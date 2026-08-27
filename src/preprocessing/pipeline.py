from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

from src.data.loader import DatasetBundle


@dataclass
class PreparedSplits:
    train: pd.DataFrame
    validation: pd.DataFrame
    test: pd.DataFrame
    scaler: StandardScaler


def chronological_split(df: pd.DataFrame, train_ratio: float = 0.80, validation_ratio: float = 0.10):
    n = len(df)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + validation_ratio))
    if train_end < 20 or val_end - train_end < 8 or n - val_end < 8:
        raise ValueError("Dataset is too small for the configured chronological split")
    return df.iloc[:train_end].copy(), df.iloc[train_end:val_end].copy(), df.iloc[val_end:].copy()


def fit_transform_splits(
    bundle: DatasetBundle,
    train_ratio: float = 0.80,
    validation_ratio: float = 0.10,
) -> PreparedSplits:
    train, validation, test = chronological_split(bundle.frame, train_ratio, validation_ratio)
    scaler = StandardScaler()
    scaler.fit(train[bundle.feature_columns])
    transformed_frames = []
    for frame in (train, validation, test):
        frame = frame.copy()
        frame[bundle.feature_columns] = frame[bundle.feature_columns].astype(float)
        frame[bundle.feature_columns] = scaler.transform(frame[bundle.feature_columns]).astype(np.float32)
        transformed_frames.append(frame)
    train, validation, test = transformed_frames
    return PreparedSplits(train, validation, test, scaler)


def save_preprocessor(path: str | Path, scaler: StandardScaler, feature_columns: List[str]) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"scaler": scaler, "feature_columns": feature_columns}, path)


def load_preprocessor(path: str | Path):
    return joblib.load(path)
