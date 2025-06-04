from fastapi import APIRouter, HTTPException, Form, Request, Depends, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta
import logging
import requests

from app.services.auth import (
    authenticate_user,
    log_login_attempt,
    update_user_last_login,
    get_user_by_username,
)
from app.core.security import create_access_token, verify_token
from app.models.auth import UserLogin, Token, UserResponse

router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer()


def get_location_from_ip(ip):
    """Get location information from IP address using ip-api.com"""
    try:
        url = f"http://ip-api.com/json/{ip}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "success":
            return {
                "country": data.get("country"),
                "region": data.get("regionName"),
                "city": data.get("city"),
                "lat": data.get("lat"),
                "lon": data.get("lon"),
                "isp": data.get("isp"),
            }
        else:
            logger.warning(f"GeoIP API error: {data.get('message')}")
            return None
    except Exception as e:
        logger.error(f"GeoIP API request failed: {e}")
        return None


def get_client_ip(request: Request):
    """Extract client IP from request headers"""
    # Check for forwarded IP first (for reverse proxy setups)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    # Check for real IP header
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip

    # Fall back to client host
    return request.client.host


# EXISTING FORM-BASED LOGIN (for backward compatibility)
@router.post("/login")
async def login_form(
    request: Request, username: str = Form(...), password: str = Form(...)
):
    """Original form-based login endpoint - maintains backward compatibility"""
    client_ip = get_client_ip(request)
    logger.info(f"🚀 FORM LOGIN ATTEMPT: username='{username}' from IP={client_ip}")

    if not username or not password:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "Username and password are required"},
        )

    user = authenticate_user(username, password)

    if user:
        logger.info(f"✅ Form login successful for {username}")

        # Get location data
        location_data = get_location_from_ip(client_ip)

        # Log the attempt
        log_login_attempt(username, client_ip, location_data, True)

        # Update last login
        update_user_last_login(username, client_ip, location_data)

        # Create JWT token for this session too
        access_token_expires = timedelta(minutes=480)  # 8 hours
        access_token = create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )

        return JSONResponse(
            content={
                "success": True,
                "user": user,
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 480 * 60,  # Added: expires in seconds
                "message": "Login successful",
            }
        )
    else:
        logger.warning(f"❌ Form login failed for {username}")

        # Log failed attempt
        location_data = get_location_from_ip(client_ip)
        log_login_attempt(username, client_ip, location_data, False)

        return JSONResponse(
            status_code=401,
            content={"success": False, "message": "Invalid username or password"},
        )


# NEW JSON-BASED LOGIN (for React frontend)
@router.post("/login-json", response_model=Token)
async def login_json(request: Request, user_credentials: UserLogin):
    """JSON-based login endpoint for React frontend with JWT tokens"""
    client_ip = get_client_ip(request)
    logger.info(
        f"🚀 JSON LOGIN ATTEMPT: username='{user_credentials.username}' from IP={client_ip}"
    )

    if not user_credentials.username or not user_credentials.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required",
        )

    user = authenticate_user(user_credentials.username, user_credentials.password)

    if user:
        logger.info(f"✅ JSON login successful for {user_credentials.username}")

        # Get location data
        location_data = get_location_from_ip(client_ip)

        # Log the attempt
        log_login_attempt(user_credentials.username, client_ip, location_data, True)

        # Update last login
        update_user_last_login(user_credentials.username, client_ip, location_data)

        # Create JWT token
        access_token_expires = timedelta(minutes=480)  # 8 hours for healthcare system
        access_token = create_access_token(
            data={"sub": user_credentials.username}, expires_delta=access_token_expires
        )

        # Fixed: Added expires_in field to Token response
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=480 * 60,  # expires in seconds
            user=user,
        )
    else:
        logger.warning(f"❌ JSON login failed for {user_credentials.username}")

        # Log failed attempt
        location_data = get_location_from_ip(client_ip)
        log_login_attempt(user_credentials.username, client_ip, location_data, False)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )


# JWT TOKEN VALIDATION AND USER RETRIEVAL
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Get current user from JWT token"""
    try:
        username = verify_token(credentials.credentials)
        user = get_user_by_username(username)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )

        if not user.get("is_active", False):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
            )

        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information from JWT token"""
    return {"success": True, "user": current_user}


