# SIH26153 — Module 3: World Model & AI Forecasting

This is the complete, independently runnable Module 3 implementation for **Predictive Network Attack Progression & Explainable Cybersecurity**.

## What is implemented

```text
Module 2 network_state_sequence.csv
        ↓
contract validation
        ↓
chronological train / validation / test split
        ↓
training-only StandardScaler
        ↓
5-window temporal history
        ↓
2-step direct multi-task LSTM
        ├── future network-state regression
        ├── future attack probability
        └── future attack-stage distribution
        ↓
metrics by T+1 / T+2
        ↓
model + preprocessing + schema artifacts
        ↓
Python inference contract for Module 4
```

The actual uploaded Module 2 output contains **105 network-state windows at 5-second resolution** and **21 numeric model features**. The label-derived columns `majority_label`, `majority_attack_stage`, and `stage_purity` are excluded from model inputs to prevent label leakage.

## Dataset contract

Input:

`data/network_state_sequence.csv`

Actual state features used:

```text
total_packets
total_bytes
duration
syn_flag_count
ack_flag_count
fin_flag_count
rst_flag_count
psh_flag_count
ttl
tcp_window_size
fragmented
retransmission_count
flow_bytes_per_sec
flow_packets_per_sec
avg_packet_size
flow_count
unique_src_ips
unique_dst_ips
unique_dst_ports
tcp_count
udp_count
```

Observed stages in the uploaded Module 2 dataset:

```text
Normal
Reconnaissance
Initial Access
Denial of Service
Lateral Movement
Command and Control
Exfiltration
```

## Important data limitation

The uploaded dataset is a small synthetic sequence with 105 windows. The chronological test segment contains later stages that are not present in the training segment. Module 3 therefore **does not pretend those unseen stages are learnable**. The inference layer masks stage choices to stages actually observed during training and records unseen test stages in evaluation.

For a stronger SIH result, retrain on a larger dataset where every stage you want the model to predict occurs in the training period.

## Environment

Python **3.11.9**.

### Windows PowerShell

```powershell
cd SIH26153_Module3
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python --version
pip install --upgrade pip
pip install -r requirements.txt
```

Expected Python version:

```text
Python 3.11.9
```

## Train

```powershell
python train.py
```

Training performs:

- actual Module 2 dataset validation
- chronological splitting
- training-only scaling
- temporal sequence construction
- LSTM training
- multi-task loss
- gradient clipping
- learning-rate scheduling
- early stopping
- best checkpoint saving

The default model consumes **5 × 5 seconds = 25 seconds of history** and predicts **K=2 future windows = 10 seconds**. These are configurable in `configs/module3.json`.

## Evaluate

```powershell
python evaluate.py
```

The command calculates real test metrics:

- precision
- recall
- F1
- false-positive rate
- confusion matrix
- Brier score
- ROC-AUC / PR-AUC when both classes exist
- raw-state MAE/RMSE
- normalized-state MAE/RMSE
- stage accuracy/macro-F1
- metrics separately for T+1 and T+2

No evaluation number is hard-coded.

## Predict

Inference never retrains the model.

```powershell
python predict.py --input data/network_state_sequence.csv
```

Optional output file:

```powershell
python predict.py --input data/network_state_sequence.csv --output artifacts/forecast.json
```

The predictor loads:

```text
artifacts/model.pt
artifacts/preprocessor.joblib
artifacts/feature_schema.json
artifacts/label_mapping.json
artifacts/model_config.json
```

## Real working website / dashboard

The dashboard is a local control surface for the actual Python model, not a static mockup.

```powershell
streamlit run dashboard/app.py
```

Use **Model Build → TRAIN / REBUILD MODEL** to execute the actual training pipeline. Then use **Forecast** to load the saved model and generate real K-step predictions.

The dashboard also exposes:

- actual Module 2 data
- network-state signals
- observed attack stages
- model architecture
- training loss
- evaluation metrics
- forecast probabilities
- predicted future state values
- Module 4 integration information

## Artifacts

```text
artifacts/
├── model.pt
├── preprocessor.joblib
├── model_config.json
├── feature_schema.json
├── label_mapping.json
├── dataset_inspection.json
├── training_history.json
├── evaluation_metrics.json
└── test_sequences.npz
```

## Model architecture

