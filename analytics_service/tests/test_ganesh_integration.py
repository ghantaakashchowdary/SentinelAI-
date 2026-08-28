import json
from pathlib import Path
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from api import app, model_manager
from src.integration.ganesh_adapter import process_raw_flows_to_sequence, is_ganesh_available
from src.forecasting.inference import Forecaster

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
GANESH_RAW_CSV = WORKSPACE / "Ganesh-Module" / "data" / "raw" / "synthetic_network_traffic.csv"
ART = ROOT / "artifacts"


@pytest.fixture(scope="module")
def client():
    """FastAPI Test Client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def canonical_features():
    """Load canonical feature list from feature_schema.json."""
    with open(ART / "feature_schema.json", "r", encoding="utf-8") as f:
        schema = json.load(f)
    return schema["feature_columns"]


@pytest.fixture(scope="module")
def raw_traffic_df():
    """Load sample raw traffic records."""
    assert GANESH_RAW_CSV.exists(), f"Ganesh raw CSV missing at {GANESH_RAW_CSV}"
    return pd.read_csv(GANESH_RAW_CSV)


def test_ganesh_availability():
    """Verify Ganesh module is discovered as a sibling repository."""
    assert is_ganesh_available() is True


def test_process_raw_flows_direct(raw_traffic_df, canonical_features):
    """Test process_raw_flows_to_sequence with full synthetic raw flow dataset."""
    seq_df, timestamps, log = process_raw_flows_to_sequence(raw_traffic_df)

    # 1. Shape and window count check
    assert len(seq_df) == 5
    assert len(timestamps) == 5

    # 2. Canonical 21 feature check
    assert list(seq_df.columns) == canonical_features
    assert len(seq_df.columns) == 21

    # 3. Label exclusion check: ground truth columns MUST NOT be present in model input
    for label_col in ["majority_label", "majority_attack_stage", "stage_purity", "label", "attack_stage"]:
        assert label_col not in seq_df.columns

    # 4. No NaNs or infinities
    assert not seq_df.isna().any().any()


def test_ganesh_to_madhav_real_inference(raw_traffic_df):
    """End-to-end test: Raw Flows -> Ganesh Pipeline -> Madhav Forecaster -> Real LSTM Prediction."""
    seq_df, timestamps, _ = process_raw_flows_to_sequence(raw_traffic_df)

    forecaster = Forecaster(ART)
    result = forecaster.predict(seq_df, timestamps)

    # Verify Module 4 prediction contract
    assert result["model_version"] == "m3-lstm-1.0.0"
    assert result["feature_schema_version"] == "module2-network-state-v1"
    assert 0.0 <= result["attack_probability"] <= 1.0
    assert result["predicted_stage"] in forecaster.stage_names
    assert result["forecast_horizon"] == 2
    assert len(result["future_predictions"]) == 2

    # Check future steps
    for step in result["future_predictions"]:
        assert "step" in step
        assert "time_window" in step
        assert "attack_probability" in step
        assert "predicted_stage" in step
        assert "stage_confidence" in step
        assert "predicted_state" in step
        assert len(step["predicted_state"]) == 21


def test_insufficient_temporal_history_rejected(raw_traffic_df):
    """Test that raw traffic covering < 25s (fewer than 5 5s windows) raises controlled ValueError."""
    # Take only the first 5 flow records (spans less than 1 second)
    short_df = raw_traffic_df.head(5).copy()

    with pytest.raises(ValueError) as exc_info:
        process_raw_flows_to_sequence(short_df, window_seconds=5, required_windows=5)

    assert "Insufficient temporal history" in str(exc_info.value)
    assert "at least 5 history windows" in str(exc_info.value)


def test_api_predict_raw_flows_list(client, raw_traffic_df):
    """Test POST /predict/raw-flows with list of flow dicts."""
    # Take first 40 seconds of traffic (plenty for 5 windows)
    sample_flows = raw_traffic_df.head(200).to_dict(orient="records")

    payload = {"flows": sample_flows}
    response = client.post("/predict/raw-flows", json=payload)
    assert response.status_code == 200
    res = response.json()

    assert "attack_probability" in res
    assert "predicted_stage" in res
    assert res["forecast_horizon"] == 2
    assert len(res["future_predictions"]) == 2


def test_api_predict_raw_flows_csv_string(client, raw_traffic_df):
    """Test POST /predict/raw-flows with raw CSV text."""
    csv_text = raw_traffic_df.head(200).to_csv(index=False)

    payload = {"csv_data": csv_text}
    response = client.post("/predict/raw-flows", json=payload)
    assert response.status_code == 200
    res = response.json()

    assert "attack_probability" in res
    assert len(res["future_predictions"]) == 2


def test_api_predict_raw_flows_insufficient_data(client, raw_traffic_df):
    """Test POST /predict/raw-flows with insufficient traffic returns 422."""
    short_flows = raw_traffic_df.head(3).to_dict(orient="records")

    payload = {"flows": short_flows}
    response = client.post("/predict/raw-flows", json=payload)
    assert response.status_code == 422
    assert "Insufficient temporal history" in response.json()["message"]


def test_api_predict_raw_flows_missing_identity_column(client):
    """Test POST /predict/raw-flows with missing required schema column (e.g. src_ip) returns 422."""
    bad_flows = [
        {"timestamp": "2026-08-27 09:00:00", "dst_ip": "10.0.0.1", "protocol": "TCP"}
    ] * 20

    payload = {"flows": bad_flows}
    response = client.post("/predict/raw-flows", json=payload)
    assert response.status_code == 422
    assert "missing required columns" in response.json()["message"].lower()
