"""
generate_sample_data.py
------------------------
Generates a SYNTHETIC, CICIDS2017-style network flow dataset for
SIH26153 (Predictive Network Attack Progression).

WHY THIS EXISTS
----------------
Ganesh's module needs an input dataset to build/test the pipeline against.
Real CICIDS2017 downloads are large (100MB-48GB) and depend on external
university servers that may be slow/unavailable during the hackathon.

This script generates a REALISTIC, LABELED, TIME-ORDERED flow dataset that:
  - Follows the same column structure as real CICIDS2017 CSVs
    (so swapping in the real dataset later requires no pipeline changes)
  - Simulates a full attack PROGRESSION over time (this is the key story
    of the project): Benign -> Reconnaissance -> Brute Force -> DoS ->
    Infiltration -> Exfiltration
  - Is fully reproducible (fixed random seed)
  - Can be used for BOTH pipeline development tonight AND as the
    "offline demo scenario" Saranya's module needs for judging

IMPORTANT: This is clearly synthetic/demo data. Document this to your team.
If a real CICIDS2017 / UNSW-NB15 file becomes available before judging,
this pipeline should be re-run against it -- no code changes needed,
only the input file path.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

RANDOM_SEED = 42
rng = np.random.default_rng(RANDOM_SEED)

# ---------------------------------------------------------------------------
# Attack scenario timeline (this tells the "story" the whole team will demo)
# Each phase = (attack_label, attack_stage, duration_in_seconds, flow_rate)
# attack_stage follows standard attack-progression / kill-chain terminology
# ---------------------------------------------------------------------------
SCENARIO_TIMELINE = [
    ("BENIGN",        "Normal",              120, 4),   # normal quiet traffic
    ("PortScan",      "Reconnaissance",       60, 12),  # attacker scans ports
    ("FTP-Patator",   "Initial Access",       45, 8),   # brute force login attempts
    ("SSH-Patator",   "Initial Access",       45, 8),
    ("BENIGN",        "Normal",               30, 4),   # brief lull
    ("DoS Hulk",       "Denial of Service",   50, 25),  # volumetric attack
    ("Infiltration",  "Lateral Movement",     40, 6),   # attacker moves inside network
    ("Botnet",         "Command and Control", 40, 5),   # C2 beaconing
    ("DDoS",           "Exfiltration",        35, 30),  # large outbound transfer disguised as DDoS-like burst
    ("BENIGN",        "Normal",               60, 4),   # traffic returns to normal
]

BENIGN_LABEL = "BENIGN"

# common ports for realism
COMMON_PORTS = [80, 443, 22, 21, 25, 53, 110, 3306, 8080, 8443]


def random_ip(rng, internal=False):
    if internal:
        return f"192.168.1.{rng.integers(2, 254)}"
    return f"{rng.integers(1, 223)}.{rng.integers(0, 255)}.{rng.integers(0, 255)}.{rng.integers(1, 254)}"


def generate_flow(rng, ts, label, stage):
    """Generate a single synthetic network FLOW record (one row)."""
    is_attack = label != BENIGN_LABEL

    src_ip = random_ip(rng, internal=True)
    dst_ip = random_ip(rng, internal=(rng.random() < 0.3))
    protocol = rng.choice(["TCP", "UDP"], p=[0.85, 0.15])

    src_port = int(rng.integers(1024, 65535))
    if is_attack and stage == "Reconnaissance":
        # scans hit many different ports rapidly
        dst_port = int(rng.integers(1, 65535))
    else:
        dst_port = int(rng.choice(COMMON_PORTS))

    # Attack traffic tends to have different statistical signatures
    if stage == "Reconnaissance":
        duration = round(rng.uniform(0.001, 0.05), 4)
        fwd_packets = int(rng.integers(1, 3))
        bwd_packets = int(rng.integers(0, 2))
        fwd_bytes = int(rng.integers(40, 100) * fwd_packets)
        bwd_bytes = int(rng.integers(0, 60) * bwd_packets)
        syn = 1
    elif stage == "Initial Access":
        duration = round(rng.uniform(0.05, 0.5), 4)
        fwd_packets = int(rng.integers(3, 10))
        bwd_packets = int(rng.integers(2, 8))
        fwd_bytes = int(rng.integers(60, 200) * fwd_packets)
        bwd_bytes = int(rng.integers(60, 200) * bwd_packets)
        syn = 1
    elif stage == "Denial of Service":
        duration = round(rng.uniform(0.001, 0.02), 4)
        fwd_packets = int(rng.integers(20, 80))
        bwd_packets = int(rng.integers(0, 5))
        fwd_bytes = int(rng.integers(40, 1500) * fwd_packets)
        bwd_bytes = int(rng.integers(0, 60) * bwd_packets)
        syn = 1
    elif stage == "Lateral Movement":
        duration = round(rng.uniform(0.2, 2.0), 4)
        fwd_packets = int(rng.integers(5, 20))
        bwd_packets = int(rng.integers(5, 20))
        fwd_bytes = int(rng.integers(100, 600) * fwd_packets)
        bwd_bytes = int(rng.integers(100, 600) * bwd_packets)
        syn = int(rng.integers(0, 2))
    elif stage == "Command and Control":
        duration = round(rng.uniform(0.5, 3.0), 4)
        fwd_packets = int(rng.integers(2, 6))
        bwd_packets = int(rng.integers(2, 6))
        fwd_bytes = int(rng.integers(50, 150) * fwd_packets)   # small beacon-like packets
        bwd_bytes = int(rng.integers(50, 150) * bwd_packets)
        syn = 0
    elif stage == "Exfiltration":
        duration = round(rng.uniform(0.5, 4.0), 4)
        fwd_packets = int(rng.integers(30, 100))
        bwd_packets = int(rng.integers(2, 10))
        fwd_bytes = int(rng.integers(800, 1500) * fwd_packets)  # large outbound volume
        bwd_bytes = int(rng.integers(40, 100) * bwd_packets)
        syn = 0
    else:  # Normal
        duration = round(rng.uniform(0.1, 3.0), 4)
        fwd_packets = int(rng.integers(2, 15))
        bwd_packets = int(rng.integers(2, 15))
        fwd_bytes = int(rng.integers(60, 500) * fwd_packets)
        bwd_bytes = int(rng.integers(60, 500) * bwd_packets)
        syn = int(rng.integers(0, 2))

    total_packets = fwd_packets + bwd_packets
    total_bytes = fwd_bytes + bwd_bytes

    ack = int(rng.integers(0, total_packets + 1))
    fin = 1 if rng.random() < 0.3 else 0
    rst = 1 if (is_attack and rng.random() < 0.2) else 0
    psh = int(rng.integers(0, max(1, fwd_packets // 2 + 1)))
    urg = 1 if rng.random() < 0.02 else 0

    ttl = int(rng.integers(48, 65)) if not is_attack else int(rng.choice([64, 128, 255]))
    window_size = int(rng.integers(1024, 65535))
    fragmented = 1 if (stage == "Reconnaissance" and rng.random() < 0.15) else 0
    retransmits = int(rng.integers(0, 3)) if is_attack else int(rng.integers(0, 1))

    return {
        "timestamp": ts,
        "src_ip": src_ip,
        "dst_ip": dst_ip,
        "src_port": src_port,
        "dst_port": dst_port,
        "protocol": protocol,
        "duration": duration,
        "total_fwd_packets": fwd_packets,
        "total_bwd_packets": bwd_packets,
        "total_fwd_bytes": fwd_bytes,
        "total_bwd_bytes": bwd_bytes,
        "syn_flag_count": syn,
        "ack_flag_count": ack,
        "fin_flag_count": fin,
        "rst_flag_count": rst,
        "psh_flag_count": psh,
        "urg_flag_count": urg,
        "ttl": ttl,
        "tcp_window_size": window_size,
        "fragmented": fragmented,
        "retransmission_count": retransmits,
        "label": label,
        "attack_stage": stage,
    }


def generate_dataset(output_path="data/raw/synthetic_network_traffic.csv"):
    rows = []
    current_time = datetime(2026, 8, 27, 9, 0, 0)

    for label, stage, duration_sec, flow_rate_per_sec in SCENARIO_TIMELINE:
        phase_end = current_time + timedelta(seconds=duration_sec)
        t = current_time
        while t < phase_end:
            n_flows_this_second = rng.poisson(flow_rate_per_sec)
            for _ in range(n_flows_this_second):
                jitter = timedelta(milliseconds=int(rng.integers(0, 999)))
                rows.append(generate_flow(rng, t + jitter, label, stage))
            t += timedelta(seconds=1)
        current_time = phase_end

    df = pd.DataFrame(rows)
    df = df.sort_values("timestamp").reset_index(drop=True)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic flow records -> {output_path}")
    print(f"Time span: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"Label distribution:\n{df['label'].value_counts()}")
    return df


if __name__ == "__main__":
    generate_dataset()