```text
Input: [batch, 5, 21]
        ↓
2-layer LSTM
hidden size = 48
        ↓
LayerNorm
        ↓
 ┌──────────────┬────────────────┬─────────────────┐
 ↓              ↓                ↓
State head      Attack head      Stage head
2×21 values     2 logits         2×7 logits
 ↓              ↓                ↓
Future state    sigmoid          softmax
```

Loss:

```text
SmoothL1(state forecast)
+ BCEWithLogits(attack probability)
+ weighted CrossEntropy(stage)
```

The attack probability is generated by a learned sigmoid output. It is **not calibrated** on this tiny dataset; Brier score is reported so calibration quality can be monitored.

## Module 4 integration

Do not copy the training code into Module 4. Import the inference class:

```python
from src.forecasting.inference import Forecaster

forecaster = Forecaster("artifacts")
result = forecaster.predict(current_sequence_df)
```

The exact JSON-compatible contract is documented in `module4_interface.json`.

## Judge-facing explanation

> Module 2 converts traffic into timestamped network states. Module 3 takes a history of those states and learns temporal dependencies with an LSTM. Instead of asking only whether the current traffic is malicious, the model predicts the next network states, the probability that future windows are under attack, and a supported attack stage for each forecast step. Because preprocessing is fitted only on the historical training segment, future information is not used to normalize the past. The saved model and preprocessing artifacts are then loaded by the inference layer for Module 4.

## Testing

```powershell
python -m pytest -q
```

Tests cover:

- Module 2 contract
- sequence generation
- model loading
- real prediction output
- invalid input handling

## No FastAPI / frontend ownership (Original Note)

Module 3 originally provided only the Python model and inference contract. The sections below describe the newly added **FastAPI AI inference service** and **Firebase Cloud Functions backend integration**.

---

# Backend Integration: Firebase + Python AI HTTP API

## 1. System Architecture

```text
Frontend (Web / Mobile App)
    │
    │  Firebase Callable / HTTP REST
    ▼
Firebase Cloud Functions (TypeScript)
    │
    │  1. Input validation (5 windows × 21 features)
    │  2. HTTP POST with timeout (AI_SERVICE_URL/predict)
    ▼
Python FastAPI Inference Service (api.py)
    │
    │  1. Schema & numeric validation
    │  2. Singleton Forecaster instance (lifespan)
    ▼
src.forecasting.inference.Forecaster
    │
    │  StandardScaler preprocessing (artifacts/preprocessor.joblib)
    ▼
PyTorch MultiTaskLSTM Model (artifacts/model.pt)
    │
    │  Direct K=2 step multi-task inference:
    │  ├── Future network state regression
    │  ├── Future attack probability
    │  └── Future attack stage classification
    ▼
Prediction Output
    │
    ├── Write prediction history to Cloud Firestore (`predictions` collection)
    ▼
Clean JSON Response → Frontend
```

---

## 2. Python AI Inference Service (`api.py`)

The Python API wraps Madhav's existing `Forecaster` engine without modifying the model architecture, retraining, or duplicating code.

### Endpoints

#### `GET /health`
Verifies service readiness and artifact availability without running training.

**Response Example (`200 OK`):**
```json
{
  "status": "healthy",
  "service": "module3-ai-forecasting",
  "artifacts_ready": true,
  "artifacts": {
    "model.pt": true,
    "preprocessor.joblib": true,
    "feature_schema.json": true,
    "label_mapping.json": true,
    "model_config.json": true
  },
  "model_version": "m3-lstm-1.0.0",
  "feature_count": 21,
  "sequence_length": 5,
  "forecast_horizon": 2
}
```

#### `POST /predict`
Runs inference on a sequence of **5 history windows**, each containing the **21 canonical features** in the exact order specified by `artifacts/feature_schema.json`.

