#!/usr/bin/env python3
import json
import os
from pathlib import Path

LOCATION_FILE = os.path.join(os.path.expanduser("~"), ".swifttow_location.json")

def save_location(latitude, longitude, location_name=""):
    """Save current location coordinates"""
    data = {
        "latitude": latitude,
        "longitude": longitude,
        "location_name": location_name
    }
    with open(LOCATION_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\nLocation saved: {location_name}")
    print(f"  Lat: {latitude}, Lon: {longitude}\n")

def get_location():
    """Retrieve saved location"""
    if os.path.exists(LOCATION_FILE):
        with open(LOCATION_FILE, 'r') as f:
            data = json.load(f)
        return data
    return None

def display_location(data):
    """Display location nicely"""
    print("\n📍 Your Saved Location:")
    print("=" * 40)
    print(f"Latitude:   {data['latitude']}")
    print(f"Longitude:  {data['longitude']}")
    if data.get('location_name'):
        print(f"Location:   {data['location_name']}")
    print("=" * 40 + "\n")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "set":
            if len(sys.argv) >= 4:
                lat = float(sys.argv[2])
                lon = float(sys.argv[3])
                name = sys.argv[4] if len(sys.argv) > 4 else ""
                save_location(lat, lon, name)
            else:
                print("Usage: python get_gps_location.py set <latitude> <longitude> [location_name]")
        elif sys.argv[1] == "get":
            data = get_location()
            if data:
                display_location(data)
            else:
                print("No location saved. Use: python get_gps_location.py set <lat> <lon> [name]")
    else:
        data = get_location()
        if data:
            display_location(data)
        else:
            print("No location saved yet.")
            print("Save your location with:")
            print("  python get_gps_location.py set <latitude> <longitude> [location_name]")
            print("\nExample:")
            print("  python get_gps_location.py set 0.592857 35.352493 Kelji")
