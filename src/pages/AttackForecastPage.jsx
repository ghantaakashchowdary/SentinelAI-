import React, { useState } from 'react';
import { useForecasting } from '../context/ForecastingContext';
import {
  TrendingUp,
  Clock,
  ShieldAlert,
  Zap,
  Target,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  Radio
} from 'lucide-react';
import RiskBadge from '../components/common/RiskBadge';
import MetricCard from '../components/common/MetricCard';

export default function AttackForecastPage() {
  const { currentScenario, selectedHorizon, setSelectedHorizon, setIsMitigateModalOpen } = useForecasting();
  const [activeStepIndex, setActiveStepIndex] = useState(2); // default to T+15m

  const currentTimelineStep = currentScenario.timeline[activeStepIndex] || currentScenario.timeline[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              AI TEMPORAL ATTACK FORECASTING ENGINE
            </h1>
            <span className="rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono">
              PROACTIVE HORIZON
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Bi-LSTM Sequence Extrapolation & Multi-Step Escalation Modeling (T0 → T+60min)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMitigateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-mono text-xs font-bold uppercase px-4 py-2 shadow-cyber-rose transition-all"
          >
            <Zap className="h-4 w-4" />
            Simulate Mitigation Response
          </button>
        </div>
      </div>

      {/* Horizon Selector Tabs */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 px-2 text-xs font-mono text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Select Temporal Horizon:
          </span>
          <span>Click a timestep to inspect predicted network state</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 font-mono">
          {currentScenario.timeline.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveStepIndex(idx);
                  setSelectedHorizon(step.step);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400/80 shadow-cyber-cyan/30 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {step.step}
                  </span>
                  <RiskBadge severity={step.riskLevel} size="sm" showLabel={false} />
                </div>
                <div className="text-[11px] font-semibold text-white mt-1 truncate">
                  {step.stage}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Risk: <strong className={step.riskScore > 80 ? 'text-rose-400' : 'text-slate-200'}>{step.riskScore}/100</strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Horizon State Deep Dive */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  FORECASTED NETWORK STATE @ {currentTimelineStep.step}
                </span>
                <RiskBadge severity={currentTimelineStep.riskLevel} size="sm" />
              </div>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                {currentTimelineStep.stage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">Predicted Risk Score:</span>
              <span className="text-xl font-bold text-rose-400">{currentTimelineStep.riskScore} / 100</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-500 block text-[10px]">AI Certainty:</span>
              <span className="text-xl font-bold text-emerald-400">{currentScenario.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Narrative description */}
        <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <strong className="text-cyan-300 font-mono">Temporal State Simulation: </strong>
          {currentTimelineStep.stateDesc}
        </p>

        {/* Metrics Grid at this timestep */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">SYN to ACK Ratio:</span>
            <span className="text-lg font-bold text-rose-400">{currentTimelineStep.synRatio}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Projected Ingress Rate:</span>
            <span className="text-lg font-bold text-cyan-400">{currentTimelineStep.packetRate}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Projected Bandwidth:</span>
            <span className="text-lg font-bold text-amber-400">{currentTimelineStep.bandwidth}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Edge CPU Degradation:</span>
            <span className="text-lg font-bold text-white">{currentTimelineStep.cpuImpact}</span>
          </div>
        </div>
      </div>

      {/* Unmitigated vs Mitigated Risk Trajectory Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Probability Curve */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                RISK TRAJECTORY: UNMITIGATED VS AUTOMATED MITIGATION
              </h3>
              <p className="text-xs text-slate-400">
                Shows the critical window for intervention before full service disruption occurs.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span> Unmitigated
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> If Mitigated Now
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-600"></span> Baseline
              </span>
            </div>
          </div>

          {/* Dynamic SVG Visual Chart */}
          <div className="relative pt-4">
            <div className="grid grid-cols-8 gap-2 h-48 items-end bg-slate-950 p-4 rounded-xl border border-slate-800">
              {currentScenario.riskCurve.map((point, idx) => (
                <div key={idx} className="flex flex-col items-center h-full justify-end group relative font-mono text-xs">
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 p-2 rounded-lg text-[10px] z-20 shadow-xl whitespace-nowrap">
                    <span className="font-bold text-white">{point.time}</span>
                    <span className="text-rose-400">Unmitigated Risk: {point.unmitigated}/100</span>
                    <span className="text-emerald-400">Mitigated: {point.mitigated}/100</span>
                    <span className="text-slate-400">Baseline: {point.baseline}/100</span>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Unmitigated bar */}
                    <div
                      className="w-3 rounded-t bg-gradient-to-t from-rose-600 to-rose-400 transition-all duration-500"
                      style={{ height: `${point.unmitigated}%` }}
                    ></div>
                    {/* Mitigated bar */}
                    <div
                      className="w-3 rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500"
                      style={{ height: `${point.mitigated}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-2 truncate w-full text-center">
                    {point.time}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
              <span>Past Telemetry (T-10m)</span>
              <span className="text-amber-400 font-bold">⚡ Decision Threshold: Deploy within 5 min</span>
              <span>Future Horizon (T+60m)</span>
            </div>
          </div>
        </div>

        {/* Competing Attack Vector Probabilities */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              VECTOR PROBABILITIES
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Softmax Ensemble</span>
          </div>

          <div className="space-y-4">
            {currentScenario.vectorProbabilities.map((vec) => (
              <div key={vec.name} className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: vec.color }}></span>
                    {vec.name}
                  </span>
                  <span className="font-bold text-white">{vec.probability}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${vec.probability}%`, backgroundColor: vec.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
            <strong className="text-slate-200 block">Confidence Interval:</strong>
            <p className="text-[11px]">
              Prediction is bounded by a 95% Bayesian credible envelope (92.1% - 98.4%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
