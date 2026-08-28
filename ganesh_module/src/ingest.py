"""
ingest.py
---------
TASK 1: Ingest raw network data (CSV or PCAP) into a standardized DataFrame.

Design goal: reproducibility. Same input file + same config => same output,
every time. No manual editing of data at any point.
"""

import pandas as pd
import os


class IngestionError(Exception):
    """Raised when the input file cannot be read or is fundamentally invalid."""
    pass


def ingest_csv(filepath: str) -> pd.DataFrame:
    """
    Read a CSV network-flow file into a pandas DataFrame.

    Works with:
      - our synthetic dataset (see generate_sample_data.py)
      - real CICIDS2017-style CSVs (column names will differ slightly;
        see normalize_column_names() below)
    """
    if not os.path.exists(filepath):
        raise IngestionError(f"Input file not found: {filepath}")

    try:
        df = pd.read_csv(filepath, low_memory=False)
    except Exception as e:
        raise IngestionError(f"Failed to parse CSV: {e}")

    if df.empty:
        raise IngestionError("Input CSV is empty.")

    df = normalize_column_names(df)
    return df


def normalize_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Real CICIDS2017 CSVs use column names like ' Destination Port',
    ' Flow Duration', ' Total Fwd Packets' (note leading spaces and
    inconsistent capitalization). This maps common variants onto our
    pipeline's canonical schema so the rest of the pipeline doesn't care
    which raw source the data came from.

    If you plug in a real CICIDS2017 file, extend this mapping as needed --
    do NOT silently invent columns that aren't present.
    """
    df.columns = [c.strip() for c in df.columns]

    rename_map = {
        "Timestamp": "timestamp",
        "Flow Duration": "duration",
        "Destination Port": "dst_port",
        "Source Port": "src_port",
        "Protocol": "protocol",
        "Total Fwd Packets": "total_fwd_packets",
        "Total Backward Packets": "total_bwd_packets",
        "Total Length of Fwd Packets": "total_fwd_bytes",
        "Total Length of Bwd Packets": "total_bwd_bytes",
        "SYN Flag Count": "syn_flag_count",
        "ACK Flag Count": "ack_flag_count",
        "FIN Flag Count": "fin_flag_count",
        "RST Flag Count": "rst_flag_count",
        "PSH Flag Count": "psh_flag_count",
        "URG Flag Count": "urg_flag_count",
        "Label": "label",
    }
    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})
    return df


def ingest_pcap(filepath: str, max_packets: int = None) -> pd.DataFrame:
    """
    Read a PCAP file into a per-packet DataFrame using Scapy.

    NOTE: This produces PACKET-level records (one row per packet), which is
    a different granularity than the FLOW-level CSV path above. The feature
    extraction module aggregates packets into flows/windows either way, so
    downstream code is agnostic to which ingestion path was used.

    Requires: pip install scapy
    """
    try:
        from scapy.all import rdpcap, IP, TCP, UDP
    except ImportError:
        raise IngestionError(
            "scapy is not installed. Run: pip install scapy --break-system-packages"
        )

    if not os.path.exists(filepath):
        raise IngestionError(f"Input file not found: {filepath}")

    try:
        packets = rdpcap(filepath, count=max_packets) if max_packets else rdpcap(filepath)
    except Exception as e:
        raise IngestionError(f"Failed to parse PCAP: {e}")

    if len(packets) == 0:
        raise IngestionError("PCAP file contains no packets.")

    records = []
    for pkt in packets:
        if IP not in pkt:
            continue  # skip non-IP packets (e.g. ARP) -- documented limitation

        record = {
            "timestamp": float(pkt.time),
            "src_ip": pkt[IP].src,
            "dst_ip": pkt[IP].dst,
            "ttl": pkt[IP].ttl,
            "packet_size": len(pkt),
            "protocol": None,
            "src_port": None,
            "dst_port": None,
            "tcp_window_size": None,
            "syn_flag": 0,
            "ack_flag": 0,
            "fin_flag": 0,
            "rst_flag": 0,
            "psh_flag": 0,
            "urg_flag": 0,
            "fragmented": 1 if pkt[IP].frag > 0 else 0,
        }

        if TCP in pkt:
            record["protocol"] = "TCP"
            record["src_port"] = pkt[TCP].sport
            record["dst_port"] = pkt[TCP].dport
            record["tcp_window_size"] = pkt[TCP].window
            flags = pkt[TCP].flags
            record["syn_flag"] = 1 if "S" in str(flags) else 0
            record["ack_flag"] = 1 if "A" in str(flags) else 0
            record["fin_flag"] = 1 if "F" in str(flags) else 0
            record["rst_flag"] = 1 if "R" in str(flags) else 0
            record["psh_flag"] = 1 if "P" in str(flags) else 0
            record["urg_flag"] = 1 if "U" in str(flags) else 0
        elif UDP in pkt:
            record["protocol"] = "UDP"
            record["src_port"] = pkt[UDP].sport
            record["dst_port"] = pkt[UDP].dport
        else:
            record["protocol"] = "OTHER"

        records.append(record)

    if not records:
        raise IngestionError("No IP packets found in PCAP (only non-IP traffic present).")

    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="s")
    return df


def ingest(filepath: str) -> pd.DataFrame:
    """
    Auto-detect input type by extension and route to the correct ingestion function.
    This is the single entry point the rest of the pipeline should call.
    """
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".csv":
        return ingest_csv(filepath)
    elif ext in (".pcap", ".pcapng"):
        return ingest_pcap(filepath)
    else:
        raise IngestionError(f"Unsupported file type: {ext}. Expected .csv, .pcap, or .pcapng")


if __name__ == "__main__":
    df = ingest("data/raw/synthetic_network_traffic.csv")
    print(f"Ingested {len(df)} rows, {len(df.columns)} columns")
    print(df.head())
