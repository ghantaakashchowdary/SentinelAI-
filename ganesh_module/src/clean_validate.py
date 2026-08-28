"""
clean_validate.py
------------------
TASK 4: Clean the data
TASK 5: Validate the data

Handles missing values, duplicates, invalid types, bad timestamps, and
confirms the dataset has the structure the rest of the pipeline expects.

Every cleaning decision is LOGGED, not silently applied, so it can be
documented in preprocessing_notes.md and explained to judges/Madhav.
"""

import pandas as pd
import numpy as np


REQUIRED_COLUMNS = ["timestamp", "src_ip", "dst_ip", "protocol"]

# Columns that must be numeric if present (flow-level features)
NUMERIC_COLUMNS = [
    "duration", "total_fwd_packets", "total_bwd_packets",
    "total_fwd_bytes", "total_bwd_bytes",
    "syn_flag_count", "ack_flag_count", "fin_flag_count",
    "rst_flag_count", "psh_flag_count", "urg_flag_count",
    "ttl", "tcp_window_size", "fragmented", "retransmission_count",
    "src_port", "dst_port",
]


class ValidationError(Exception):
    """Raised when the dataset fails structural validation and cannot proceed."""
    pass


def validate_schema(df: pd.DataFrame) -> list:
    """
    TASK 5: Confirm required columns exist before doing any work.
    Raises ValidationError if the dataset is fundamentally unusable.
    Returns a list of warnings for columns that are optional but missing.
    """
    missing_required = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_required:
        raise ValidationError(
            f"Input is missing required columns: {missing_required}. "
            f"Cannot proceed -- these are needed to build network-state features."
        )

    warnings = []
    missing_optional = [c for c in NUMERIC_COLUMNS if c not in df.columns]
    if missing_optional:
        warnings.append(
            f"Optional feature columns not present in this input and will be "
            f"SKIPPED (not fabricated): {missing_optional}"
        )
    return warnings


def clean(df: pd.DataFrame, log: list = None) -> pd.DataFrame:
    """
    TASK 4: Clean the dataset.

    Steps (each logged for the preprocessing_notes.md documentation):
      1. Parse/validate timestamps -> drop rows with unparseable timestamps
      2. Drop exact duplicate rows
      3. Coerce numeric columns to numeric dtype, invalid parses -> NaN
      4. Handle missing values in numeric columns (median imputation,
         documented -- NOT invented feature values, just standard
         statistical imputation for genuinely missing numeric fields)
      5. Drop rows missing core identity fields (src_ip, dst_ip, protocol)
    """
    if log is None:
        log = []
    df = df.copy()
    initial_rows = len(df)

    # 1. Timestamps
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    bad_ts = df["timestamp"].isna().sum()
    if bad_ts > 0:
        df = df.dropna(subset=["timestamp"])
        log.append(f"Dropped {bad_ts} rows with unparseable timestamps.")

    # 2. Duplicates
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        df = df.drop_duplicates()
        log.append(f"Dropped {dup_count} exact duplicate rows.")

    # 3. Coerce numeric columns
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            before_non_null = df[col].notna().sum()
            df[col] = pd.to_numeric(df[col], errors="coerce")
            after_non_null = df[col].notna().sum()
            newly_invalid = before_non_null - after_non_null
            if newly_invalid > 0:
                log.append(
                    f"Column '{col}': {newly_invalid} non-numeric values "
                    f"coerced to NaN (will be median-imputed)."
                )

    # 4. Missing value imputation (median, per-column, documented)
    for col in NUMERIC_COLUMNS:
        if col in df.columns:
            n_missing = df[col].isna().sum()
            if n_missing > 0:
                median_val = df[col].median()
                if pd.isna(median_val):
                    median_val = 0
                df[col] = df[col].fillna(median_val)
                log.append(
                    f"Column '{col}': imputed {n_missing} missing values "
                    f"with column median ({median_val:.2f})."
                )

    # 5. Drop rows missing core identity fields (can't build a flow record without these)
    before = len(df)
    df = df.dropna(subset=["src_ip", "dst_ip", "protocol"])
    dropped_core = before - len(df)
    if dropped_core > 0:
        log.append(f"Dropped {dropped_core} rows missing core identity fields (src_ip/dst_ip/protocol).")

    # 6. Range sanity checks (documented, not silently dropped -- flagged)
    if "duration" in df.columns:
        negative_durations = (df["duration"] < 0).sum()
        if negative_durations > 0:
            df.loc[df["duration"] < 0, "duration"] = 0
            log.append(f"Corrected {negative_durations} negative duration values to 0.")

    final_rows = len(df)
    log.append(f"Cleaning summary: {initial_rows} rows in -> {final_rows} rows out "
               f"({initial_rows - final_rows} removed, {100*(final_rows/initial_rows):.1f}% retained).")

    df = df.sort_values("timestamp").reset_index(drop=True)
    return df


def validate_final(df: pd.DataFrame, log: list = None) -> None:
    """
    Final sanity check before handing off to normalization/windowing.
    Raises ValidationError if something is structurally wrong.
    """
    if df.empty:
        raise ValidationError("Dataset is empty after cleaning -- cannot proceed.")

    if df["timestamp"].isna().any():
        raise ValidationError("Timestamps still contain NaN after cleaning -- pipeline bug.")

    for col in NUMERIC_COLUMNS:
        if col in df.columns and df[col].isna().any():
            raise ValidationError(f"Column '{col}' still contains NaN after cleaning -- pipeline bug.")

    if log is not None:
        log.append(f"Final validation passed: {len(df)} clean rows, "
                   f"time span {df['timestamp'].min()} to {df['timestamp'].max()}.")


if __name__ == "__main__":
    from ingest import ingest

    log = []
    df = ingest("data/raw/synthetic_network_traffic.csv")
    warnings = validate_schema(df)
    for w in warnings:
        print("WARNING:", w)

    df_clean = clean(df, log)
    validate_final(df_clean, log)

    print("\n--- Cleaning Log ---")
    for entry in log:
        print("-", entry)
    print(f"\nFinal shape: {df_clean.shape}")
