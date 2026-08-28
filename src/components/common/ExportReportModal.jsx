import React, { useState } from 'react';
import { useForecasting } from '../../context/ForecastingContext';
import { FileText, Download, X, CheckCircle, Shield, FileSpreadsheet, Code } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function ExportReportModal() {
  const { isExportModalOpen, setIsExportModalOpen, currentScenario, addNotification } = useForecasting();
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!isExportModalOpen) return null;

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
      addNotification(
        'Executive Report Downloaded 📄',
        `Generated SIH Incident Audit Brief for [${currentScenario.title}] (${reportFormat.toUpperCase()}).`,
        'safe'
      );
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Generate Executive CISO Audit Report
              </h3>
              <p className="text-xs text-slate-400">
                AI Forecasting Telemetry & Threat Breakdown
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report Preview Document Card */}
        <div className="my-4 rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                SIH-2026-THREAT-BRIEF.PDF
              </span>
            </div>
            <RiskBadge severity={currentScenario.severity} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Forecast Vector:</span>
              <span className="text-slate-200 font-semibold">{currentScenario.shortName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Lead Time Horizon:</span>
              <span className="text-cyan-400 font-semibold">{currentScenario.horizon}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Certainty / CI:</span>
              <span className="text-slate-200">{currentScenario.confidence}% (95% CI)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Target Ingress:</span>
              <span className="text-slate-200">{currentScenario.targetAssets[0]}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 leading-relaxed">
            <strong className="text-slate-300">Executive Summary: </strong>
            {currentScenario.summary}
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-2 my-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Export Format:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pdf', label: 'Executive PDF', icon: FileText, desc: 'Formatted CISO Brief' },
              { id: 'csv', label: 'Raw CSV Flows', icon: FileSpreadsheet, desc: '78-Feature NetFlow' },
              { id: 'json', label: 'JSON Telemetry', icon: Code, desc: 'API Schema Payload' }
            ].map(fmt => {
              const Icon = fmt.icon;
              const isSelected = reportFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setReportFormat(fmt.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 text-white shadow-cyber-cyan/30'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold font-mono">{fmt.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{fmt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-cyber-cyan disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
                Generating {reportFormat.toUpperCase()}...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Report ({reportFormat.toUpperCase()})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
