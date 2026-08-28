import React, { useState } from 'react';
import { useForecasting } from '../context/ForecastingContext';
import {
  PREDICTION_HISTORY_RECORDS,
  ACCURACY_TREND_DATA
} from '../data/historyData';
import {
  History,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';
import RiskBadge from '../components/common/RiskBadge';
import MetricCard from '../components/common/MetricCard';

export default function PredictionHistoryPage() {
  const { setIsExportModalOpen } = useForecasting();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const filteredRecords = PREDICTION_HISTORY_RECORDS.filter((rec) => {
    const matchesSearch =
      rec.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.predictedAttack.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.analyst.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || rec.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || rec.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesSev && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              PREDICTION AUDIT LOGS & ACCURACY HISTORY
            </h1>
            <span className="rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono">
              30-DAY LOGS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Historical Incident Forecast Tracking, Verification Outcomes, and MTTF Performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider shadow-cyber-cyan transition-all"
          >
            <Download className="h-4 w-4" />
            Export Full Audit Log (PDF/CSV)
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="30-Day Forecast Accuracy"
          value="98.7%"
          subvalue="Precision: 98.6%"
          change="+0.7%"
          isIncreaseBad={false}
          icon={CheckCircle}
          variant="safe"
        />
        <MetricCard
          title="Mean Lead Time (MTTF)"
          value="14.8 min"
          subvalue="Prior to Incident Peak"
          change="+1.2m"
          isIncreaseBad={false}
          icon={Clock}
          variant="safe"
        />
        <MetricCard
          title="Total Forecasts Triggered"
          value="48 Incidents"
          subvalue="46 True Positives"
          change="95.8% True Rate"
          isIncreaseBad={false}
          icon={History}
        />
        <MetricCard
          title="Mitigation Success Rate"
          value="100%"
          subvalue="0 Uncontained Breaches"
          change="0 Breaches"
          isIncreaseBad={false}
          icon={ShieldCheck}
          variant="safe"
        />
      </div>

      {/* 30-Day Accuracy Trend Chart */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              HISTORICAL MODEL ACCURACY & LEAD TIME TRENDS (30 DAYS)
            </h3>
            <p className="text-xs text-slate-400">
              Evolution of Bi-LSTM forecast accuracy and mean lead-time before attack peak.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Accuracy %
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Precision %
            </span>
          </div>
        </div>

        {/* Dynamic Accuracy Trend Grid */}
        <div className="space-y-2 pt-2 font-mono text-xs">
          <div className="grid grid-cols-7 gap-2 h-40 items-end bg-slate-950 p-4 rounded-xl border border-slate-800">
            {ACCURACY_TREND_DATA.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 p-2 rounded-lg text-[10px] z-20 shadow-xl whitespace-nowrap">
                  <span className="font-bold text-white">{item.day}</span>
                  <span className="text-cyan-400">Accuracy: {item.accuracy}%</span>
                  <span className="text-emerald-400">Precision: {item.precision}%</span>
                  <span className="text-amber-400">Lead Time: {item.leadTimeMin}m</span>
                </div>

                <div className="w-full max-w-[32px] flex items-end justify-center gap-1 h-full">
                  <div
                    className="w-3 rounded-t bg-cyan-500 transition-all duration-500"
                    style={{ height: `${(item.accuracy - 90) * 10}%` }}
                  ></div>
                  <div
                    className="w-3 rounded-t bg-emerald-500 transition-all duration-500"
                    style={{ height: `${(item.precision - 90) * 10}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-400 mt-2 truncate w-full text-center">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Day 1 (Initial Weights)</span>
            <span className="text-emerald-400 font-semibold">Continuous Self-Supervised Fine-Tuning Active</span>
            <span>Day 30 (Current SOTA)</span>
          </div>
        </div>
      </div>

      {/* Historical Forecast Audit Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <History className="h-4 w-4 text-cyan-400" />
              HISTORICAL PREDICTION AUDIT LOG
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Click any record to inspect incident timeline and mitigation post-mortem
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Incident ID, Attack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Elevated">Elevated</option>
              <option value="Warning">Warning</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="True Positive">True Positive</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Forecasted Attack Vector</th>
                <th className="p-3">Horizon</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Outcome Status</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500">
                    No matching historical predictions found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.incidentId}
                    onClick={() => setSelectedIncident(r)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-cyan-400">{r.incidentId}</td>
                    <td className="p-3 text-slate-400">{r.timestamp}</td>
                    <td className="p-3 font-semibold text-white">{r.predictedAttack}</td>
                    <td className="p-3 text-cyan-300">{r.forecastHorizon}</td>
                    <td className="p-3 font-bold text-slate-200">{r.confidence}</td>
                    <td className="p-3 text-amber-400">{r.leadTime}</td>
                    <td className="p-3">
                      <RiskBadge severity={r.severity} size="sm" />
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'True Positive' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(r);
                        }}
                        className="rounded px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Post-Mortem Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  INCIDENT POST-MORTEM: {selectedIncident.incidentId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Forecast Horizon:</span>
                <span className="text-cyan-400 font-bold">{selectedIncident.forecastHorizon}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Certainty / Confidence:</span>
                <span className="text-emerald-400 font-bold">{selectedIncident.confidence}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lead Time Before Peak:</span>
                <span className="text-amber-400 font-bold">{selectedIncident.leadTime}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Assigned Analyst:</span>
                <span className="text-white">{selectedIncident.analyst}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-slate-400 block font-bold">Mitigation Executed:</span>
              <p className="text-emerald-400 font-semibold">{selectedIncident.mitigationAction}</p>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block font-bold">Incident Log Details:</span>
                <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">{selectedIncident.details}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-mono text-slate-200"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