**Request JSON Format:**
```json
{
  "sequence": [
    [1355.2, 814033.7, 0.96, 45.1, 0.0, 11.5, 4.7, 0.0, 109.5, 37365.0, 1.8, 29.1, 1002134.6, 2134.2, 217.3, 28.6, 33.0, 33.7, 16.4, 28.0, 1.6],
    [1327.2, 144327.6, 0.68, 24.8, 188.0, 7.0, 0.0, 280.4, 95.6, 33969.1, 0.2, 51.8, 776063.1, 293.4, 353.0, 48.2, 26.8, 23.6, 6.9, 57.4, 7.4],
    [1400.0, 200000.0, 1.00, 30.0, 150.0, 8.0, 0.0, 200.0, 98.0, 35000.0, 0.5, 40.0, 800000.0, 500.0, 300.0, 40.0, 28.0, 25.0, 8.0, 50.0, 5.0],
    [1450.0, 250000.0, 1.20, 35.0, 160.0, 9.0, 0.0, 220.0, 100.0, 36000.0, 0.6, 45.0, 850000.0, 600.0, 320.0, 42.0, 30.0, 27.0, 9.0, 52.0, 6.0],
    [1500.0, 300000.0, 1.50, 40.0, 170.0, 10.0, 0.0, 240.0, 102.0, 37000.0, 0.7, 50.0, 900000.0, 700.0, 340.0, 45.0, 32.0, 29.0, 10.0, 55.0, 7.0]
  ],
  "timestamps": [
    "2026-08-27T09:08:25",
    "2026-08-27T09:08:30",
    "2026-08-27T09:08:35",
    "2026-08-27T09:08:40",
    "2026-08-27T09:08:45"
  ]
}
```

*Note: The `sequence` can also be provided as a list of 5 JSON objects keyed by feature column names.*

**Response JSON Format (`200 OK`):**
```json
{
  "model_version": "m3-lstm-1.0.0",
  "feature_schema_version": "module2-network-state-v1",
  "attack_probability": 0.3176,
  "predicted_stage": "Normal",
  "forecast_horizon": 2,
  "future_predictions": [
    {
      "step": 1,
      "time_window": "2026-08-27T09:08:50",
      "attack_probability": 0.3176,
      "predicted_stage": "Normal",
      "stage_confidence": 0.1976,
      "predicted_state": {
        "total_packets": 1355.23,
        "total_bytes": 814033.75,
        "duration": 0.97,
        "syn_flag_count": 45.17,
        "ack_flag_count": 0.0,
        "fin_flag_count": 11.58,
        "rst_flag_count": 4.77,
        "psh_flag_count": 0.0,
        "ttl": 109.59,
        "tcp_window_size": 37365.01,
        "fragmented": 1.87,
        "retransmission_count": 29.14,
        "flow_bytes_per_sec": 1002134.62,
        "flow_packets_per_sec": 2134.25,
        "avg_packet_size": 217.33,
        "flow_count": 28.69,
        "unique_src_ips": 33.03,
        "unique_dst_ips": 33.74,
        "unique_dst_ports": 16.43,
        "tcp_count": 28.02,
        "udp_count": 1.69
      }
    },
    {
      "step": 2,
      "time_window": "2026-08-27T09:08:55",
      "attack_probability": 0.3760,
      "predicted_stage": "Normal",
      "stage_confidence": 0.3359,
      "predicted_state": {
        "total_packets": 1327.21,
        "total_bytes": 144327.62,
        "duration": 0.69,
        "syn_flag_count": 24.90,
        "ack_flag_count": 188.10,
        "fin_flag_count": 7.04,
        "rst_flag_count": 0.0,
        "psh_flag_count": 280.42,
        "ttl": 95.66,
        "tcp_window_size": 33969.16,
        "fragmented": 0.26,
        "retransmission_count": 51.87,
        "flow_bytes_per_sec": 776063.12,
        "flow_packets_per_sec": 293.42,
        "avg_packet_size": 353.01,
        "flow_count": 48.24,
        "unique_src_ips": 26.82,
        "unique_dst_ips": 23.68,
        "unique_dst_ports": 6.92,
        "tcp_count": 57.47,
        "udp_count": 7.47
      }
    }
  ]
}
```

**Error Response Format (`422 Unprocessable Entity`):**
```json
{
  "error": "Validation Error",
  "message": "Expected exactly 5 history windows, received 3.",
  "details": []
}
```

#### `POST /predict/raw-flows` (Ganesh Pipeline Integration)
Accepts **raw network flows** (as a list of flow objects or a raw CSV string), runs Ganesh's cleaning, feature extraction, and 5-second windowing pipeline, strips ground-truth labels, and feeds the resulting 5 windows into Madhav's `Forecaster`.

