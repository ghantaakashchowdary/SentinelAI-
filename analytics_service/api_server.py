from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
from src.analytics.interpreter import SecurityInterpreter

app = FastAPI(title="SentinelAI Analytics API", version="1.0")

# Load interpreter globally
interpreter = SecurityInterpreter(artifact_dir="artifacts")

class NetworkWindow(BaseModel):
    timestamp: str
    total_packets: float
    total_bytes: float
    duration: float
    syn_flag_count: float
    ack_flag_count: float
    fin_flag_count: float
    rst_flag_count: float
    psh_flag_count: float
    ttl: float
    tcp_window_size: float
    fragmented: float
    retransmission_count: float
    flow_bytes_per_sec: float
    flow_packets_per_sec: float
    avg_packet_size: float
    flow_count: float
    unique_src_ips: float
    unique_dst_ips: float
    unique_dst_ports: float
    tcp_count: float
    udp_count: float

class ForecastRequest(BaseModel):
    request_id: str
    sequence: List[NetworkWindow]

@app.post("/api/v1/forecast/analytics")
def generate_forecast_analytics(request: ForecastRequest):
    if len(request.sequence) != 5:
        raise HTTPException(
            status_code=400, 
            detail="The LSTM requires exactly 25 seconds (5 windows) of temporal history."
        )
    
    # Convert incoming sequence to DataFrame matching exactly what the model expects
    data = [window.model_dump() for window in request.sequence]
    df = pd.DataFrame(data)
    
    try:
        # Run the full inference and explanation
        result = interpreter.analyze_sequence(df)
        # Add the tracing ID
        result["request_id"] = request.request_id
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
