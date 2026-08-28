import json
from pathlib import Path
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from api import app, model_manager
from src.data.loader import load_network_states

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "network_state_sequence.csv"
ART = ROOT / "artifacts"


@pytest.fixture(scope="module")
def client():
    """Create a FastAPI test client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def sample_features():
    """Load canonical feature columns from artifacts."""
    with open(ART / "feature_schema.json", "r", encoding="utf-8") as f:
        schema = json.load(f)
    return schema["feature_columns"]


@pytest.fixture(scope="module")
def real_data_sequence():
    """Load 5 real windows from the dataset."""
    bundle = load_network_states(DATA)
    seq = bundle.frame.tail(5)
    return seq[bundle.feature_columns].values.tolist(), seq["timestamp"].astype(str).tolist()


def test_health_endpoint(client):
    """Test GET /health returns 200 and correct structure."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["service"] == "module3-ai-forecasting"
    assert "artifacts" in data
    assert data["feature_count"] == 21
    assert data["sequence_length"] == 5
    assert data["forecast_horizon"] == 2
    assert "model_version" in data


def test_predict_valid_matrix(client, real_data_sequence):
    """Test POST /predict with valid 5x21 numeric array."""
    matrix, timestamps = real_data_sequence
    payload = {
        "sequence": matrix,
        "timestamps": timestamps,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res = response.json()

    # Module 4 Contract checks
    assert "model_version" in res
    assert "feature_schema_version" in res
    assert "attack_probability" in res
    assert 0.0 <= res["attack_probability"] <= 1.0
    assert "predicted_stage" in res
    assert res["forecast_horizon"] == 2
    assert "future_predictions" in res
    assert len(res["future_predictions"]) == 2

    # Check future predictions format
    for step_pred in res["future_predictions"]:
        assert "step" in step_pred
        assert "time_window" in step_pred
        assert "attack_probability" in step_pred
        assert 0.0 <= step_pred["attack_probability"] <= 1.0
        assert "predicted_stage" in step_pred
        assert "stage_confidence" in step_pred
        assert 0.0 <= step_pred["stage_confidence"] <= 1.0
        assert "predicted_state" in step_pred
        assert isinstance(step_pred["predicted_state"], dict)
        assert len(step_pred["predicted_state"]) == 21


def test_predict_without_timestamps(client, real_data_sequence):
    """Test POST /predict without optional timestamps produces T+1, T+2 time windows."""
    matrix, _ = real_data_sequence
    payload = {"sequence": matrix}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["future_predictions"][0]["time_window"] == "T+1"
    assert res["future_predictions"][1]["time_window"] == "T+2"


def test_predict_dict_format(client, sample_features, real_data_sequence):
    """Test POST /predict with list of dicts keyed by feature names."""
    matrix, _ = real_data_sequence
    dict_sequence = [
        {feature: val for feature, val in zip(sample_features, row)}
        for row in matrix
    ]
    payload = {"sequence": dict_sequence}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert len(res["future_predictions"]) == 2


def test_predict_missing_sequence(client):
    """Test POST /predict with missing sequence field returns 422."""
    response = client.post("/predict", json={})
    assert response.status_code == 422
    assert "error" in response.json()


def test_predict_wrong_history_length_too_short(client, sample_features):
    """Test POST /predict with 3 windows instead of 5 returns 422."""
    payload = {
        "sequence": [[1.0] * len(sample_features) for _ in range(3)]
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    assert "history windows" in response.json()["message"]


def test_predict_wrong_history_length_too_long(client, sample_features):
    """Test POST /predict with 7 windows instead of 5 returns 422."""
    payload = {
        "sequence": [[1.0] * len(sample_features) for _ in range(7)]
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    assert "history windows" in response.json()["message"]


def test_predict_wrong_feature_count(client):
    """Test POST /predict with wrong number of features (e.g. 10 instead of 21) returns 422."""
    payload = {
        "sequence": [[1.0] * 10 for _ in range(5)]
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    assert "Expected exactly 21 features" in response.json()["message"]


def test_predict_missing_feature_in_dict(client, sample_features, real_data_sequence):
    """Test POST /predict with missing feature key in dict returns 422."""
    matrix, _ = real_data_sequence
    dict_sequence = [
        {feature: val for feature, val in zip(sample_features, row)}
        for row in matrix
    ]
    # Remove one feature from window 2
    del dict_sequence[1]["total_bytes"]

    payload = {"sequence": dict_sequence}
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    assert "missing required features" in response.json()["message"]


def test_predict_non_numeric_feature_value(client, sample_features):
    """Test POST /predict with non-numeric value returns 422."""
    sequence = [[1.0] * 21 for _ in range(5)]
    sequence[2][3] = "invalid_string"
    payload = {"sequence": sequence}
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_predict_wrong_timestamp_count(client, real_data_sequence):
    """Test POST /predict with mismatched timestamps length returns 422."""
    matrix, timestamps = real_data_sequence
    payload = {
        "sequence": matrix,
        "timestamps": timestamps[:3],  # Only 3 timestamps for 5 windows
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    assert "timestamps" in response.json()["message"]