**Request JSON (Flow Records):**
```json
{
  "flows": [
    {
      "timestamp": "2026-08-27 09:00:00.100",
      "src_ip": "192.168.1.5",
      "dst_ip": "10.0.0.1",
      "protocol": "TCP",
      "src_port": 54321,
      "dst_port": 80,
      "duration": 0.05,
      "total_fwd_packets": 5,
      "total_bwd_packets": 4,
      "total_fwd_bytes": 450,
      "total_bwd_bytes": 520,
      "syn_flag_count": 1,
      "ack_flag_count": 8,
      "fin_flag_count": 0,
      "rst_flag_count": 0,
      "psh_flag_count": 2,
      "urg_flag_count": 0,
      "ttl": 64,
      "tcp_window_size": 65535,
      "fragmented": 0,
      "retransmission_count": 0
    }
  ],
  "window_seconds": 5
}
```

*Note: The raw flow records must cover at least 25 seconds of network activity (to yield 5 5-second history windows).*

**Request JSON (CSV Text):**
```json
{
  "csv_data": "timestamp,src_ip,dst_ip,protocol,src_port,dst_port,duration,total_fwd_packets,total_bwd_packets,total_fwd_bytes,total_bwd_bytes,syn_flag_count,ack_flag_count,fin_flag_count,rst_flag_count,psh_flag_count,urg_flag_count,ttl,tcp_window_size,fragmented,retransmission_count\n...",
  "window_seconds": 5
}
```


---

## 3. Firebase Backend (`firebase/`)

The Firebase backend provides Cloud Functions and Firestore persistence.

### Functions Exposed:
- **`predictAttack`** (HTTPS Callable): For Firebase Web/Mobile Client SDKs.
- **`apiPredict`** (HTTPS REST): Direct HTTP endpoint with CORS support.
- **`getPredictionHistory`** (HTTPS Callable): Queries recent predictions from Firestore.
- **`health`** (HTTPS REST): Health check verifying Firebase function and AI service connectivity.

### Firestore `predictions` Collection Schema:
```json
{
  "timestamp": "2026-08-27T15:27:00.000Z",
  "model_version": "m3-lstm-1.0.0",
  "feature_schema_version": "module2-network-state-v1",
  "attack_probability": 0.3176,
  "predicted_stage": "Normal",
  "forecast_horizon": 2,
  "future_predictions": [
    {
      "step": 1,
      "time_window": "2026-08-27T09:08:50",
      "attack_probability": 0.3176,
      "predicted_stage": "Normal",
      "stage_confidence": 0.1976
    },
    {
      "step": 2,
      "time_window": "2026-08-27T09:08:55",
      "attack_probability": 0.3760,
      "predicted_stage": "Normal",
      "stage_confidence": 0.3359
    }
  ],
  "request_metadata": {
    "source": "firebase-callable",
    "auth_uid": "user123_or_null",
    "created_at_iso": "2026-08-27T15:27:00.000Z"
  }
}
```

*Note: Raw network features are excluded from Firestore persistence to protect network privacy and save storage.*

---

## 4. Local Development & Quickstart

### Step 1: Start Python AI Service
```powershell
# In project root
.\.venv\Scripts\activate
uvicorn api:app --host 127.0.0.1 --port 8000 --reload
```

### Step 2: Configure Environment for Firebase
```powershell
cd firebase/functions
cp .env.example .env
```
Inside `.env`:
```ini
AI_SERVICE_URL=http://127.0.0.1:8000
AI_SERVICE_TIMEOUT_MS=30000
```

### Step 3: Run Firebase Emulator
```powershell
cd firebase
firebase emulators:start
```

---

## 5. Running Tests

```powershell
# Run all tests (Forecasting engine + FastAPI API suite)
.\.venv\Scripts\python.exe -m pytest -v
```


MODULE 2
                    │
                    │
                    ▼
        network_state_sequence.csv
                    │
                    ▼
          ┌─────────────────────┐
          │ Contract Validation │
          └──────────┬──────────┘
                     │
                     ▼
        Chronological Train/Val/Test
                     │
                     ▼
          Training-only StandardScaler
                     │
                     ▼
            Temporal Sequences
              5 history windows
                     │
                     ▼
             ┌─────────────┐
             │    LSTM     │
             │ World Model │
             └──────┬──────┘
                    │
        ┌───────────┼────────────┐
        │           │            │
        ▼           ▼            ▼
 Future State   Attack Risk   Attack Stage
 Forecast       Probability   Prediction
        │           │            │
        └───────────┼────────────┘
                    ▼
             Evaluation
                    │
                    ▼
              Model Artifacts
                    │
                    ▼
             Module 4 Inference
