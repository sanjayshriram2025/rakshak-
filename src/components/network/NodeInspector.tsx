import React from 'react';
import { 
  User, 
  Phone, 
  Car, 
  MapPin, 
  Building, 
  FileText, 
  X, 
  ExternalLink, 
  ShieldAlert, 
  Share2, 
  Cpu, 
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Entity, Relationship } from '../../types';
import { NeutralTermTooltip } from '../common/NeutralTermTooltip';

interface NodeInspectorProps {
  entity: Entity | null;
  relationships: Relationship[];
  allEntities: Entity[];
  onClose: () => void;
  onViewFullProfile: (entityId: string) => void;
  onSelectConnectedEntity: (entityId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  entity,
  relationships,
  allEntities,
  onClose,
  onViewFullProfile,
  onSelectConnectedEntity
}) => {
  if (!entity) return null;

  // Calculate connected entity counts
  const connectedRelLinks = relationships.filter(
    r => r.source === entity.id || r.target === entity.id
  );

  const connectedEntityIds = new Set<string>();
  connectedRelLinks.forEach(r => {
    if (r.source !== entity.id) connectedEntityIds.add(r.source);
    if (r.target !== entity.id) connectedEntityIds.add(r.target);
  });

  const connectedEntities = allEntities.filter(e => connectedEntityIds.has(e.id));

  const counts = {
    PERSON: connectedEntities.filter(e => e.type === 'PERSON').length,
    PHONE: connectedEntities.filter(e => e.type === 'PHONE').length,
    VEHICLE: connectedEntities.filter(e => e.type === 'VEHICLE').length,
    LOCATION: connectedEntities.filter(e => e.type === 'LOCATION').length,
    ORGANIZATION: connectedEntities.filter(e => e.type === 'ORGANIZATION').length,
    CASE: entity.associatedCases.length
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PERSON': return <User className="w-5 h-5 text-sky-400" />;
      case 'PHONE': return <Phone className="w-5 h-5 text-emerald-400" />;
      case 'VEHICLE': return <Car className="w-5 h-5 text-amber-400" />;
      case 'LOCATION': return <MapPin className="w-5 h-5 text-rose-400" />;
      case 'ORGANIZATION': return <Building className="w-5 h-5 text-purple-400" />;
      default: return <FileText className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <aside className="w-96 bg-slate-900 border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto h-full text-xs animate-in slide-in-from-right duration-200 shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center">
            {getEntityIcon(entity.type)}
          </div>
          <div>
            <span className="font-extrabold text-slate-100 text-sm block leading-none">{entity.name}</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">{entity.type} • ID: {entity.id}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Neutral Designation Badge */}
      <div>
        <NeutralTermTooltip term={entity.neutralTerm} className="w-full justify-center py-1 text-center" />
      </div>

      {/* Key Action Button */}
      <button
        onClick={() => onViewFullProfile(entity.id)}
        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-glow-primary transition-all text-xs"
      >
        <span>View Full Dossier Profile</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>

      {/* Network Metrics Cards */}
      <div>
        <label className="text-slate-400 font-semibold block mb-2 uppercase tracking-wider text-[10px] flex items-center gap-1">
          <Activity className="w-3 h-3 text-sky-400" />
          Graph Analytics & Centrality Metrics
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Degree Centrality</span>
            <span className="text-sm font-mono font-bold text-sky-400">{entity.centrality.degreeCentrality}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Betweenness Centrality</span>
            <span className="text-sm font-mono font-bold text-amber-400">{entity.centrality.betweennessCentrality}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Community Cluster ID</span>
            <span className="text-sm font-mono font-bold text-purple-400">Cluster #{entity.centrality.communityId}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Connection Count</span>
            <span className="text-sm font-mono font-bold text-emerald-400">{entity.centrality.connectionCount} Links</span>
          </div>
        </div>
      </div>

      {/* Connected Entities Summary */}
      <div>
        <label className="text-slate-400 font-semibold block mb-2 uppercase tracking-wider text-[10px] flex items-center justify-between">
          <span>Connected Entities Summary</span>
          <span className="text-sky-400 font-mono">{connectedEntities.length} Total</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[9.5px]">Persons</span>
            <span className="font-bold text-slate-200">{counts.PERSON}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[9.5px]">Phones</span>
            <span className="font-bold text-emerald-400">{counts.PHONE}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[9.5px]">Vehicles</span>
            <span className="font-bold text-amber-400">{counts.VEHICLE}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[9.5px]">Locations</span>
            <span className="font-bold text-rose-400">{counts.LOCATION}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[9.5px]">Firms</span>
            <span className="font-bold text-purple-400">{counts.ORGANIZATION}</span>
          </div>
          <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[9.5px]">Cases</span>
            <span className="font-bold text-indigo-400">{counts.CASE}</span>
          </div>
        </div>
      </div>

      {/* XAI Explanation: Why this entity was flagged */}
      <div className="p-3 rounded-lg bg-slate-950 border border-purple-900/40 space-y-2">
        <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
          <Cpu className="w-4 h-4" />
          <span>Explainable AI: Why Flagged</span>
        </div>
        <ul className="space-y-1 text-[11px] text-slate-300">
          {entity.riskIndicators.map((ind, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-purple-400 font-bold">•</span>
              <span className="leading-tight">{ind}</span>
            </li>
          ))}
        </ul>
        <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-900">
          Requires verification by authorized investigator.
        </div>
      </div>

      {/* Direct Neighbors List */}
      <div>
        <label className="text-slate-400 font-semibold block mb-2 uppercase tracking-wider text-[10px]">
          Directly Linked Neighbors ({connectedEntities.length})
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {connectedEntities.map((ce) => (
            <div
              key={ce.id}
              onClick={() => onSelectConnectedEntity(ce.id)}
              className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center flex-shrink-0">
                  {getEntityIcon(ce.type)}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-200 text-xs truncate block">{ce.name}</span>
                  <span className="text-[9.5px] text-slate-400 block">{ce.type}</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};
