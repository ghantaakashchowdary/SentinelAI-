import React from 'react';
import { useForecasting } from '../../context/ForecastingContext';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  Brain,
  History,
  UploadCloud,
  ShieldAlert,
  Cpu,
  Terminal,
  Radio,
  ExternalLink
} from 'lucide-react';
import RiskBadge from '../common/RiskBadge';

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { activeTab, setActiveTab, currentScenario } = useForecasting();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sublabel: 'Executive Overview',
      icon: LayoutDashboard,
      badge: currentScenario.severity !== 'Safe' ? 'Active' : null,
      badgeColor: currentScenario.severity
    },
    {
      id: 'traffic',
      label: 'Traffic Analysis',
      sublabel: 'Packet Telemetry & Flows',
      icon: Activity,
      badge: 'Live',
      badgeColor: 'safe'
    },
    {
      id: 'forecast',
      label: 'Attack Forecast',
      sublabel: 'T0 → T+60m Trajectory',
      icon: TrendingUp,
      badge: currentScenario.horizon,
      badgeColor: currentScenario.severity
    },
    {
      id: 'explainability',
      label: 'Explainability (XAI)',
      sublabel: 'SHAP Feature Attribution',
      icon: Brain,
      badge: '98.6%',
      badgeColor: 'safe'
    },
    {
      id: 'history',
      label: 'Prediction History',
      sublabel: 'Audit Logs & Accuracy',
      icon: History,
      badge: '6 Logs',
      badgeColor: 'info'
    },
    {
      id: 'upload',
      label: 'Demo Upload',
      sublabel: 'Datasets & Scenarios',
      icon: UploadCloud,
      badge: '5 Demos',
      badgeColor: 'safe'
    }
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-20 flex flex-col justify-between border-r border-slate-800 bg-[#080d1a]/95 backdrop-blur-md transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          {!isCollapsed && 'Navigation & Analytics'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-white border border-cyan-500/40 shadow-cyber-cyan/20'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              {/* Active neon strip indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-cyan-400"></span>
              )}

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 group-hover:text-cyan-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <div className="flex flex-col truncate">
                    <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate">
                      {item.sublabel}
                    </span>
                  </div>

                  {item.badge && (
                    <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-mono font-medium text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Model Engine & System Health Footer */}
      <div className="border-t border-slate-800 p-3 bg-slate-950/60 font-mono text-xs">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>Bi-LSTM + GNN</span>
              </span>
              <span className="text-emerald-400 font-semibold">11.4ms</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Threat Horizon:</span>
              <span className="text-rose-400 font-semibold">{currentScenario.horizon}</span>
            </div>

            <div className="rounded-lg bg-slate-900 p-2 border border-slate-800 text-[10px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Buffer Health:</span>
                <span className="text-emerald-400 font-bold">99.4%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[99.4%]"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        )}
      </div>
    </aside>
  );
}
