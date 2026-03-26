import os
from db.pool import db_pool
import math
import random
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()


class OrderCreate(BaseModel):
    user_id: str
    shop_id: str
    vehicle: dict
    location: dict
    symptoms: List[str]
    total_price: float


def calculate_haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@router.get("/eta")
async def get_order_eta(
    shopId: str = Query(...),
    lat: float = Query(...),
    lng: float = Query(...)
):
    async with await db_pool.get_conn() as conn:
        try:
            shop = await conn.fetchrow("SELECT lat, lng, current_workload FROM shops WHERE id = $1::uuid", shopId)
            if not shop:
                raise HTTPException(status_code=404, detail="Shop not found")

            dist_km = calculate_haversine_km(shop['lat'], shop['lng'], lat, lng)
            driving_time_mins = (dist_km / 40) * 60
            workload_buffer = shop['current_workload'] * 5
            total_eta_mins = round(float(driving_time_mins + workload_buffer))
            final_eta = max(10, total_eta_mins)
            arrives_at = (datetime.now() + timedelta(minutes=final_eta)).strftime("%I:%M %p")

            return {
                "eta_mins": final_eta,
                "arrives_at": arrives_at,
                "dist_km": round(float(dist_km), 1),
                "buffer_applied": workload_buffer
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def get_orders():
    async with await db_pool.get_conn() as conn:
        try:
            rows = await conn.fetch("SELECT id, display_id, status, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 50")
            return [dict(r) for r in rows]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/id/{order_id}")
async def get_order_by_id(order_id: str):
    """
    Returns full order detail used by the confirmation and tracking pages.
    Includes display_id, driver_name, vehicle_desc, arrives_at, total_amount, status.
    """
    async with await db_pool.get_conn() as conn:
        try:
            row = await conn.fetchrow(
                """
                SELECT
                    o.id, o.display_id, o.status, o.payment_status,
                    o.total_amount, o.location_lat AS lat, o.location_lng AS lng, o.location_address AS address,
                    o.created_at,
                    -- Compute arrives_at from the original ETA stored at creation
                    (o.created_at + INTERVAL '1 minute' * COALESCE(o.eta_mins, 18)) AS arrives_at,
                    o.eta_mins,
                    -- Driver info (may be NULL if not yet assigned)
                    d.name AS driver_name,
                    d.vehicle_desc,
                    d.photo_url AS driver_photo,
                    d.phone AS driver_phone
                FROM orders o
                LEFT JOIN users d ON d.id = o.driver_id
                WHERE o.id = $1::uuid
                """,
                order_id
            )
            if not row:
                raise HTTPException(status_code=404, detail="Order not found")

            result = dict(row)
            # Format arrives_at as readable time string
            if result.get("arrives_at"):
                result["arrives_at"] = result["arrives_at"].strftime("%I:%M %p")
            if result.get("created_at"):
                result["created_at"] = result["created_at"].isoformat()
            return result
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_order(order: OrderCreate):
    """
    Standalone order creation (without payment). Persists to DB.
    The main order+payment flow goes through /payments/confirm.
    """
    async with await db_pool.get_conn() as conn:
        try:
            now = datetime.now()
            date_str = now.strftime("%y%m%d")
            rand_str = os.urandom(3).hex().upper()
            display_id = f"ST-{date_str}-{rand_str}"

            order_id = await conn.fetchval(
                """
                INSERT INTO orders
                    (display_id, shop_id, user_id, total_amount, location_lat, location_lng, location_address, payment_status, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'pending')
                RETURNING id
                """,
                display_id,
                order.shop_id,
                order.user_id,
                order.total_price,
                order.location.get("lat", 0),
                order.location.get("lng", 0),
                order.location.get("address", "Unknown"),
            )
            return {"id": str(order_id), "display_id": display_id, "status": "dispatched", "message": "Driver is on the way!"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/available")
async def get_available_jobs(lat: float = Query(...), lng: float = Query(...), radius_km: float = 20.0):
    """
    Finds pending recovery orders within the specified radius.
    """
    async with await db_pool.get_conn() as conn:
        try:
            # 1. Fetch all pending orders
            rows = await conn.fetch("SELECT id, display_id, location_lat AS lat, location_lng AS lng, location_address AS address, total_amount, created_at FROM orders WHERE status = 'pending'")
            
            available = []
            for r in rows:
                dist = calculate_haversine_km(lat, lng, r['lat'], r['lng'])
                if dist <= radius_km:
                    job = dict(r)
                    job.update({
                        "distance": f"{dist:.1f}km",
                        "name": "Recovery Mission",
                        "price": float(r['total_amount']),
                        "dist_km": float(dist)
                    })
                    available.append(job)
            
            return sorted(available, key=lambda x: x['dist_km'] if 'dist_km' in x else 0)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-orders")
async def get_my_orders(user_id: str = Query(...)):
    """
    Get all orders for a specific user
    """
    async with await db_pool.get_conn() as conn:
        try:
            rows = await conn.fetch(
                """
                SELECT 
                    id, display_id, status, payment_status,
                    total_amount AS final_amount,
                    location_lat, location_lng, location_address,
                    issue_description,
                    created_at
                FROM orders 
                WHERE user_id = $1::uuid 
                ORDER BY created_at DESC
                """,
                user_id
            )
            return [dict(r) for r in rows]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/{order_id}/accept")
async def accept_job(order_id: str, driver_id: str = Query(...)):
    """
    Assigns a driver to an order and updates status to 'accepted'.
    """
    async with await db_pool.get_conn() as conn:
        try:
            # Use transaction to ensure no double-acceptance
            async with conn.transaction():
                current_status = await conn.fetchval("SELECT status FROM orders WHERE id = $1::uuid", order_id)
                if current_status != 'pending':
                    raise HTTPException(status_code=400, detail="Job already taken")
                
                await conn.execute(
                    "UPDATE orders SET driver_id = $2::uuid, status = 'accepted' WHERE id = $1::uuid",
                    order_id, driver_id
                )
                
                # Emit status change via Socket.io
                try:
                    from core.sockets import sio
                    await sio.emit("order:status_change", {"order_id": order_id, "status": "accepted"}, room=f"order_{order_id}")
                except:
                    pass
                
            return {"status": "success", "message": "Mission started"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, status: str = Query(...)):
    """
    Updates the status of an order (en_route, arrived, completed, etc.).
    """
    async with await db_pool.get_conn() as conn:
        try:
            await conn.execute("UPDATE orders SET status = $2 WHERE id = $1::uuid", order_id, status)
            
            # If status is 'completed', trigger payment capture (Escrow)
            if status == 'completed':
                try:
                    # Get the payment intent ID
                    pi_id = await conn.fetchval("SELECT payment_intent_id FROM orders WHERE id = $1::uuid", order_id)
                    if pi_id:
                        import stripe
                        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
                        stripe.PaymentIntent.capture(pi_id)
                        await conn.execute("UPDATE orders SET payment_status = 'captured' WHERE id = $1::uuid", order_id)
                except Exception as e:
                    print(f"ESCROW CAPTURE FAILED for order {order_id}: {e}")

            # Emit status change via Socket.io
            try:
                from core.sockets import sio
                await sio.emit("order:status_change", {"order_id": order_id, "status": status}, room=f"order_{order_id}")
            except:
                pass
                
            return {"status": "success", "new_status": status}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/{order_id}/cancel")
async def cancel_order(order_id: str):
    """
    Cancels an order and notifies the driver.
    """
    async with await db_pool.get_conn() as conn:
        try:
            await conn.execute("UPDATE orders SET status = 'cancelled' WHERE id = $1::uuid", order_id)
            
            try:
                from core.sockets import sio
                await sio.emit("order:status_change", {"order_id": order_id, "status": "cancelled"}, room=f"order_{order_id}")
            except:
                pass
                
            return {"status": "success", "message": "Order cancelled"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/{order_id}/share-token")
async def generate_share_token(order_id: str):
    """
    Generates a secure tracking URL for the order.
    """
    app_url = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    return {"url": f"{app_url}/order/{order_id}/track"}


# Import at end to avoid circularity
try:
    from core.sockets import sio
except ImportError:
    pass
