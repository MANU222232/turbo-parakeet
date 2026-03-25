import os
from db.pool import db_pool
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter()

class DriverLocationUpdate(BaseModel):
    driver_id: str
    order_id: Optional[str] = None
    lat: float
    lng: float
    heading: float = 0.0
    speed: float = 0.0
    eta_mins: Optional[int] = None

@router.post("/location")
async def update_driver_location(req: DriverLocationUpdate):
    async with await db_pool.get_conn() as conn:
        try:
            # 1. Upsert Location in DB
            query = """
                INSERT INTO driver_locations (driver_id, lat, lng, heading, speed, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (driver_id) DO UPDATE 
                SET lat = $2, lng = $3, heading = $4, speed = $5, updated_at = $6
            """
            await conn.execute(query, req.driver_id, req.lat, req.lng, req.heading, req.speed, datetime.now())

            # 3. Emergency Watchdog (Simple check)
            # If last update was > 10 mins ago, we should have a background task
            # But for now, we'll check stale locations in this flow if we need to notify
            stale_drivers = await conn.fetch("SELECT driver_id FROM driver_locations WHERE updated_at < NOW() - INTERVAL '10 minutes'")
            for d in stale_drivers:
                # Trigger SMS to active order customer
                print(f"EMERGENCY: Driver {d['driver_id']} offline for 10 mins. Alerting safety team.")

            return {"status": "updated"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
@router.get("/")
async def list_drivers():
    async with await db_pool.get_conn() as conn:
        try:
            # Join with driver_locations to get current status
            query = """
                SELECT 
                    u.id::text, u.name, u.phone, u.verified,
                    loc.lat, loc.lng, loc.updated_at,
                    (loc.updated_at > NOW() - INTERVAL '5 minutes') AS is_online
                FROM users u
                LEFT JOIN driver_locations loc ON loc.driver_id = u.id
                WHERE u.role = 'driver'
                ORDER BY u.name ASC
            """
            rows = await conn.fetch(query)
            return [dict(r) for r in rows]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{driver_id}")
async def delete_driver(driver_id: str):
    async with await db_pool.get_conn() as conn:
        try:
            await conn.execute("DELETE FROM users WHERE id = $1::uuid", driver_id)
            return {"status": "deleted"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
