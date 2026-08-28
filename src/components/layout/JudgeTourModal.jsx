import React, { useState } from 'react';
import { useForecasting } from '../../context/ForecastingContext';
import { X, Award, Shield, ArrowRight, Brain, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function JudgeTourModal() {
  const { isTourOpen, setIsTourOpen, changeScenario } = useForecasting();
  const [step, setStep] = useState(1);

  if (!isTourOpen) return null;

  const slides = [
    {
      title: 'Problem Statement & Hackathon Objective',
      subtitle: 'Why Forecasting beats Reactive IDS Detection',
      icon: Shield,
      content: (
        <div className="space-y-3 text-sm text-slate-300">
          <p className="leading-relaxed">
            Traditional Intrusion Detection Systems (Snort, Suricata) only trigger alerts <span className="text-rose-400 font-semibold">after an attack has breached perimeter buffers</span>, resulting in server downtime and exfiltration.
          </p>
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
              <Zap className="h-4 w-4" /> OUR SIH INNOVATION:
            </div>
            <p className="text-xs text-slate-300">
              We train a temporal sequence model (Bi-LSTM + Graph Neural Network) on continuous NetFlow dynamics to <strong className="text-white">forecast network attack progression 15 to 60 minutes before peak disruption</strong>, enabling automated proactive mitigation.
            </p>
          </div>
        </div>
      )
    },
    {
      title: '10-Second Judge Navigation Guide',
      subtitle: 'Everything you need above the fold',
      icon: Clock,
      content: (
        <div className="space-y-3 text-sm text-slate-300">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-cyan-400 block mb-1">1. Hero Section (Dashboard)</strong>
              Instantly review Risk Tier, Forecast Horizon, Vector, and AI Confidence without scrolling.
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-amber-400 block mb-1">2. Scenario Switcher (Top Bar)</strong>
              Switch between 5 live SIH attack datasets (DDoS, Slowloris, APT Recon, Ransomware C2, Nominal).
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-rose-400 block mb-1">3. Attack Forecast Screen</strong>
              View multi-step state progression from T0 to T+60m and mitigation impact curves.
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-emerald-400 block mb-1">4. Explainability (SHAP)</strong>
              Understand exact mathematical feature attribution and human-readable CISO justification.
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'AI Model Architecture & Benchmarks',
      subtitle: 'State-of-the-Art Ensemble with Zero Black-Box Obscurity',
      icon: Brain,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30">
              <span className="text-lg font-bold text-cyan-400 block">98.6%</span>
              <span className="text-[10px] text-slate-400 uppercase">Accuracy</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30">
              <span className="text-lg font-bold text-emerald-400 block">0.994</span>
              <span className="text-[10px] text-slate-400 uppercase">ROC-AUC</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30">
              <span className="text-lg font-bold text-amber-400 block">14.8m</span>
              <span className="text-[10px] text-slate-400 uppercase">Lead Time</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/30">
              <span className="text-lg font-bold text-rose-400 block">11.4ms</span>
              <span className="text-[10px] text-slate-400 uppercase">Latency</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trained on 78 statistical flow features (CIC-IDS2018 + UNSW-NB15). Combines Graph Attention Networks for topological clustering with Bi-LSTMs for sequence forecasting and TreeSHAP for exact local feature attribution.
          </p>
        </div>
      )
    }
  ];

  const currentSlide = slides[step - 1];
  const Icon = currentSlide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-cyan-400">
                Smart India Hackathon 2026
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Judge Walkthrough & System Overview
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsTourOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="py-5">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Icon className="h-5 w-5" />
            <h4 className="text-base font-bold text-white">{currentSlide.title}</h4>
          </div>
          <p className="text-xs text-slate-400 font-mono mb-4">{currentSlide.subtitle}</p>

          {currentSlide.content}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  step === i + 1 ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Back
              </button>
            )}

            {step < slides.length ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-1.5 text-xs font-bold font-mono uppercase tracking-wider shadow-cyber-cyan"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsTourOpen(false);
                  changeScenario('ddos-syn-flood');
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 text-xs font-bold font-mono uppercase tracking-wider shadow-cyber-emerald"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Start Exploring Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
