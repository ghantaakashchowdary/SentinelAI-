import React from 'react';
import { useForecasting } from '../context/ForecastingContext';
import {
  MODEL_SPECS,
  GLOBAL_FEATURE_IMPORTANCE,
  MICRO_EVIDENCE_RULES
} from '../data/explainabilityData';
import {
  Brain,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Layers,
  Cpu,
  HelpCircle,
  FileCheck,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import RiskBadge from '../components/common/RiskBadge';

export default function ExplainabilityPage() {
  const { currentScenario } = useForecasting();
  const { explainability } = currentScenario;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              AI EXPLAINABILITY & SHAP REASONING (XAI)
            </h1>
            <span className="rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono">
              ZERO BLACK-BOX
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Mathematical Shapley Feature Decomposition & Human-Readable Incident Justification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RiskBadge severity={currentScenario.severity} size="md" />
        </div>
      </div>

      {/* Human-Readable AI Explanation Section (CISO / Judge Summary) */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/90 to-slate-900/90 border border-cyan-500/30 p-6 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
          <Sparkles className="h-4 w-4" />
          EXECUTIVE REASONING SYNTHESIS (NATURAL LANGUAGE EXPLANATION)
        </div>
        <h2 className="text-lg font-bold text-white">
          Why the AI Model Forecasted [{currentScenario.predictedAttack}]
        </h2>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {explainability.cisoSummary}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
          <span className="text-cyan-400 font-semibold">Model Confidence: {currentScenario.confidence}%</span>
          <span>•</span>
          <span>Forecast Horizon: {currentScenario.horizon}</span>
          <span>•</span>
          <span>Target VIP: {currentScenario.targetAssets[0]}</span>
        </div>
      </div>

      {/* SHAP Feature Importance Waterfall / Horizontal Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Local Scenario SHAP Waterfall */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Brain className="h-4 w-4 text-cyan-400" />
                SHAPLEY FEATURE ATTRIBUTION (LOCAL INCIDENT CONTRIBUTION)
              </h3>
              <p className="text-xs text-slate-400">
                Positive values increase attack probability; negative values denote normal baseline behavior.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">TreeSHAP</span>
          </div>

          <div className="space-y-4 pt-2 font-mono text-xs">
            {explainability.topShapFeatures.map((feat, idx) => {
              const isPositive = feat.impact === 'positive';
              const widthPct = Math.min(100, Math.abs(feat.importance) * 200);
              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 text-rose-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                      )}
                      {feat.feature}
                    </span>
                    <span className={`font-bold ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isPositive ? `+${feat.importance.toFixed(2)}` : `${feat.importance.toFixed(2)}`} SHAP
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans">
                    {feat.description}
                  </p>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isPositive ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Model Feature Weights */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              GLOBAL IMPORTANCE
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Ensemble Baseline</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {GLOBAL_FEATURE_IMPORTANCE.map((item) => (
              <div key={item.feature} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span className="font-semibold">{item.feature}</span>
                  <span className="text-cyan-400 font-bold">{(item.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${item.weight * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Micro-Evidence Rules & Anomaly Triggers */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-cyan-400" />
              MODEL EVIDENCE & THRESHOLD VIOLATION CARDS
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic threshold breaches correlating with the neural network predictions.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">MITRE ATT&CK Matrix</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MICRO_EVIDENCE_RULES.map((rule) => {
            const isViolated = rule.status === 'VIOLATED';
            return (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border font-mono text-xs space-y-2.5 transition-all ${
                  isViolated
                    ? 'bg-slate-950 border-rose-500/40 shadow-cyber-rose/10'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{rule.id}: {rule.name}</span>
                  </div>
                  <RiskBadge severity={rule.severity} size="sm" />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1 text-[11px]">
                  <div className="text-slate-400">
                    <span className="text-slate-500">Condition: </span>
                    {rule.condition}
                  </div>
                  <div className={isViolated ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    <span className="text-slate-500 font-normal">Observed: </span>
                    {rule.currentValue}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>{rule.mitreTactic}</span>
                  <span className="text-cyan-400 font-semibold">{rule.mitreTechnique}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Architecture & Benchmarks Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            AI MODEL ARCHITECTURE & EVALUATION BENCHMARKS
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-semibold">Production Ready</span>
        </div>

        {/* 4 Performance Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Accuracy:</span>
            <span className="text-xl font-bold text-cyan-400">{MODEL_SPECS.metrics.accuracy}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">ROC-AUC:</span>
            <span className="text-xl font-bold text-emerald-400">{MODEL_SPECS.metrics.rocAuc}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Mean Lead Time:</span>
            <span className="text-xl font-bold text-amber-400">{MODEL_SPECS.metrics.mttf}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Inference Latency:</span>
            <span className="text-xl font-bold text-white">{MODEL_SPECS.metrics.inferenceLatency}</span>
          </div>
        </div>

        {/* Pipeline Architecture Layers */}
        <div className="space-y-2 pt-2">
          {MODEL_SPECS.layerBreakdown.map((layer, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="font-bold text-cyan-300 block mb-0.5">{layer.name}</span>
              <p className="text-slate-400 font-sans text-xs">{layer.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
