import uuid
from decimal import Decimal
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from db.session import SessionLocal, engine
from models.database import Base, User, UserRole, Shop, ShopVerificationStatus, Service, Product

def seed_data():
    db = SessionLocal()
    try:
        # 1. Create a dummy shop owner
        owner = User(
            name="Mike",
            phone="+1234567890",
            email="mike@service.com",
            role=UserRole.shop_owner,
            verified=True
        )
        db.add(owner)
        db.commit()
        db.refresh(owner)

        # 2. Create Services
        services = [
            Service(name="Towing", base_price=Decimal("75.00"), per_mile_rate=Decimal("5.00"), estimated_duration=30, required_skills=["towing"]),
            Service(name="Battery Jump", base_price=Decimal("50.00"), per_mile_rate=Decimal("0.00"), estimated_duration=15, required_skills=["battery"]),
            Service(name="Fuel Delivery", base_price=Decimal("40.00"), per_mile_rate=Decimal("2.00"), estimated_duration=20, required_skills=["fuel"]),
        ]
        db.add_all(services)
        db.commit()

        # 3. Create 5 Shops
        shops = []
        for i in range(5):
            shop = Shop(
                name=f"Mike's Service #{i+1}",
                lat=37.7749 + (i * 0.01),
                lng=-122.4194 + (i * 0.01),
                address=f"{100 + i} Main St, San Francisco, CA",
                services=["Towing", "Battery Jump", "Fuel Delivery"],
                rating=4.5 + (i * 0.1),
                completed_jobs=100 + (i * 10),
                avg_arrival_time=15 + i,
                owner_id=owner.id,
                verification_status=ShopVerificationStatus.approved
            )
            shops.append(shop)
        db.add_all(shops)
        db.commit()

        # 4. Create 10 Products for the first shop
        first_shop = shops[0]
        products = [
            Product(shop_id=first_shop.id, name="Hot Coffee", category="Drinks", price=Decimal("3.50"), stock_count=50, image_url="https://example.com/coffee.jpg"),
            Product(shop_id=first_shop.id, name="Burger", category="Hot Food", price=Decimal("8.99"), stock_count=30, image_url="https://example.com/burger.jpg"),
            Product(shop_id=first_shop.id, name="Water Bottle", category="Drinks", price=Decimal("1.50"), stock_count=100, image_url="https://example.com/water.jpg"),
            Product(shop_id=first_shop.id, name="Car Charger", category="Electronics", price=Decimal("15.00"), stock_count=20, image_url="https://example.com/charger.jpg"),
            Product(shop_id=first_shop.id, name="Blanket", category="Safety", price=Decimal("20.00"), stock_count=15, image_url="https://example.com/blanket.jpg"),
            Product(shop_id=first_shop.id, name="Snack Bar", category="Snacks", price=Decimal("2.50"), stock_count=60, image_url="https://example.com/snack.jpg"),
            Product(shop_id=first_shop.id, name="Gas Canister", category="Fuel", price=Decimal("25.00"), stock_count=10, image_url="https://example.com/gas.jpg"),
            Product(shop_id=first_shop.id, name="Flashlight", category="Electronics", price=Decimal("12.00"), stock_count=25, image_url="https://example.com/light.jpg"),
            Product(shop_id=first_shop.id, name="Crisps", category="Snacks", price=Decimal("1.99"), stock_count=40, image_url="https://example.com/crisps.jpg"),
            Product(shop_id=first_shop.id, name="Jump Leads", category="Safety", price=Decimal("35.00"), stock_count=5, image_url="https://example.com/leads.jpg"),
        ]
        db.add_all(products)
        db.commit()

        print("Seeding complete!")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
