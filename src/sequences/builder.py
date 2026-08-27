from __future__ import annotations

from dataclasses import dataclass
import numpy as np
import pandas as pd


@dataclass
class SequenceSet:
    X: np.ndarray
    state_y: np.ndarray
    attack_y: np.ndarray
    stage_y: np.ndarray
    target_timestamps: list[list[str]]


def build_sequences(
    df: pd.DataFrame,
    feature_columns: list[str],
    stage_to_id: dict[str, int],
    sequence_length: int,
    forecast_horizon: int,
) -> SequenceSet:
    if len(df) < sequence_length + forecast_horizon:
        raise ValueError(
            f"Need at least {sequence_length + forecast_horizon} rows, received {len(df)}"
        )

    values = df[feature_columns].to_numpy(dtype=np.float32)
    stages = df["majority_attack_stage"].astype(str).map(stage_to_id)
    if stages.isna().any():
        raise ValueError("Encountered a stage not present in the global stage mapping")
    stage_ids = stages.to_numpy(dtype=np.int64)
    attack_ids = (df["majority_attack_stage"].astype(str) != "Normal").astype(np.float32).to_numpy()
    timestamps = pd.to_datetime(df["timestamp"]).map(lambda x: x.isoformat()).tolist()

    xs, ys, attacks, stage_targets, target_times = [], [], [], [], []
    max_start = len(df) - sequence_length - forecast_horizon + 1
    for start in range(max_start):
        history_end = start + sequence_length
        target_end = history_end + forecast_horizon
        xs.append(values[start:history_end])
        ys.append(values[history_end:target_end])
        attacks.append(attack_ids[history_end:target_end])
        stage_targets.append(stage_ids[history_end:target_end])
        target_times.append(timestamps[history_end:target_end])

    return SequenceSet(
        X=np.asarray(xs, dtype=np.float32),
        state_y=np.asarray(ys, dtype=np.float32),
        attack_y=np.asarray(attacks, dtype=np.float32),
        stage_y=np.asarray(stage_targets, dtype=np.int64),
        target_timestamps=target_times,
    )
