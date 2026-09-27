import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { EvidenceItem } from '../types';
import { BlockchainVerifier } from '../components/evidence/BlockchainVerifier';

interface EvidenceViewProps {
  evidence: EvidenceItem[];
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ evidence }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Evidence Integrity & Blockchain Ledger Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            SHA-256 cryptographic hash verification ensuring court-admissible chain of custody integrity.
          </p>
        </div>
      </div>

      <BlockchainVerifier evidence={evidence} />

    </div>
  );
};
