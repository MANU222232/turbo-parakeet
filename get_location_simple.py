#!/usr/bin/env python3
import urllib.request
import json

try:
    response = urllib.request.urlopen('http://ip-api.com/json/')
    data = json.loads(response.read())
    
    print("\n🌍 Your Current Location:\n")
    print(f"Latitude:  {data['lat']}")
    print(f"Longitude: {data['lon']}")
    print(f"City:      {data['city']}")
    print(f"Region:    {data['regionName']}")
    print(f"Country:   {data['country']}")
    print(f"ISP:       {data['isp']}\n")
    
except Exception as e:
    print(f"Error: {e}")
