import os
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from datetime import datetime
import json
from db.pool import db_pool

router = APIRouter()

async def stats_generator():
    while True:
        try:
            async with await db_pool.get_conn() as conn:
                # 1. Drivers assisted today
                assisted = await conn.fetchval(
                    "SELECT COUNT(*) FROM orders WHERE status = 'completed' AND created_at >= CURRENT_DATE"
                )

                # 2. Drivers online (pinged in last 5 mins)
                online = await conn.fetchval(
                    "SELECT COUNT(DISTINCT driver_id) FROM driver_locations WHERE updated_at > NOW() - INTERVAL '5 minutes'"
                )

                # 3. Avg response time – real calculation from last 7 days
                avg_time_raw = await conn.fetchval(
                    """
                    SELECT AVG(EXTRACT(EPOCH FROM (arrived_at - created_at)) / 60.0)
                    FROM orders
                    WHERE arrived_at IS NOT NULL
                      AND created_at >= NOW() - INTERVAL '7 days'
                    """
                )
                
                # Round to 1 decimal; fall back to 18 if calculation fails or data missing
                try:
                    avg_time = round(float(avg_time_raw), 1) if avg_time_raw else 18.0
                except (TypeError, ValueError):
                    avg_time = 18.0

                data = {
                    "drivers_assisted_today": int(assisted or 0),
                    "drivers_online": int(online or 0),
                    "avg_response_time_mins": avg_time
                }

                yield f"data: {json.dumps(data)}\n\n"
        except Exception as e:
            print(f"Stats SSE Error: {e}")
            yield f"data: {json.dumps({'error': 'stream_interrupted'})}\n\n"

        await asyncio.sleep(30)  # Refresh every 30s

@router.get("/live")
async def get_live_stats():
    return StreamingResponse(stats_generator(), media_type="text/event-stream")
