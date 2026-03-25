#!/bin/bash
# Render injects $PORT automatically. socket_app wraps both FastAPI and Socket.io.
exec uvicorn main:socket_app --host 0.0.0.0 --port "${PORT:-8000}"
