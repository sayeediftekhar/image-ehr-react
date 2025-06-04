from fastapi import APIRouter, Depends, HTTPException, status
from app.routers.auth import get_current_user, require_role
from app.services.auth import get_user_by_id, update_user, get_all_users
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    return {"success": True, "user": current_user}


@router.put("/profile")
async def update_user_profile(
    profile_data: dict, current_user: dict = Depends(get_current_user)
):
    """Update current user's profile"""
    try:
        # Users can only update certain fields
        allowed_fields = ["full_name", "email", "phone"]
        update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update",
            )

        success = update_user(current_user["id"], update_data)

        if success:
            return {"success": True, "message": "Profile updated successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not update profile",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update profile",
        )


@router.get("/")
async def get_users(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(require_role("admin")),
):
    """Get all users - admin only"""
    try:
        result = get_all_users(limit, offset)
        return {
            "success": True,
            "data": result["users"],
            "total": result["total"],
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch users",
        )


@router.get("/{user_id}")
async def get_user(user_id: int, current_user: dict = Depends(require_role("admin"))):
    """Get user by ID - admin only"""
    try:
        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return {"success": True, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch user",
        )
