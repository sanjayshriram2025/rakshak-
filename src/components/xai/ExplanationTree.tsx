import React from 'react';
import { 
  FileText, 
  Share2, 
  ShieldAlert, 
  ArrowDown, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Brain,
  Layers
} from 'lucide-react';
import { AlertItem } from '../../types';

interface ExplanationTreeProps {
  alert: AlertItem;
  onViewNetwork?: () => void;
  onViewEvidence?: () => void;
}

export const ExplanationTree: React.FC<ExplanationTreeProps> = ({
  alert,
  onViewNetwork,
  onViewEvidence
}) => {
  const steps = [
    {
      stage: '1. Source Evidence',
      icon: FileText,
      color: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
      title: `Input Crime Records (${alert.evidenceReferences.join(', ')})`,
      detail: 'Extracted directly from signed FIR text logs, CDR dumps, and ANPR highway camera feeds.'
    },
    {
      stage: '2. Detected Relationship',
      icon: Share2,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      title: `${alert.entitiesInvolved[0]?.name || 'Person A'} ↔ ${alert.entitiesInvolved[2]?.name || 'Phone X'} ↔ ${alert.entitiesInvolved[1]?.name || 'Person B'}`,
      detail: 'Graph triplet matching identified shared communication identifier across distinct police station jurisdictions.'
    },
    {
      stage: '3. Pattern Recognition',
      icon: Layers,
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
      title: alert.patternName,
      detail: 'High Betweenness Centrality node bridging two isolated regional clusters during night-shift window.'
    },
    {
      stage: '4. Risk Indicator',
      icon: ShieldAlert,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
      title: alert.reason,
      detail: 'Anomaly score exceeds 85.0 threshold based on multi-FIR co-occurrence.'
    },
    {
      stage: '5. Generated Alert',
      icon: Sparkles,
      color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
      title: alert.title,
      detail: `Final severity classification: ${alert.severity} • Confidence Rating: ${alert.xaiConfidence}%`
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Why Was This Alert Generated? (Explainable AI Chain)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Alert ID: <span className="font-mono text-sky-400">{alert.id}</span></p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
            Confidence: {alert.xaiConfidence}%
          </div>
        </div>
      </div>

      {/* Chain Visualizer */}
      <div className="space-y-2 relative">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <React.Fragment key={idx}>
              <div className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${st.color}`}>
                <div className="p-2 rounded-md bg-slate-950 border border-slate-800 flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">{st.stage}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-100 mt-0.5">{st.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{st.detail}</p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="flex justify-center my-0.5">
                  <ArrowDown className="w-4 h-4 text-slate-600 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Action Links */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {onViewNetwork && (
            <button
              onClick={onViewNetwork}
              className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              View Network Sub-Graph
            </button>
          )}

          {onViewEvidence && (
            <button
              onClick={onViewEvidence}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              View Supporting Evidence
            </button>
          )}
        </div>
      </div>

      {/* Legal & Policy Disclaimer */}
      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300/90 leading-tight flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Investigator Mandatory Disclaimer:</span>
          AI-generated intelligence is an investigative aid and requires verification by authorized personnel under law enforcement operating standards.
        </div>
      </div>

    </div>
  );
};
