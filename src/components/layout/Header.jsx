import React, { useState, useEffect } from 'react';
import { useForecasting } from '../../context/ForecastingContext';
import {
  ShieldAlert,
  Bell,
  Download,
  HelpCircle,
  Activity,
  ChevronDown,
  Layers,
  CheckCircle,
  X,
  Zap,
  Radio
} from 'lucide-react';
import RiskBadge from '../common/RiskBadge';

export default function Header() {
  const {
    scenarios,
    currentScenario,
    changeScenario,
    notifications,
    dismissNotification,
    setIsTourOpen,
    setIsExportModalOpen,
    setIsMitigateModalOpen,
    isSimulating,
    setIsSimulating
  } = useForecasting();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#080d1a]/95 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Project Branding & Live Heartbeat */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldAlert className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wide text-white uppercase font-mono">
                AEGIS-AI <span className="text-cyan-400">SOC</span>
              </span>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
                SIH 2026
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-mono">
              AI-Based Network Attack Forecasting from Network Traffic Data
            </p>
          </div>
        </div>

        {/* Live Stream Pulse */}
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white"
            title="Click to pause/resume live telemetry"
          >
            <Radio className={`h-3.5 w-3.5 ${isSimulating ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{isSimulating ? 'LIVE INGESTION' : 'STREAM PAUSED'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">48.2k flows/s</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Active Scenario Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className="flex items-center gap-2 rounded-xl bg-slate-900/90 px-3 py-1.5 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono text-slate-200 transition-all shadow-sm"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-slate-400">Scenario:</span>
            <span className="font-semibold text-white max-w-[130px] truncate">
              {currentScenario.shortName}
            </span>
            <RiskBadge severity={currentScenario.severity} size="sm" showLabel={false} />
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 flex justify-between items-center">
                <span>Select SIH Evaluation Scenario</span>
                <span className="text-cyan-400">5 Scenarios</span>
              </div>
              <div className="mt-1 space-y-1">
                {scenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      changeScenario(sc.id);
                      setShowScenarioMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-all ${
                      currentScenario.id === sc.id
                        ? 'bg-cyan-500/20 text-white border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-white font-mono text-xs">{sc.shortName}</span>
                      <span className="text-[10px] text-slate-400">{sc.horizon} • {sc.confidence}% cert</span>
                    </div>
                    <RiskBadge severity={sc.severity} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 10-Second Judge Tour Button */}
        <button
          onClick={() => setIsTourOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 px-3 py-1.5 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-all shadow-cyber-cyan/20"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Judge Tour</span>
        </button>

        {/* Quick Mitigation Trigger Button */}
        {currentScenario.severity !== 'Safe' && (
          <button
            onClick={() => setIsMitigateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold transition-all animate-pulse"
            title="Deploy Automated Mitigation"
          >
            <Zap className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden md:inline">Mitigate</span>
          </button>
        )}

        {/* Export Executive Brief Button */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3 py-1.5 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
          title="Export CISO Report"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Report</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                <span className="font-bold text-white">Live Threat Alerts</span>
                <span className="text-slate-400 text-[10px]">{unreadCount} active</span>
              </div>
              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No active alerts</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="relative rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-200">{n.title}</span>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          className="text-slate-500 hover:text-white ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-cyan-400 font-mono mt-1.5 block">{n.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex flex-col text-right font-mono text-xs border-l border-slate-800 pl-3">
          <span className="font-bold text-slate-200">
            {currentTime.toLocaleTimeString()}
          </span>
          <span className="text-[10px] text-slate-500">
            {currentTime.toISOString().slice(0, 10)} UTC+5:30
          </span>
        </div>
      </div>
    </header>
  );
}
