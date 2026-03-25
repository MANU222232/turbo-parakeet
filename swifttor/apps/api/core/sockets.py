import socketio
import os
import json
import asyncio
from typing import Optional

# Setup Socket.io with Redis Manager for scaling
mgr = socketio.AsyncRedisManager(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
sio = socketio.AsyncServer(async_mode='asgi', client_manager=mgr, cors_allowed_origins="*")

class SocketManager:
    @staticmethod
    async def emit_to_order(order_id: str, event: str, data: dict):
        room = f"order_{order_id}"
        await sio.emit(event, data, room=room)

    @staticmethod
    async def emit_to_shop(shop_id: str, event: str, data: dict):
        room = f"shop_{shop_id}"
        await sio.emit(event, data, room=room)

    @staticmethod
    async def broadcast_status_change(order_id: str, status: str, message: str):
        data = {
            "status": status,
            "message": message,
            "timestamp": asyncio.get_event_loop().time()
        }
        await SocketManager.emit_to_order(order_id, "order:status_change", data)

@sio.event
async def connect(sid, environ):
    print(f"SOCKET CONNECTED: {sid}")

@sio.event
async def join_admin(sid, data):
    """
    Admins join a global room to monitor all activity.
    """
    await sio.enter_room(sid, "admin")
    print(f"ADMIN SID {sid} joined global monitoring room")

@sio.event
async def join_order(sid, data):
    order_id = data.get("order_id")
    if order_id:
        room = f"order_{order_id}"
        await sio.enter_room(sid, room)
        print(f"SID {sid} joined room {room}")

@sio.event
async def driver_location_update(sid, data):
    """
    Relays driver GPS to the customer track page and admin dashboard.
    """
    order_id = data.get("order_id")
    if order_id:
        # Relay to the order room (customer)
        await SocketManager.emit_to_order(order_id, "driver:location_update", data)
        # Relay to admin dashboard
        await sio.emit("driver:location_update", data, room="admin")

@sio.event
async def order_status_change(sid, data):
    """
    Relays status updates to the customer and admin dashboard.
    """
    order_id = data.get("order_id")
    if order_id:
        await SocketManager.broadcast_status_change(order_id, data.get("status"), data.get("message", "Status updated"))
        # Also notify admins globally
        await sio.emit("order:status_change", data, room="admin")

@sio.event
async def send_chat_message(sid, data):
    """
    Relays chat messages between admin and driver for a specific order.
    """
    order_id = data.get("order_id")
    if order_id:
        # Save to DB logic would happen in the router, 
        # but here we relay it in real-time.
        room = f"order_{order_id}"
        await sio.emit("new_chat_message", data, room=room)
        # Also ensure admins see it
        await sio.emit("new_chat_message", data, room="admin")
