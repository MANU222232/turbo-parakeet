from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import time
from dotenv import load_dotenv

# MUST LOAD BEFORE ROUTERS
load_dotenv()

from routers import orders, users, shops, auth, upload, ai, payments, drivers, comms, stats, profiles, whatsapp
from db.session import engine, SessionLocal
from db.mongodb import client as mongo_client
from core.sockets import sio
import socketio

from contextlib import asynccontextmanager
from db.pool import db_pool
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db_pool.connect()
    yield
    # Shutdown
    await db_pool.disconnect()

app = FastAPI(title="SwiftTor API", lifespan=lifespan)


# CORS — set CORS_ORIGINS env var to a comma-separated list of allowed origins.
# Example: https://swifttor-web.onrender.com,https://yourdomain.com
# Falls back to wildcard for local dev when env var is not set.
_cors_origins_raw = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS: list[str] = (
    [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]
    if _cors_origins_raw
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    print(f"GLOBAL ERROR: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )

@app.get("/health")
async def health_check():
    health = {
        "status": "healthy",
        "postgres": "ok",
        "redis": "ok",
        "mongo": "ok"
    }
    
    # Check Postgres
    try:
        from sqlalchemy import text
        with SessionLocal() as db_session:
            db_session.execute(text("SELECT 1"))
    except Exception as e:
        health["postgres"] = f"error: {str(e)}"
        health["status"] = "degraded"

    # Check Upstash Redis (REST)
    try:
        from upstash_redis import Redis
        url = os.getenv("UPSTASH_REDIS_REST_URL")
        token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
        if url and token:
            r = Redis(url=url, token=token)
            if r.ping() != "PONG":
                health["redis"] = "error: ping failed"
                health["status"] = "degraded"
        else:
            health["redis"] = "error: missing credentials"
            health["status"] = "degraded"
    except Exception as e:
        health["redis"] = f"error: {str(e)}"
        health["status"] = "degraded"

    # Check MongoDB (Atlas)
    try:
        if mongo_client:
            await mongo_client.admin.command('ping')
        else:
            health["mongo"] = "error: client not initialized"
            health["status"] = "degraded"
    except Exception as e:
        health["mongo"] = f"error: {str(e)}"
        health["status"] = "degraded"

    return health

@app.get("/api/v1/protected")
async def protected_route(token: str = Header(None)):
    if not token or token == "invalid":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"message": "Authorized", "user": "Test User"}

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(profiles.router, prefix="/api/v1", tags=["profiles"])
app.include_router(shops.router, prefix="/api/v1/shops", tags=["shops"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(drivers.router, prefix="/api/v1/drivers", tags=["drivers"])
app.include_router(comms.router, prefix="/api/v1/comms", tags=["comms"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(whatsapp.router, prefix="/api/v1", tags=["whatsapp"])

# Mount Socket.io
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
