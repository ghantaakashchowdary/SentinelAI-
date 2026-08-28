from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List
import pandas as pd

REQUIRED_COLUMNS = {
    "timestamp",
    "majority_label",
    "majority_attack_stage",
    "stage_purity",
}

LABEL_COLUMNS = {"majority_label", "majority_attack_stage", "stage_purity"}
NON_FEATURE_COLUMNS = {"timestamp", *LABEL_COLUMNS}


@dataclass
class DatasetBundle:
    frame: pd.DataFrame
    feature_columns: List[str]
    stage_names: List[str]
    label_names: List[str]
    timestamp_column: str = "timestamp"


def load_network_states(path: str | Path) -> DatasetBundle:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Module 2 network-state file not found: {path}")

    df = pd.read_csv(path)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Module 2 contract is missing required columns: {sorted(missing)}")

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    if df["timestamp"].isna().any():
        raise ValueError("timestamp contains invalid values")
    if not df["timestamp"].is_monotonic_increasing:
        df = df.sort_values("timestamp").reset_index(drop=True)
    if df["timestamp"].duplicated().any():
        raise ValueError("Duplicate timestamps found in network_state_sequence.csv")

    numeric_candidates = df.select_dtypes(include="number").columns.tolist()
    feature_columns = [c for c in numeric_candidates if c not in LABEL_COLUMNS]
    if not feature_columns:
        raise ValueError("No numeric network-state features were found")

    if df[feature_columns].isna().any().any():
        missing_counts = df[feature_columns].isna().sum()
        bad = missing_counts[missing_counts > 0].to_dict()
        raise ValueError(f"Network-state features contain missing values: {bad}")

    stages = sorted(df["majority_attack_stage"].astype(str).unique().tolist())
    labels = sorted(df["majority_label"].astype(str).unique().tolist())
    return DatasetBundle(df, feature_columns, stages, labels)


def inspect_dataset(bundle: DatasetBundle) -> Dict[str, object]:
    df = bundle.frame
    deltas = df["timestamp"].diff().dropna().dt.total_seconds()
    return {
        "rows": int(len(df)),
        "features": bundle.feature_columns,
        "feature_count": len(bundle.feature_columns),
        "stages": bundle.stage_names,
        "labels": bundle.label_names,
        "missing_values": int(df.isna().sum().sum()),
        "start": df["timestamp"].iloc[0].isoformat(),
        "end": df["timestamp"].iloc[-1].isoformat(),
        "window_seconds": float(deltas.median()) if not deltas.empty else None,
        "gap_count": int((deltas != deltas.median()).sum()) if not deltas.empty else 0,
        "stage_counts": df["majority_attack_stage"].value_counts().to_dict(),
        "label_counts": df["majority_label"].value_counts().to_dict(),
        "feature_leakage_excluded": sorted(LABEL_COLUMNS),
    }
