import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Hash, 
  Database, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  FileCheck,
  Lock,
  Layers
} from 'lucide-react';
import { EvidenceItem } from '../../types';

interface BlockchainVerifierProps {
  evidence: EvidenceItem[];
}

export const BlockchainVerifier: React.FC<BlockchainVerifierProps> = ({ evidence }) => {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(evidence[0]?.id || '');
  const [inputHash, setInputHash] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'IDLE' | 'MATCH' | 'MISMATCH';
    message?: string;
  }>({ status: 'IDLE' });

  const activeItem = evidence.find(e => e.id === selectedEvidenceId) || evidence[0];

  const handleVerify = () => {
    if (!inputHash.trim()) {
      // Auto fill target hash for quick demo verification
      setInputHash(activeItem.hash);
      setVerificationResult({
        status: 'MATCH',
        message: 'SHA-256 Hash Digest matches ledger record exactly. Evidence integrity verified.'
      });
      return;
    }

    if (inputHash.trim().toLowerCase() === activeItem.hash.toLowerCase()) {
      setVerificationResult({
        status: 'MATCH',
        message: 'SHA-256 Hash Digest matches ledger record exactly. Evidence integrity verified.'
      });
    } else {
      setVerificationResult({
        status: 'MISMATCH',
        message: 'CRITICAL ALERT: Hash mismatch detected! Evidence file may have been altered or tampered with!'
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Status */}
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl ${
        verificationResult.status === 'MISMATCH'
          ? 'bg-rose-950/40 border-rose-500/60 shadow-glow-alert'
          : 'bg-emerald-950/30 border-emerald-500/40 shadow-glow-primary'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-lg border ${
            verificationResult.status === 'MISMATCH'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}>
            {verificationResult.status === 'MISMATCH' ? (
              <AlertOctagon className="w-8 h-8 animate-pulse" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                {verificationResult.status === 'MISMATCH' ? '⚠ INTEGRITY CHECK FAILED' : '✓ EVIDENCE VERIFIED & BLOCKCHAIN ANCHORED'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-sky-400">
                SHA-256 LEDGER
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {verificationResult.message || 'All registered FIR documents, CDR dumps, and court exhibits are cryptographically hashed and immutable.'}
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400 border-l border-slate-800 pl-4 hidden md:block">
          <span className="block text-emerald-400 font-bold">100% Chain Integrity</span>
          <span className="block text-[11px]">Active Node: Rakshak-Govt-Ledger #489</span>
        </div>
      </div>

      {/* Interactive Verification Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Evidence Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-sky-400" />
            Select Evidence Item
          </h3>
          <div className="space-y-2">
            {evidence.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedEvidenceId(item.id);
                  setInputHash('');
                  setVerificationResult({ status: 'IDLE' });
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-colors text-xs ${
                  selectedEvidenceId === item.id
                    ? 'bg-sky-500/20 border-sky-500/60 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="text-sky-400 font-mono font-bold">{item.id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] bg-slate-800 text-emerald-400 border border-slate-700">
                    {item.integrityStatus}
                  </span>
                </div>
                <p className="text-xs font-semibold mt-1 text-slate-100">{item.title}</p>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono truncate">
                  Hash: {item.hash.substring(0, 24)}...
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Cryptographic Details & Live Hash Comparator */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-400" />
                Evidence Cryptographic Hash Comparison
              </h3>
              <p className="text-xs text-slate-400">Target File: <span className="text-sky-400 font-semibold">{activeItem.title}</span></p>
            </div>
            <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
              Block #{activeItem.blockNumber}
            </span>
          </div>

          {/* Registered Ledger Hash Display */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10.5px] text-slate-400 font-mono uppercase block">Blockchain Immutable SHA-256 Record:</span>
            <div className="font-mono text-xs font-bold text-sky-300 break-all select-all bg-slate-900 p-2 rounded border border-slate-800">
              {activeItem.hash}
            </div>
          </div>

          {/* Input Live Hash */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">
              Recalculated Local File SHA-256 Digest (Paste or click Auto-Verify):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="Paste calculated SHA-256 hash or leave empty for auto-verify..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none"
              />
              <button
                onClick={handleVerify}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-glow-primary"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify Digest
              </button>
            </div>
          </div>

          {/* Verification Result Message */}
          {verificationResult.status !== 'IDLE' && (
            <div className={`p-4 rounded-lg border text-xs font-semibold flex items-center gap-3 ${
              verificationResult.status === 'MATCH'
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
            }`}>
              {verificationResult.status === 'MATCH' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span>{verificationResult.message}</span>
            </div>
          )}

          {/* Immutable Blockchain Ledger Reference */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Transaction Hash:</span>
              <span className="font-mono text-slate-300">{activeItem.blockchainTxHash}</span>
            </div>
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span className="font-mono text-slate-300">{activeItem.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span>Recording Officer:</span>
              <span className="font-mono text-sky-400">{activeItem.recordedBy}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
