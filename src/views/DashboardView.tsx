import React from 'react';
import { 
  FolderArchive, 
  Users, 
  Share2, 
  BellRing, 
  ShieldCheck, 
  Activity, 
  UploadCloud, 
  ArrowRight,
  ExternalLink,
  Navigation,
  FileText
} from 'lucide-react';
import { Entity, Relationship, CaseFile, AlertItem, EvidenceItem } from '../types';
import { DelhiMap } from '../components/map/DelhiMap';

interface DashboardViewProps {
  entities: Entity[];
  relationships: Relationship[];
  cases: CaseFile[];
  alerts: AlertItem[];
  evidence: EvidenceItem[];
  onNavigate: (view: string) => void;
  onSelectEntity: (entityId: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  entities,
  relationships,
  cases,
  alerts,
  evidence,
  onNavigate,
  onSelectEntity,
  onSelectCase
}) => {
  const kpis = [
    { title: 'Active Crime Files', value: '142 FIRs', icon: FolderArchive, color: 'border-blue-200 bg-blue-50/70 text-blue-800' },
    { title: 'Registered Entities', value: '1,890 Dossiers', icon: Users, color: 'border-slate-200 bg-slate-50 text-slate-800' },
    { title: 'Connected Networks', value: '34 Clusters', icon: Share2, color: 'border-purple-200 bg-purple-50/70 text-purple-900' },
    { title: 'Pattern Alerts', value: `${alerts.length} Flagged`, icon: BellRing, color: 'border-amber-200 bg-amber-50/70 text-amber-900' },
    { title: 'High Betweenness Hubs', value: '8 Suspects', icon: Activity, color: 'border-red-200 bg-red-50/70 text-red-900' },
    { title: 'Evidence Hash Vault', value: '100% Verified', icon: ShieldCheck, color: 'border-emerald-200 bg-emerald-50/70 text-emerald-900' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">
              Delhi Police Crime Branch Command Portal
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold font-mono">
              CCTNS NODE #DL-CB-01
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Central Crime & Criminal Tracking Network Systems. Cross-station linkage active for Special Cell Lodhi Road, Crime Branch Chanakyapuri & Dwarka PS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('DELHI_MAP')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 border border-slate-300 transition-all"
          >
            <Navigation className="w-4 h-4 text-blue-700" />
            <span>Open Delhi Map</span>
          </button>

          <button
            onClick={() => onNavigate('UPLOAD')}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Ingest CCTNS FIR / CDR</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border ${kpi.color} space-y-2 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider opacity-80">{kpi.title}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-xl font-black font-mono">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Delhi Geospatial Map Section */}
      <div className="space-y-3">
        <DelhiMap
          entities={entities}
          onSelectEntity={(id) => { onSelectEntity(id); onNavigate('ENTITIES'); }}
          onNavigateToGraph={() => onNavigate('NETWORK_EXPLORER')}
        />
      </div>

      {/* Bottom Grid: Recent Alerts & FIR Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-600" />
              Suspicious Pattern Alerts ({alerts.length})
            </span>
            <button onClick={() => onNavigate('ALERTS')} className="text-xs text-blue-700 hover:underline font-bold">
              View All
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => onNavigate('ALERTS')}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800">{alt.patternName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {alt.severity} SEVERITY
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-snug">{alt.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active FIR Files */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-blue-700" />
              Crime Branch FIR Investigation Files
            </span>
            <button onClick={() => onNavigate('CASES')} className="text-xs text-blue-700 hover:underline font-bold">
              View All
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-blue-700 block text-xs">{c.firNumber}</span>
                  <span className="text-slate-800 font-semibold block truncate max-w-xs">{c.title}</span>
                  <span className="text-[10.5px] text-slate-500 block">{c.policeStation}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
