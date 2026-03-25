import os
import asyncpg
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class DatabasePool:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        if not self.pool:
            db_url = os.getenv("DATABASE_URL")
            if not db_url:
                raise ValueError("DATABASE_URL not found in environment")
            
            # Create a connection pool (suitable for serverless or long-running)
            self.pool = await asyncpg.create_pool(
                db_url,
                min_size=1,
                max_size=10,
                max_inactive_connection_lifetime=300
            )
            print("Database connection pool initialized.")

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            self.pool = None
            print("Database connection pool closed.")

    async def get_conn(self):
        if not self.pool:
            await self.connect()
        return self.pool.acquire()

db_pool = DatabasePool()
