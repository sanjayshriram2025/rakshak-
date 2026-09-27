import React, { useState } from 'react';
import { Search, X, User, Phone, Car, MapPin, Building, FileText, ArrowRight, Shield } from 'lucide-react';
import { Entity, CaseFile } from '../../types';
import { NeutralTermTooltip } from './NeutralTermTooltip';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  entities: Entity[];
  cases: CaseFile[];
  onSelectEntity: (entityId: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  entities,
  cases,
  onSelectEntity,
  onSelectCase
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredEntities = entities.filter(e => {
    const matchesFilter = selectedFilter === 'ALL' || e.type === selectedFilter;
    const matchesQuery = !query || 
      e.name.toLowerCase().includes(query.toLowerCase()) || 
      e.id.toLowerCase().includes(query.toLowerCase()) ||
      (e.subtitle && e.subtitle.toLowerCase().includes(query.toLowerCase()));
    return matchesFilter && matchesQuery;
  });

  const filteredCases = cases.filter(c => {
    const matchesFilter = selectedFilter === 'ALL' || selectedFilter === 'CASE';
    const matchesQuery = !query ||
      c.firNumber.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.location.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PERSON': return <User className="w-4 h-4 text-sky-400" />;
      case 'PHONE': return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'VEHICLE': return <Car className="w-4 h-4 text-amber-400" />;
      case 'LOCATION': return <MapPin className="w-4 h-4 text-rose-400" />;
      case 'ORGANIZATION': return <Building className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
          <Search className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Persons, Phone Numbers, Vehicles, Locations, Organizations, FIRs..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded hover:bg-slate-700">
            Esc
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'PERSON', 'PHONE', 'VEHICLE', 'LOCATION', 'ORGANIZATION', 'CASE'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedFilter === filter
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* Case Results */}
          {filteredCases.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Case Records ({filteredCases.length})
              </div>
              <div className="space-y-2">
                {filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCase(c.id);
                      onClose();
                    }}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-400 text-xs">{c.firNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {c.policeStation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium mt-1">{c.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.summary}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entity Results */}
          {filteredEntities.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                Entities ({filteredEntities.length})
              </div>
              <div className="space-y-2">
                {filteredEntities.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onSelectEntity(e.id);
                      onClose();
                    }}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        {getEntityIcon(e.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-xs">{e.name}</span>
                          <NeutralTermTooltip term={e.neutralTerm} />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{e.subtitle || e.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Betweenness</span>
                        <span className="text-xs font-mono font-bold text-sky-400">{e.centrality.betweennessCentrality}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCases.length === 0 && filteredEntities.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No entities or case files match "{query}".
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
