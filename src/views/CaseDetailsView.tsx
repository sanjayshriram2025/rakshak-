import React from 'react';
import { FolderArchive, FileText, Share2, Users, Shield, ArrowLeft, ExternalLink } from 'lucide-react';
import { CaseFile, Entity } from '../types';

interface CaseDetailsViewProps {
  caseId: string;
  cases: CaseFile[];
  entities: Entity[];
  onBack: () => void;
  onNavigateToNetwork: () => void;
  onSelectEntity: (entityId: string) => void;
}

export const CaseDetailsView: React.FC<CaseDetailsViewProps> = ({
  caseId,
  cases,
  entities,
  onBack,
  onNavigateToNetwork,
  onSelectEntity
}) => {
  const caseItem = cases.find(c => c.id === caseId || c.firNumber.includes(caseId)) || cases[0];
  if (!caseItem) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={onNavigateToNetwork}
          className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Open Case Sub-Graph</span>
        </button>
      </div>

      {/* Main Case Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
              {caseItem.firNumber}
            </span>
            <h1 className="text-xl font-extrabold text-white mt-2">{caseItem.title}</h1>
            <p className="text-xs text-slate-400 mt-1">{caseItem.policeStation} • Registered: {caseItem.date}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
            {caseItem.status}
          </span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
          {caseItem.summary}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">IPC / BNS Sections</span>
            <span className="font-bold text-sky-400 mt-0.5 block">{caseItem.ipcSections.join(', ')}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Assigned Officer</span>
            <span className="font-bold text-slate-200 mt-0.5 block">{caseItem.assignedOfficer}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Extracted Entities</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">{caseItem.entityCount} Entities</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Evidence Exhibits</span>
            <span className="font-bold text-purple-400 mt-0.5 block">{caseItem.evidenceItems.length} Hash Sealed</span>
          </div>
        </div>
      </div>

    </div>
  );
};
