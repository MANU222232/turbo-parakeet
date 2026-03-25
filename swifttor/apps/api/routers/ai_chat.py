from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
import random

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: dict

async def fake_stream_response(content: str):
    # Simulate thinking delay
    await asyncio.sleep(0.5)
    words = content.split()
    for word in words:
        yield f"data: {json.dumps({'content': word + ' '})}\n\n"
        await asyncio.sleep(0.1)
    yield "data: [DONE]\n\n"

@router.post("/stream")
async def chat_stream(req: ChatRequest):
    # Diagnostic logic simulation
    last_msg = req.messages[-1].content.lower()
    
    if "quote" in last_msg or "cost" in last_msg:
        response = "Based on your vehicle (2024 Tesla Model 3) and the overheating issue, the estimated towing cost to the nearest certified shop is $85.00. Should I proceed with dispatching a flatbed?"
    elif "status" in last_msg or "where" in last_msg:
        response = "I've analyzed your location. There are 3 service partners within 5 miles of you. One high-priority unit is available in 12 minutes. Would you like to see them on the map?"
    else:
        response = "I understand you're experiencing " + req.context.get("symptoms", ["an issue"])[0] + ". To give you the most accurate help, could you tell me if there's any smoke or if the engine makes a clicking sound?"

    return StreamingResponse(fake_stream_response(response), media_type="text/event-stream")

@router.post("/calculate-quote")
async def calculate_quote(req: dict):
    # Mock quote calculation
    base = 50.0
    mileage = 15.0 * 2.5 # 2.5 per mile
    total = base + mileage
    return {"quote": total, "currency": "USD"}
