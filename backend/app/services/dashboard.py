from app.db.context import get_db_cursor
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def get_dashboard_stats(user_role: str, clinic_id: int = None):
    """Get dashboard statistics based on user role and clinic"""
    try:
        with get_db_cursor() as cur:
            stats = {}

            # Base query conditions
            clinic_filter = ""
            params = []

            if user_role != "admin" and clinic_id:
                clinic_filter = "WHERE clinic_id = %s"
                params = [clinic_id]

            # Total patients
            cur.execute(f"SELECT COUNT(*) FROM patients {clinic_filter}", params)
            stats["total_patients"] = cur.fetchone()[0]

            # Total users
            if user_role == "admin":
                cur.execute("SELECT COUNT(*) FROM users WHERE is_active = true")
                stats["total_users"] = cur.fetchone()[0]

            # Today's appointments (if appointments table exists)
            today = datetime.now().date()
            try:
                cur.execute(
                    f"""
                    SELECT COUNT(*) FROM appointments 
                    WHERE DATE(appointment_date) = %s {clinic_filter.replace('WHERE', 'AND') if clinic_filter else ''}
                """,
                    [today] + params,
                )
                stats["todays_appointments"] = cur.fetchone()[0]
            except:
                stats["todays_appointments"] = 0

            # Recent registrations (last 7 days)
            week_ago = datetime.now() - timedelta(days=7)
            cur.execute(
                f"""
                SELECT COUNT(*) FROM patients 
                WHERE created_at >= %s {clinic_filter.replace('WHERE', 'AND') if clinic_filter else ''}
            """,
                [week_ago] + params,
            )
            stats["recent_registrations"] = cur.fetchone()[0]

            # Monthly stats
            month_start = datetime.now().replace(day=1)
            cur.execute(
                f"""
                SELECT COUNT(*) FROM patients 
                WHERE created_at >= %s {clinic_filter.replace('WHERE', 'AND') if clinic_filter else ''}
            """,
                [month_start] + params,
            )
            stats["monthly_registrations"] = cur.fetchone()[0]

            return stats

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return {
            "total_patients": 0,
            "total_users": 0,
            "todays_appointments": 0,
            "recent_registrations": 0,
            "monthly_registrations": 0,
        }


def get_quick_stats(user_role: str, clinic_id: int = None):
    """Get quick statistics for dashboard cards"""
    try:
        with get_db_cursor() as cur:
            stats = []

            # Base query conditions
            clinic_filter = ""
            params = []

            if user_role != "admin" and clinic_id:
                clinic_filter = "WHERE clinic_id = %s"
                params = [clinic_id]

            # Total Patients Card
            cur.execute(f"SELECT COUNT(*) FROM patients {clinic_filter}", params)
            total_patients = cur.fetchone()[0]
            stats.append(
                {
                    "title": "Total Patients",
                    "value": total_patients,
                    "icon": "users",
                    "color": "blue",
                    "change": "+12%",  # TODO: Calculate actual change
                    "trend": "up",
                }
            )

            # Today's Appointments Card
            today = datetime.now().date()
            try:
                cur.execute(
                    f"""
                    SELECT COUNT(*) FROM appointments 
                    WHERE DATE(appointment_date) = %s {clinic_filter.replace('WHERE', 'AND') if clinic_filter else ''}
                """,
                    [today] + params,
                )
                todays_appointments = cur.fetchone()[0]
            except:
                todays_appointments = 0

            stats.append(
                {
                    "title": "Today's Appointments",
                    "value": todays_appointments,
                    "icon": "calendar",
                    "color": "green",
                    "change": "+5%",  # TODO: Calculate actual change
                    "trend": "up",
                }
            )

            # Recent Registrations Card
            week_ago = datetime.now() - timedelta(days=7)
            cur.execute(
                f"""
                SELECT COUNT(*) FROM patients 
                WHERE created_at >= %s {clinic_filter.replace('WHERE', 'AND') if clinic_filter else ''}
            """,
                [week_ago] + params,
            )
            recent_registrations = cur.fetchone()[0]

            stats.append(
                {
                    "title": "This Week",
                    "value": recent_registrations,
                    "icon": "user-plus",
                    "color": "purple",
                    "change": "+8%",  # TODO: Calculate actual change
                    "trend": "up",
                }
            )

            # Active Users (Admin only)
            if user_role == "admin":
                cur.execute("SELECT COUNT(*) FROM users WHERE is_active = true")
                active_users = cur.fetchone()[0]
                stats.append(
                    {
                        "title": "Active Users",
                        "value": active_users,
                        "icon": "user-check",
                        "color": "orange",
                        "change": "+2%",  # TODO: Calculate actual change
                        "trend": "up",
                    }
                )

            return stats

    except Exception as e:
        logger.error(f"Error getting quick stats: {e}")
        return []


def get_recent_activities(user_role: str, clinic_id: int = None, limit: int = 10):
    """Get recent activities for the dashboard"""
    try:
        with get_db_cursor() as cur:
            activities = []

            # Get recent patient registrations
            clinic_filter = ""
            params = [limit]

            if user_role != "admin" and clinic_id:
                clinic_filter = "WHERE p.clinic_id = %s"
                params = [clinic_id, limit]

            cur.execute(
                f"""
                SELECT p.patient_id, p.name, p.created_at, c.name as clinic_name
                FROM patients p
                LEFT JOIN clinics c ON p.clinic_id = c.id
                {clinic_filter}
                ORDER BY p.created_at DESC
                LIMIT %s
            """,
                params,
            )

            results = cur.fetchall()
            for result in results:
                activities.append(
                    {
                        "type": "patient_registration",
                        "title": f"New patient registered: {result[1]}",
                        "description": f"Patient ID: {result[0]}",
                        "clinic": result[3] if result[3] else "Unknown",
                        "timestamp": result[2].isoformat() if result[2] else None,
                        "icon": "user-plus",
                        "color": "green",
                    }
                )

            return activities

    except Exception as e:
        logger.error(f"Error getting recent activities: {e}")
        return []
