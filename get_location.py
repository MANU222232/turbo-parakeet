import requests
import json

def get_location():
    try:
        # Fetch data from ipapi.co (IP-based geolocation)
        response = requests.get('https://ipapi.co/json/')
        data = response.json()
        
        if 'latitude' in data and 'longitude' in data:
            print("\n📍 Current PC Location Found:")
            print("-" * 30)
            print(f"Latitude:  {data.get('latitude')}")
            print(f"Longitude: {data.get('longitude')}")
            print(f"City:      {data.get('city')}, {data.get('region')}")
            print(f"Country:   {data.get('country_name')}")
            print("-" * 30 + "\n")
        else:
            print("Error: Could not find location data in response.")
            
    except Exception as e:
        print(f"Error fetching location: {e}")

if __name__ == "__main__":
    get_location()
