import math
import os
import httpx
from typing import Optional

# Simple mock for ZIP -> Coordinates (Can be replaced with a real geocoding API or DB)
ZIP_COORDS = {
    "94103": (37.7749, -122.4194),  # San Francisco
    "10001": (40.7128, -74.0060),   # New York
    "90210": (34.0522, -118.2437),  # Los Angeles
    "02108": (42.3601, -71.0589),   # Boston
}

def get_distance_km(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def lookup_zip_coords(zip_code: str) -> Optional[tuple]:
    # 1. Check local cache/mock
    if zip_code in ZIP_COORDS:
        return ZIP_COORDS[zip_code]
    
    # 2. Fallback to Google Geocoding API
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return None
        
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                params={"address": zip_code, "key": api_key}
            )
            data = resp.json()
            if data["status"] == "OK":
                loc = data["results"][0]["geometry"]["location"]
                return (loc["lat"], loc["lng"])
    except Exception as e:
        print(f"Geocoding error for ZIP {zip_code}: {e}")
    
    return None

async def perform_fraud_check(billing_zip: str, user_lat: float, user_lng: float, address: str) -> dict:
    # 1. Highway Exception: Skip if address mentions highway/interstate
    address_lower = address.lower()
    if any(keyword in address_lower for keyword in ["highway", "interstate", "i-", "rt-", "route"]):
        return {"status": "pass", "reason": "highway_exception"}

    # 2. Geospatial Distance Check
    zip_center = await lookup_zip_coords(billing_zip)
    if not zip_center:
        return {"status": "pass", "reason": "zip_not_mapped"}

    dist = get_distance_km(zip_center[0], zip_center[1], user_lat, user_lng)
    
    if dist > 200:
        return {"status": "flagged", "reason": f"Distance mismatch: {round(dist)}km from billing home"}

    return {"status": "pass", "reason": "verified"}
