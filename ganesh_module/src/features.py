"""
features.py
-----------
TASK 2: Extract flow-level features
TASK 3: Extract packet-level features

This module does NOT invent features that aren't supported by the input
data. If a packet-level field (e.g. TTL) isn't available because the
input was a flow-level CSV rather than a PCAP, the corresponding column
is left as NaN and documented -- never fabricated.
"""

import pandas as pd
import numpy as np


# Features expected from FLOW-level input (CSV, CICIDS2017-style, or already-aggregated)
FLOW_FEATURES = [
    "duration", "total_fwd_packets", "total_bwd_packets",
    "total_fwd_bytes", "total_bwd_bytes",
    "syn_flag_count", "ack_flag_count", "fin_flag_count",
    "rst_flag_count", "psh_flag_count", "urg_flag_count",
]

# Features expected from PACKET-level input (PCAP) or already present in the CSV
PACKET_FEATURES = [
    "ttl", "tcp_window_size", "fragmented", "retransmission_count",
]


def compute_derived_flow_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Derive additional flow-level features from the base columns, matching
    the kind of features CICFlowMeter produces (bytes/sec, packets/sec,
    bidirectional ratios, average packet size). These are genuinely
    computed from available columns, not invented.
    """
    df = df.copy()

    if {"total_fwd_bytes", "total_bwd_bytes"}.issubset(df.columns):
        df["total_bytes"] = df["total_fwd_bytes"] + df["total_bwd_bytes"]

    if {"total_fwd_packets", "total_bwd_packets"}.issubset(df.columns):
        df["total_packets"] = df["total_fwd_packets"] + df["total_bwd_packets"]

    # Bytes/sec and packets/sec (guard against divide-by-zero on near-instant flows)
    if "total_bytes" in df.columns and "duration" in df.columns:
        safe_duration = df["duration"].replace(0, np.nan)
        df["flow_bytes_per_sec"] = (df["total_bytes"] / safe_duration).fillna(df["total_bytes"])

    if "total_packets" in df.columns and "duration" in df.columns:
        safe_duration = df["duration"].replace(0, np.nan)
        df["flow_packets_per_sec"] = (df["total_packets"] / safe_duration).fillna(df["total_packets"])

    # Bidirectional ratio: forward vs backward traffic balance.
    # Ratio near 1.0 = symmetric conversation. Very high/low = one-sided
    # traffic (e.g. exfiltration = high fwd, low bwd; scans = fwd only).
    if {"total_fwd_bytes", "total_bwd_bytes"}.issubset(df.columns):
        df["bidirectional_byte_ratio"] = (
            df["total_fwd_bytes"] / df["total_bwd_bytes"].replace(0, np.nan)
        ).fillna(df["total_fwd_bytes"])  # if no backward traffic, ratio = all-forward

    # Average packet size (helps distinguish scan probes vs bulk transfer)
    if "total_bytes" in df.columns and "total_packets" in df.columns:
        df["avg_packet_size"] = (
            df["total_bytes"] / df["total_packets"].replace(0, np.nan)
        ).fillna(0)

    return df


def extract_features(df: pd.DataFrame, log: list = None) -> pd.DataFrame:
    """
    Main entry point: extract/validate flow-level and packet-level features
    that are actually present in the input, compute derived features, and
    document what's missing rather than fabricating it.
    """
    if log is None:
        log = []

    df = df.copy()

    available_flow = [c for c in FLOW_FEATURES if c in df.columns]
    missing_flow = [c for c in FLOW_FEATURES if c not in df.columns]
    available_packet = [c for c in PACKET_FEATURES if c in df.columns]
    missing_packet = [c for c in PACKET_FEATURES if c not in df.columns]

    log.append(f"Flow-level features available: {available_flow}")
    if missing_flow:
        log.append(f"Flow-level features NOT available in this input (skipped, not fabricated): {missing_flow}")

    log.append(f"Packet-level features available: {available_packet}")
    if missing_packet:
        log.append(
            f"Packet-level features NOT available in this input (skipped, not fabricated): {missing_packet}. "
            f"These typically require PCAP-level input rather than pre-aggregated flow CSVs."
        )

    df = compute_derived_flow_features(df)

    derived = [c for c in ["total_bytes", "total_packets", "flow_bytes_per_sec",
                            "flow_packets_per_sec", "bidirectional_byte_ratio",
                            "avg_packet_size"] if c in df.columns]
    log.append(f"Derived features computed: {derived}")

    return df


if __name__ == "__main__":
    from ingest import ingest
    from clean_validate import clean, validate_schema, validate_final

    log = []
    df = ingest("data/raw/synthetic_network_traffic.csv")
    validate_schema(df)
    df = clean(df, log)
    validate_final(df, log)
    df = extract_features(df, log)

    print("\n--- Feature Extraction Log ---")
    for entry in log:
        print("-", entry)

    print(f"\nColumns after feature extraction ({len(df.columns)}):")
    print(list(df.columns))
    print("\nSample row:")
    print(df.iloc[0])
