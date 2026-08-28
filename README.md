# 🛡️ AEGIS-AI SOC: AI-Based Network Attack Forecasting from Network Traffic Data

> **Smart India Hackathon (SIH) 2026 Project**  
> *A high-performance cybersecurity operations center platform designed to visualize AI-generated network attack forecasts.*

---

## 🌟 Key Highlights

1. **Above-The-Fold Clarity:** Immediate visibility into **Current Risk Level**, **Forecasted Attack Vector**, **Lead-Time Horizon ($T+15\text{m}$ to $T+60\text{m}$)**, and **AI Confidence Score**.
2. **Predictive Forecasting vs Reactive IDS:** Multi-step attack progression trajectories ($T_0 \to T+5\text{m} \to T+15\text{m} \to T+30\text{m} \to T+60\text{m}$).
3. **Transparent Explainability (XAI):** Mathematical TreeSHAP feature attribution and human-readable natural language justification.
4. **1-Click Evaluation Playground:** Pre-loaded SIH attack datasets (*DDoS SYN Flood*, *Slowloris HTTP*, *APT Port Recon*, *Ransomware C2*, *Nominal Baseline*).

---

## 🎨 Color Coding Standard

- 🟢 **Safe:** Emerald Green (`#10B981`) — Nominal baseline operations
- 🟡 **Warning:** Amber Yellow (`#F59E0B`) — Low-volume reconnaissance / port probes
- 🟠 **Elevated Risk:** Vivid Orange (`#F97316`) — Stealth keep-alive socket starvation
- 🔴 **Critical Threat:** Crimson Rose (`#EF4444`) — Volumetric saturation & C2 exfiltration

---

## 🚀 6 Core Application Screens

| # | Screen | Description |
|---|---|---|
| **1** | **Dashboard** | 10-Second Hero section, Overall Risk Gauge (0-100), Active Threat Profile, Trajectory mini-chart, Top 4 Flow KPIs, Real-time Pipeline Health, and Quick Mitigation buttons. |
| **2** | **Traffic Analysis** | Protocol breakdown (TCP/UDP/TLS/DNS/ICMP), Top Talkers IP Geolocation & ASN threat reputation, and CIC-IDS2017 interactive table with search, filters, and socket inspector. |
| **3** | **Attack Forecast** | Multi-step temporal horizon selector ($T_0 \to T+60\text{m}$), attack progression stages, unmitigated vs mitigated risk curve, and competing vector probabilities. |
| **4** | **Explainability (XAI)** | Plain-English CISO reasoning synthesis, TreeSHAP feature attribution waterfall, MITRE ATT&CK micro-evidence rule violations, and Bi-LSTM + GNN benchmark metrics. |
| **5** | **Prediction History** | 30-day forecast audit logs, accuracy and lead-time trendlines, incident post-mortem playback, and instant CISO PDF/CSV report exporter. |
| **6** | **Demo Upload** | Drag-and-drop PCAP/CSV ingestion zone, 4-stage pipeline animation (Header Parsing $\to$ 78 Flow Features $\to$ Bi-LSTM $\to$ SHAP), and 1-click SIH Demo Scenario launcher. |

---

## 🛠️ Complete Backend & AI Forecasting Engine

### 1. Python Environment & Setup
```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Start FastAPI Server
```powershell
uvicorn api:app --host 0.0.0.0 --port 8000
```

### 3. Start Firebase Cloud Functions
```powershell
cd firebase/functions
npm install
npm run build
cd ..
firebase emulators:start
```

### 4. Running Verification Tests
```powershell
python -m pytest -v
```
