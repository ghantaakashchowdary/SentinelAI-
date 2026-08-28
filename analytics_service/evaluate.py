from __future__ import annotations

import argparse
import json
from pathlib import Path
import numpy as np
import torch
from torch import nn

from train import load_config
from src.data.loader import load_network_states
from src.preprocessing.pipeline import fit_transform_splits
from src.sequences.builder import build_sequences
from src.models.lstm import MultiTaskLSTM
from src.evaluation.metrics import binary_metrics, continuous_metrics
from src.utils.io import save_json
from sklearn.metrics import f1_score, accuracy_score

ROOT = Path(__file__).resolve().parent


def evaluate(config_path=ROOT / "configs" / "module3.json"):
    cfg = load_config(config_path)
    artifact_dir = ROOT / cfg["artifact_dir"]
    bundle = load_network_states(ROOT / cfg["data_path"])
    splits = fit_transform_splits(bundle, cfg["train_ratio"], cfg["validation_ratio"])
    stage_to_id = {name: i for i, name in enumerate(bundle.stage_names)}
    seq_train = build_sequences(splits.train, bundle.feature_columns, stage_to_id, cfg["sequence_length"], cfg["forecast_horizon"])
    seq_test = build_sequences(splits.test, bundle.feature_columns, stage_to_id, cfg["sequence_length"], cfg["forecast_horizon"])

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MultiTaskLSTM(len(bundle.feature_columns), cfg["hidden_size"], cfg["num_layers"], cfg["dropout"], cfg["forecast_horizon"], len(bundle.stage_names)).to(device)
    model.load_state_dict(torch.load(artifact_dir / "model.pt", map_location=device, weights_only=True))
    model.eval()
    x = torch.tensor(seq_test.X, dtype=torch.float32, device=device)
    with torch.no_grad():
        state_scaled, attack_logits, stage_logits = model(x)
        attack_probs = torch.sigmoid(attack_logits).cpu().numpy()
        stage_probs = torch.softmax(stage_logits, dim=-1).cpu().numpy()
        state_pred_scaled = state_scaled.cpu().numpy()

    state_pred_scaled = np.clip(state_pred_scaled, -3.0, 3.0)
    state_pred = splits.scaler.inverse_transform(state_pred_scaled.reshape(-1, len(bundle.feature_columns))).reshape(state_pred_scaled.shape)
    state_pred = np.maximum(state_pred, 0.0)
    state_true = splits.scaler.inverse_transform(seq_test.state_y.reshape(-1, len(bundle.feature_columns))).reshape(seq_test.state_y.shape)
    train_supported_ids = set(seq_train.stage_y.reshape(-1).tolist())

    result = {
        "model_version": cfg["model_version"],
        "test_windows": len(splits.test),
        "test_sequences": len(seq_test.X),
        "forecast_horizon": cfg["forecast_horizon"],
        "attack_by_step": {},
        "state_forecast_by_step": {},
        "stage_by_step": {},
    }
    for k in range(cfg["forecast_horizon"]):
        result["attack_by_step"][f"T+{k+1}"] = binary_metrics(seq_test.attack_y[:, k], attack_probs[:, k])
        result["state_forecast_by_step"][f"T+{k+1}"] = continuous_metrics(state_true[:, k, :], state_pred[:, k, :])
        result["state_forecast_by_step"][f"T+{k+1}"]["normalized"] = continuous_metrics(seq_test.state_y[:, k, :], state_pred_scaled[:, k, :])
        true_stage = seq_test.stage_y[:, k]
        masked_stage_probs = stage_probs[:, k, :].copy()
        unsupported = [i for i in range(len(bundle.stage_names)) if i not in train_supported_ids]
        if unsupported:
            masked_stage_probs[:, unsupported] = -np.inf
        pred_stage = masked_stage_probs.argmax(axis=1)
        known = sorted(set(true_stage.tolist()))
        result["stage_by_step"][f"T+{k+1}"] = {
            "macro_f1": float(f1_score(true_stage, pred_stage, average='macro', zero_division=0)),
            "accuracy": float(accuracy_score(true_stage, pred_stage)),
            "classes_observed_in_test": [bundle.stage_names[i] for i in known],
            "classes_unseen_in_training": [
                bundle.stage_names[i] for i in known
                if i not in train_supported_ids
            ],
            "stage_prediction_is_masked_to_training_supported_classes": True,
        }
    result["overall"] = {
        "attack_precision": float(np.mean([v["precision"] for v in result["attack_by_step"].values()])),
        "attack_recall": float(np.mean([v["recall"] for v in result["attack_by_step"].values()])),
        "attack_f1": float(np.mean([v["f1"] for v in result["attack_by_step"].values()])),
        "attack_false_positive_rate": float(np.mean([v["false_positive_rate"] for v in result["attack_by_step"].values()])),
        "state_mae": float(np.mean([v["mae"] for v in result["state_forecast_by_step"].values()])),
        "state_rmse": float(np.mean([v["rmse"] for v in result["state_forecast_by_step"].values()])),
        "normalized_state_mae": float(np.mean([v["normalized"]["mae"] for v in result["state_forecast_by_step"].values()])),
        "normalized_state_rmse": float(np.mean([v["normalized"]["rmse"] for v in result["state_forecast_by_step"].values()])),
    }
    save_json(result, artifact_dir / "evaluation_metrics.json")
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=str(ROOT / "configs" / "module3.json"))
    args = parser.parse_args()
    evaluate(args.config)
