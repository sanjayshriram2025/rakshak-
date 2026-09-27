import React from 'react';
import { Filter, Search, RefreshCw, Layers, Shield, Sparkles } from 'lucide-react';
import { EntityType, RelationshipType } from '../../types';

interface NetworkFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTypes: EntityType[];
  onToggleType: (t: EntityType) => void;
  selectedRelType: string;
  onRelTypeChange: (r: string) => void;
  minCentrality: number;
  onCentralityChange: (v: number) => void;
  onResetFilters: () => void;
  totalNodes: number;
  visibleNodes: number;
}

export const NetworkFilters: React.FC<NetworkFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedTypes,
  onToggleType,
  selectedRelType,
  onRelTypeChange,
  minCentrality,
  onCentralityChange,
  onResetFilters,
  totalNodes,
  visibleNodes
}) => {
  const entityTypes: { type: EntityType; label: string; color: string }[] = [
    { type: 'PERSON', label: 'Person of Interest', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    { type: 'PHONE', label: 'Phone Number (CDR)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { type: 'VEHICLE', label: 'Vehicle (ANPR)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { type: 'LOCATION', label: 'Location / GPS', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { type: 'ORGANIZATION', label: 'Firm / Shell Company', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { type: 'CASE', label: 'Case / FIR', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  ];

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto h-full text-xs">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-slate-100 text-sm">Graph Filters</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1"
          title="Reset Graph Filters"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Quick Search */}
      <div>
        <label className="text-slate-400 font-medium block mb-1.5">Search Graph Entity</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Name, Phone, Vehicle No..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg pl-8 pr-3 py-1.5 text-slate-100 placeholder-slate-500 text-xs outline-none"
          />
        </div>
      </div>

      {/* Visible Nodes Count */}
      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
        <span className="text-slate-400 font-medium">Visible Nodes</span>
        <span className="font-mono font-bold text-sky-400">
          {visibleNodes} / {totalNodes}
        </span>
      </div>

      {/* Entity Types Checklist */}
      <div>
        <label className="text-slate-400 font-medium block mb-2 flex items-center justify-between">
          <span>Entity Categories</span>
          <span className="text-[10px] text-slate-500">Filter Nodes</span>
        </label>
        <div className="space-y-1.5">
          {entityTypes.map((et) => {
            const isChecked = selectedTypes.includes(et.type);
            return (
              <label
                key={et.type}
                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                  isChecked ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleType(et.type)}
                    className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                  />
                  <span className="text-slate-200 font-medium">{et.label}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${et.color}`}>
                  {et.type}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Relationship Type Filter */}
      <div>
        <label className="text-slate-400 font-medium block mb-1.5">Relationship Edge Type</label>
        <select
          value={selectedRelType}
          onChange={(e) => onRelTypeChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:border-sky-500 outline-none"
        >
          <option value="ALL">All Relationship Links</option>
          <option value="COMMUNICATED_WITH">COMMUNICATED_WITH (CDR)</option>
          <option value="SHARED_LOCATION">SHARED_LOCATION (GPS/Co-location)</option>
          <option value="VEHICLE_LINKED">VEHICLE_LINKED (RTO/ANPR)</option>
          <option value="ORGANIZATION_LINKED">ORGANIZATION_LINKED (Firm)</option>
          <option value="FINANCIAL_TRANSACTION">FINANCIAL_TRANSACTION (Hawala)</option>
        </select>
      </div>

      {/* Betweenness Centrality Slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-slate-400 font-medium">Min Centrality Score</label>
          <span className="font-mono text-sky-400 font-bold">{minCentrality.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.9"
          step="0.05"
          value={minCentrality}
          onChange={(e) => onCentralityChange(parseFloat(e.target.value))}
          className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-[10px] text-slate-500 mt-1">Filters out peripheral nodes to isolate high-risk network hubs.</p>
      </div>

      {/* Legend & Terminology Note */}
      <div className="mt-auto pt-3 border-t border-slate-800 bg-slate-950/60 p-2.5 rounded-lg text-[10.5px] text-slate-400 leading-snug">
        <div className="flex items-center gap-1 text-sky-400 font-semibold mb-1">
          <Shield className="w-3 h-3" />
          Investigator Guidance
        </div>
        Node centrality indicates structural position within network topology. Neutral legal terminology applies.
      </div>

    </div>
  );
};
