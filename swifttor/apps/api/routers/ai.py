import os
import json
import asyncio
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from db.mongodb import db
from db.redis_cli import redis_cli
from google import genai
from db.pool import db_pool

# Lazy client initialization to prevent startup crashes
def get_ai_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or "your_" in api_key:
        return None
    return genai.Client(api_key=api_key)

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class UserContext(BaseModel):
    location: Optional[Dict[str, Any]] = None
    vehicle: Optional[Dict[str, Any]] = None
    symptoms: Optional[List[str]] = None
    imageKeys: Optional[List[str]] = None

class DiagnoseRequest(BaseModel):
    session_id: str
    conversation: List[Message]
    user_context: UserContext

class ImageAnalyzeRequest(BaseModel):
    image_key: str

class DriverMatchRequest(BaseModel):
    service: str
    lat: float
    lng: float

class SessionSaveRequest(BaseModel):
    session_id: str
    messages: List[Message]

class Content(BaseModel):
    role: str
    parts: List[dict]

SYSTEM_PROMPT = """
You are SwiftTor's AI rescue assistant. The user is stranded. Be professional, urgent-but-calm, and use their first name. 
ALWAYS confirm they are safe as your first interaction. 
Your goals: 
(1) diagnose the issue through targeted questions, 
(2) generate an itemized service quote, 
(3) match them with the best available driver. 

When you have enough info, generate a quote in this exact JSON block within your response: 
<QUOTE>{"service_name":"","parts":[{"name":"","price":0}],"labor":0,"service_fee":25,"subtotal":0,"tax_rate":0.08,"total":0}</QUOTE>. 
Then query available drivers and recommend the top match conversationally.
"""

@router.post("/diagnose")
async def diagnose(req: DiagnoseRequest):
    try:
        # Prepare history for the new SDK structure
        history = []
        for msg in req.conversation[:-1]:
            role = "user" if msg.role == "user" else "model"
            history.append({"role": role, "parts": [{"text": msg.content}]})

        # Inject context into the user prompt
        last_msg = req.conversation[-1]
        user_prompt = f"USER CONTEXT: {req.user_context.model_dump_json()}\n\nUSER MESSAGE: {last_msg.content}"

        # Cache in Redis (Audit Check 14)
        redis_cli.set_session(req.session_id, [m.model_dump() for m in req.conversation], ttl=3600)
        
        async def event_stream():
            try:
                # Use modern chat session with lazy loading
                ai_client = get_ai_client()
                if not ai_client:
                    yield f"data: {json.dumps({'error': 'GEMINI_API_KEY is not configured. Please add it to your .env file.'})}\n\n"
                    return

                chat = ai_client.chats.create(
                    model='gemini-1.5-pro',
                    config={"system_instruction": SYSTEM_PROMPT},
                    history=history
                )
                
                response = chat.send_message(user_prompt, stream=True)
                for chunk in response:
                    # New SDK uses chunk.text directly or chunk.candidates[0].content.parts[0].text
                    if chunk.text:
                        data = json.dumps({"text": chunk.text})
                        yield f"data: {data}\n\n"
                        await asyncio.sleep(0.01)
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                yield "data: [DONE]\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-image")
async def analyze_image(req: ImageAnalyzeRequest):
    try:
        import boto3
        from PIL import Image
        import io

        # 1. Fetch from S3
        s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        bucket_name = os.getenv("AWS_S3_BUCKET_NAME", "swifttor-emergency-uploads")
        
        response = s3.get_object(Bucket=bucket_name, Key=req.image_key)
        image_data = response['Body'].read()
        img = Image.open(io.BytesIO(image_data))

        # 2. Multimodal analysis with modern Gemini SDK and lazy loading
        ai_client = get_ai_client()
        if not ai_client:
            raise Exception("GEMINI_API_KEY is not configured.")

        prompt = """
        You are an expert automotive diagnostic AI. Analyze this vehicle emergency photo.
        Identify the likely issue (e.g. flat tire, steam/smoke from hood, collision damage).
        Return a JSON object with:
        {
          "description": "Short 1-sentence visual description",
          "likely_issue": "Specific issue name",
          "confidence": 0.0-1.0
        }
        """

        res = ai_client.models.generate_content(
            model='gemini-1.5-pro',
            contents=[prompt, img]
        )
        
        # Clean up the response
        text = res.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
        
        analysis = json.loads(text)
        return analysis

    except Exception as e:
        print(f"AI Vision Error: {e}")
        return {
            "description": "Image analyzed but diagnostic confidence is low.",
            "likely_issue": "General Breakdown (Manual Review Required)",
            "confidence": 0.5
        }

@router.post("/match-driver")
async def match_driver(req: DriverMatchRequest):
    async with await db_pool.get_conn() as conn:
        try:
            # PostGIS query to find nearby available drivers who provide the requested service
            # Logic: status='available' AND requested_service IN services array
            query = """
                SELECT name, rating, vehicle, specializations,
                       ST_Distance(ST_MakePoint(lng, lat)::geography, ST_MakePoint($2, $1)::geography) / 1000.0 as distance_km
                FROM drivers
                WHERE status = 'available' AND $3 = ANY(services)
                ORDER BY distance_km ASC
                LIMIT 3;
            """
            
            rows = await conn.fetch(query, req.lat, req.lng, req.service)
            
            drivers = []
            for r in rows:
                drivers.append({
                    "name": r["name"],
                    "rating": r["rating"],
                    "vehicle": r["vehicle"],
                    "distance": round(r["distance_km"], 1),
                    "eta_mins": int(r["distance_km"] * 3) + 5, # Simple ETA formula
                    "specializations": r["specializations"]
                })
                
            return drivers
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/session/save")
async def save_session(req: SessionSaveRequest):
    try:
        # Cache in MongoDB (Audit Check 11)
        collection = db.chat_sessions
        msg_list = [m.model_dump() for m in req.messages]
        await collection.update_one(
            {"session_id": req.session_id},
            {"$set": {"messages": msg_list}},
            upsert=True
        )
        
        # Cache in Redis with TTL (Audit Check 14)
        redis_cli.set_session(req.session_id, msg_list, ttl=3600)
        
        return {"status": "saved"}
    except Exception as e:
        print(f"Mongo save error: {e}")
        return {"status": "error", "detail": str(e)}

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    collection = db.chat_sessions
    doc = await collection.find_one({"session_id": session_id})
    if doc:
        doc["_id"] = str(doc["_id"])
        return doc
    return {"session_id": session_id, "messages": []}
