from app.db.context import get_db_cursor
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def authenticate_user(username: str, password: str):
    """Authenticate user with username and password"""
    with get_db_cursor() as cur:
        query = """
            SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role, u.clinic_id, c.name as clinic_name, u.is_active
            FROM users u
            LEFT JOIN clinics c ON u.clinic_id = c.id
            WHERE u.username = %s AND u.password = %s AND u.is_active = true
        """
        cur.execute(query, (username, password))
        result = cur.fetchone()
        if result:
            user_data = {
                "id": result[0],
                "username": result[1],
                "full_name": result[2],
                "email": result[3],
                "phone": result[4],
                "role": result[5],
                "clinic_id": result[6],
                "clinic_name": result[7] if result[7] else "All Clinics",
                "is_active": result[8],
                "has_emoc": result[5] in ["admin", "manager", "emoc_staff"],
            }
            return user_data
        return None


def get_user_by_username(username: str):
    """Get user by username for JWT token validation"""
    try:
        with get_db_cursor() as cur:
            query = """
                SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role, u.clinic_id, 
                       c.name as clinic_name, u.last_login_at, u.last_login_ip, 
                       u.last_login_country, u.last_login_city, u.is_active, u.created_at
                FROM users u
                LEFT JOIN clinics c ON u.clinic_id = c.id
                WHERE u.username = %s AND u.is_active = true
            """
            cur.execute(query, (username,))
            result = cur.fetchone()

            if result:
                user_data = {
                    "id": result[0],
                    "username": result[1],
                    "full_name": result[2],
                    "email": result[3],
                    "phone": result[4],
                    "role": result[5],
                    "clinic_id": result[6],
                    "clinic_name": result[7] if result[7] else "All Clinics",
                    "last_login_at": result[8].isoformat() if result[8] else None,
                    "last_login_ip": result[9],
                    "last_login_country": result[10],
                    "last_login_city": result[11],
                    "is_active": result[12],
                    "created_at": result[13].isoformat() if result[13] else None,
                    "has_emoc": result[5] in ["admin", "manager", "emoc_staff"],
                }
                return user_data
            return None
    except Exception as e:
        logger.error(f"Error getting user by username {username}: {e}")
        return None


