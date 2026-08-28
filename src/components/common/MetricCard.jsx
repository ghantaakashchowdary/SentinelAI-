import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Info, HelpCircle } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subvalue,
  change,
  isIncreaseBad = true,
  icon: Icon,
  variant = 'default',
  badgeText,
  // Technical details for hover state
  techTitle,
  techValue,
  techDesc,
  techFormula
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isPositiveChange = change && change.startsWith('+');
  const isAlarm = isIncreaseBad ? isPositiveChange : !isPositiveChange;

  const borderStyles = {
    default: 'border-slate-800 hover:border-cyan-500/50',
    critical: 'border-rose-500/40 shadow-cyber-rose/20 bg-rose-950/10 hover:border-rose-400',
    warning: 'border-amber-500/40 shadow-cyber-amber/20 bg-amber-950/10 hover:border-amber-400',
    safe: 'border-emerald-500/40 shadow-cyber-emerald/20 bg-emerald-950/10 hover:border-emerald-400'
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-visible rounded-2xl bg-slate-900/85 p-4 border backdrop-blur-md transition-all duration-200 cursor-pointer ${borderStyles[variant] || borderStyles.default}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-slate-300 font-sans flex items-center gap-1.5">
          {title}
          <Info className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Card Main Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-sans tracking-tight text-white">
          {value}
        </span>
        {subvalue && (
          <span className="text-xs text-slate-400 font-sans">
            {subvalue}
          </span>
        )}
      </div>

      {/* Card Footer Change & Badge */}
      <div className="mt-2.5 flex items-center justify-between text-xs">
        {change ? (
          <span className={`inline-flex items-center gap-1 font-sans font-medium ${isAlarm ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isPositiveChange ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {change} <span className="text-slate-500">vs normal</span>
          </span>
        ) : (
          <span className="text-slate-500 font-sans">Normal Range</span>
        )}

        {badgeText && (
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-700">
            {badgeText}
          </span>
        )}
      </div>

      {/* =========================================================================
          TECHNICAL HOVER OVERLAY (Appears smoothly when hovering)
          ========================================================================= */}
      {isHovered && (techTitle || techDesc) && (
        <div className="absolute left-0 right-0 -top-2 transform -translate-y-full z-50 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-xs font-mono">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px]">
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              ⚡ TECHNICAL TELEMETRY
            </span>
            <span className="text-slate-500">Raw NetFlow</span>
          </div>

          <div className="mt-1.5 space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500 font-sans">Metric:</span>
              <strong className="text-white">{techTitle || title}</strong>
            </div>
            {techValue && (
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500 font-sans">Raw Value:</span>
                <span className="text-cyan-300 font-bold">{techValue}</span>
              </div>
            )}
            {techFormula && (
              <div className="text-[10px] text-amber-300/90 pt-0.5">
                Formula: {techFormula}
              </div>
            )}
            {techDesc && (
              <div className="text-[11px] text-slate-400 font-sans pt-1 border-t border-slate-800/80 leading-relaxed">
                {techDesc}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
