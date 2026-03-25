import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from twilio.rest import Client

router = APIRouter()

# Twilio Credentials (mocked/env based)
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PROXY_SERVICE = os.getenv("TWILIO_PROXY_SERVICE_SID")

client = Client(TWILIO_SID, TWILIO_AUTH) if TWILIO_SID else None

class CallProxyRequest(BaseModel):
    customer_phone: str
    driver_phone: str

@router.post("/call-proxy")
async def create_masked_call(req: CallProxyRequest):
    if not client:
        return {"masked_number": "555-PROXY-MOCK", "session_sid": "mock_id"}
    
    try:
        # 1. Create Proxy Session
        session = client.proxy.v1.services(TWILIO_PROXY_SERVICE).sessions.create(unique_name=f"call_{os.urandom(4).hex()}")
        
        # 2. Add Participants
        client.proxy.v1.services(TWILIO_PROXY_SERVICE).sessions(session.sid).participants.create(identifier=req.customer_phone)
        client.proxy.v1.services(TWILIO_PROXY_SERVICE).sessions(session.sid).participants.create(identifier=req.driver_phone)
        
        # 3. Get Proxy Number
        proxy_number = client.proxy.v1.services(TWILIO_PROXY_SERVICE).phone_numbers.list(limit=1)[0].phone_number
        
        return {"masked_number": proxy_number, "session_sid": session.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SMSRequest(BaseModel):
    phone: str
    message: str

@router.post("/sms/notify")
async def send_sms_notification(req: SMSRequest):
    if not client:
        print(f"SMS MOCK [TO {req.phone}]: {req.message}")
        return {"status": "mock_sent"}
    
    try:
        message = client.messages.create(
            body=req.message,
            from_=os.getenv("TWILIO_PHONE_NUMBER"),
            to=req.phone
        )
        return {"status": "sent", "sid": message.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
