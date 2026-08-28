import React, { useState } from 'react';
import { useForecasting } from '../../context/ForecastingContext';
import { ShieldAlert, ShieldCheck, X, Zap, Server, Lock, Cpu } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function MitigationModal() {
  const { isMitigateModalOpen, setIsMitigateModalOpen, currentScenario, applyMitigation } = useForecasting();
  const [selectedAction, setSelectedAction] = useState('bgp-flowspec');
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isMitigateModalOpen) return null;

  const actions = [
    {
      id: 'bgp-flowspec',
      name: 'Deploy BGP Flowspec Filter',
      desc: 'Diverts and blackholes malicious ingress subnet flows at Tier-1 boundary routers.',
      icon: Zap,
      recommended: currentScenario.id === 'ddos-syn-flood'
    },
    {
      id: 'waf-ratelimit',
      name: 'Dynamic WAF & Syn-Cookie Hardening',
      desc: 'Enables kernel-level TCP SYN cookies and throttles per-IP handshake rate to 500 req/s.',
      icon: ShieldAlert,
      recommended: currentScenario.id === 'slowloris-attack'
    },
    {
      id: 'quarantine-host',
      name: 'EDR Endpoint Isolation & Quarantine',
      desc: 'Instantly revokes Kerberos tickets and quarantines compromised internal host interfaces.',
      icon: Lock,
      recommended: currentScenario.id === 'ransomware-c2' || currentScenario.id === 'apt-recon-scan'
    },
    {
      id: 'subnet-acl',
      name: 'Microsegmentation ACL Enforcement',
      desc: 'Shuts down cross-zone lateral communication between DMZ and database tiers.',
      icon: Server,
      recommended: currentScenario.id === 'apt-recon-scan'
    }
  ];

  const handleExecute = () => {
    setIsExecuting(true);
    const chosen = actions.find(a => a.id === selectedAction);
    setTimeout(() => {
      applyMitigation(chosen.name, currentScenario.targetAssets[0] || '10.0.1.1');
      setIsExecuting(false);
      setIsMitigateModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Automated Incident Mitigation Engine
              </h3>
              <p className="text-xs text-slate-400">
                Active Threat: <span className="text-rose-300 font-semibold">{currentScenario.predictedAttack}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMitigateModalOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Attack Target & Horizon Info */}
        <div className="my-4 grid grid-cols-3 gap-3 rounded-xl bg-slate-950/70 p-3 border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">Threat Severity:</span>
            <RiskBadge severity={currentScenario.severity} size="sm" />
          </div>
          <div>
            <span className="text-slate-500 block">Forecast Horizon:</span>
            <span className="text-cyan-400 font-semibold">{currentScenario.horizon}</span>
          </div>
          <div>
            <span className="text-slate-500 block">AI Confidence:</span>
            <span className="text-white font-semibold">{currentScenario.confidence}%</span>
          </div>
        </div>

        {/* Action Selection List */}
        <div className="space-y-2.5 my-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Select Mitigation Strategy:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {actions.map((act) => {
              const Icon = act.icon;
              const isSelected = selectedAction === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedAction(act.id)}
                  className={`flex items-start gap-3.5 rounded-xl p-3.5 border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-cyber-cyan/30'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {act.name}
                      </span>
                      {act.recommended && (
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400 uppercase">
                          AI Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      {act.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-xs text-slate-500 font-mono">
            Simulated rollback enabled • Audit log recorded
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMitigateModalOpen(false)}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-cyber-cyan disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
                  Deploying Rule...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Deploy Mitigation Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
