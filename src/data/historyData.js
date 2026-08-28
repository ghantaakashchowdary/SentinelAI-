/**
 * Historical Prediction Logs and Verification Records
 */

export const PREDICTION_HISTORY_RECORDS = [
  {
    incidentId: 'INC-2026-0881',
    timestamp: '2026-08-27 11:24:00',
    forecastHorizon: 'T + 15 min',
    predictedAttack: 'Distributed SYN Flood & UDP Amplification',
    confidence: '96.2%',
    actualOutcome: 'Confirmed & Mitigated',
    status: 'True Positive',
    severity: 'Critical',
    leadTime: '14.2 min before peak',
    mitigationAction: 'BGP Flowspec scrubbing + Rate-limit 20k pps',
    analyst: 'SOC-Automated AI Agent',
    details: 'Model forecasted 12.4 Gbps ingress flood. Automated BGP diversion activated at T+3 min. Zero service downtime.'
  },
  {
    incidentId: 'INC-2026-0880',
    timestamp: '2026-08-26 19:42:15',
    forecastHorizon: 'T + 30 min',
    predictedAttack: 'Slowloris HTTP Thread Exhaustion',
    confidence: '88.5%',
    actualOutcome: 'Confirmed & Mitigated',
    status: 'True Positive',
    severity: 'Elevated',
    leadTime: '26.8 min before peak',
    mitigationAction: 'NGINX client_header_timeout reduced to 5s',
    analyst: 'A. Sharma (Senior Analyst)',
    details: 'Stealth low-and-slow connections detected before worker threads were starved.'
  },
  {
    incidentId: 'INC-2026-0879',
    timestamp: '2026-08-26 08:15:30',
    forecastHorizon: 'T + 60 min',
    predictedAttack: 'Subnet Port Sweep & Lateral Recon',
    confidence: '92.1%',
    actualOutcome: 'Verified & Quarantined',
    status: 'True Positive',
    severity: 'Warning',
    leadTime: '51.4 min before exploit',
    mitigationAction: 'Host IP 45.33.32.156 blacklisted at perimeter',
    analyst: 'SOC-Automated AI Agent',
    details: 'Decoy port probing flagged across /24 subnet. Perimeter drop rule prevented subsequent RCE staging.'
  },
  {
    incidentId: 'INC-2026-0878',
    timestamp: '2026-08-25 14:02:40',
    forecastHorizon: 'T + 5 min',
    predictedAttack: 'DNS Query Flood',
    confidence: '71.4%',
    actualOutcome: 'Benign Surge (Marketing Campaign)',
    status: 'False Positive',
    severity: 'Warning',
    leadTime: '4.8 min',
    mitigationAction: 'Threshold tuned; Whitelisted legitimate DNS CDN',
    analyst: 'R. Patel (L2 Analyst)',
    details: 'Spike in DNS lookups originated from legitimate promotional email blast.'
  },
  {
    incidentId: 'INC-2026-0877',
    timestamp: '2026-08-24 03:19:10',
    forecastHorizon: 'T + 15 min',
    predictedAttack: 'Cobalt Strike C2 HTTPS Beaconing',
    confidence: '98.4%',
    actualOutcome: 'Confirmed & Contained',
    status: 'True Positive',
    severity: 'Critical',
    leadTime: '12.6 min before exfil',
    mitigationAction: 'EDR isolated infected endpoint 172.16.5.88',
    analyst: 'SOC-Automated AI Agent',
    details: 'Periodic 45s jitter beacon flagged. Compromised financial DB isolated before database exfiltration.'
  },
  {
    incidentId: 'INC-2026-0876',
    timestamp: '2026-08-23 22:50:00',
    forecastHorizon: 'T + 30 min',
    predictedAttack: 'SSH Brute Force Dictionary Attack',
    confidence: '94.0%',
    actualOutcome: 'Confirmed & Mitigated',
    status: 'True Positive',
    severity: 'Elevated',
    leadTime: '24.1 min before lockout',
    mitigationAction: 'Fail2ban dynamic jail + IP range drop',
    analyst: 'SOC-Automated AI Agent',
    details: 'Distributed bot cluster targeting port 22 blocked after 3 failed password handshakes.'
  }
];

export const ACCURACY_TREND_DATA = [
  { day: 'Day 1', precision: 97.2, recall: 96.5, accuracy: 98.0, leadTimeMin: 15.2 },
  { day: 'Day 5', precision: 97.8, recall: 97.1, accuracy: 98.2, leadTimeMin: 14.8 },
  { day: 'Day 10', precision: 98.1, recall: 97.4, accuracy: 98.4, leadTimeMin: 15.6 },
  { day: 'Day 15', precision: 98.0, recall: 97.6, accuracy: 98.3, leadTimeMin: 14.5 },
  { day: 'Day 20', precision: 98.4, recall: 97.9, accuracy: 98.6, leadTimeMin: 16.0 },
  { day: 'Day 25', precision: 98.7, recall: 98.1, accuracy: 98.8, leadTimeMin: 15.4 },
  { day: 'Day 30 (Today)', precision: 98.6, recall: 98.2, accuracy: 98.7, leadTimeMin: 14.8 }
];
