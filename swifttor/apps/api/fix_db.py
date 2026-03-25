import os
import psycopg2
from urllib.parse import urlparse

db_url = "postgresql://neondb_owner:npg_KGnEYfWb07Td@ep-sparkling-mountain-amz8yvcj-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

def main():
    try:
        print("Connecting to Neon DB...")
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Running ALTER TABLE...")
        cur.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMP WITH TIME ZONE;")
        
        print("Success: 'arrived_at' column ensured.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
