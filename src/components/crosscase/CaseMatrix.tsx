import React from 'react';
import { GitCompare, Share2, ArrowRight, User, Phone, Car, MapPin, Building } from 'lucide-react';
import { CrossCaseLink, CaseFile } from '../../types';

interface CaseMatrixProps {
  cases: CaseFile[];
  links: CrossCaseLink[];
  onOpenNetworkForCases: (caseA: string, caseB: string) => void;
}

export const CaseMatrix: React.FC<CaseMatrixProps> = ({
  cases,
  links,
  onOpenNetworkForCases
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-sky-400" />
            Cross-Case Intelligence Link Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated entity co-occurrence detection across distinct Police Station FIR filings.
          </p>
        </div>
      </div>

      {/* Visual Relationship Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {links.map((link) => (
          <div
            key={link.id}
            onClick={() => onOpenNetworkForCases(link.caseA, link.caseB)}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all shadow-lg space-y-3 group"
          >
            <div className="flex items-center justify-between font-mono font-bold text-xs border-b border-slate-800 pb-2">
              <span className="text-sky-400">{link.caseA}</span>
              <span className="text-purple-400">↔</span>
              <span className="text-sky-400">{link.caseB}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Link Strength Score</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                {link.strengthScore}%
              </span>
            </div>

            {/* Shared breakdown */}
            <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
              <div className="p-1 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Persons</span>
                <span className="font-bold text-sky-400">{link.sharedPersons}</span>
              </div>
              <div className="p-1 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Phones</span>
                <span className="font-bold text-emerald-400">{link.sharedPhones}</span>
              </div>
              <div className="p-1 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Vehicles</span>
                <span className="font-bold text-amber-400">{link.sharedVehicles}</span>
              </div>
              <div className="p-1 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Firms</span>
                <span className="font-bold text-purple-400">{link.sharedOrganizations}</span>
              </div>
            </div>

            {/* Key shared entity names */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Bridging Entities:</span>
              {link.entities.map(e => (
                <span key={e.id} className="inline-block px-1.5 py-0.5 mr-1 mb-1 rounded bg-slate-950 border border-slate-800 text-slate-200">
                  {e.name}
                </span>
              ))}
            </div>

            <div className="pt-1 flex justify-end text-sky-400 group-hover:underline text-[11px] font-semibold items-center gap-1">
              <span>View Inter-Case Sub-Graph</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
