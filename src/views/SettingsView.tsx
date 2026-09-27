import React, { useState } from 'react';
import { Settings, Shield, User, Database, Lock, Server, CheckCircle2, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';
import { USE_MOCK_API, API_BASE_URL } from '../services/api';

interface SettingsViewProps {
  user: UserProfile;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
  const [useMock, setUseMock] = useState(USE_MOCK_API);
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-400" />
          System Settings & Backend API Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure API connection endpoints, REST service layers, and officer clearance profiles.
        </p>
      </div>

      {/* User Officer Dossier */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-4 h-4 text-sky-400" />
          Active Officer Profile & Security Clearance
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Officer Name</span>
            <span className="font-bold text-slate-100 mt-0.5 block">{user.name}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Badge ID</span>
            <span className="font-bold text-sky-400 mt-0.5 block font-mono">{user.badgeNumber}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Department</span>
            <span className="font-bold text-slate-200 mt-0.5 block truncate">{user.department}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">Clearance Level</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">{user.clearanceLevel}</span>
          </div>
        </div>
      </div>

      {/* Backend Integration Settings (Requirement #18) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            Claude Backend API Integration Service
          </h3>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            REST API READY
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Use Frontend Mock API Layer</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                Toggle between synthetic mock responses and real Claude REST backend endpoints.
              </span>
            </div>
            <button
              onClick={() => setUseMock(!useMock)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                useMock
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {useMock ? 'Mock API Active' : 'Live REST API Active'}
            </button>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Backend Base Endpoint URL:</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-purple-200 leading-relaxed text-[11px]">
            <span className="font-bold block mb-1">API Service Contracts Configured:</span>
            Endpoints `/api/auth`, `/api/cases`, `/api/entities`, `/api/network`, `/api/analysis`, `/api/alerts`, `/api/evidence`, and `/api/audit` are cleanly decoupled in <code className="font-mono text-sky-300">src/services/api.ts</code>.
          </div>
        </div>
      </div>

    </div>
  );
};
