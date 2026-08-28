"""
normalize.py
------------
TASK 6: Normalize the features

Different features live on very different numeric scales (packets ~10s,
bytes ~10,000s). The temporal model needs these on a comparable scale to
train stably.

METHOD: Min-Max scaling to [0, 1], fit on the current dataset and SAVED
to a JSON file so the exact same transformation can be reapplied at
inference time (this is critical -- training and inference must use
IDENTICAL normalization parameters, or the model will misinterpret
live data).
"""

import pandas as pd
import numpy as np
import json
import os


# Columns to normalize (numeric feature columns only -- never IDs, timestamps, or labels)
NORMALIZE_COLUMNS = [
    "duration", "total_fwd_packets", "total_bwd_packets",
    "total_fwd_bytes", "total_bwd_bytes", "total_bytes", "total_packets",
    "syn_flag_count", "ack_flag_count", "fin_flag_count",
    "rst_flag_count", "psh_flag_count", "urg_flag_count",
    "ttl", "tcp_window_size", "fragmented", "retransmission_count",
    "flow_bytes_per_sec", "flow_packets_per_sec",
    "bidirectional_byte_ratio", "avg_packet_size",
]


def fit_normalization_params(df: pd.DataFrame, columns: list = None) -> dict:
    """
    Compute min/max for each numeric column. This is the 'fit' step --
    should only be run once on the training dataset.
    """
    if columns is None:
        columns = [c for c in NORMALIZE_COLUMNS if c in df.columns]

    params = {}
    for col in columns:
        col_min = float(df[col].min())
        col_max = float(df[col].max())
        # guard against zero-range columns (constant value) -> avoid divide by zero
        if col_max == col_min:
            col_max = col_min + 1.0
        params[col] = {"min": col_min, "max": col_max}
    return params


def apply_normalization(df: pd.DataFrame, params: dict) -> pd.DataFrame:
    """
    Apply min-max normalization using PRE-FIT parameters.
    This same function is used both at training time (with freshly fit
    params) and at inference time (with the saved params) -- guaranteeing
    the same preprocessing procedure in both cases, per project requirement.
    """
    df = df.copy()
    for col, bounds in params.items():
        if col in df.columns:
            col_min, col_max = bounds["min"], bounds["max"]
            normalized = (df[col] - col_min) / (col_max - col_min)
            df[f"{col}_norm"] = normalized.clip(0, 1)  # clip in case inference values exceed training range
    return df


def save_normalization_params(params: dict, filepath: str = "data/processed/normalization_params.json"):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        json.dump(params, f, indent=2)


def load_normalization_params(filepath: str = "data/processed/normalization_params.json") -> dict:
    with open(filepath, "r") as f:
        return json.load(f)


def normalize(df: pd.DataFrame, log: list = None,
              params_path: str = "data/processed/normalization_params.json",
              refit: bool = True) -> pd.DataFrame:
    """
    Main entry point. If refit=True (training/first run), fits new
    parameters and saves them. If refit=False (inference), loads existing
    saved parameters to ensure consistency with training.
    """
    if log is None:
        log = []

    columns = [c for c in NORMALIZE_COLUMNS if c in df.columns]

    if refit or not os.path.exists(params_path):
        params = fit_normalization_params(df, columns)
        save_normalization_params(params, params_path)
        log.append(f"Fit new normalization parameters on {len(columns)} columns, saved to {params_path}")
    else:
        params = load_normalization_params(params_path)
        log.append(f"Loaded existing normalization parameters from {params_path} (inference mode)")

    df_norm = apply_normalization(df, params)
    log.append(f"Applied min-max normalization to columns: {columns}")

    return df_norm


if __name__ == "__main__":
    from ingest import ingest
    from clean_validate import clean, validate_schema, validate_final
    from features import extract_features

    log = []
    df = ingest("data/raw/synthetic_network_traffic.csv")
    validate_schema(df)
    df = clean(df, log)
    validate_final(df, log)
    df = extract_features(df, log)
    df = normalize(df, log, refit=True)

    print("\n--- Normalization Log ---")
    for entry in log:
        print("-", entry)

    norm_cols = [c for c in df.columns if c.endswith("_norm")]
    print(f"\nNormalized columns ({len(norm_cols)}):")
    print(df[norm_cols].describe().loc[["min", "max"]])
