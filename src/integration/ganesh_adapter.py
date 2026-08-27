"""
ganesh_adapter.py
-----------------
Integration adapter bridging Ganesh's Network Data Pipeline with Madhav's AI Forecaster.

Flow:
Raw Network Flows / CSV / Records
    ↓
Ganesh Ingestion & Column Normalization (ingest.py)
    ↓
Ganesh Schema Validation & Cleaning (clean_validate.py)
    ↓
Ganesh Flow & Packet Feature Extraction (features.py)
    ↓
Ganesh Time Windowing (5-second network state windows) (windowing.py)
    ↓
Validation of 5-window history requirement (>= 25 seconds of network traffic)
    ↓
Extraction of 21 canonical features (excluding ground-truth labels)
    ↓
Return model-ready (DataFrame, timestamps) for Forecaster.predict()
"""

import io
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd

# Locate Ganesh-Module sibling directory
CURRENT_FILE = Path(__file__).resolve()
MODULE3_ROOT = CURRENT_FILE.parents[2]
WORKSPACE_ROOT = MODULE3_ROOT.parent

GANESH_MODULE_DIR = Path(
    os.environ.get("GANESH_MODULE_DIR", str(WORKSPACE_ROOT / "Ganesh-Module"))
)

# Add Ganesh-Module/src to Python path if available
GANESH_SRC_DIR = GANESH_MODULE_DIR / "src"
if GANESH_SRC_DIR.exists() and str(GANESH_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(GANESH_SRC_DIR))


def is_ganesh_available() -> bool:
    """Check if Ganesh's module and source files are accessible."""
    return (
        GANESH_SRC_DIR.exists()
        and (GANESH_SRC_DIR / "clean_validate.py").exists()
        and (GANESH_SRC_DIR / "features.py").exists()
        and (GANESH_SRC_DIR / "windowing.py").exists()
    )


def _import_ganesh_modules():
    """Import Ganesh's actual processing functions dynamically."""
    if not is_ganesh_available():
        raise RuntimeError(
            f"Ganesh's module source directory was not found at: {GANESH_SRC_DIR}. "
            "Please ensure the Ganesh-Module repository is cloned as a sibling directory."
        )

    try:
        from ingest import normalize_column_names
        from clean_validate import validate_schema, clean, validate_final, ValidationError
        from features import extract_features
        from windowing import build_time_windows
        return normalize_column_names, validate_schema, clean, validate_final, extract_features, build_time_windows, ValidationError
    except ImportError as e:
        raise RuntimeError(f"Failed to import Ganesh's pipeline modules: {e}")


def process_raw_flows_to_sequence(
    raw_input: Union[pd.DataFrame, List[Dict[str, Any]], str],
    window_seconds: int = 5,
    required_windows: int = 5,
) -> Tuple[pd.DataFrame, List[str], List[str]]:
    """
    Process raw flow records using Ganesh's pipeline into 5 model-ready windows.

    Args:
        raw_input: Raw flow records as a pandas DataFrame, list of dicts, or CSV string.
        window_seconds: Time window duration in seconds (default 5).
        required_windows: Number of history windows required by Madhav (default 5).

    Returns:
        Tuple containing:
        - DataFrame with the 5 most recent windows containing the 21 numeric features.
        - List of ISO-8601 timestamp strings for the 5 windows.
        - Execution log messages from Ganesh's pipeline.

    Raises:
        ValueError: If input schema is invalid or contains insufficient temporal history (< 5 windows).
        RuntimeError: If Ganesh module is unavailable or internal failure occurs.
    """
    (
        normalize_column_names,
        validate_schema,
        clean,
        validate_final,
        extract_features,
        build_time_windows,
        ValidationError,
    ) = _import_ganesh_modules()

    log: List[str] = []

    # 1. Convert raw input to DataFrame
    if isinstance(raw_input, str):
        try:
            df = pd.read_csv(io.StringIO(raw_input))
        except Exception as e:
            raise ValueError(f"Failed to parse CSV raw flow input: {str(e)}")
    elif isinstance(raw_input, list):
        if not raw_input:
            raise ValueError("Raw flows list is empty.")
        df = pd.DataFrame(raw_input)
    elif isinstance(raw_input, pd.DataFrame):
        df = raw_input.copy()
    else:
        raise ValueError(
            f"Unsupported raw input type: {type(raw_input)}. Expected DataFrame, list of dicts, or CSV string."
        )

    if df.empty:
        raise ValueError("Input flow dataset contains 0 records.")

    # 2. Ingestion column standardization
    df = normalize_column_names(df)

    # 3. Schema validation
    try:
        warnings = validate_schema(df)
        for w in warnings:
            log.append(f"[Ganesh Warning] {w}")
    except ValidationError as ve:
        raise ValueError(f"Ganesh Schema Validation Error: {str(ve)}")

    # 4. Cleaning & NaN handling
    df = clean(df, log)

    # 5. Final validation
    try:
        validate_final(df, log)
    except ValidationError as ve:
        raise ValueError(f"Ganesh Final Validation Error: {str(ve)}")

    # 6. Feature extraction (flow & packet features)
    df = extract_features(df, log)

    # 7. Time windowing into network state sequences
    windows_df = build_time_windows(df, window_seconds=window_seconds, log=log)

    if len(windows_df) < required_windows:
        timespan = (
            (df["timestamp"].max() - df["timestamp"].min()).total_seconds()
            if "timestamp" in df.columns and len(df) > 1
            else 0.0
        )
        raise ValueError(
            f"Insufficient temporal history: input flows cover {timespan:.1f}s, producing "
            f"{len(windows_df)} 5-second windows. Madhav's forecasting model strictly requires "
            f"at least {required_windows} history windows ({required_windows * window_seconds} seconds of traffic)."
        )

    # 8. Take the 5 most recent windows for forecasting
    tail_windows = windows_df.tail(required_windows).copy()

    # Extract timestamps
    timestamps = tail_windows["timestamp"].astype(str).tolist()

    # 9. Isolate the 21 numeric feature columns and exclude ground-truth label columns
    LABEL_COLUMNS = {"majority_label", "majority_attack_stage", "stage_purity", "timestamp"}
    numeric_feature_cols = [c for c in tail_windows.columns if c not in LABEL_COLUMNS]

    sequence_df = tail_windows[numeric_feature_cols].copy()

    return sequence_df, timestamps, log