@router.post("/validate-token")
async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT token and return user info"""
    try:
        username = verify_token(credentials.credentials)
        user = get_user_by_username(username)
        if user and user.get("is_active", False):
            return {"valid": True, "user": user, "username": username}
        else:
            return {"valid": False, "error": "User not found or inactive"}
    except HTTPException as e:
        return {"valid": False, "error": str(e.detail)}
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        return {"valid": False, "error": "Token validation failed"}


@router.post("/refresh-token")
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """Refresh JWT token for authenticated user"""
    try:
        # Create new token
        access_token_expires = timedelta(minutes=480)
        access_token = create_access_token(
            data={"sub": current_user["username"]}, expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 480 * 60,  # Added: expires in seconds
            "user": current_user,
        }
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not refresh token",
        )


@router.post("/logout")
async def logout(request: Request, current_user: dict = Depends(get_current_user)):
    """Logout endpoint - logs the logout action"""
    try:
        client_ip = get_client_ip(request)
        logger.info(
            f"🚪 LOGOUT: username='{current_user['username']}' from IP={client_ip}"
        )

        # Optional: Add logout logging to database
        # You could implement log_logout_attempt in your auth service
        # log_logout_attempt(current_user['username'], client_ip)

        return JSONResponse(
            content={"success": True, "message": "Logged out successfully"}
        )
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return JSONResponse(
            content={"success": True, "message": "Logged out successfully"}
        )


# ROLE-BASED ACCESS HELPERS
def require_role(required_role: str):
    """Dependency to require specific role"""

    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}",
            )
        return current_user

    return role_checker


def require_roles(required_roles: list):
    """Dependency to require one of multiple roles"""

    async def roles_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}",
            )
        return current_user

    return roles_checker


# CLINIC-SPECIFIC ACCESS
def require_clinic_access(clinic_id: int = None):
    """Dependency to require access to specific clinic"""

    async def clinic_checker(current_user: dict = Depends(get_current_user)):
        # Admin can access all clinics
        if current_user["role"] == "admin":
            return current_user

        # Users can only access their own clinic
        if clinic_id and current_user["clinic_id"] != clinic_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only access your clinic's data",
            )
        return current_user

    return clinic_checker


# ADMIN-ONLY ENDPOINTS (Placeholder implementations)
@router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(require_role("admin"))):
    """Get all users - admin only"""
    try:
        # TODO: Implement actual user fetching logic
        # users = get_all_users_from_db()
        return {
            "success": True,
            "message": "Admin endpoint - get all users",
            "data": [],  # Placeholder
            "total": 0,
        }
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch users",
        )


@router.get("/admin/login-logs")
async def get_login_logs(
    current_user: dict = Depends(require_role("admin")),
    limit: int = 100,
    offset: int = 0,
):
    """Get login logs - admin only"""
    try:
        # TODO: Implement actual login logs fetching
        # logs = get_login_logs_from_db(limit, offset)
        return {
            "success": True,
            "message": "Admin endpoint - get login logs",
            "data": [],  # Placeholder
            "total": 0,
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"Error fetching login logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch login logs",
        )


# HEALTH CHECK
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "IMAGE EHR Auth Service",
        "version": "1.0.0",
        "timestamp": "2025-06-04T00:00:00Z",  # You could use datetime.utcnow()
    }


# PASSWORD CHANGE (Enhanced implementation ready)
@router.post("/change-password")
async def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    """Change user password"""
    try:
        # Validate current password first
        if not authenticate_user(current_user["username"], current_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        # Validate new password strength
        if len(new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 6 characters long",
            )

        # TODO: Implement password update in auth service
        # success = update_user_password(current_user["username"], new_password)

        return {
            "success": False,
            "message": "Password change functionality not yet implemented",
            "note": "Ready for implementation in auth service",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not change password",
        )


# OPTIONAL: Logout endpoint that doesn't require authentication (for frontend cleanup)
@router.post("/logout-public")
async def logout_public():
    """Public logout endpoint for frontend token cleanup"""
    return JSONResponse(content={"success": True, "message": "Logged out successfully"})
