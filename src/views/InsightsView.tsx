import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Brain
} from 'lucide-react';
import { AnalysisSummary } from '../types';

interface InsightsViewProps {
  summary: AnalysisSummary;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ summary }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Investigation Intelligence Briefing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal intelligence summary generated for Superintendent of Police & Field Operations Team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Dossier</span>
          </button>
        </div>
      </div>

      {/* Printable Briefing Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
        
        {/* Document Header Watermark */}
        <div className="border-b-2 border-sky-500/40 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold block">
              CONFIDENTIAL • LAW ENFORCEMENT SENSITIVE
            </span>
            <h2 className="text-lg font-extrabold text-white mt-0.5">
              INTELLIGENCE BRIEFING: OPERATION TRISHUL / HAWALA CORRIDOR
            </h2>
            <span className="text-xs text-slate-400 block mt-0.5">Case Reference: {summary.caseId}</span>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-400">
            <span className="block font-bold text-slate-200">Date: 15-SEP-2026</span>
            <span className="block">State CID Headquarters</span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
            1. Executive Intelligence Summary
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
            Multi-stage Graph AI analysis of FIR-1024 and associated CDR dumps revealed an organized cyber-financial syndicate operating across Patna, Gaya, and Muzaffarpur. Central communication bridge identifier <span className="text-emerald-400 font-mono font-bold">+91-90000-10001</span> links high-centrality person of interest <span className="text-sky-400 font-bold">Rajesh Kumar</span> to inter-district logistics operations.
          </p>
        </div>

        {/* 2. Key Findings */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
            2. Core Analytical Findings
          </h3>
          <div className="space-y-2 text-xs">
            {summary.keyInsights.map((insight, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Recommended Investigation Paths */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
            3. Recommended Field Investigation Paths
          </h3>
          <div className="space-y-2 text-xs">
            {summary.recommendedSteps.map((step, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-purple-200 flex items-start gap-2.5">
                <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 italic flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Notice: AI-generated intelligence summaries serve as investigative guidance and require verification by authorized law enforcement personnel prior to judicial submission.
          </span>
        </div>

      </div>

    </div>
  );
};
