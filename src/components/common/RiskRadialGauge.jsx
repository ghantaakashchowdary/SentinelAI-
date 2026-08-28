import React from 'react';

export default function RiskRadialGauge({ score = 75, severity = 'Critical', size = 160 }) {
  // Score 0 to 100
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 60;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Use 240-degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  const getColor = (sev) => {
    switch ((sev || '').toLowerCase()) {
      case 'critical':
        return { stroke: '#ef4444', text: 'text-rose-400', glow: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))' };
      case 'elevated':
        return { stroke: '#f97316', text: 'text-orange-400', glow: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.6))' };
      case 'warning':
        return { stroke: '#f59e0b', text: 'text-amber-400', glow: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.6))' };
      default:
        return { stroke: '#10b981', text: 'text-emerald-400', glow: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))' };
    }
  };

  const { stroke, text, glow } = getColor(severity);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        viewBox="0 0 140 140"
        className="transform -rotate-[135deg]"
      >
        {/* Background track */}
        <circle
          stroke="#1e293b"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="70"
          cy="70"
        />
        {/* Active score arc */}
        <circle
          stroke={stroke}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          style={{ strokeDashoffset, filter: glow, transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="70"
          cy="70"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
        <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
          {clampedScore}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
          / 100 Risk
        </span>
        <span className={`mt-0.5 text-xs font-mono font-semibold uppercase tracking-wider ${text}`}>
          {severity}
        </span>
      </div>
    </div>
  );
}
