import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ShieldAlert, 
  Clock, 
  User, 
  Lock, 
  Sparkles,
  ChevronRight,
  Shield,
  Palette,
  Sun,
  Moon,
  Terminal,
  Cpu
} from 'lucide-react';
import { UserProfile, AlertItem, ThemeMode } from '../../types';

interface TopbarProps {
  currentView: string;
  onOpenSearch: () => void;
  currentUser: UserProfile;
  alerts: AlertItem[];
  onNavigateToAlerts: () => void;
  sidebarCollapsed: boolean;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  onOpenSearch,
  currentUser,
  alerts,
  onNavigateToAlerts,
  sidebarCollapsed,
  currentTheme,
  onSelectTheme
}) => {
  const [time, setTime] = useState<string>('');
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = alerts.filter(a => a.status === 'UNREVIEWED');

  const formatViewName = (view: string) => {
    switch (view) {
      case 'DASHBOARD': return 'Crime Branch Overview';
      case 'UPLOAD': return 'CCTNS FIR & CDR Ingestion';
      case 'AI_ANALYSIS': return 'Link Analysis & Triplet Mapping';
      case 'NETWORK_EXPLORER': return 'Criminal Link Analysis Graph';
      case 'ENTITIES': return 'Entity Profiles & Dossiers';
      case 'CASES': return 'Crime Branch FIR Files';
      case 'ALERTS': return 'Suspicious Activity & Anomaly Alerts';
      case 'CROSS_CASE': return 'Cross-Case Intelligence Linkage';
      case 'ANALYTICS': return 'Network Topology & Centrality';
      case 'INSIGHTS': return 'Crime Branch Intelligence Briefing';
      case 'EVIDENCE': return 'CCTNS Evidence Integrity Audit';
      case 'AUDIT_LOGS': return 'System Activity Logs';
      case 'SETTINGS': return 'System & Theme Configuration';
      default: return 'Delhi Police Portal';
    }
  };

  const themesList: { id: ThemeMode; label: string; icon: any }[] = [
    { id: 'DELHI_DARK', label: 'Delhi Police Dark Command', icon: Moon },
    { id: 'GOVT_LIGHT', label: 'Govt Official Light Mode', icon: Sun },
    { id: 'TACTICAL_AMBER', label: 'Tactical Night Vision Amber', icon: Terminal },
    { id: 'CYBER_CELL', label: 'Special Cyber Cell Cyan', icon: Cpu },
  ];

  return (
    <header className={`h-16 border-b backdrop-blur sticky top-0 z-30 flex items-center justify-between px-6 transition-all duration-300 ${
      currentTheme === 'GOVT_LIGHT' 
        ? 'bg-slate-100 border-slate-300 text-slate-900' 
        : currentTheme === 'TACTICAL_AMBER'
        ? 'bg-neutral-950 border-amber-900/60 text-amber-100'
        : 'bg-slate-950/95 border-slate-800 text-slate-100'
    } ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
      
      {/* Left: Emblem & View Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-700 via-slate-900 to-blue-800 flex items-center justify-center text-amber-400 font-bold border border-red-500/40 flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
              DELHI POLICE
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold">
                CRIME BRANCH
              </span>
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium opacity-80">
              <span>CCTNS</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <span className="font-semibold text-sky-400">{formatViewName(currentView)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Global Search Bar Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className={`w-full border rounded-lg px-3.5 py-1.5 flex items-center justify-between text-xs transition-all shadow-inner group ${
            currentTheme === 'GOVT_LIGHT'
              ? 'bg-white border-slate-300 text-slate-700 hover:border-blue-500'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-sky-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition-colors" />
            <span>Search Person, Phone, Vehicle, FIR-42/2026, Dwarka...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Controls & Theme Selector */}
      <div className="flex items-center gap-3">
        
        {/* System Time */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{time}</span>
        </div>

        {/* Theme Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Switch Theme"
          >
            <Palette className="w-4 h-4 text-sky-400" />
            <span className="hidden xl:inline">Theme</span>
          </button>

          {showThemeDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5 border-b border-slate-800 mb-1">
                Select Police System Theme
              </div>
              <div className="space-y-1">
                {themesList.map((t) => {
                  const Icon = t.icon;
                  const isSelected = currentTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTheme(t.id);
                        setShowThemeDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                        isSelected
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Alerts Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertDropdown(!showAlertDropdown)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors relative"
            title="Suspicious Network Alerts"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showAlertDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Network Alerts ({unreadAlerts.length} Unreviewed)
                </span>
                <button
                  onClick={() => {
                    setShowAlertDropdown(false);
                    onNavigateToAlerts();
                  }}
                  className="text-[11px] text-sky-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {alerts.slice(0, 3).map((alt) => (
                  <div 
                    key={alt.id}
                    onClick={() => {
                      setShowAlertDropdown(false);
                      onNavigateToAlerts();
                    }}
                    className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 cursor-pointer border border-slate-700/60 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between font-medium text-slate-200">
                      <span className="text-amber-400 font-semibold">{alt.patternName}</span>
                      <span className="text-[10px] text-slate-400">{alt.detectedTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{alt.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-600/40 flex items-center justify-center text-amber-400 font-bold text-xs shadow-inner">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400">Badge #{currentUser.badgeNumber}</span>
          </div>
        </div>

      </div>

    </header>
  );
};
