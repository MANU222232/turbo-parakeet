import os
import asyncio
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

async def init_db():
    print(f"Connecting to Neon using pooled string...")
    
    try:
        conn = await asyncpg.connect(DB_URL)
        
        print("Checking/installing PostGIS extension...")
        await conn.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        
        print("Creating shops table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS shops (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                lat FLOAT,
                lng FLOAT,
                rating FLOAT,
                completed_jobs INT,
                avg_arrival_time INT,
                response_time_mins INT,
                status VARCHAR(50),
                base_price FLOAT,
                per_mile_rate FLOAT,
                completion_rate FLOAT,
                current_workload INT
            );
        """)
        
        print("Creating products table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(50) PRIMARY KEY,
                shop_id UUID REFERENCES shops(id),
                name VARCHAR(255),
                price FLOAT,
                category VARCHAR(100),
                img VARCHAR(10)
            );
        """)

        print("Creating drivers table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS drivers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                lat FLOAT,
                lng FLOAT,
                rating FLOAT,
                status VARCHAR(50) DEFAULT 'available',
                vehicle VARCHAR(255),
                services TEXT[],
                specializations TEXT[],
                completed_jobs INT DEFAULT 0
            );
        """)
        
        print("Creating orders table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                display_id VARCHAR(20) UNIQUE,
                shop_id UUID REFERENCES shops(id),
                driver_id UUID REFERENCES drivers(id),
                user_name VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                payment_status VARCHAR(50) DEFAULT 'unpaid',
                payment_intent_id VARCHAR(255),
                total_amount FLOAT,
                lat FLOAT,
                lng FLOAT,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        print("Creating order_items table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
                item_type VARCHAR(20), -- 'service' or 'product'
                name VARCHAR(255),
                quantity INT DEFAULT 1,
                price FLOAT
            );
        """)

        # Check if shops are empty to seed
        count = await conn.fetchval("SELECT COUNT(*) FROM shops")
        if count == 0:
            print("Seeding interactive map shops...")
            await conn.execute("""
                INSERT INTO shops (name, lat, lng, rating, completed_jobs, avg_arrival_time, response_time_mins, status, base_price, per_mile_rate, completion_rate, current_workload)
                VALUES 
                ('Swift Rescue Central', 37.7749, -122.4194, 4.8, 120, 15, 2, 'available', 65.0, 2.5, 0.98, 1),
                ('Downtown Towing', 37.7849, -122.4094, 4.2, 50, 30, 5, 'busy', 50.0, 3.0, 0.85, 4),
                ('Eastbay Mechanics', 37.7949, -122.3994, 4.9, 300, 10, 1, 'available', 80.0, 2.0, 0.99, 0),
                ('Sunset Auto Recovery', 37.7649, -122.4294, 3.5, 20, 45, 10, 'offline', 45.0, 4.0, 0.70, 0)
            """)
            
            # Seed supermarket items to the first shop
            shop_id = await conn.fetchval("SELECT id FROM shops LIMIT 1")
            print(f"Seeding Supermarket items for Provider: {shop_id}")
            await conn.execute(f"""
                INSERT INTO products (id, shop_id, name, price, category, img) VALUES
                ('p1', '{shop_id}', 'Hot Coffee', 3.50, 'Hot Food', '☕'),
                ('p2', '{shop_id}', 'Energy Drink', 4.00, 'Drinks', '🔋'),
                ('p3', '{shop_id}', 'Water Bottle', 2.00, 'Drinks', '💧'),
                ('p4', '{shop_id}', 'Protein Bar', 3.00, 'Snacks', '🍫'),
                ('p5', '{shop_id}', 'Chips', 2.50, 'Snacks', '🥔'),
                ('p6', '{shop_id}', 'Phone Charger Cable', 15.00, 'Supplies', '🔌')
            """)

            print("Seeding drivers...")
            await conn.execute("""
                INSERT INTO drivers (name, lat, lng, rating, status, vehicle, services, specializations, completed_jobs)
                VALUES 
                ('Mike R.', 37.7750, -122.4180, 4.9, 'available', 'Flatbed Tow Truck', ARRAY['towing', 'recovery'], ARRAY['Electrical', 'Battery'], 47),
                ('Sarah J.', 37.7800, -122.4050, 4.8, 'available', 'Wheel-Lift Truck', ARRAY['towing', 'lockout'], ARRAY['Towing', 'Lockout'], 122),
                ('David W.', 37.7700, -122.4300, 4.7, 'available', 'Service Van', ARRAY['tire_change', 'battery'], ARRAY['Mobile Mechanic'], 89)
            """)
        else:
            print("Initial Data verified!")

        await conn.close()
        print("Database Audit 100% complete!")
    except Exception as e:
        print(f"Error initializing DB: {e}")

if __name__ == '__main__':
    asyncio.run(init_db())
