import os
import stripe
from db.pool import db_pool
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from db.redis_cli import redis_cli
from core.sockets import sio

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentIntentRequest(BaseModel):
    amount_cents: int
    currency: str = "kes" # As per audit Kes, but usually usd
    capture_method: str = "manual"
    phone: str

class OrderItem(BaseModel):
    item_type: str
    name: str
    quantity: int
    price: float

class OrderConfirmRequest(BaseModel):
    payment_intent_id: str
    shop_id: str
    driver_id: Optional[str] = None
    user_name: str
    items: List[OrderItem]
    total_amount: float
    lat: float
    lng: float
    address: str
    billing_zip: str
    payment_method: str = "card"

@router.post("/intent")
async def create_payment_intent(req: PaymentIntentRequest):
    # Ensure API Key is set
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    
    # Fraud Check: Rate limit 3 attempts per phone per hour
    rate_key = f"payment_attempts:{req.phone}"
    attempts = redis_cli.get_cache(rate_key) or 0
    if attempts >= 3:
        raise HTTPException(status_code=429, detail="Too many payment attempts. Please try again later.")
    
    redis_cli.set_cache(rate_key, attempts + 1, ttl=3600)

    try:
        key = os.getenv("STRIPE_SECRET_KEY")
        intent = stripe.PaymentIntent.create(
            amount=req.amount_cents,
            currency=req.currency,
            capture_method=req.capture_method,
            metadata={"phone": req.phone},
            api_key=key
        )
        return {"client_secret": intent.client_secret, "id": intent.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/confirm")
async def confirm_payment(req: OrderConfirmRequest):
    from middleware.fraud import perform_fraud_check
    
    # 0. Fraud Check
    fraud = await perform_fraud_check(req.billing_zip, req.lat, req.lng, req.address)
    if fraud["status"] == "flagged":
        print(f"FRAUD WARNING: Order flagged for {req.user_name} - {fraud['reason']}")

    async with await db_pool.get_conn() as conn:
        try:
            # 1. Verify Payment Intent if card
            p_status = 'held'
            if req.payment_method == 'card':
                intent = stripe.PaymentIntent.retrieve(req.payment_intent_id)
                if intent.status not in ["requires_capture", "succeeded"]:
                     raise HTTPException(status_code=400, detail="Payment not authorized")
            elif req.payment_method == 'arrival':
                p_status = 'pay_on_arrival'

            # 2. Generate Display ID (ST-YYMMDD-XXXXX)
            now = datetime.now()
            date_str = now.strftime("%y%m%d")
            rand_str = os.urandom(3).hex().upper()
            display_id = f"ST-{date_str}-{rand_str}"

            # 3. Create Order
            order_query = """
                INSERT INTO orders (display_id, shop_id, driver_id, user_name, total_amount, lat, lng, address, payment_intent_id, payment_status, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
                RETURNING id
            """
            order_id = await conn.fetchval(
                order_query, display_id, req.shop_id, req.driver_id, req.user_name, 
                req.total_amount, req.lat, req.lng, req.address, req.payment_intent_id, p_status
            )

            # 4. Create Order Items
            for item in req.items:
                await conn.execute(
                    "INSERT INTO order_items (order_id, item_type, name, quantity, price) VALUES ($1, $2, $3, $4, $5)",
                    order_id, item.item_type, item.name, item.quantity, item.price
                )

            # 5. Socket.io Emit – notify shop dashboard in real-time
            try:
                await sio.emit(
                    "new_order",
                    {
                        "order_id": str(order_id),
                        "display_id": display_id,
                        "user_name": req.user_name,
                        "address": req.address,
                        "total_amount": req.total_amount,
                        "items": [i.model_dump() for i in req.items]
                    },
                    room=f"shop_{req.shop_id}"
                )
            except Exception as socket_err:
                print(f"Socket emit warning: {socket_err}")

            return {
                "status": "success",
                "order_id": str(order_id),
                "display_id": display_id,
                "fraud_flag": fraud["status"] == "flagged",
                "fraud_reason": fraud.get("reason") if fraud["status"] == "flagged" else None
            }

        except Exception as e:
            print(f"Confirm Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/capture/{order_id}")
async def capture_payment(order_id: str):
    async with await db_pool.get_conn() as conn:
        try:
            # Get intent ID
            pi_id = await conn.fetchval("SELECT payment_intent_id FROM orders WHERE id = $1::uuid", order_id)
            if not pi_id:
                raise HTTPException(status_code=404, detail="Order or Payment Intent not found")

            # Capture in Stripe
            stripe.PaymentIntent.capture(pi_id)

            # Update DB
            await conn.execute("UPDATE orders SET payment_status = 'captured', status = 'completed' WHERE id = $1::uuid", order_id)
            
            return {"status": "captured"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

@router.post("/refund/{order_id}")
async def refund_order(order_id: str):
    async with await db_pool.get_conn() as conn:
        try:
            pi_id = await conn.fetchval("SELECT payment_intent_id FROM orders WHERE id = $1::uuid", order_id)
            if not pi_id:
                raise HTTPException(status_code=404, detail="Order not found")

            # Refund in Stripe
            stripe.Refund.create(payment_intent=pi_id)

            # Update DB
            await conn.execute("UPDATE orders SET payment_status = 'refunded', status = 'cancelled' WHERE id = $1::uuid", order_id)
            
            return {"status": "refunded"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

@router.get("/id/{order_id}")
async def get_order_by_id(order_id: str):
    async with await db_pool.get_conn() as conn:
        try:
            row = await conn.fetchrow("SELECT * FROM orders WHERE id = $1::uuid", order_id)
            if not row:
                raise HTTPException(status_code=404, detail="Order not found")
            return dict(row)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/{order_id}/share-token")
async def generate_share_token(order_id: str):
    token = os.urandom(16).hex()
    url = f"{os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')}/track/{token}"
    return {"token": token, "url": url}

@router.post("/shops/{shop_id}/kitchen-orders")
async def kitchen_order_sync(shop_id: str, items: List[OrderItem]):
    # In Phase 7 this will push to FCM
    print(f"KITCHEN SYNC: {len(items)} items sent to Shop {shop_id}")
    return {"status": "synced"}
