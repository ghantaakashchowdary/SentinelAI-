/**
 * AI Explainability (XAI), SHAP Attribution & Model Architecture Specifications
 */

export const MODEL_SPECS = {
  architecture: 'Hybrid Temporal Bi-LSTM + Graph Attention Network (GAT) + XGBoost Ensemble',
  xaiFramework: 'KernelSHAP & TreeSHAP Local/Global Attribution with Multi-Step Rolling Windows',
  trainingDataset: 'CSE-CIC-IDS2018 + UNSW-NB15 + Real Enterprise Synthetic NetFlow (78 Features)',
  metrics: {
    accuracy: '98.6%',
    precision: '98.2%',
    recall: '97.9%',
    f1Score: '0.980',
    rocAuc: '0.994',
    mttf: '14.8 min', // Mean Time to Forecast
    inferenceLatency: '11.4 ms / batch',
    falsePositiveRate: '0.62%'
  },
  layerBreakdown: [
    { name: 'Layer 1: NetFlow Feature Ingestion', details: 'Statistical flow extractor computing 78 temporal metrics across 1s, 5s, 30s sliding windows.' },
    { name: 'Layer 2: Spatial Graph Attention (GAT)', details: 'Maps IP-to-IP connectivity topology, detecting node fan-out, port sweeps, and botnet clusters.' },
    { name: 'Layer 3: Bidirectional Temporal LSTM', details: 'Forecasts progression state $T_0 \\to T+60\\text{m}$ by learning sequence dependencies in packet dynamics.' },
    { name: 'Layer 4: TreeSHAP Explainer Engine', details: 'Computes exact Shapley values per flow to decompose prediction probability into human-readable network features.' }
  ]
};

export const GLOBAL_FEATURE_IMPORTANCE = [
  { feature: 'SYN_Flag_Ratio', weight: 0.28, category: 'TCP Flags', description: 'Ratio of SYN flags to established ACK handshakes' },
  { feature: 'Flow_Duration_Mean', weight: 0.22, category: 'Temporal Duration', description: 'Average lifespan of active TCP/UDP sockets' },
  { feature: 'Fwd_IAT_Mean', weight: 0.18, category: 'Inter-Arrival Time', description: 'Mean inter-arrival time between consecutive forward packets' },
  { feature: 'Dst_Port_Entropy', weight: 0.14, category: 'Topology Variance', description: 'Shannon entropy across destination port distributions' },
  { feature: 'Payload_Byte_Entropy', weight: 0.10, category: 'Payload Cryptography', description: 'Randomness/encryption score of application layer payload' },
  { feature: 'Flow_Bytes_Sec', weight: 0.08, category: 'Volumetric Bandwidth', description: 'Forward bytes per second throughput surge' }
];

export const MICRO_EVIDENCE_RULES = [
  {
    id: 'R-701',
    name: 'Half-Open Connection Flooding',
    status: 'VIOLATED',
    severity: 'Critical',
    condition: 'SYN_ACK_Ratio > 5.0 across sliding 10-second window',
    currentValue: '14.2x (Threshold: 5.0x)',
    mitreTactic: 'TA0040 - Impact (Denial of Service)',
    mitreTechnique: 'T1498.001 - Direct Network Flood'
  },
  {
    id: 'R-702',
    name: 'Inter-Packet Interval Collapse',
    status: 'VIOLATED',
    severity: 'Critical',
    condition: 'Fwd_IAT_Mean < 0.01ms with Packet_Rate > 100k pps',
    currentValue: '0.002ms at 412,890 pps',
    mitreTactic: 'TA0040 - Impact',
    mitreTechnique: 'T1499.003 - Endpoint DoS'
  },
  {
    id: 'R-703',
    name: 'Known Malicious Threat Actor ASN',
    status: 'VIOLATED',
    severity: 'Elevated',
    condition: 'Source IP matches Tier-1 Tor Exit or Bulletproof Hosting ASN',
    currentValue: 'AS208323 & AS44034 identified',
    mitreTactic: 'TA0001 - Initial Access',
    mitreTechnique: 'T1190 - Exploit Public-Facing Application'
  },
  {
    id: 'R-704',
    name: 'Destination Port Fanout Anomaly',
    status: 'NOMINAL',
    severity: 'Safe',
    condition: 'Unique Dst Ports per IP > 150 / min',
    currentValue: '2 ports (Targeting 80/443 exclusively)',
    mitreTactic: 'TA0007 - Discovery',
    mitreTechnique: 'T1046 - Network Service Discovery'
  }
];
