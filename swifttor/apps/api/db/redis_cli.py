import os
import json
from typing import Any
from upstash_redis import Redis
from dotenv import load_dotenv

load_dotenv()

# Centralized Upstash Redis Client (REST-based)
class RedisClient:
    def __init__(self):
        url = os.getenv("UPSTASH_REDIS_REST_URL")
        token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
        self.client = Redis(url=url, token=token) if url and token else None

    def set_session(self, session_id: str, history: list, ttl: int = 3600):
        if not self.client:
            return False
        try:
            key = f"ai_session:{session_id}"
            return self.client.set(key, json.dumps(history), ex=ttl)
        except Exception as e:
            print(f"Redis set_session error: {e}")
            return False

    def get_session(self, session_id: str):
        if not self.client:
            return None
        try:
            key = f"ai_session:{session_id}"
            val = self.client.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            print(f"Redis get_session error: {e}")
            return None

    def set_cache(self, key: str, data: Any, ttl: int = 300):
        if not self.client:
            return False
        try:
            return self.client.set(key, json.dumps(data), ex=ttl)
        except Exception as e:
            print(f"Redis set_cache error: {e}")
            return False

    def get_cache(self, key: str):
        if not self.client:
            return None
        try:
            val = self.client.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            print(f"Redis get_cache error: {e}")
            return None

# Singleton instance
redis_cli = RedisClient()
