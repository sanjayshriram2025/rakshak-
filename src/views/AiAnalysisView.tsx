import React from 'react';
import { 
  Cpu, 
  Share2, 
  FileText, 
  Sparkles, 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  Layers,
  Activity
} from 'lucide-react';
import { AnalysisSummary } from '../types';

interface AiAnalysisViewProps {
  summary: AnalysisSummary;
  onNavigateToNetwork: () => void;
  onNavigateToEvidence: () => void;
  onNavigateToXai: () => void;
}

export const AiAnalysisView: React.FC<AiAnalysisViewProps> = ({
  summary,
  onNavigateToNetwork,
  onNavigateToEvidence,
  onNavigateToXai
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400" />
            AI Investigation Analysis Result
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Case ID: <span className="font-mono text-sky-400 font-bold">{summary.caseId}</span> • Source: {summary.fileUploaded}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToNetwork}
            className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>View Network Graph</span>
          </button>
          <button
            onClick={onNavigateToEvidence}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Evidence</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono block">Extracted Entities</span>
          <span className="text-xl font-extrabold text-sky-400 font-mono">{summary.extractedEntitiesCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono block">Relationships Found</span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">{summary.extractedRelationshipsCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono block">Communities Detected</span>
          <span className="text-xl font-extrabold text-purple-400 font-mono">{summary.communitiesDetected} Clusters</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono block">Overall Anomaly Score</span>
          <span className="text-xl font-extrabold text-amber-400 font-mono">{summary.overallAnomalyScore} / 100</span>
        </div>
      </div>

      {/* AI Intelligence Brief Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          AI Executive Briefing Summary
        </h3>
        <div className="space-y-2 text-xs">
          {summary.keyInsights.map((insight, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Triplets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          Extracted Semantic Triplets (Subject → Predicate → Object)
        </h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10.5px] uppercase">
                <th className="py-2 px-3">Subject Entity</th>
                <th className="py-2 px-3">Relationship Predicate</th>
                <th className="py-2 px-3">Object Entity</th>
                <th className="py-2 px-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
              {summary.extractedTriplets.map((trip, idx) => (
                <tr key={idx} className="hover:bg-slate-800/60">
                  <td className="py-2.5 px-3 font-bold text-sky-400">{trip.subject}</td>
                  <td className="py-2.5 px-3 text-purple-300 font-semibold">{trip.predicate}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{trip.object}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{(trip.confidence * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
