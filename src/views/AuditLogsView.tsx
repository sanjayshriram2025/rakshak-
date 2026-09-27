import React, { useState } from 'react';
import { History, Shield, Filter, Search, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredLogs = logs.filter(log => 
    !filterQuery ||
    log.officerName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
    log.target.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-sky-400" />
            Audit & System Activity Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system operation logs compliant with Section 79B of IT Act & Govt Security Standards.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter by officer, action, or FIR..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[10.5px] uppercase">
              <th className="py-3 px-4">Timestamp (IST)</th>
              <th className="py-3 px-4">Officer / Badge ID</th>
              <th className="py-3 px-4">Action Executed</th>
              <th className="py-3 px-4">Target Entity / Case</th>
              <th className="py-3 px-4">IP / Session</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/60 font-mono">
                <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                <td className="py-3 px-4 font-sans font-semibold text-slate-100">
                  {log.officerName}
                  <span className="block text-[10px] font-mono text-slate-400">{log.officerBadge}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 font-sans">{log.target}</td>
                <td className="py-3 px-4 text-slate-400 text-[11px]">{log.ipAddress}</td>
                <td className="py-3 px-4 text-right font-sans">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
