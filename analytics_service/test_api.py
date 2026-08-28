import requests
import pandas as pd
import json

def test_api():
    print("1. Loading dataset...")
    try:
        df = pd.read_csv("data/network_state_sequence.csv")
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return

    # Take the last 5 windows
    last_5 = df.tail(5)
    
    # Format exactly as the API expects
    sequence = []
    for _, row in last_5.iterrows():
        window = row.to_dict()
        # Add a dummy timestamp if it doesn't exist
        window["timestamp"] = "2026-08-28T10:00:00Z"
        sequence.append(window)

    payload = {
        "request_id": "test-req-001",
        "sequence": sequence
    }

    print("2. Sending POST request to http://localhost:8000/api/v1/forecast/analytics...")
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/forecast/analytics",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        if response.status_code == 200:
            print("\nSUCCESS! Here is the response from your module:")
            print(json.dumps(response.json(), indent=2))
        else:
            print("\nFAILED. Error details:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to the API.")
        print("Did you forget to start the server? Run: python -m uvicorn api_server:app --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    test_api()
