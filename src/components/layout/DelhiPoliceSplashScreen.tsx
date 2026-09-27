import React, { useState, useEffect } from 'react';
import { Shield, Lock, ArrowRight, CheckCircle2, Server, Key, AlertTriangle } from 'lucide-react';

interface DelhiPoliceSplashScreenProps {
  onEnterPortal: () => void;
}

export const DelhiPoliceSplashScreen: React.FC<DelhiPoliceSplashScreenProps> = ({ onEnterPortal }) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  const bootSteps = [
    'Initializing Delhi Police CCTNS Network Core (Node #DL-CB-01)...',
    'Authenticating DCP Special Cell Credentials (Badge #DP-8849)...',
    'Establishing Encrypted Tunnel to NATGRID & Cyber Crime Cell (I4C)...',
    'Synchronizing Delhi NCR Tower Dumps & Highway ANPR Feeds...',
    'Loading Inter-State Syndicate Knowledge Topology...',
    'System Diagnostic Complete. Secure Portal Access Authorized.'
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < bootSteps.length) {
        setLogs(prev => [...prev, bootSteps[currentStep]]);
        currentStep++;
        setProgress(Math.round((currentStep / bootSteps.length) * 100));
      } else {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 radar-grid font-sans selection:bg-red-600 selection:text-white overflow-hidden">
      
      {/* Background Police Red/Blue Strobe Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-slate-800/80 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 via-slate-900 to-blue-800 flex items-center justify-center text-white shadow-lg border border-red-500/40">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wider flex items-center gap-2">
              DELHI POLICE
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-mono font-bold">
                CRIME BRANCH
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Headquarters: Jai Singh Road, Connaught Place, New Delhi</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-amber-400 font-mono font-bold">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>RESTRICTED LAW ENFORCEMENT PORTAL</span>
        </div>
      </div>

      {/* Central Emblem & Loader Box */}
      <div className="w-full max-w-lg mx-auto my-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6 z-10 text-center relative border-t-4 border-t-red-600">
        
        {/* Ashoka Emblem / Crest Render */}
        <div className="space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-950 border-2 border-amber-500/60 p-3 shadow-glow-primary flex items-center justify-center">
            <Shield className="w-12 h-12 text-amber-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">
              DELHI POLICE
            </h2>
            <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase mt-0.5 font-mono">
              शांति • सेवा • न्याय (Shanti • Seva • Nyaya)
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Central Criminal Database & Linkage Investigation Portal
            </p>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="space-y-2">
          <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>CCTNS BOOT LOG</span>
            <span className="text-amber-400 font-bold">{progress}% READY</span>
          </div>
        </div>

        {/* Boot Terminal Log Container */}
        <div className="h-28 bg-slate-950 rounded-lg p-3 border border-slate-800 text-[11px] font-mono text-left overflow-y-auto space-y-1 text-slate-300">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">[OK]</span>
              <span className="leading-tight">{log}</span>
            </div>
          ))}
        </div>

        {/* Action Enter Button */}
        <div>
          <button
            onClick={onEnterPortal}
            disabled={!isReady}
            className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
              isReady
                ? 'bg-gradient-to-r from-red-600 via-amber-500 to-blue-700 hover:from-red-500 hover:to-blue-600 text-white shadow-glow-primary cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>{isReady ? 'Enter Delhi Police Command Portal' : 'Authenticating CCTNS Credentials...'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-slate-500 text-[11px] z-10 font-mono">
        Delhi Police Crime Branch • Special Cell • IFSO Division • Section 79B Compliant
      </footer>
    </div>
  );
};
