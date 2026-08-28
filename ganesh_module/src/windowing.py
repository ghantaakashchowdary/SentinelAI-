"""
windowing.py
------------
TASK 7: Create time windows (THE MOST IMPORTANT PART OF THIS MODULE)

This converts a flat list of individual flows into a SEQUENCE OF NETWORK
STATES -- one row per time window, each row summarizing everything that
happened in the network during that window. THIS sequence is what
Madhav's temporal/world model consumes to learn state transitions and
forecast the future.

Without this step, the project is just a static per-flow classifier.
With it, the project becomes genuinely temporal.
"""

import pandas as pd
import numpy as np


DEFAULT_WINDOW_SIZE_SECONDS = 5


def build_time_windows(df: pd.DataFrame, window_seconds: int = DEFAULT_WINDOW_SIZE_SECONDS,
                        log: list = None) -> pd.DataFrame:
    """
    Aggregate flow-level records into fixed-size time windows, producing
    one NETWORK STATE per window.

    Each network state includes:
      - traffic volume stats (packet_count, byte_count)
      - protocol mix (tcp_count, udp_count)
      - diversity stats (unique_src_ips, unique_dst_ips, unique_ports)
      - flag activity (syn/ack/fin/rst counts -- useful for scan/DoS signatures)
      - packet-level averages where available (ttl, window size, fragmentation, retransmits)
      - the majority label/attack_stage for that window (for supervised training
        and for building the ground-truth progression timeline in the demo)

    window_seconds controls temporal resolution. Smaller = finer-grained but
    noisier; larger = smoother but may blur fast attacks (e.g. port scans).
    5 seconds is a reasonable MVP default -- documented so Madhav can tune it.
    """
    if log is None:
        log = []

    df = df.copy()
    df = df.sort_values("timestamp")

    # Bin every flow into a time window using pandas' resample-style flooring
    df["window_start"] = df["timestamp"].dt.floor(f"{window_seconds}s")

    agg_dict = {}

    if "total_packets" in df.columns:
        agg_dict["total_packets"] = "sum"
    if "total_bytes" in df.columns:
        agg_dict["total_bytes"] = "sum"
    if "duration" in df.columns:
        agg_dict["duration"] = "mean"
    if "syn_flag_count" in df.columns:
        agg_dict["syn_flag_count"] = "sum"
    if "ack_flag_count" in df.columns:
        agg_dict["ack_flag_count"] = "sum"
    if "fin_flag_count" in df.columns:
        agg_dict["fin_flag_count"] = "sum"
    if "rst_flag_count" in df.columns:
        agg_dict["rst_flag_count"] = "sum"
    if "psh_flag_count" in df.columns:
        agg_dict["psh_flag_count"] = "sum"
    if "ttl" in df.columns:
        agg_dict["ttl"] = "mean"
    if "tcp_window_size" in df.columns:
        agg_dict["tcp_window_size"] = "mean"
    if "fragmented" in df.columns:
        agg_dict["fragmented"] = "sum"
    if "retransmission_count" in df.columns:
        agg_dict["retransmission_count"] = "sum"
    if "flow_bytes_per_sec" in df.columns:
        agg_dict["flow_bytes_per_sec"] = "mean"
    if "flow_packets_per_sec" in df.columns:
        agg_dict["flow_packets_per_sec"] = "mean"
    if "avg_packet_size" in df.columns:
        agg_dict["avg_packet_size"] = "mean"

    grouped = df.groupby("window_start").agg(agg_dict)

    # Diversity / count features computed separately (nunique, value_counts)
    extra = df.groupby("window_start").agg(
        flow_count=("timestamp", "count"),
        unique_src_ips=("src_ip", "nunique") if "src_ip" in df.columns else ("timestamp", "count"),
        unique_dst_ips=("dst_ip", "nunique") if "dst_ip" in df.columns else ("timestamp", "count"),
        unique_dst_ports=("dst_port", "nunique") if "dst_port" in df.columns else ("timestamp", "count"),
        tcp_count=("protocol", lambda x: (x == "TCP").sum()) if "protocol" in df.columns else ("timestamp", "count"),
        udp_count=("protocol", lambda x: (x == "UDP").sum()) if "protocol" in df.columns else ("timestamp", "count"),
    )

    window_df = grouped.join(extra)

    # Majority label + attack_stage per window (ground truth for training/demo comparison)
    if "label" in df.columns:
        window_df["majority_label"] = df.groupby("window_start")["label"].agg(
            lambda x: x.value_counts().idxmax()
        )
    if "attack_stage" in df.columns:
        window_df["majority_attack_stage"] = df.groupby("window_start")["attack_stage"].agg(
            lambda x: x.value_counts().idxmax()
        )
        # also track whether the window is "mixed" (multiple stages present) --
        # useful signal near transition points in the attack progression
        window_df["stage_purity"] = df.groupby("window_start")["attack_stage"].agg(
            lambda x: (x.value_counts().iloc[0] / len(x))
        )

    window_df = window_df.reset_index().rename(columns={"window_start": "timestamp"})
    window_df = window_df.sort_values("timestamp").reset_index(drop=True)

    # Fill any gap windows (time periods with zero flows) with zeros so the
    # sequence has NO missing timesteps -- critical for sequential models.
    full_range = pd.date_range(
        start=window_df["timestamp"].min(),
        end=window_df["timestamp"].max(),
        freq=f"{window_seconds}s"
    )
    window_df = window_df.set_index("timestamp").reindex(full_range)
    n_gap_windows = window_df.isna().all(axis=1).sum()
    window_df = window_df.fillna(0)
    window_df.index.name = "timestamp"
    window_df = window_df.reset_index()

    if "majority_label" in window_df.columns:
        window_df["majority_label"] = window_df["majority_label"].replace(0, "NO_TRAFFIC")
    if "majority_attack_stage" in window_df.columns:
        window_df["majority_attack_stage"] = window_df["majority_attack_stage"].replace(0, "NO_TRAFFIC")

    log.append(f"Built {len(window_df)} time windows of {window_seconds}s each "
               f"(from {df['window_start'].nunique()} windows with traffic + "
               f"{n_gap_windows} empty gap-windows filled with zero-state).")
    log.append(f"Network-state feature columns: {[c for c in window_df.columns if c not in ('timestamp','majority_label','majority_attack_stage')]}")

    return window_df


if __name__ == "__main__":
    from ingest import ingest
    from clean_validate import clean, validate_schema, validate_final
    from features import extract_features
    from normalize import normalize

    log = []
    df = ingest("data/raw/synthetic_network_traffic.csv")
    validate_schema(df)
    df = clean(df, log)
    validate_final(df, log)
    df = extract_features(df, log)
    df = normalize(df, log, refit=True)
    windows = build_time_windows(df, window_seconds=5, log=log)

    print("\n--- Windowing Log ---")
    for entry in log:
        print("-", entry)

    print(f"\nFinal network-state sequence shape: {windows.shape}")
    print("\nFirst 5 network states:")
    print(windows[["timestamp", "flow_count", "total_packets", "total_bytes",
                    "tcp_count", "udp_count", "unique_dst_ports",
                    "majority_label", "majority_attack_stage"]].head(10))
