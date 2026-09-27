import React, { useState } from 'react';
import { Share2, Sparkles, AlertCircle, Info } from 'lucide-react';
import { Entity, Relationship, EntityType } from '../types';
import { NetworkFilters } from '../components/network/NetworkFilters';
import { NetworkCanvas } from '../components/network/NetworkCanvas';
import { NodeInspector } from '../components/network/NodeInspector';

interface NetworkExplorerViewProps {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  onSelectEntity: (entityId: string) => void;
  onNavigateToEntityProfile: (entityId: string) => void;
}

export const NetworkExplorerView: React.FC<NetworkExplorerViewProps> = ({
  entities,
  relationships,
  selectedEntityId,
  onSelectEntity,
  onNavigateToEntityProfile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<EntityType[]>([
    'PERSON', 'PHONE', 'VEHICLE', 'LOCATION', 'ORGANIZATION', 'CASE'
  ]);
  const [selectedRelType, setSelectedRelType] = useState('ALL');
  const [minCentrality, setMinCentrality] = useState(0);

  // Filter entities based on selections
  const filteredEntities = entities.filter(e => {
    const matchesType = selectedTypes.includes(e.type);
    const matchesSearch = !searchQuery || 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCentrality = e.centrality.betweennessCentrality >= minCentrality;
    return matchesType && matchesSearch && matchesCentrality;
  });

  const visibleEntityIds = new Set(filteredEntities.map(e => e.id));
  const filteredRelationships = relationships.filter(r => {
    const matchesNodes = visibleEntityIds.has(r.source) && visibleEntityIds.has(r.target);
    const matchesRelType = selectedRelType === 'ALL' || r.type === selectedRelType;
    return matchesNodes && matchesRelType;
  });

  const selectedEntity = entities.find(e => e.id === selectedEntityId) || null;

  const handleToggleType = (type: EntityType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length === 1) return; // Keep at least 1
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTypes(['PERSON', 'PHONE', 'VEHICLE', 'LOCATION', 'ORGANIZATION', 'CASE']);
    setSelectedRelType('ALL');
    setMinCentrality(0);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-950 overflow-hidden">
      
      {/* Top Explorer Control Header */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white flex items-center gap-2">
              Criminal Network Explorer
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                NEO4J GRAPH ENGINE
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span>Nodes: <strong className="text-sky-400">{filteredEntities.length}</strong></span>
          <span>Edges: <strong className="text-amber-400">{filteredRelationships.length}</strong></span>
          <span>Density: <strong className="text-emerald-400">0.42</strong></span>
        </div>
      </div>

      {/* Main 3-Column Explorer Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Filters Panel */}
        <NetworkFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypes={selectedTypes}
          onToggleType={handleToggleType}
          selectedRelType={selectedRelType}
          onRelTypeChange={setSelectedRelType}
          minCentrality={minCentrality}
          onCentralityChange={setMinCentrality}
          onResetFilters={handleResetFilters}
          totalNodes={entities.length}
          visibleNodes={filteredEntities.length}
        />

        {/* Center Force Graph Canvas */}
        <div className="flex-1 relative h-full">
          <NetworkCanvas
            entities={filteredEntities}
            relationships={filteredRelationships}
            selectedNodeId={selectedEntityId}
            onSelectNode={(nodeId) => onSelectEntity(nodeId)}
            searchHighlightQuery={searchQuery}
          />
        </div>

        {/* Right Entity Inspector Panel */}
        {selectedEntityId && (
          <NodeInspector
            entity={selectedEntity}
            relationships={relationships}
            allEntities={entities}
            onClose={() => onSelectEntity('')}
            onViewFullProfile={(id) => onNavigateToEntityProfile(id)}
            onSelectConnectedEntity={(id) => onSelectEntity(id)}
          />
        )}

      </div>

    </div>
  );
};
