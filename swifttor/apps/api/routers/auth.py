from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()

class RegisterRequest(BaseModel):
    phone: str
    name: Optional[str] = None

class VerifyRequest(BaseModel):
    phone: str
    otp: str

# Mock DB for OTPs
otp_store = {}

@router.post("/register")
async def register(req: RegisterRequest):
    # In a real app, generate a 6-digit code and send via Twilio
    otp = "123456" 
    otp_store[req.phone] = otp
    print(f"OTP for {req.phone}: {otp}")
    return {"message": "OTP sent"}

import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("NEXTAUTH_SECRET", "supersecret")
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/refresh")
async def refresh(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        data = {"sub": user_id, "role": role}
        return {
            "accessToken": create_access_token(data),
            "refreshToken": create_refresh_token(data)
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/verify")
async def verify(req: VerifyRequest):
    if req.phone in otp_store and otp_store[req.phone] == req.otp:
        user_id = str(uuid.uuid4())
        data = {"sub": user_id, "role": "customer"}
        return {
            "id": user_id,
            "name": "Test User",
            "email": f"{req.phone}@test.com",
            "role": "customer",
            "accessToken": create_access_token(data),
            "refreshToken": create_refresh_token(data)
        }
    raise HTTPException(status_code=401, detail="Invalid OTP")
