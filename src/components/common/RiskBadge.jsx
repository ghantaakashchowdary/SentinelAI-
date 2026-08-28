import React from 'react';

export default function RiskBadge({ severity, size = 'md', pulse = true, showLabel = true }) {
  const norm = (severity || 'Safe').toLowerCase();

  const configs = {
    critical: {
      label: 'Critical Threat',
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      dot: 'bg-rose-500',
      glow: 'shadow-cyber-rose'
    },
    elevated: {
      label: 'Elevated Risk',
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/40',
      dot: 'bg-orange-500',
      glow: 'shadow-cyber-orange'
    },
    warning: {
      label: 'Warning',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      dot: 'bg-amber-500',
      glow: 'shadow-cyber-amber'
    },
    safe: {
      label: 'Safe Nominal',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      dot: 'bg-emerald-500',
      glow: 'shadow-cyber-emerald'
    }
  };

  const config = configs[norm] || configs.safe;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
    lg: 'px-4 py-1.5 text-sm gap-2.5 font-semibold'
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${config.glow} ${sizeClasses[size] || sizeClasses.md} font-mono uppercase tracking-wider`}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      {showLabel && (config.label)}
    </span>
  );
}
