from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel, Field
import json

from models.database import WhatsAppConfig
from db.session import get_db

router = APIRouter()

# Pydantic Schemas
class WhatsAppConfigCreate(BaseModel):
    phone_number: str = Field(..., description="WhatsApp phone number (without country code)")
    country_code: str = Field(default="+1", description="Country calling code (e.g., +1, +254)")
    display_name: Optional[str] = Field(None, description="Business display name")
    webhook_url: Optional[str] = Field(None, description="Webhook URL for receiving messages")
    api_token: Optional[str] = Field(None, description="WhatsApp Business API token")
    auto_reply_enabled: bool = Field(default=False, description="Enable automatic replies")
    business_hours_start: Optional[str] = Field(None, description="Business hours start (HH:MM)")
    business_hours_end: Optional[str] = Field(None, description="Business hours end (HH:MM)")
    timezone: str = Field(default="UTC", description="Timezone for business hours")

class WhatsAppConfigUpdate(BaseModel):
    phone_number: Optional[str] = None
    country_code: Optional[str] = None
    display_name: Optional[str] = None
    is_active: Optional[bool] = None
    webhook_url: Optional[str] = None
    api_token: Optional[str] = None
    auto_reply_enabled: Optional[bool] = None
    business_hours_start: Optional[str] = None
    business_hours_end: Optional[str] = None
    timezone: Optional[str] = None

class WhatsAppConfigResponse(BaseModel):
    id: str
    phone_number: str
    country_code: str
    full_number: str
    display_name: Optional[str]
    is_active: bool
    webhook_url: Optional[str]
    auto_reply_enabled: bool
    business_hours_start: Optional[str]
    business_hours_end: Optional[str]
    timezone: str
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

# Helper functions
def format_full_number(country_code: str, phone_number: str) -> str:
    """Format the full WhatsApp number with country code."""
    # Remove any leading zeros or plus signs from phone number
    clean_number = phone_number.lstrip('0').lstrip('+')
    # Remove plus sign from country code for consistent formatting
    clean_code = country_code.lstrip('+')
    return f"+{clean_code}{clean_number}"

