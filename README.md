# 🛡️ AEGIS-AI SOC: AI-Based Network Attack Forecasting from Network Traffic Data

> **Smart India Hackathon (SIH) 2026 Project**  
> *A high-performance, judge-friendly cybersecurity operations center frontend designed to visualize AI-generated network attack forecasts within 10 seconds.*

---

## 🌟 Key Highlights & 10-Second Judge Rule

1. **Above-The-Fold Clarity:** The Dashboard Hero Section provides instantaneous visibility into **Current Risk Level**, **Forecasted Attack Vector**, **Lead-Time Horizon ($T+15\text{m}$ to $T+60\text{m}$)**, and **AI Confidence Score (96.4%)**.
2. **Predictive Forecasting vs Reactive IDS:** Demonstrates moving beyond legacy post-breach alerts by forecasting multi-step attack progression trajectories ($T_0 \to T+5\text{m} \to T+15\text{m} \to T+30\text{m} \to T+60\text{m}$).
3. **Transparent Explainability (XAI):** Full mathematical TreeSHAP feature attribution waterfall and human-readable natural language justification for CISOs.
4. **1-Click Evaluation Playground:** 5 pre-loaded SIH attack datasets (*DDoS SYN Flood*, *Slowloris HTTP*, *APT Port Recon*, *Ransomware C2*, *Nominal Baseline*) to test dynamic prediction in real-time.

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
| **2** | **Traffic Analysis** | Protocol breakdown (TCP/UDP/TLS/DNS/ICMP), Top Talkers IP Geolocation & ASN threat reputation, and CIC-IDS2017 78-feature interactive table with search, filters, and socket inspector. |
| **3** | **Attack Forecast** | Multi-step temporal horizon selector ($T_0 \to T+60\text{m}$), attack progression stages, unmitigated vs mitigated risk curve, and competing vector probabilities. |
| **4** | **Explainability (XAI)** | Plain-English CISO reasoning synthesis, TreeSHAP feature attribution waterfall, MITRE ATT&CK micro-evidence rule violations, and Bi-LSTM + GNN benchmark metrics. |
| **5** | **Prediction History** | 30-day forecast audit logs, accuracy and lead-time trendlines, incident post-mortem playback, and instant CISO PDF/CSV report exporter. |
| **6** | **Demo Upload** | Drag-and-drop PCAP/CSV ingestion zone, 4-stage pipeline animation (Header Parsing $\to$ 78 Flow Features $\to$ Bi-LSTM $\to$ SHAP), and 1-click SIH Demo Scenario launcher. |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 3.4, Lucide Icons, Glassmorphism Dark SOC styling
- **AI Forecasting Core (Emulated Architecture):** Bidirectional LSTM + Graph Attention Network (GAT) + XGBoost + TreeSHAP
- **Dataset Compatibility:** CIC-IDS2017, CSE-CIC-IDS2018, UNSW-NB15, PCAP & NetFlow v9

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
Preview production build:
```bash
npm run preview
```

---

## 👨‍💻 Smart India Hackathon Demonstration Flow for Judges

1. **Step 1:** Open Dashboard — Notice the **Hero Section** displaying Critical Risk Tier, $T+15\text{m}$ Horizon, and 96.4% confidence score within 10 seconds.
2. **Step 2:** Click **"Judge Tour"** on top bar to view the 3-slide pitch and architectural benchmarks.
3. **Step 3:** Switch scenarios via the **"Scenario" dropdown** in the header (e.g. switch between *DDoS SYN Flood* and *Slowloris*).
4. **Step 4:** Navigate to **"Attack Forecast"** — Click across $T_0 \to T+5\text{m} \to T+15\text{m} \to T+30\text{m} \to T+60\text{m}$ to observe how the network state degrades over time.
5. **Step 5:** Click **"Deploy Automated Mitigation"** — Observe how the predicted risk curve drops from 96% down to 18%.
6. **Step 6:** Navigate to **"Explainability (XAI)"** to inspect SHAP feature weights (`SYN_Flag_Ratio`, `Fwd_IAT_Mean`).
7. **Step 7:** Open **"Demo Upload"** to drag-and-drop a sample PCAP/CSV and watch the live 4-stage AI pipeline execute.
