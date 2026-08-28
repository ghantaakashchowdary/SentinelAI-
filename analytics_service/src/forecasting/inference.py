from __future__ import annotations

from pathlib import Path
import json
import numpy as np
import pandas as pd
import torch

from src.models.lstm import MultiTaskLSTM


class Forecaster:
    def __init__(self, artifact_dir: str | Path):
        self.artifact_dir = Path(artifact_dir)
        with open(self.artifact_dir / "model_config.json", "r", encoding="utf-8") as f:
            self.config = json.load(f)
        with open(self.artifact_dir / "label_mapping.json", "r", encoding="utf-8") as f:
            self.mapping = json.load(f)
        prep = __import__("joblib").load(self.artifact_dir / "preprocessor.joblib")
        self.scaler = prep["scaler"]
        self.feature_columns = prep["feature_columns"]
        self.stage_names = self.mapping["stage_names"]
        self.train_supported_stage_names = self.mapping.get("train_supported_stage_names", self.stage_names)
        self.supported_stage_ids = [self.stage_names.index(x) for x in self.train_supported_stage_names]
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = MultiTaskLSTM(
            feature_count=len(self.feature_columns),
            hidden_size=self.config["hidden_size"],
            num_layers=self.config["num_layers"],
            dropout=self.config["dropout"],
            forecast_horizon=self.config["forecast_horizon"],
            stage_count=len(self.stage_names),
        ).to(self.device)
        state = torch.load(self.artifact_dir / "model.pt", map_location=self.device, weights_only=True)
        self.model.load_state_dict(state)
        self.model.eval()

    def predict(self, sequence: pd.DataFrame | np.ndarray, timestamps: list[str] | None = None) -> dict:
        if isinstance(sequence, pd.DataFrame):
            missing = [c for c in self.feature_columns if c not in sequence.columns]
            if missing:
                raise ValueError(f"Input sequence is missing features: {missing}")
            raw = sequence[self.feature_columns].to_numpy(dtype=np.float32)
        else:
            raw = np.asarray(sequence, dtype=np.float32)
            if raw.ndim != 2 or raw.shape[1] != len(self.feature_columns):
                raise ValueError(f"Expected [sequence_length, {len(self.feature_columns)}] input")
        expected_len = self.config["sequence_length"]
        if raw.shape[0] != expected_len:
            raise ValueError(f"Expected {expected_len} history windows, received {raw.shape[0]}")

        scaled = self.scaler.transform(pd.DataFrame(raw, columns=self.feature_columns))
        x = torch.tensor(scaled, dtype=torch.float32, device=self.device).unsqueeze(0)
        with torch.no_grad():
            state_scaled, attack_logits, stage_logits = self.model(x)
        state_scaled = state_scaled.squeeze(0).cpu().numpy()
        state_scaled = np.clip(state_scaled, -3.0, 3.0)
        attack_probs = torch.sigmoid(attack_logits.squeeze(0)).cpu().numpy()
        stage_probs = torch.softmax(stage_logits.squeeze(0), dim=-1).cpu().numpy()
        state_raw = self.scaler.inverse_transform(state_scaled)
        state_raw = np.maximum(state_raw, 0.0)

        step_timestamps = []
        if timestamps:
            last = pd.to_datetime(timestamps[-1])
            step_seconds = self.config["window_seconds"]
            step_timestamps = [
                (last + pd.Timedelta(seconds=step_seconds * (i + 1))).isoformat()
                for i in range(self.config["forecast_horizon"])
            ]
        else:
            step_timestamps = [f"T+{i+1}" for i in range(self.config["forecast_horizon"])]

        future = []
        for i in range(self.config["forecast_horizon"]):
            if float(attack_probs[i]) < self.config.get("stage_normal_threshold", 0.5) and "Normal" in self.stage_names:
                sid = self.stage_names.index("Normal")
            else:
                masked = np.full_like(stage_probs[i], -np.inf)
                masked[self.supported_stage_ids] = stage_probs[i][self.supported_stage_ids]
                sid = int(np.argmax(masked))
            future.append({
                "step": i + 1,
                "time_window": step_timestamps[i],
                "attack_probability": float(attack_probs[i]),
                "predicted_stage": self.stage_names[sid],
                "stage_confidence": float(stage_probs[i, sid]),
                "predicted_state": {
                    k: float(v) for k, v in zip(self.feature_columns, state_raw[i])
                },
            })
        return {
            "model_version": self.config["model_version"],
            "feature_schema_version": self.config["feature_schema_version"],
            "attack_probability": future[0]["attack_probability"],
            "predicted_stage": future[0]["predicted_stage"],
            "forecast_horizon": self.config["forecast_horizon"],
            "future_predictions": future,
        }
