import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Cpu, 
  Share2, 
  Users, 
  FolderArchive, 
  BellRing, 
  GitCompare, 
  BarChart3, 
  FileText, 
  ShieldCheck, 
  History, 
  Settings, 
  Navigation,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { UserProfile, ThemeMode } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: UserProfile;
  onLogout: () => void;
  alertCount?: number;
  currentTheme?: ThemeMode;
}

export const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Crime Branch Dashboard', icon: LayoutDashboard, category: 'Core' },
  { id: 'DELHI_MAP', label: 'Delhi Spatial Map & Grid', icon: Navigation, category: 'Spatial Tracking', badge: 'DELHI MAP' },
  { id: 'NETWORK_EXPLORER', label: 'Criminal Network Graph', icon: Share2, category: 'Crime Analysis' },
  { id: 'UPLOAD', label: 'CCTNS Data Ingestion', icon: UploadCloud, category: 'Data Ingestion' },
  { id: 'AI_ANALYSIS', label: 'Link Triplet Mapping', icon: Cpu, category: 'Crime Analysis' },
  { id: 'ENTITIES', label: 'Suspect & Entity Dossiers', icon: Users, category: 'Intelligence' },
  { id: 'CASES', label: 'Crime Branch FIR Files', icon: FolderArchive, category: 'Intelligence' },
  { id: 'ALERTS', label: 'Suspicious Activity Alerts', icon: BellRing, category: 'Threat Detection', hasBadge: true },
  { id: 'CROSS_CASE', label: 'Inter-Station Case Matrix', icon: GitCompare, category: 'Graph Analytics' },
  { id: 'ANALYTICS', label: 'Network Centrality Ranking', icon: BarChart3, category: 'Graph Analytics' },
  { id: 'INSIGHTS', label: 'Crime Briefing Report', icon: FileText, category: 'Reporting' },
  { id: 'EVIDENCE', label: 'CCTNS Evidence Vault', icon: ShieldCheck, category: 'Audit & Integrity' },
  { id: 'AUDIT_LOGS', label: 'System Audit Logs', icon: History, category: 'Audit & Integrity' },
  { id: 'SETTINGS', label: 'System Settings', icon: Settings, category: 'System' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  currentUser,
  onLogout,
  alertCount = 2,
  currentTheme = 'GOVT_LIGHT'
}) => {
  const isLight = currentTheme === 'GOVT_LIGHT';

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col transition-all duration-300 border-r ${
        isLight 
          ? 'bg-slate-900 text-slate-100 border-slate-800' 
          : 'bg-slate-950 text-slate-100 border-slate-800'
      } ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="h-16 px-3 flex items-center justify-between border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md flex-shrink-0 font-bold border border-blue-500/40">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1">
                DELHI POLICE
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                  CCTNS
                </span>
              </span>
              <span className="text-[9.5px] text-slate-400 tracking-tight font-medium uppercase truncate">
                Crime Branch & Special Cell
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Security Status Tag */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-slate-200 truncate">Delhi Police Official Portal</span>
            <span className="text-[9.5px] text-slate-400 truncate">{currentUser.clearanceLevel}</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDelhiMap = item.id === 'DELHI_MAP';

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all relative group ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : isDelhiMap
                  ? 'bg-blue-950/60 text-blue-300 hover:bg-slate-800 border border-blue-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${
                isActive ? 'text-white' : isDelhiMap ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
              }`} />

              {!collapsed && (
                <span className="truncate flex-1 text-left">
                  {item.label}
                </span>
              )}

              {/* Badges */}
              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-0.5">
                  {item.badge}
                </span>
              )}

              {!collapsed && item.hasBadge && alertCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow">
                  {alertCount}
                </span>
              )}

              {/* Hover Tooltip for collapsed view */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-600/40 flex items-center justify-center font-bold text-xs text-amber-400 flex-shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 truncate">{currentUser.badgeNumber}</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
            title="Sign Out of Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
