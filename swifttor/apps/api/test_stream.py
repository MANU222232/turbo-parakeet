import sys
import httpx

def test_ai_stream():
    url = "http://localhost:8000/api/v1/ai/diagnose"
    payload = {
        "conversation": [{"role": "user", "content": "My car won't start. It's making a clicking noise. Please give me a quote and find a driver."}],
        "user_context": {
            "location": {"lat": 34.0, "lng": -118.0},
            "vehicle": {"make": "Honda", "model": "Civic", "year": "2018"},
            "symptoms": ["clicking", "won't start"]
        }
    }
    
    print(f"Connecting to {url}...\n")
    try:
        with httpx.stream("POST", url, json=payload, timeout=30.0) as r:
            if r.status_code != 200:
                print(f"Failed with status code: {r.status_code}")
                # Read error response
                print(r.read().decode())
                return
            
            for line in r.iter_lines():
                if line:
                    print(line)
        print("\n\nStream Test Completed Successfully!")
    except Exception as e:
        print(f"Error connecting to stream: {e}")

if __name__ == "__main__":
    test_ai_stream()
