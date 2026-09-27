import React from 'react';
import { Play, ChevronRight, CheckCircle, Shield, RotateCcw } from 'lucide-react';

interface DemoWalkthroughBannerProps {
  currentStepIndex: number;
  onSelectStep: (stepId: string) => void;
  onReset: () => void;
}

export const DEMO_STEPS = [
  { id: 'dashboard', label: '1. Dashboard', view: 'DASHBOARD', desc: 'Delhi Police Intelligence Overview' },
  { id: 'upload', label: '2. Ingest CCTNS FIR', view: 'UPLOAD', desc: 'FIR & CDR Data Parsing' },
  { id: 'ai-analysis', label: '3. Link Triplets', view: 'AI_ANALYSIS', desc: 'Extracted Entity Triplet Analysis' },
  { id: 'network-explorer', label: '4. Link Graph', view: 'NETWORK_EXPLORER', desc: 'Interactive Topology & Centrality' },
  { id: 'entities', label: '5. Key Suspect', view: 'ENTITIES', desc: 'Dossier Profile & Risk Factors' },
  { id: 'cross-case', label: '6. Inter-State Link', view: 'CROSS_CASE', desc: 'Delhi NCR FIR Matrix' },
  { id: 'alerts', label: '7. Anomaly Alert', view: 'ALERTS', desc: 'Pattern & Co-location Trigger' },
  { id: 'evidence', label: '8. Evidence Vault', view: 'EVIDENCE', desc: 'SHA-256 Ledger Audit' },
  { id: 'insights', label: '9. Case Dossier', view: 'INSIGHTS', desc: 'Official Crime Branch Briefing' }
];

export const DemoWalkthroughBanner: React.FC<DemoWalkthroughBannerProps> = ({
  currentStepIndex,
  onSelectStep,
  onReset
}) => {
  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0];
  const isEnd = currentStepIndex >= DEMO_STEPS.length - 1;

  const handleNext = () => {
    if (!isEnd) {
      onSelectStep(DEMO_STEPS[currentStepIndex + 1].view);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onSelectStep(DEMO_STEPS[currentStepIndex - 1].view);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 border-b border-red-500/30 px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Delhi Police Crime Branch Flow</span>
          </div>
        </div>

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
          {DEMO_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step.view)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all whitespace-nowrap text-xs font-medium border ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-blue-700 text-white border-amber-400 shadow'
                    : isCompleted
                    ? 'bg-slate-800 text-amber-300 border-amber-900/60 hover:border-amber-500/50'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title={step.desc}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3 h-3 text-amber-400" />
                ) : (
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                )}
                <span>{step.label.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700 flex items-center gap-1 font-medium transition-colors"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={isEnd}
            className="px-3 py-1 rounded bg-gradient-to-r from-red-600 to-blue-700 hover:from-red-500 hover:to-blue-600 text-white font-semibold flex items-center gap-1 shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{isEnd ? 'Flow Complete' : 'Next Step'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
