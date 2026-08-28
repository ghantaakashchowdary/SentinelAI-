from pathlib import Path
import json
import numpy as np
import pandas as pd
import pytest

from src.data.loader import load_network_states
from src.sequences.builder import build_sequences
from src.forecasting.inference import Forecaster

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "network_state_sequence.csv"
ART = ROOT / "artifacts"


def test_dataset_contract():
    bundle = load_network_states(DATA)
    assert len(bundle.frame) == 105
    assert bundle.frame["timestamp"].is_monotonic_increasing
    assert len(bundle.feature_columns) == 21
    assert "stage_purity" not in bundle.feature_columns


def test_sequence_generation():
    bundle = load_network_states(DATA)
    mapping = {s: i for i, s in enumerate(bundle.stage_names)}
    seq = build_sequences(bundle.frame.iloc[:20], bundle.feature_columns, mapping, 5, 2)
    assert seq.X.shape == (14, 5, 21)
    assert seq.state_y.shape == (14, 2, 21)
    assert seq.attack_y.shape == (14, 2)
    assert seq.stage_y.shape == (14, 2)


@pytest.mark.skipif(not (ART / "model.pt").exists(), reason="train model first")
def test_model_loading_and_prediction():
    forecaster = Forecaster(ART)
    bundle = load_network_states(DATA)
    seq = bundle.frame.tail(forecaster.config["sequence_length"])
    result = forecaster.predict(seq, seq.timestamp.astype(str).tolist())
    assert result["forecast_horizon"] == forecaster.config["forecast_horizon"]
    assert len(result["future_predictions"]) == forecaster.config["forecast_horizon"]
    assert 0.0 <= result["attack_probability"] <= 1.0


def test_invalid_input():
    if not (ART / "model.pt").exists():
        pytest.skip("train model first")
    forecaster = Forecaster(ART)
    with pytest.raises(ValueError):
        forecaster.predict(np.zeros((2, len(forecaster.feature_columns)), dtype=np.float32))
