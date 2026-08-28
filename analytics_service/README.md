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

## No FastAPI / frontend ownership

Module 3 provides the Python model and inference contract. FastAPI remains Module 4's responsibility. The included Streamlit dashboard is only a local Module 3 engineering/demo surface for exercising the actual model.

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
