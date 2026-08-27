# Preprocessing Notes — Ganesh's Module

SIH26153 — Predictive Network Attack Progression & Explainable Cybersecurity

## 1. Dataset Used

**Current state:** Synthetic, CICIDS2017-schema-compatible dataset
(`src/generate_sample_data.py`), generated with a fixed random seed (42) for
full reproducibility. It simulates a realistic attack progression:

```
Normal (120s) → Reconnaissance/PortScan (60s) → Initial Access/Brute-Force (90s)
→ Normal lull (30s) → DoS (50s) → Lateral Movement/Infiltration (40s)
→ Command & Control/Botnet (40s) → Exfiltration/DDoS-like burst (35s) → Normal (60s)
```

**Why synthetic instead of a downloaded dataset:** given the hackathon
timeline, a self-generated dataset removes dependency on large external
downloads (real CICIDS2017 is 100MB–48GB depending on file) while still
following the same column schema. **If a real CICIDS2017 or UNSW-NB15 CSV
becomes available**, it can be dropped into `data/raw/` and run through the
exact same pipeline with zero code changes — only `--input` needs to change.
This is possible because `ingest.py`'s `normalize_column_names()` already
maps common real-dataset column names onto our canonical schema.

**Team-facing disclosure:** this is demo/development data, not a captured
real-world dataset. It should be described honestly as a synthetic scenario
built for reproducible offline demonstration — which is also explicitly
listed as a project requirement (offline demo mode, no dependency on live
traffic).

## 2. Missing-Value Handling

- Numeric columns: missing/invalid values are coerced to `NaN`, then
  **median-imputed** (per column). Every imputation is logged with the
  column name, count of affected rows, and the median value used.
- Rows missing core identity fields (`src_ip`, `dst_ip`, `protocol`) are
  **dropped** — a flow record without these can't be meaningfully processed.
- Rows with unparseable timestamps are **dropped** (temporal ordering is
  non-negotiable for this project).

## 3. Data Validation

Before feature extraction, the pipeline checks:
- Required columns (`timestamp`, `src_ip`, `dst_ip`, `protocol`) are present
  → hard failure if missing.
- Optional feature columns are checked and **logged as unavailable** if
  missing — never fabricated.

After cleaning, a final validation confirms no `NaN` values remain in
numeric columns and the dataset isn't empty, before handing off to
normalization.

## 4. Normalization Method

**Min-max scaling to [0, 1]**, chosen for simplicity and because it keeps
all features on a directly comparable scale for the LSTM, without assuming
a particular distribution (unlike z-score standardization).

- Parameters (`min`, `max` per column) are fit once and saved to
  `data/processed/normalization_params.json`.
- **Training vs inference:** the exact same saved parameters must be reused
  at inference time (`--no-refit` flag in `pipeline.py`) so live traffic is
  scaled identically to how the model was trained. This is enforced by the
  pipeline design, not just a convention.
- Values are clipped to [0, 1] at apply-time, so inference-time values that
  exceed the training range don't break downstream matrix shapes.

## 5. Time-Window Construction

- **Default window size: 5 seconds.** This is a tunable MVP default — chosen
  because it's fine-grained enough to catch fast reconnaissance/scan bursts
  while still producing a stable window with several flows for the DoS/
  exfiltration phases seen in our scenario.
- Windows are constructed by flooring each flow's timestamp to the nearest
  5-second boundary, then aggregating.
- **Gap-filling:** if a time window has zero flows, it's filled with a
  zero-valued network state, not skipped — this keeps the sequence
  contiguous, which sequential models require (no missing timesteps).
- Aggregation methods per feature are documented in
  `docs/feature_dictionary.md` (sum for volume features, mean for rate/size
  features, nunique for diversity features, mode for labels).

## 6. Feature Extraction — What's Real vs. Derived

**Directly extracted** (present in source data): all flow-level fields
(packets, bytes, TCP flags) and packet-level fields (TTL, window size,
fragmentation, retransmissions) when the input supports them.

**Derived (genuinely computed, not fabricated):** `total_bytes`,
`total_packets`, `flow_bytes_per_sec`, `flow_packets_per_sec`,
`bidirectional_byte_ratio`, `avg_packet_size` — all computed directly from
extracted fields using standard formulas, documented in the feature
dictionary.

**Never fabricated:** if a feature isn't supported by the input (e.g.
packet-level TTL when given a pre-aggregated flow CSV without that column),
it is left absent and logged — not filled with a guessed value.

## 7. Known Limitations

- Synthetic data approximates realistic attack signatures but is **not**
  captured from a real network — statistical properties will differ from
  real-world CICIDS2017/UNSW-NB15 data in ways a judge may probe.
- PCAP ingestion path (`ingest_pcap` in `ingest.py`) is implemented via
  Scapy but has not been tested against a large real-world PCAP file due to
  time constraints — the CSV path is the primary, tested route for the
  hackathon MVP.
- 5-second windows may blur extremely short bursts (sub-second scans); this
  is a tunable parameter, not a hard limitation, and should be discussed
  with Madhav based on what the model responds best to.
- `bidirectional_byte_ratio` is undefined (falls back to raw fwd_bytes) when
  backward traffic is exactly zero — documented behavior, not a bug.
- Reproducibility is guaranteed for the pipeline logic and synthetic data
  generation (fixed seed). If real captured data is substituted, output will
  naturally differ run-to-run only if the input file itself changes.

## 8. Reproducibility Statement

Running `python3 src/pipeline.py --input <same file> --window <same value>`
multiple times against the same input produces **byte-identical output**
(verified via checksum during development). No step in the pipeline
involves non-deterministic randomness after the initial data generation
(which itself uses a fixed seed).
