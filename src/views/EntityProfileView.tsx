import React from 'react';
import { 
  User, 
  Phone, 
  Car, 
  MapPin, 
  Building, 
  FileText, 
  ShieldAlert, 
  Cpu, 
  Share2, 
  Calendar, 
  Hash, 
  ArrowLeft,
  ExternalLink,
  Activity,
  Layers,
  Clock
} from 'lucide-react';
import { Entity, Relationship, CaseFile, EvidenceItem } from '../types';
import { NeutralTermTooltip } from '../components/common/NeutralTermTooltip';

interface EntityProfileViewProps {
  entityId: string;
  entities: Entity[];
  relationships: Relationship[];
  cases: CaseFile[];
  evidence: EvidenceItem[];
  onBack: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToEvidence: () => void;
}

export const EntityProfileView: React.FC<EntityProfileViewProps> = ({
  entityId,
  entities,
  relationships,
  cases,
  evidence,
  onBack,
  onNavigateToNetwork,
  onNavigateToEvidence
}) => {
  const entity = entities.find(e => e.id === entityId) || entities[0];
  if (!entity) return null;

  const connectedRels = relationships.filter(r => r.source === entity.id || r.target === entity.id);
  const connectedCases = cases.filter(c => entity.associatedCases.includes(c.id) || entity.associatedCases.includes(c.firNumber));

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PERSON': return <User className="w-6 h-6 text-sky-400" />;
      case 'PHONE': return <Phone className="w-6 h-6 text-emerald-400" />;
      case 'VEHICLE': return <Car className="w-6 h-6 text-amber-400" />;
      case 'LOCATION': return <MapPin className="w-6 h-6 text-rose-400" />;
      case 'ORGANIZATION': return <Building className="w-6 h-6 text-purple-400" />;
      default: return <FileText className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Graph Explorer</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToNetwork}
            className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Locate in Network Explorer</span>
          </button>
          <button
            onClick={onNavigateToEvidence}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-glow-primary"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Supporting Evidence</span>
          </button>
        </div>
      </div>

      {/* Entity Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center shadow-inner">
              {getEntityIcon(entity.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">{entity.name}</h1>
                <NeutralTermTooltip term={entity.neutralTerm} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{entity.subtitle || entity.type}</p>
              <span className="text-[11px] font-mono text-slate-500 block mt-0.5">Entity ID: {entity.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Betweenness Score</span>
              <span className="text-lg font-bold text-amber-400">{entity.centrality.betweennessCentrality}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Degree Centrality</span>
              <span className="text-lg font-bold text-sky-400">{entity.centrality.degreeCentrality}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Community Cluster</span>
              <span className="text-lg font-bold text-purple-400">#{entity.centrality.communityId}</span>
            </div>
          </div>
        </div>

        {/* Attribute Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {Object.entries(entity.attributes).map(([key, val]) => (
            <div key={key} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">{key}</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2 Column Layout: XAI Reasonings + Connected Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: AI Explanation: Why this entity was flagged */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-white">AI Intelligence Explanation: Why Flagged</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-purple-200 leading-relaxed">
              <span className="font-bold block mb-1">Graph Neural Net Summary:</span>
              Target entity exhibits structural properties of a multi-district communication relay node connecting FIR-1024 (Patna) and FIR-1087 (Gaya).
            </div>

            <div>
              <span className="font-bold text-slate-300 block mb-2">Detected Risk Indicators:</span>
              <ul className="space-y-2">
                {entity.riskIndicators.map((ind, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Connected Relationships & Cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Share2 className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm text-white">Extracted Graph Relationships ({connectedRels.length})</h3>
          </div>

          <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
            {connectedRels.map((rel) => {
              const otherEntityId = rel.source === entity.id ? rel.target : rel.source;
              const otherEntity = entities.find(e => e.id === otherEntityId);

              return (
                <div key={rel.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sky-400 block">{rel.label}</span>
                    <span className="text-slate-300 mt-0.5 block">Linked to: {otherEntity?.name || otherEntityId}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-400">
                    {rel.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
