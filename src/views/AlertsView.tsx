import React, { useState } from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  Share2, 
  FileText, 
  Brain, 
  CheckCircle2, 
  Eye, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { AlertItem } from '../types';
import { ExplanationTree } from '../components/xai/ExplanationTree';

interface AlertsViewProps {
  alerts: AlertItem[];
  onNavigateToNetwork: () => void;
  onNavigateToEvidence: () => void;
  onUpdateStatus: (alertId: string, status: AlertItem['status']) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onNavigateToNetwork,
  onNavigateToEvidence,
  onUpdateStatus
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => 
    filterSeverity === 'ALL' || a.severity === filterSeverity
  );

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BellRing className="w-6 h-6 text-amber-400" />
            Suspicious Activity & Network Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated anomaly detection scans across inter-district crime records and CDR dumps.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                filterSeverity === sev
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column View: Alerts Feed on Left, XAI Explanation Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Alerts List (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredAlerts.map((alt) => {
            const isSelected = selectedAlertId === alt.id;
            return (
              <div
                key={alt.id}
                onClick={() => setSelectedAlertId(alt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all shadow-lg text-xs space-y-2.5 ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 shadow-glow-alert'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-xs">{alt.patternName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    alt.severity === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : alt.severity === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}>
                    {alt.severity} SEVERITY
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-xs leading-snug">{alt.title}</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">{alt.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10.5px] text-slate-400">
                  <span>Detected: {alt.detectedTime}</span>
                  <span className="text-purple-400 font-mono font-semibold">XAI Confidence: {alt.xaiConfidence}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Explainable AI Panel (3 Cols) */}
        <div className="lg:col-span-3">
          {selectedAlert && (
            <ExplanationTree
              alert={selectedAlert}
              onViewNetwork={onNavigateToNetwork}
              onViewEvidence={onNavigateToEvidence}
            />
          )}
        </div>

      </div>

    </div>
  );
};
