import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  Loader2, 
  FileText, 
  FileSpreadsheet, 
  Cpu, 
  Share2, 
  BrainCircuit, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { AnalysisSummary } from '../../types';

interface ProcessingPipelineProps {
  fileName: string;
  isProcessing: boolean;
  currentStep: number; // 0 to 7
  onComplete: (summary: AnalysisSummary) => void;
}

export const STAGES = [
  { step: 1, title: 'Data Received', desc: 'Ingesting file format & security check' },
  { step: 2, title: 'Text Extraction (OCR)', desc: 'Parsing raw un-structured crime report' },
  { step: 3, title: 'Entity Extraction (NER)', desc: 'Extracting Persons, Phones, Vehicles, Locations' },
  { step: 4, title: 'Relationship Extraction', desc: 'Mapping semantic triplets & interactions' },
  { step: 5, title: 'Knowledge Graph Sync', desc: 'Anchoring nodes into Neo4j graph database' },
  { step: 6, title: 'Network Analysis', desc: 'Computing Betweenness & Degree Centrality' },
  { step: 7, title: 'Anomaly Detection', desc: 'Scanning for cross-case communication bursts' },
  { step: 8, title: 'Analysis Complete', desc: 'Generated XAI Dossier & Intelligence Brief' },
];

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  fileName,
  isProcessing,
  currentStep,
  onComplete
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            AI Extraction Pipeline Progress
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">File: <span className="text-sky-400 font-mono">{fileName}</span></p>
        </div>
        <div className="flex items-center gap-2">
          {currentStep < 8 ? (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing Stage {currentStep}/8
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Extraction Complete
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 transition-all duration-500"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
          <span>0%</span>
          <span>{Math.round((currentStep / 8) * 100)}% Completed</span>
          <span>100%</span>
        </div>
      </div>

      {/* Step by Step Vertical Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {STAGES.map((s) => {
          const isDone = currentStep >= s.step;
          const isCurrent = currentStep === s.step - 1 && isProcessing;

          return (
            <div
              key={s.step}
              className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                isDone
                  ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                  : isCurrent
                  ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 shadow-glow-ai'
                  : 'bg-slate-950/30 border-slate-900 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isCurrent
                    ? 'bg-purple-500 text-slate-950 font-extrabold'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : s.step}
                </div>
                <div>
                  <span className="font-semibold block text-xs">{s.title}</span>
                  <span className="text-[10px] text-slate-400 block">{s.desc}</span>
                </div>
              </div>

              {isCurrent && <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />}
            </div>
          );
        })}
      </div>

    </div>
  );
};