@router.get("/whatsapp/config", response_model=List[WhatsAppConfigResponse])
async def get_whatsapp_configs(
    skip: int = 0,
    limit: int = 10,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get all WhatsApp configurations.
    
    - **skip**: Number of records to skip for pagination
    - **limit**: Maximum number of records to return
    - **active_only**: If true, only return active configurations
    """
    query = db.query(WhatsAppConfig)
    
    if active_only:
        query = query.filter(WhatsAppConfig.is_active == True)
    
    configs = query.offset(skip).limit(limit).all()
    
    results = []
    for config in configs:
        config_dict = {
            "id": str(config.id),
            "phone_number": config.phone_number,
            "country_code": config.country_code,
            "full_number": format_full_number(config.country_code, config.phone_number),  # type: ignore
            "display_name": config.display_name,
            "is_active": config.is_active,
            "webhook_url": config.webhook_url,
            "auto_reply_enabled": config.auto_reply_enabled,
            "business_hours_start": config.business_hours_start,
            "business_hours_end": config.business_hours_end,
            "timezone": config.timezone,
            "created_at": config.created_at.isoformat() if config.created_at else None,  # type: ignore
            "updated_at": config.updated_at.isoformat() if config.updated_at else None,  # type: ignore
        }
        results.append(config_dict)
    
    return results

@router.get("/whatsapp/config/active", response_model=Optional[WhatsAppConfigResponse])
async def get_active_whatsapp_config(db: Session = Depends(get_db)):
    """
    Get the currently active WhatsApp configuration.
    Returns null if no active configuration exists.
    """
    config = db.query(WhatsAppConfig).filter(WhatsAppConfig.is_active == True).first()
    
    if not config:
        return None
    
    return {
        "id": str(config.id),
        "phone_number": config.phone_number,
        "country_code": config.country_code,
        "full_number": format_full_number(config.country_code, config.phone_number),
        "display_name": config.display_name,
        "is_active": config.is_active,
        "webhook_url": config.webhook_url,
        "auto_reply_enabled": config.auto_reply_enabled,
        "business_hours_start": config.business_hours_start,
        "business_hours_end": config.business_hours_end,
        "timezone": config.timezone,
        "created_at": config.created_at.isoformat() if config.created_at else None,
        "updated_at": config.updated_at.isoformat() if config.updated_at else None,
    }

@router.get("/whatsapp/config/{config_id}", response_model=WhatsAppConfigResponse)
async def get_whatsapp_config(config_id: str, db: Session = Depends(get_db)):
    """
    Get a specific WhatsApp configuration by ID.
    """
    config = db.query(WhatsAppConfig).filter(WhatsAppConfig.id == config_id).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="WhatsApp configuration not found")
    
    return {
        "id": str(config.id),
        "phone_number": config.phone_number,
        "country_code": config.country_code,
        "full_number": format_full_number(config.country_code, config.phone_number),
        "display_name": config.display_name,
        "is_active": config.is_active,
        "webhook_url": config.webhook_url,
        "auto_reply_enabled": config.auto_reply_enabled,
        "business_hours_start": config.business_hours_start,
        "business_hours_end": config.business_hours_end,
        "timezone": config.timezone,
        "created_at": config.created_at.isoformat() if config.created_at else None,
        "updated_at": config.updated_at.isoformat() if config.updated_at else None,
    }

@router.post("/whatsapp/config", response_model=WhatsAppConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_whatsapp_config(
    config_data: WhatsAppConfigCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new WhatsApp configuration.
    
    This will automatically deactivate any existing active configurations.
    """
    # Deactivate all existing configs (only one active at a time recommended)
    db.query(WhatsAppConfig).update({"is_active": False})
    
    # Create new config
    db_config = WhatsAppConfig(**config_data.model_dump())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    
    return {
        "id": str(db_config.id),
        "phone_number": db_config.phone_number,
        "country_code": db_config.country_code,
        "full_number": format_full_number(db_config.country_code, db_config.phone_number),
        "display_name": db_config.display_name,
        "is_active": db_config.is_active,
        "webhook_url": db_config.webhook_url,
        "auto_reply_enabled": db_config.auto_reply_enabled,
        "business_hours_start": db_config.business_hours_start,
        "business_hours_end": db_config.business_hours_end,
        "timezone": db_config.timezone,
        "created_at": db_config.created_at.isoformat() if db_config.created_at else None,
        "updated_at": db_config.updated_at.isoformat() if db_config.updated_at else None,
    }

@router.put("/whatsapp/config/{config_id}", response_model=WhatsAppConfigResponse)
async def update_whatsapp_config(
    config_id: str,
    config_data: WhatsAppConfigUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing WhatsApp configuration.
    """
    db_config = db.query(WhatsAppConfig).filter(WhatsAppConfig.id == config_id).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="WhatsApp configuration not found")
    
    # Update fields
    update_data = config_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_config, field, value)
    
    # If setting as active, deactivate others
    if update_data.get("is_active", False):
        db.query(WhatsAppConfig).filter(WhatsAppConfig.id != config_id).update({"is_active": False})
    
    db.commit()
    db.refresh(db_config)
    
    return {
        "id": str(db_config.id),
        "phone_number": db_config.phone_number,
        "country_code": db_config.country_code,
        "full_number": format_full_number(db_config.country_code, db_config.phone_number),
        "display_name": db_config.display_name,
        "is_active": db_config.is_active,
        "webhook_url": db_config.webhook_url,
        "auto_reply_enabled": db_config.auto_reply_enabled,
        "business_hours_start": db_config.business_hours_start,
        "business_hours_end": db_config.business_hours_end,
        "timezone": db_config.timezone,
        "created_at": db_config.created_at.isoformat() if db_config.created_at else None,
        "updated_at": db_config.updated_at.isoformat() if db_config.updated_at else None,
    }

@router.delete("/whatsapp/config/{config_id}")
async def delete_whatsapp_config(config_id: str, db: Session = Depends(get_db)):
    """
    Delete a WhatsApp configuration.
    """
    db_config = db.query(WhatsAppConfig).filter(WhatsAppConfig.id == config_id).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="WhatsApp configuration not found")
    
    db.delete(db_config)
    db.commit()
    
    return {"message": "WhatsApp configuration deleted successfully"}

@router.post("/whatsapp/config/{config_id}/activate")
async def activate_whatsapp_config(config_id: str, db: Session = Depends(get_db)):
    """
    Activate a WhatsApp configuration (deactivates all others).
    """
    # Deactivate all configs
    db.query(WhatsAppConfig).update({"is_active": False})
    
    # Activate this one
    db_config = db.query(WhatsAppConfig).filter(WhatsAppConfig.id == config_id).first()
    
    if not db_config:
        raise HTTPException(status_code=404, detail="WhatsApp configuration not found")
    
    db_config.is_active = True
    db.commit()
    
    return {
        "message": "WhatsApp configuration activated successfully",
        "config_id": str(config_id),
        "full_number": format_full_number(db_config.country_code, db_config.phone_number)
    }
