
# app/services/finance_auth.py
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import jwt
from datetime import datetime, timedelta
import logging
from app.db.context import get_db_cursor

logger = logging.getLogger(__name__)

# JWT Configuration (use your existing settings)
SECRET_KEY = "your-secret-key-here"  # Use same as your existing auth
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

class FinancePermissions:
    """Finance permission constants"""
    VIEW_ALL = "view_all"
    EDIT_ALL = "edit_all"
    DELETE_ALL = "delete_all"
    MANAGE_USERS = "manage_users"
    AUDIT_ACCESS = "audit_access"
    VIEW_CLINIC = "view_clinic"
    EDIT_CLINIC = "edit_clinic"
    CREATE_TRANSACTIONS = "create_transactions"
    VIEW_REPORTS = "view_reports"
    APPROVE_TRANSACTIONS = "approve_transactions"

class FinanceRoles:
    """Finance role constants"""
    ADMINISTRATOR = "administrator"
    MANAGER = "manager"
    MANAGEMENT_STAFF = "management_staff"
    STAFF = "staff"

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Extract user info from JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None

        # Get user details from database
        with get_db_cursor() as cur:
            cur.execute("""
                SELECT u.id, u.username, u.email, u.role, u.clinic_id, 
                       u.finance_permissions, u.is_active, c.clinic_name
                FROM users u
                LEFT JOIN clinics c ON u.clinic_id = c.id
                WHERE u.id = %s AND u.is_active = true
            """, (user_id,))

            user_data = cur.fetchone()
            if not user_data:
                return None

            return {
                "id": user_data[0],
                "username": user_data[1],
                "email": user_data[2],
                "role": user_data[3],
                "clinic_id": user_data[4],
                "finance_permissions": user_data[5] or {},
                "is_active": user_data[6],
                "clinic_name": user_data[7]
            }
    except jwt.PyJWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user"""
    user = get_user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_finance_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get current user with finance access"""
    if current_user["role"] not in [FinanceRoles.ADMINISTRATOR, FinanceRoles.MANAGER, FinanceRoles.MANAGEMENT_STAFF]:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Finance module access required."
        )
    return current_user

def check_permission(user: Dict[str, Any], permission: str, clinic_id: Optional[int] = None) -> bool:
    """Check if user has specific permission"""
    user_permissions = user.get("finance_permissions", {})
    user_role = user.get("role")
    user_clinic_id = user.get("clinic_id")

    # Administrator has all permissions
    if user_role == FinanceRoles.ADMINISTRATOR:
        return True

    # Check specific permission
    if permission in user_permissions and user_permissions[permission]:
        # For clinic-specific permissions, check clinic access
        if clinic_id is not None and user_clinic_id is not None:
            return user_clinic_id == clinic_id
        return True

    return False

def require_permission(permission: str, clinic_id: Optional[int] = None):
    """Decorator to require specific permission"""
    def decorator(current_user: Dict[str, Any] = Depends(get_current_finance_user)):
        if not check_permission(current_user, permission, clinic_id):
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required permission: {permission}"
            )
        return current_user
    return decorator

async def get_admin_user(current_user: Dict[str, Any] = Depends(get_current_finance_user)) -> Dict[str, Any]:
    """Require administrator role"""
    if current_user["role"] != FinanceRoles.ADMINISTRATOR:
        raise HTTPException(
            status_code=403,
            detail="Administrator access required"
        )
    return current_user

async def get_manager_user(current_user: Dict[str, Any] = Depends(get_current_finance_user)) -> Dict[str, Any]:
    """Require manager or administrator role"""
    if current_user["role"] not in [FinanceRoles.ADMINISTRATOR, FinanceRoles.MANAGER]:
        raise HTTPException(
            status_code=403,
            detail="Manager or Administrator access required"
        )
    return current_user

def get_accessible_clinics(user: Dict[str, Any]) -> Optional[list]:
    """Get list of clinic IDs user can access"""
    if user["role"] == FinanceRoles.ADMINISTRATOR:
        return None  # Can access all clinics

    if user["clinic_id"]:
        return [user["clinic_id"]]

    return []

def log_audit_action(user_id: int, table_name: str, record_id: int, action: str, 
                    old_values: Optional[Dict] = None, new_values: Optional[Dict] = None,
                    ip_address: Optional[str] = None, user_agent: Optional[str] = None):
    """Log audit action"""
    try:
        with get_db_cursor() as cur:
            cur.execute("""
                INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, 
                                     user_id, ip_address, user_agent, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (table_name, record_id, action, old_values, new_values, user_id, ip_address, user_agent))
    except Exception as e:
        logger.error(f"Failed to log audit action: {e}")

class AuditMiddleware:
    """Middleware to log all finance operations"""

    @staticmethod
    async def log_request(request: Request, user: Dict[str, Any], action: str, resource_id: Optional[int] = None):
        """Log request for audit"""
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent")

        # Extract resource info from URL
        path_parts = request.url.path.split('/')
        table_name = "unknown"
        if "transactions" in path_parts:
            table_name = "transactions"
        elif "revenue" in path_parts:
            table_name = "daily_revenue_summaries"
        elif "clinics" in path_parts:
            table_name = "clinics"

        log_audit_action(
            user_id=user["id"],
            table_name=table_name,
            record_id=resource_id or 0,
            action=action,
            ip_address=client_ip,
            user_agent=user_agent
        )

# Time-based restrictions
def can_edit_transaction(user: Dict[str, Any], transaction_date: datetime) -> bool:
    """Check if user can edit transaction based on time restrictions"""
    if user["role"] == FinanceRoles.ADMINISTRATOR:
        return True

    # Managers can only edit today's transactions
    if user["role"] == FinanceRoles.MANAGER:
        today = datetime.now().date()
        return transaction_date.date() == today

    return False

def can_delete_transaction(user: Dict[str, Any]) -> bool:
    """Check if user can delete transactions"""
    return user["role"] == FinanceRoles.ADMINISTRATOR

# Suspicious activity detection
def detect_suspicious_activity(user_id: int, action: str, amount: Optional[float] = None) -> bool:
    """Detect suspicious financial activities"""
    try:
        with get_db_cursor() as cur:
            # Check for multiple large transactions in short time
            if amount and amount > 10000:  # Large transaction threshold
                cur.execute("""
                    SELECT COUNT(*) FROM audit_log 
                    WHERE user_id = %s 
                    AND timestamp > NOW() - INTERVAL '1 hour'
                    AND new_values->>'amount' IS NOT NULL
                    AND CAST(new_values->>'amount' AS DECIMAL) > 10000
                """, (user_id,))

                large_transactions = cur.fetchone()[0]
                if large_transactions > 3:  # More than 3 large transactions in 1 hour
                    return True

            # Check for rapid successive actions
            cur.execute("""
                SELECT COUNT(*) FROM audit_log 
                WHERE user_id = %s 
                AND timestamp > NOW() - INTERVAL '5 minutes'
            """, (user_id,))

            recent_actions = cur.fetchone()[0]
            if recent_actions > 20:  # More than 20 actions in 5 minutes
                return True

        return False
    except Exception as e:
        logger.error(f"Error detecting suspicious activity: {e}")
        return False

async def security_check_middleware(request: Request, user: Dict[str, Any]):
    """Security middleware for finance operations"""
    # Log the request
    await AuditMiddleware.log_request(request, user, request.method)

    # Check for suspicious activity
    if detect_suspicious_activity(user["id"], request.method):
        logger.warning(f"Suspicious activity detected for user {user['id']}")
        # You could send alerts, temporarily lock account, etc.

    return True
