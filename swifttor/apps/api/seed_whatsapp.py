"""
Seed script to create initial WhatsApp configuration.
Run this after running migrations.

Usage:
    python apps/api/seed_whatsapp.py
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from api.models.database import WhatsAppConfig, Base
from api.db.session import engine

def seed_whatsapp_config():
    """Create initial WhatsApp configuration."""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as db:
        # Check if config already exists
        existing = db.query(WhatsAppConfig).first()
        
        if existing:
            print("✓ WhatsApp configuration already exists")
            print(f"  Phone: {existing.country_code} {existing.phone_number}")
            print(f"  Display Name: {existing.display_name}")
            return
        
        # Create default configuration
        # You can customize these values or set via environment variables
        whatsapp_config = WhatsAppConfig(
            phone_number=os.getenv("WHATSAPP_PHONE", "1234567890"),
            country_code=os.getenv("WHATSAPP_COUNTRY_CODE", "+1"),
            display_name=os.getenv("WHATSAPP_DISPLAY_NAME", "SwiftTor Support"),
            is_active=True,
            webhook_url=os.getenv("WHATSAPP_WEBHOOK_URL"),
            api_token=os.getenv("WHATSAPP_API_TOKEN"),
            auto_reply_enabled=True,
            business_hours_start="09:00",
            business_hours_end="17:00",
            timezone=os.getenv("WHATSAPP_TIMEZONE", "UTC")
        )
        
        db.add(whatsapp_config)
        db.commit()
        db.refresh(whatsapp_config)
        
        print("✓ WhatsApp configuration created successfully!")
        print(f"  ID: {whatsapp_config.id}")
        print(f"  Phone: {whatsapp_config.country_code} {whatsapp_config.phone_number}")
        print(f"  Display Name: {whatsapp_config.display_name}")
        print(f"  Active: {whatsapp_config.is_active}")
        print("\nTo update the configuration, use the API endpoints:")
        print(f"  GET    /api/v1/whatsapp/config")
        print(f"  PUT    /api/v1/whatsapp/config/{whatsapp_config.id}")
        print(f"  POST   /api/v1/whatsapp/config/{whatsapp_config.id}/activate")

if __name__ == "__main__":
    seed_whatsapp_config()
