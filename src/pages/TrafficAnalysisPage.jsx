import React, { useState } from 'react';
import { useForecasting } from '../context/ForecastingContext';
import {
  PROTOCOL_DISTRIBUTION,
  TOP_TALKERS,
  SAMPLE_FLOW_RECORDS,
  FLOW_VOLUME_TIMELINE
} from '../data/trafficData';
import {
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  Shield,
  Layers,
  Radio,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import RiskBadge from '../components/common/RiskBadge';
import MetricCard from '../components/common/MetricCard';

export default function TrafficAnalysisPage() {
  const { currentScenario, setActiveTab, liveTick } = useForecasting();
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedFlow, setSelectedFlow] = useState(null);

  // Filtered flow table
  const filteredFlows = SAMPLE_FLOW_RECORDS.filter(flow => {
    const matchesSearch =
      flow.srcIp.includes(searchTerm) ||
      flow.dstIp.includes(searchTerm) ||
      flow.threatTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProto = protocolFilter === 'ALL' || flow.protocol === protocolFilter;
    const matchesSev = severityFilter === 'ALL' || flow.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesProto && matchesSev;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              REAL-TIME NETWORK TRAFFIC TELEMETRY
            </h1>
            <span className="rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono">
              LIVE 10.0.1.0/24
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            CIC-IDS2017 78-Dimensional Flow Extraction & NetFlow v9 Ingestion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3.5 py-1.5 text-xs font-mono font-semibold transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            Upload Custom PCAP / CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Captured Flows"
          value="1,489,204"
          subvalue="Sliding 10m window"
          change="+18.4%"
          isIncreaseBad={false}
          icon={Activity}
        />
        <MetricCard
          title="Ingress Throughput"
          value={currentScenario.metrics.ingressRate}
          subvalue={currentScenario.metrics.packetRate}
          change={currentScenario.id === 'ddos-syn-flood' ? '+320%' : '+2%'}
          isIncreaseBad={true}
          icon={Radio}
          variant={currentScenario.severity.toLowerCase()}
        />
        <MetricCard
          title="Suspicious Flow Count"
          value={currentScenario.severity === 'Safe' ? '4 Flows' : '412 Flows'}
          subvalue="Anomaly Score > 0.70"
          change={currentScenario.severity === 'Safe' ? '-80%' : '+840%'}
          isIncreaseBad={true}
          icon={AlertTriangle}
          variant={currentScenario.severity.toLowerCase()}
        />
        <MetricCard
          title="Protocol Entropy"
          value="0.34 bits"
          subvalue="Normal: 1.82 bits"
          change="-78%"
          isIncreaseBad={true}
          icon={Sparkles}
          badgeText="Skew Alert"
        />
      </div>

      {/* Protocol Distribution & Flow Volume Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Breakdown */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              PROTOCOL DISTRIBUTION
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Total: 22.4 GB</span>
          </div>

          <div className="space-y-3">
            {PROTOCOL_DISTRIBUTION.map((proto) => (
              <div key={proto.name} className="space-y-1 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: proto.color }}></span>
                    {proto.name}
                  </span>
                  <span className="text-slate-400">
                    {proto.percentage}% <span className="text-slate-500">({proto.bytes})</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${proto.percentage}%`, backgroundColor: proto.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Packet Ingress & Anomaly Flow Timeline */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                PACKET INGRESS & ANOMALY SPIKES OVER TIME
              </h3>
              <p className="text-xs text-slate-400">
                Comparing Benign Flow Baseline vs AI Flagged Anomaly Bursts
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Benign pps
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400"></span> Anomaly pps
              </span>
            </div>
          </div>

          {/* Flow Volume Visual Bars */}
          <div className="space-y-2 pt-2 font-mono text-xs">
            <div className="grid grid-cols-9 gap-2 h-44 items-end bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              {FLOW_VOLUME_TIMELINE.map((item, idx) => {
                const totalHeight = Math.min(100, (item.anomalyPps / 400000) * 85 + 15);
                const isSpike = item.anomalyPps > 10000;
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 p-2 rounded-lg text-[10px] z-20 shadow-xl whitespace-nowrap">
                      <span className="font-bold text-white">{item.time}</span>
                      <span className="text-cyan-400">Normal: {item.normalPps.toLocaleString()} pps</span>
                      <span className="text-rose-400">Anomaly: {item.anomalyPps.toLocaleString()} pps</span>
                      <span className="text-amber-400">BW: {item.bandwidthGbps} Gbps</span>
                    </div>

                    <div className="w-full max-w-[28px] flex flex-col justify-end rounded-t overflow-hidden bg-slate-800/50 h-full">
                      {/* Normal portion */}
                      <div
                        className="bg-cyan-500/60 w-full"
                        style={{ height: '15%' }}
                      ></div>
                      {/* Anomaly portion */}
                      <div
                        className={`w-full transition-all duration-300 ${
                          isSpike ? 'bg-gradient-to-t from-rose-600 to-rose-400 animate-pulse' : 'bg-slate-700'
                        }`}
                        style={{ height: `${totalHeight - 15}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 truncate w-full text-center">
                      {item.time.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>T-8 minutes</span>
              <span className="text-rose-400 font-bold">⚡ Critical Surge Detected at 14:58</span>
              <span>Real-Time (Now)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Talkers & IP Geolocation Matrix */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            TOP TALKERS & SOURCE IP THREAT INTELLIGENCE
          </h3>
          <span className="text-xs font-mono text-slate-400">ASNs & Reputational Scans</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOP_TALKERS.map((talker, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border font-mono text-xs space-y-2 transition-all ${
                talker.flagged
                  ? 'bg-slate-950 border-rose-500/40 shadow-cyber-rose/10'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{talker.ip}</span>
                </div>
                <RiskBadge severity={talker.reputation} size="sm" />
              </div>

              <div className="text-[11px] text-slate-400">
                <span>{talker.geo}</span> • <span className="text-slate-300">{talker.asn}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Packets Sent:</span>
                  <span className="text-slate-200 font-semibold">{talker.packets}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Volume:</span>
                  <span className="text-cyan-400 font-semibold">{talker.bytes}</span>
                </div>
              </div>

              <div className="text-[10px] text-amber-400/90 font-medium">
                {talker.threatCategory}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep Traffic Feature Table (CIC-IDS2017 NetFlow Schema) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              DEEP TRAFFIC FLOW FEATURE INSPECTOR (CIC-IDS2017)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Showing {filteredFlows.length} active flow traces with real-time anomaly scores
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search IP, Tag, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Protocols</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Elevated">Elevated</option>
              <option value="Warning">Warning</option>
              <option value="Safe">Safe</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Flow ID</th>
                <th className="p-3">Source Socket</th>
                <th className="p-3">Dest Socket</th>
                <th className="p-3">Proto</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Fwd Pkts</th>
                <th className="p-3">SYN Flags</th>
                <th className="p-3">Bytes/s</th>
                <th className="p-3">Anomaly</th>
                <th className="p-3">Classification Tag</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-slate-500">
                    No matching flows found for current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFlows.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedFlow(f)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-cyan-400">{f.id}</td>
                    <td className="p-3 text-white">
                      {f.srcIp}:{f.srcPort}
                    </td>
                    <td className="p-3 text-slate-300">
                      {f.dstIp}:{f.dstPort}
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                        {f.protocol}
                      </span>
                    </td>
                    <td className="p-3">{f.flowDuration}</td>
                    <td className="p-3">{f.totFwdPkts}</td>
                    <td className="p-3">
                      <span className={f.synFlags > 10 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {f.synFlags}
                      </span>
                    </td>
                    <td className="p-3">{f.bytesSec}</td>
                    <td className="p-3">
                      <span className={`font-bold ${f.anomalyScore > 0.8 ? 'text-rose-400' : f.anomalyScore > 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {(f.anomalyScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <RiskBadge severity={f.severity} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFlow(f);
                        }}
                        className="rounded px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px]"
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

      {/* Selected Flow Drilldown Drawer Modal */}
      {selectedFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  FLOW INSPECTOR: {selectedFlow.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFlow(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Source IP & Port:</span>
                <span className="text-white font-bold">{selectedFlow.srcIp}:{selectedFlow.srcPort}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target IP & Port:</span>
                <span className="text-white font-bold">{selectedFlow.dstIp}:{selectedFlow.dstPort}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Anomaly Probability:</span>
                <span className="text-rose-400 font-bold">{(selectedFlow.anomalyScore * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Classification:</span>
                <span className="text-slate-200 font-semibold">{selectedFlow.threatTag}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Flow Duration:</span>
                <span className="text-white">{selectedFlow.flowDuration}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Forward Packets:</span>
                <span className="text-white">{selectedFlow.totFwdPkts} pkts</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Backward Packets:</span>
                <span className="text-white">{selectedFlow.totBwdPkts} pkts</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SYN / ACK Flags:</span>
                <span className="text-rose-400 font-bold">{selectedFlow.synFlags} SYN / {selectedFlow.ackFlags} ACK</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Byte Transfer Rate:</span>
                <span className="text-cyan-400">{selectedFlow.bytesSec} bytes/sec</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedFlow(null)}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-mono text-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
