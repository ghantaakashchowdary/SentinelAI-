"""
pipeline.py
-----------
MAIN ENTRY POINT for Ganesh's module (Network Data & Feature Extraction).

Runs the full, reproducible pipeline end-to-end:

  Raw Input (CSV/PCAP)
      -> Ingestion
      -> Schema Validation
      -> Cleaning
      -> Final Validation
      -> Feature Extraction (flow + packet level)
      -> Normalization
      -> Time-Windowing (sequential network states)
      -> Output: ML-ready CSV + preprocessing log

USAGE:
    python3 pipeline.py --input data/raw/synthetic_network_traffic.csv --window 5

This is the ONE script that should be run to regenerate the dataset for
Madhav. It is deterministic: same input + same --window value = same output.
"""

import argparse
import os
import sys
from datetime import datetime

from ingest import ingest, IngestionError
from clean_validate import clean, validate_schema, validate_final, ValidationError
from features import extract_features
from normalize import normalize
from windowing import build_time_windows


def run_pipeline(input_path: str, output_dir: str = "data/processed",
                  window_seconds: int = 5, refit_normalization: bool = True) -> str:
    """
    Runs the complete pipeline. Returns the path to the final output CSV.
    """
    log = []
    log.append(f"=== Pipeline run started: {datetime.now().isoformat()} ===")
    log.append(f"Input file: {input_path}")
    log.append(f"Time window size: {window_seconds} seconds")

    # 1. Ingestion
    try:
        df = ingest(input_path)
    except IngestionError as e:
        print(f"[FATAL] Ingestion failed: {e}")
        sys.exit(1)
    log.append(f"Ingested {len(df)} raw rows from {input_path}")

    # 2. Schema validation
    try:
        warnings = validate_schema(df)
        for w in warnings:
            log.append(f"[WARNING] {w}")
    except ValidationError as e:
        print(f"[FATAL] Schema validation failed: {e}")
        sys.exit(1)

    # 3. Cleaning
    df = clean(df, log)

    # 4. Final validation
    try:
        validate_final(df, log)
    except ValidationError as e:
        print(f"[FATAL] Final validation failed: {e}")
        sys.exit(1)

    # 5. Feature extraction
    df = extract_features(df, log)

    # 6. Normalization
    df = normalize(df, log, params_path=os.path.join(output_dir, "normalization_params.json"),
                    refit=refit_normalization)

    # 7. Time windowing -> sequential network states
    windows = build_time_windows(df, window_seconds=window_seconds, log=log)

    # 8. Save outputs
    os.makedirs(output_dir, exist_ok=True)

    flow_level_path = os.path.join(output_dir, "flow_level_features.csv")
    df.to_csv(flow_level_path, index=False)
    log.append(f"Saved cleaned flow-level features -> {flow_level_path}")

    window_path = os.path.join(output_dir, "network_state_sequence.csv")
    windows.to_csv(window_path, index=False)
    log.append(f"Saved network-state sequence (Madhav's model input) -> {window_path}")

    log_path = os.path.join(output_dir, "preprocessing_log.txt")
    with open(log_path, "w") as f:
        f.write("\n".join(log))
    log.append(f"Saved preprocessing log -> {log_path}")

    log.append(f"=== Pipeline run complete: {datetime.now().isoformat()} ===")

    # rewrite log file with final line included
    with open(log_path, "w") as f:
        f.write("\n".join(log))

    print("\n".join(log))
    print(f"\n✅ Pipeline complete. Network-state sequence ready for Madhav at:\n   {window_path}")
    print(f"   Shape: {windows.shape[0]} time windows x {windows.shape[1]} features")

    return window_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ganesh's Network Data & Feature Extraction Pipeline (SIH26153)")
    parser.add_argument("--input", type=str, default="data/raw/synthetic_network_traffic.csv",
                         help="Path to input CSV or PCAP file")
    parser.add_argument("--output-dir", type=str, default="data/processed",
                         help="Directory to save processed outputs")
    parser.add_argument("--window", type=int, default=5,
                         help="Time window size in seconds (default: 5)")
    parser.add_argument("--no-refit", action="store_true",
                         help="Use existing saved normalization params instead of refitting (inference mode)")
    args = parser.parse_args()

    run_pipeline(
        input_path=args.input,
        output_dir=args.output_dir,
        window_seconds=args.window,
        refit_normalization=not args.no_refit,
    )