def log_login_attempt(username, ip_address, location_data, success, user_agent=None):
    """Log login attempt to database"""
    try:
        with get_db_cursor() as cur:
            cur.execute(
                """
                INSERT INTO login_logs (username, ip_address, country, region, city, latitude, longitude, isp, success, user_agent, login_time)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
                (
                    username,
                    ip_address,
                    location_data.get("country") if location_data else None,
                    location_data.get("region") if location_data else None,
                    location_data.get("city") if location_data else None,
                    location_data.get("lat") if location_data else None,
                    location_data.get("lon") if location_data else None,
                    location_data.get("isp") if location_data else None,
                    success,
                    user_agent,
                    datetime.now(),
                ),
            )
    except Exception as e:
        logger.error(f"Error logging login attempt for {username}: {e}")


def update_user_last_login(username, ip_address, location_data):
    """Update user's last login information"""
    try:
        with get_db_cursor() as cur:
            cur.execute(
                """
                UPDATE users
                SET last_login_at = %s,
                    last_login_ip = %s,
                    last_login_country = %s,
                    last_login_region = %s,
                    last_login_city = %s,
                    last_login_lat = %s,
                    last_login_lon = %s,
                    last_login_isp = %s
                WHERE username = %s
            """,
                (
                    datetime.now(),
                    ip_address,
                    location_data.get("country") if location_data else None,
                    location_data.get("region") if location_data else None,
                    location_data.get("city") if location_data else None,
                    location_data.get("lat") if location_data else None,
                    location_data.get("lon") if location_data else None,
                    location_data.get("isp") if location_data else None,
                    username,
                ),
            )
    except Exception as e:
        logger.error(f"Error updating last login for {username}: {e}")


def create_user(user_data: dict, created_by: str = None):
    """Create a new user"""
    try:
        from app.core.security import get_password_hash

        with get_db_cursor() as cur:
            # Hash the password
            hashed_password = get_password_hash(user_data["password"])

            cur.execute(
                """
                INSERT INTO users 
                (username, password, full_name, email, phone, role, clinic_id, is_active, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """,
                (
                    user_data["username"],
                    hashed_password,
                    user_data["full_name"],
                    user_data.get("email"),
                    user_data.get("phone"),
                    user_data["role"],
                    user_data.get("clinic_id"),
                    True,
                    datetime.now(),
                ),
            )

            user_id = cur.fetchone()[0]

            logger.info(
                f"User created: {user_data['username']} (ID: {user_id}) by {created_by}"
            )
            return user_id

    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return None


def update_user_password(username: str, new_password: str):
    """Update user password"""
    try:
        from app.core.security import get_password_hash

        with get_db_cursor() as cur:
            hashed_password = get_password_hash(new_password)

            cur.execute(
                """
                UPDATE users 
                SET password = %s, updated_at = %s
                WHERE username = %s AND is_active = true
            """,
                (hashed_password, datetime.now(), username),
            )

            if cur.rowcount > 0:
                logger.info(f"Password updated for user: {username}")
                return True
            else:
                logger.warning(f"No user found to update password: {username}")
                return False

    except Exception as e:
        logger.error(f"Error updating password for {username}: {e}")
        return False


def get_all_users(limit: int = 100, offset: int = 0):
    """Get all users for admin panel"""
    try:
        with get_db_cursor() as cur:
            cur.execute(
                """
                SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role, 
                       u.clinic_id, c.name as clinic_name, u.last_login_at, 
                       u.is_active, u.created_at
                FROM users u
                LEFT JOIN clinics c ON u.clinic_id = c.id
                ORDER BY u.created_at DESC
                LIMIT %s OFFSET %s
            """,
                (limit, offset),
            )

            results = cur.fetchall()
            users = []

            for result in results:
                user_data = {
                    "id": result[0],
                    "username": result[1],
                    "full_name": result[2],
                    "email": result[3],
                    "phone": result[4],
                    "role": result[5],
                    "clinic_id": result[6],
                    "clinic_name": result[7] if result[7] else "All Clinics",
                    "last_login_at": result[8].isoformat() if result[8] else None,
                    "is_active": result[9],
                    "created_at": result[10].isoformat() if result[10] else None,
                }
                users.append(user_data)

            # Get total count
            cur.execute("SELECT COUNT(*) FROM users")
            total = cur.fetchone()[0]

            return {"users": users, "total": total}

    except Exception as e:
        logger.error(f"Error getting all users: {e}")
        return {"users": [], "total": 0}


def get_login_logs(limit: int = 100, offset: int = 0, username: str = None):
    """Get login logs for admin panel"""
    try:
        with get_db_cursor() as cur:
            base_query = """
                SELECT id, username, login_time, ip_address, country, region, city, 
                       latitude, longitude, isp, success, user_agent
                FROM login_logs
            """

            if username:
                query = (
                    base_query
                    + " WHERE username = %s ORDER BY login_time DESC LIMIT %s OFFSET %s"
                )
                params = (username, limit, offset)
                count_query = "SELECT COUNT(*) FROM login_logs WHERE username = %s"
                count_params = (username,)
            else:
                query = base_query + " ORDER BY login_time DESC LIMIT %s OFFSET %s"
                params = (limit, offset)
                count_query = "SELECT COUNT(*) FROM login_logs"
                count_params = ()

            cur.execute(query, params)
            results = cur.fetchall()

            logs = []
            for result in results:
                log_data = {
                    "id": result[0],
                    "username": result[1],
                    "login_time": result[2].isoformat() if result[2] else None,
                    "ip_address": result[3],
                    "country": result[4],
                    "region": result[5],
                    "city": result[6],
                    "latitude": result[7],
                    "longitude": result[8],
                    "isp": result[9],
                    "success": result[10],
                    "user_agent": result[11],
                }
                logs.append(log_data)

            # Get total count
            cur.execute(count_query, count_params)
            total = cur.fetchone()[0]

            return {"logs": logs, "total": total}

    except Exception as e:
        logger.error(f"Error getting login logs: {e}")
        return {"logs": [], "total": 0}


def get_user_by_id(user_id: int):
    """Get user by ID"""
    try:
        with get_db_cursor() as cur:
            query = """
                SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role, 
                       u.clinic_id, c.name as clinic_name, u.is_active, u.created_at
                FROM users u
                LEFT JOIN clinics c ON u.clinic_id = c.id
                WHERE u.id = %s
            """
            cur.execute(query, (user_id,))
            result = cur.fetchone()

            if result:
                user_data = {
                    "id": result[0],
                    "username": result[1],
                    "full_name": result[2],
                    "email": result[3],
                    "phone": result[4],
                    "role": result[5],
                    "clinic_id": result[6],
                    "clinic_name": result[7] if result[7] else "All Clinics",
                    "is_active": result[8],
                    "created_at": result[9].isoformat() if result[9] else None,
                    "has_emoc": result[5] in ["admin", "manager", "emoc_staff"],
                }
                return user_data
            return None
    except Exception as e:
        logger.error(f"Error getting user by ID {user_id}: {e}")
        return None


def update_user(user_id: int, user_data: dict):
    """Update user information"""
    try:
        with get_db_cursor() as cur:
            # Build dynamic update query
            update_fields = []
            params = []

            for field in [
                "full_name",
                "email",
                "phone",
                "role",
                "clinic_id",
                "is_active",
            ]:
                if field in user_data:
                    update_fields.append(f"{field} = %s")
                    params.append(user_data[field])

            if not update_fields:
                return False

            update_fields.append("updated_at = %s")
            params.append(datetime.now())
            params.append(user_id)

            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
            cur.execute(query, params)

            if cur.rowcount > 0:
                logger.info(f"User updated: ID {user_id}")
                return True
            else:
                logger.warning(f"No user found to update: ID {user_id}")
                return False

    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        return False


def deactivate_user(user_id: int):
    """Deactivate user (soft delete)"""
    try:
        with get_db_cursor() as cur:
            cur.execute(
                """
                UPDATE users 
                SET is_active = false, updated_at = %s
                WHERE id = %s
            """,
                (datetime.now(), user_id),
            )

            if cur.rowcount > 0:
                logger.info(f"User deactivated: ID {user_id}")
                return True
            else:
                logger.warning(f"No user found to deactivate: ID {user_id}")
                return False

    except Exception as e:
        logger.error(f"Error deactivating user {user_id}: {e}")
        return False
