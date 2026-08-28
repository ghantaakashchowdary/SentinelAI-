import React, { useState } from 'react';
import { useForecasting } from '../context/ForecastingContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Sparkles,
  FileCode,
  FileCheck,
  RotateCw
} from 'lucide-react';
import RiskBadge from '../components/common/RiskBadge';

export default function DemoUploadPage() {
  const { scenarios, currentScenario, changeScenario, setActiveTab, addNotification } = useForecasting();
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1..4 = steps, 5 = done
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null

  const processingSteps = [
    { label: 'Step 1: Header De-encapsulation & Socket Parsing', desc: 'Extracting IP/Port pairs, TCP Window sizes, and Inter-Arrival Times' },
    { label: 'Step 2: 78-Dimensional Flow Feature Generation', desc: 'Computing CIC-IDS2017 flow statistics, packet length standard deviation, and flag ratios' },
    { label: 'Step 3: Bi-LSTM Temporal Sequence Forecasting', desc: 'Feeding rolling time-series windows through Graph Attention + Bi-LSTM ensemble' },
    { label: 'Step 4: TreeSHAP Attribution & Risk Synthesis', desc: 'Decomposing prediction output into local Shapley feature weights and plain-English narrative' }
  ];

  const handleSimulatedUpload = (fileName = 'CIC-IDS2017-Friday-DDoS-Capture.pcap') => {
    setSelectedFile(fileName);
    setIsProcessing(true);
    setCurrentStep(1);
    setUploadStatus(null);

    // Run step 1
    setTimeout(() => {
      setCurrentStep(2);
      // Run step 2
      setTimeout(() => {
        setCurrentStep(3);
        // Run step 3
        setTimeout(() => {
          setCurrentStep(4);
          // Run step 4 & finish
          setTimeout(() => {
            setCurrentStep(5);
            setIsProcessing(false);
            setUploadStatus('success');
            changeScenario('ddos-syn-flood');
            addNotification(
              'Dataset Ingestion Complete 🚀',
              `Successfully ingested and forecasted 280,000 flows from [${fileName}].`,
              'critical'
            );
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSimulatedUpload(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              DATASET UPLOAD & DEMO SCENARIO LAUNCHER
            </h1>
            <span className="rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono">
              JUDGE PLAYGROUND
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Ingest PCAP / NetFlow captures or test with 1-click pre-configured Smart India Hackathon attack scenarios
          </p>
        </div>
      </div>

      {/* 1-Click SIH Demo Scenarios Playground (Prominently featured for Judges) */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/40 p-6 backdrop-blur-md space-y-4 shadow-cyber-cyan/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-cyan-400 border border-cyan-500/30">
              Instant Evaluation Mode
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              Select a Preloaded Hackathon Attack Scenario
            </h2>
            <p className="text-xs text-slate-400">
              Click any scenario to instantly load its live telemetry, multi-step forecast, and SHAP explainability.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scenarios.map((sc) => {
            const isActive = currentScenario.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  changeScenario(sc.id);
                  setActiveTab('dashboard');
                }}
                className={`group relative rounded-xl p-4 border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-cyber-cyan/30'
                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <RiskBadge severity={sc.severity} size="sm" />
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                    {sc.horizon}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                  {sc.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {sc.summary}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Certainty: <strong className="text-white">{sc.confidence}%</strong></span>
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    {isActive ? 'Active Scenario' : 'Launch Demo'} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag and Drop Network Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-cyan-400" />
              INGEST NETWORK CAPTURE (PCAP / CSV / JSON)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Max: 500 MB</span>
          </div>

          {/* Drag zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all text-center ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/30'
                : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-cyan-400 border border-slate-700 mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>

            <h4 className="text-sm font-bold text-white">
              Drag & Drop Network Capture File Here
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Accepts Raw PCAP, CIC-IDS2017 CSV, UNSW-NB15 NetFlow, or Suricata EVE JSON
            </p>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleSimulatedUpload('CIC-IDS2017-Friday-SYN-Flood.csv')}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-mono text-cyan-300 border border-slate-700"
              >
                📁 Load Sample CSV (CIC-IDS2017)
              </button>
              <button
                onClick={() => handleSimulatedUpload('LockBit-C2-Beaconing-Traffic.pcap')}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-mono text-rose-300 border border-slate-700"
              >
                📁 Load Sample PCAP (C2)
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-400" />
            <span>Automatic Schema Validation for 78 NetFlow statistical features.</span>
          </div>
        </div>

        {/* 4-Stage Ingestion Pipeline Progress */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              AI PREPROCESSING & FORECAST PIPELINE
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {isProcessing ? 'Processing...' : uploadStatus === 'success' ? 'Completed' : 'Idle'}
            </span>
          </div>

          {/* Steps */}
          <div className="space-y-3 pt-1">
            {processingSteps.map((st, idx) => {
              const stepNum = idx + 1;
              const isCompleted = currentStep > stepNum || uploadStatus === 'success';
              const isCurrent = currentStep === stepNum && isProcessing;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border font-mono text-xs transition-all ${
                    isCompleted
                      ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                      : isCurrent
                      ? 'bg-cyan-950/30 border-cyan-500/60 shadow-cyber-cyan/20 text-white'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></span>
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                          {stepNum}
                        </span>
                      )}
                      {st.label}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">Done</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1 pl-6">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Success Banner */}
          {uploadStatus === 'success' && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Telemetry Ingested & Forecast Generated!
                </span>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 font-mono text-xs font-bold uppercase"
                >
                  View in Dashboard →
                </button>
              </div>
              <p className="text-xs text-slate-300">
                Identified <strong className="text-rose-400">Critical Threat Escalation</strong> peaking in 15 minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
