from fastapi import APIRouter, Depends, HTTPException, status
from app.routers.auth import get_current_user, require_role
from app.services.dashboard import get_dashboard_stats
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/stats")
async def get_dashboard_statistics(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics based on user role and clinic access"""
    try:
        stats = get_dashboard_stats(
            user_role=current_user["role"], clinic_id=current_user.get("clinic_id")
        )
        return {
            "success": True,
            "data": stats,
            "user": {
                "username": current_user["username"],
                "role": current_user["role"],
                "clinic_name": current_user["clinic_name"],
            },
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch dashboard statistics",
        )


@router.get("/recent-activities")
async def get_recent_activities(
    limit: int = 10, current_user: dict = Depends(get_current_user)
):
    """Get recent activities for the user's clinic"""
    try:
        # TODO: Implement recent activities logic
        activities = []  # Placeholder

        return {"success": True, "data": activities, "total": len(activities)}
    except Exception as e:
        logger.error(f"Error getting recent activities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch recent activities",
        )


@router.get("/quick-stats")
async def get_quick_stats(current_user: dict = Depends(get_current_user)):
    """Get quick statistics for dashboard cards"""
    try:
        from app.services.dashboard import get_quick_stats

        stats = get_quick_stats(
            user_role=current_user["role"], clinic_id=current_user.get("clinic_id")
        )

        return {"success": True, "data": stats}
    except Exception as e:
        logger.error(f"Error getting quick stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch quick statistics",
        )
