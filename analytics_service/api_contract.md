# Security Analytics API Contract (SIH26153)

This document defines the API contract between the **Java Spring Boot Backend** (managed by Aakash) and the **Python ML / Analytics Service** (managed by Raja/Madhav).

---

## 1. Recommended API Endpoint

**POST** `/api/v1/forecast/analytics`

- **Content-Type**: `application/json`
- **Description**: Accepts a temporal sequence of recent network states and returns forecasted future states, attack probabilities, and model explainability.

---

## 2. Request JSON Structure

The Python ML service requires a temporal history of **exactly 5 windows** to form a prediction. Each window represents 5 seconds of network traffic.

```json
{
  "request_id": "req-102938",
  "sequence": [
    {
      "timestamp": "2026-08-28T09:00:00Z",
      "total_packets": 1200,
      "total_bytes": 102400,
      "duration": 5.0,
      "syn_flag_count": 10,
      "ack_flag_count": 100,
      "fin_flag_count": 5,
      "rst_flag_count": 0,
      "psh_flag_count": 20,
      "ttl": 64,
      "tcp_window_size": 32000,
      "fragmented": 0,
      "retransmission_count": 2,
      "flow_bytes_per_sec": 20480.0,
      "flow_packets_per_sec": 240.0,
      "avg_packet_size": 85.3,
      "flow_count": 15,
      "unique_src_ips": 12,
      "unique_dst_ips": 12,
      "unique_dst_ports": 8,
      "tcp_count": 10,
      "udp_count": 5
    },
    ... // Must contain exactly 5 elements
  ]
}
```

---

## 3. Response JSON Structure

```json
{
  "analytics_timestamp": "2026-08-28T09:00:25.086Z",
  "status": "NORMAL",
  "observed_context": {
    "window_size": "5.0 seconds",
    "history_windows": 5,
    "current_state_summary": {
      "total_packets": 296.0,
      "flow_bytes_per_sec": 3254.99,
      "unique_src_ips": 20.0
    }
  },
  "forecast": {
    "horizon": 2,
    "overall_attack_probability": 0.3175,
    "progression": [
      {
        "step": 1,
        "time_window": "T+1",
        "attack_probability": 0.3175,
        "predicted_stage": "Normal",
        "stage_confidence": 0.1976,
        "predicted_state": {
          "total_packets": 1355.23,
          "flow_bytes_per_sec": 1002134.5
        }
      },
      {
        "step": 2,
        "time_window": "T+2",
        "attack_probability": 0.3759,
        "predicted_stage": "Normal",
        "stage_confidence": 0.3358,
        "predicted_state": {
          "total_packets": 1327.20,
          "flow_bytes_per_sec": 776063.18
        }
      }
    ]
  },
  "explainability": {
    "method": "Integrated Gradients (Captum) on LSTM Attack Logits",
    "top_contributing_features": [
      {
        "feature": "duration",
        "importance_score": -0.1690,
        "interpretation": "Decreases attack probability"
      },
      {
        "feature": "unique_src_ips",
        "importance_score": -0.1497,
        "interpretation": "Decreases attack probability"
      }
    ]
  }
}
```

---

## 4. Field-by-Field Explanation

### Request Fields
- `request_id`: Tracing ID provided by Spring Boot.
- `sequence`: Array of EXACTLY 5 network traffic window objects. 
- **Features**: The 21 network features extracted by Module 2. Must be numeric.

### Response Fields
- `analytics_timestamp`: The exact UTC time the prediction was generated.
- `status`: String enum (`NORMAL` or `ATTACK_FORECASTED`) based on if `overall_attack_probability` > 0.5.
- `observed_context`: 
  - `current_state_summary`: The 21 features of the *last* window in the input sequence, serving as the "current state".
- `forecast`:
  - `horizon`: How many steps into the future the model predicts (2).
  - `overall_attack_probability`: The probability of an attack happening in the T+1 window.
  - `progression`: Array containing T+1 and T+2 predictions.
    - `attack_probability`: The likelihood (0-1) of malicious traffic.
    - `predicted_stage`: The forecasted stage (e.g., Normal, Reconnaissance, Denial of Service).
    - `stage_confidence`: Softmax probability (0-1) of the predicted stage.
    - `predicted_state`: Regression values of the 21 network features for the future window.
- `explainability`:
  - `top_contributing_features`: The top 5 input features that mathematically influenced the `attack_probability`.
    - `importance_score`: Derived from Captum Integrated Gradients. Positive pushes probability towards attack, negative pushes towards normal.

---

## 5. Error Response Format

If the Java backend sends an invalid request, the Python service will return a `400 Bad Request` or `422 Unprocessable Entity`.

```json
{
  "error_code": "INVALID_SEQUENCE_LENGTH",
  "message": "Expected 5 history windows, received 3.",
  "details": "The LSTM requires exactly 25 seconds (5 windows) of temporal history to generate a forecast."
}
```
