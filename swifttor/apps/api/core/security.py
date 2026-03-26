from fastapi import HTTPException, Depends, status
from sqlalchemy.orm import Session
from models.database import Profile, UserRole
from db.session import get_db


async def get_current_user_profile(db: Session = Depends(get_db), user_id: str = None):
    """
    Get current user's profile. 
    In production, user_id should come from JWT token or session.
    """
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    return profile


def require_role(required_role: UserRole):
    """
    Decorator to require a specific role for endpoint access.
    """
    async def role_checker(profile: Profile = Depends(get_current_user_profile)):
        if profile.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role.value}"
            )
        return profile
    return role_checker


# Convenience dependencies for each role
customer_required = Depends(lambda: require_role(UserRole.customer))
driver_required = Depends(lambda: require_role(UserRole.driver))
shop_owner_required = Depends(lambda: require_role(UserRole.shop_owner))


async def get_active_profile(
    profile: Profile = Depends(get_current_user_profile)
) -> Profile:
    """Get active profile - basic check"""
    return profile
