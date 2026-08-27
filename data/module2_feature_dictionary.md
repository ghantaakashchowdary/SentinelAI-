# Feature Dictionary — Ganesh's Module (Network Data & Feature Extraction)

SIH26153 — Predictive Network Attack Progression & Explainable Cybersecurity

This document defines every feature produced by the pipeline, at both the
**flow level** (`data/processed/flow_level_features.csv`) and the **network-state
/ time-window level** (`data/processed/network_state_sequence.csv` — this is
the file handed to Madhav's temporal model).

---

## 1. Flow-Level Features (`flow_level_features.csv`)

One row = one network flow (a connection between a source and destination).

| Feature | Type | Meaning | Unit |
|---|---|---|---|
| `timestamp` | datetime | When the flow started | — |
| `src_ip` / `dst_ip` | string | Source / destination IP address | — |
| `src_port` / `dst_port` | int | Source / destination port | — |
| `protocol` | string | TCP / UDP / OTHER | — |
| `duration` | float | Flow duration | seconds |
| `total_fwd_packets` / `total_bwd_packets` | int | Packets sent forward / backward | count |
| `total_fwd_bytes` / `total_bwd_bytes` | int | Bytes sent forward / backward | bytes |
| `syn_flag_count`, `ack_flag_count`, `fin_flag_count`, `rst_flag_count`, `psh_flag_count`, `urg_flag_count` | int | Count of each TCP flag type in the flow | count |
| `ttl` | int | Time-to-live of the connection (packet-level; requires PCAP or a dataset that already includes it) | hops |
| `tcp_window_size` | int | TCP window size (packet-level) | bytes |
| `fragmented` | int (0/1) | Whether the flow showed IP fragmentation (packet-level) | flag |
| `retransmission_count` | int | Number of retransmitted packets (packet-level) | count |
| `total_bytes` | int | `total_fwd_bytes + total_bwd_bytes` (derived) | bytes |
| `total_packets` | int | `total_fwd_packets + total_bwd_packets` (derived) | count |
| `flow_bytes_per_sec` | float | `total_bytes / duration` (derived) | bytes/sec |
| `flow_packets_per_sec` | float | `total_packets / duration` (derived) | packets/sec |
| `bidirectional_byte_ratio` | float | `fwd_bytes / bwd_bytes` — near 1.0 = symmetric conversation; high = one-sided (e.g. exfiltration, scans) (derived) | ratio |
| `avg_packet_size` | float | `total_bytes / total_packets` (derived) | bytes |
| `label` | string | Ground-truth traffic label (BENIGN, PortScan, DoS Hulk, etc.) — present in labeled datasets/demo data only | — |
| `attack_stage` | string | Ground-truth attack-progression stage (Normal, Reconnaissance, Initial Access, Denial of Service, Lateral Movement, Command and Control, Exfiltration) | — |
| `*_norm` | float | Min-max normalized version of each numeric column above, scaled to [0, 1] | — |

**Note on packet-level features:** if the input is a pre-aggregated flow CSV
(e.g. a real CICIDS2017 export) rather than a raw PCAP, `ttl`, `tcp_window_size`,
`fragmented`, and `retransmission_count` may not be available. The pipeline
does **not fabricate** these — it documents their absence in the
preprocessing log instead.

---

## 2. Network-State / Time-Window Features (`network_state_sequence.csv`)

**This is the file Madhav's temporal model trains and runs inference on.**
One row = one time window (default: 5 seconds) = one **network state**.
Consecutive rows form the sequence used for K-step forecasting.

| Feature | Meaning | Aggregation method |
|---|---|---|
| `timestamp` | Start of the time window | — |
| `flow_count` | Number of flows observed in this window | count |
| `total_packets` | Total packets across all flows in the window | sum |
| `total_bytes` | Total bytes across all flows in the window | sum |
| `duration` | Average flow duration in the window | mean |
| `syn_flag_count`, `ack_flag_count`, `fin_flag_count`, `rst_flag_count`, `psh_flag_count` | TCP flag activity in the window (high SYN with low ACK = possible scan/flood) | sum |
| `ttl` | Average TTL in the window | mean |
| `tcp_window_size` | Average TCP window size | mean |
| `fragmented` | Count of fragmented flows in the window | sum |
| `retransmission_count` | Total retransmissions in the window | sum |
| `flow_bytes_per_sec`, `flow_packets_per_sec` | Average throughput per flow in the window | mean |
| `avg_packet_size` | Average packet size in the window | mean |
| `unique_src_ips` | Number of distinct source IPs active in the window | nunique |
| `unique_dst_ips` | Number of distinct destination IPs contacted | nunique |
| `unique_dst_ports` | Number of distinct destination ports contacted — **key reconnaissance/scan signal**: a spike here indicates port scanning | nunique |
| `tcp_count` / `udp_count` | Number of TCP / UDP flows in the window | count |
| `majority_label` | Most common ground-truth label in the window (for supervised training / demo comparison) | mode |
| `majority_attack_stage` | Most common ground-truth attack-progression stage in the window | mode |
| `stage_purity` | Fraction of flows in the window matching `majority_attack_stage` (low purity = transition point between attack phases) | ratio |

**Why this matters for the project's core story:** watching how
`unique_dst_ports`, `total_bytes`, and `syn_flag_count` evolve window-to-window
IS the "network state changing over time" that the world model is meant to
learn. This table is the direct input to that learning process.

---

## 3. Attack Stage Vocabulary Used in Demo Data

| Stage | Description |
|---|---|
| Normal | Ordinary benign traffic |
| Reconnaissance | Port/host scanning to discover targets |
| Initial Access | Brute-force login attempts (FTP/SSH) |
| Denial of Service | Volumetric flooding attacks |
| Lateral Movement | Attacker moving within the network after initial compromise |
| Command and Control | Beaconing traffic to an external C2 server |
| Exfiltration | Large outbound data transfer |

This vocabulary is used consistently by the synthetic demo generator and
should be the same vocabulary Raja's stage-mapping module uses, so labels
match end-to-end.
