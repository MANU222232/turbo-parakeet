from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from models.database import Profile, User, UserRole
from db.session import get_db
from core.security import get_current_user_profile
from pydantic import BaseModel, Field
import uuid

router = APIRouter(prefix="/api/v1/profiles", tags=["Profiles"])


class ProfileUpdate(BaseModel):
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferences: Optional[str] = None  # JSON string


@router.get("/me")
async def get_my_profile(profile: Profile = Depends(get_current_user_profile)):
    """Get current user's profile"""
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "role": profile.role.value,
        "avatar_url": profile.avatar_url,
        "bio": profile.bio,
        "address": profile.address,
        "city": profile.city,
        "state": profile.state,
        "zip_code": profile.zip_code,
        "country": profile.country,
        "emergency_contact_name": profile.emergency_contact_name,
        "emergency_contact_phone": profile.emergency_contact_phone,
        "preferences": profile.preferences,
        "is_active": profile.is_active,
        "last_login": profile.last_login,
        "created_at": profile.created_at.isoformat() if profile.created_at else None,
        "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
    }


@router.patch("/me")
async def update_my_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_user_profile)
):
    """Update current user's profile"""
    update_data = profile_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    return {
        "message": "Profile updated successfully",
        "profile": {
            "id": profile.id,
            "role": profile.role.value,
            "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
        }
    }


@router.get("/check-role")
async def check_user_role(profile: Profile = Depends(get_current_user_profile)):
    """Check current user's role for frontend routing"""
    return {
        "role": profile.role.value,
        "is_active": profile.is_active,
        "verified": True  # Could be enhanced to check actual verification status
    }
