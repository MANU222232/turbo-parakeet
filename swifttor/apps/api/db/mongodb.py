from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "")

# Initialize client only if a non-dummy URI is provided
if MONGODB_URI and "dummy" not in MONGODB_URI:
    try:
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client.swifttor
    except Exception:
        client = None
        db = None
else:
    client = None
    db = None
