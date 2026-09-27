import React, { useState } from 'react';
import { Shield, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [officerId, setOfficerId] = useState('POL-BH-1042');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerId) {
      setError('Please enter your Officer Badge ID or Official Email.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await apiService.auth.login(officerId, password);
      onLoginSuccess(res.user);
    } catch (err) {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6 radar-grid relative overflow-hidden selection:bg-sky-500 selection:text-white">
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Govt Security Emblem Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-glow-primary font-bold">
            <Shield className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-wider flex items-center gap-2">
              RAKSHAK
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono font-semibold">
                GOVT INTELLIGENCE PORTAL
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Ministry of Home Affairs • Crime Investigation Division</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected Investigation Environment</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto my-12 bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-sky-950/80 border border-sky-500/30 text-sky-400 shadow-glow-primary mb-1">
            <KeyRound className="w-6 h-6 text-sky-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Officer Authentication</h2>
          <p className="text-xs text-slate-400">
            Enter authorized badge credentials to access the AI Criminal Network Intelligence Platform.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Officer ID / Badge Number / Official Email
            </label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              placeholder="e.g. POL-BH-1042 or v.sharma.cid@gov.in"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Secure Password / Token
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-all"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0"
              />
              <span>Remember Authorized Session</span>
            </label>

            <span className="text-sky-400 hover:underline cursor-pointer">Hardware Token 2FA</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Authenticating Officer...</span>
            ) : (
              <>
                <span>Secure Login to Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10.5px] text-slate-500">
          🔒 Section 79B Compliant • Audit Logging Active • Official Use Only
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-slate-500 text-[11px]">
        RAKSHAK • Smart India Hackathon Finalist System • Law Enforcement Intelligence Division
      </footer>
    </div>
  );
};
