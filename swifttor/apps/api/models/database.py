from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Enum, Numeric, Table
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship, declarative_base
import uuid
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    customer = "customer"
    driver = "driver"
    shop_owner = "shop_owner"

class ShopVerificationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    en_route = "en_route"
    arrived = "arrived"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class ItemType(str, enum.Enum):
    service = "service"
    product = "product"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    phone = Column(String)
    email = Column(String, unique=True, index=True)
    role = Column(Enum(UserRole))
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to profile
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Shop(Base):
    __tablename__ = "shops"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    address = Column(String)
    services = Column(ARRAY(String))
    rating = Column(Float, default=0.0)
    completed_jobs = Column(Integer, default=0)
    avg_arrival_time = Column(Integer)  # in minutes
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    verification_status = Column(Enum(ShopVerificationStatus), default=ShopVerificationStatus.pending)
    
    owner = relationship("User")

class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    shop_id = Column(UUID(as_uuid=True), ForeignKey("shops.id"))
    driver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    location_lat = Column(Float)
    location_lng = Column(Float)
    location_address = Column(String)
    issue_description = Column(String)
    images = Column(ARRAY(String))
    quote_amount = Column(Numeric(10, 2))
    final_amount = Column(Numeric(10, 2))
    payment_status = Column(String)
    payment_method = Column(String)
    eta_initial = Column(DateTime)
    eta_current = Column(DateTime)
    arrived_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    item_type = Column(Enum(ItemType))
    item_id = Column(UUID(as_uuid=True))
    quantity = Column(Integer)
    unit_price = Column(Numeric(10, 2))
    total_price = Column(Numeric(10, 2))

class Product(Base):
    __tablename__ = "products"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shop_id = Column(UUID(as_uuid=True), ForeignKey("shops.id"))
    name = Column(String)
    category = Column(String)
    price = Column(Numeric(10, 2))
    stock_count = Column(Integer)
    image_url = Column(String)

class Service(Base):
    __tablename__ = "services"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    base_price = Column(Numeric(10, 2))
    per_mile_rate = Column(Numeric(10, 2))
    estimated_duration = Column(Integer)  # in minutes
    required_skills = Column(ARRAY(String))

class DriverLocation(Base):
    __tablename__ = "driver_locations"
    driver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    lat = Column(Float)
    lng = Column(Float)
    heading = Column(Float)
    speed = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    country = Column(String, default="USA")
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    preferences = Column(String, nullable=True)  # JSON string for flexible preferences
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to user
    user = relationship("User", back_populates="profile")

class WhatsAppConfig(Base):
    __tablename__ = "whatsapp_config"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String, nullable=False)
    country_code = Column(String, default="+1")  # e.g., +1 for US, +254 for Kenya
    display_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    webhook_url = Column(String, nullable=True)
    api_token = Column(String, nullable=True)  # Encrypted in production
    message_templates = Column(String, nullable=True)  # JSON string for templates
    auto_reply_enabled = Column(Boolean, default=False)
    business_hours_start = Column(String, nullable=True)  # HH:MM format
    business_hours_end = Column(String, nullable=True)  # HH:MM format
    timezone = Column(String, default="UTC")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
