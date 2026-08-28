from __future__ import annotations

import argparse
import json
from pathlib import Path
import pandas as pd

from src.forecasting.inference import Forecaster

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description="Run Module 3 inference without retraining")
    parser.add_argument("--input", required=True, help="CSV containing Module 2 network states")
    parser.add_argument("--artifacts", default=str(ROOT / "artifacts"))
    parser.add_argument("--output", default=None)
    args = parser.parse_args()

    df = pd.read_csv(args.input)
    forecaster = Forecaster(args.artifacts)
    sequence_len = forecaster.config["sequence_length"]
    if len(df) < sequence_len:
        raise ValueError(f"Input must contain at least {sequence_len} network-state windows")
    sequence = df.tail(sequence_len).copy()
    result = forecaster.predict(sequence, sequence["timestamp"].astype(str).tolist())
    text = json.dumps(result, indent=2)
    if args.output:
        Path(args.output).write_text(text, encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
