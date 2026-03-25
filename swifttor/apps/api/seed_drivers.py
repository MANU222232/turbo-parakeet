import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def seed():
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    count = await conn.fetchval("SELECT COUNT(*) FROM drivers")
    if count == 0:
        print("Seeding drivers...")
        await conn.execute("""
            INSERT INTO drivers (name, lat, lng, rating, status, vehicle, services, specializations, completed_jobs)
            VALUES 
            ('Mike R.', 37.7750, -122.4180, 4.9, 'available', 'Flatbed Tow Truck', ARRAY['towing', 'recovery'], ARRAY['Electrical', 'Battery'], 47),
            ('Sarah J.', 37.7800, -122.4050, 4.8, 'available', 'Wheel-Lift Truck', ARRAY['towing', 'lockout'], ARRAY['Towing', 'Lockout'], 122),
            ('David W.', 37.7700, -122.4300, 4.7, 'available', 'Service Van', ARRAY['tire_change', 'battery'], ARRAY['Mobile Mechanic'], 89)
        """)
        print("Done.")
    else:
        print(f"Drivers already seeded: {count}")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(seed())
