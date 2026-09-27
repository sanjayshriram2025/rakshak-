import React from 'react';
import { BarChart3, Activity, Layers, Shield } from 'lucide-react';
import { Entity } from '../types';
import { CentralityTable } from '../components/analytics/CentralityTable';

interface NetworkAnalyticsViewProps {
  entities: Entity[];
  onSelectEntity: (entityId: string) => void;
}

export const NetworkAnalyticsView: React.FC<NetworkAnalyticsViewProps> = ({
  entities,
  onSelectEntity
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            Network Intelligence & Graph Mathematics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quantitative network metrics computed via Louvain Community Detection and Centrality Algorithms.
          </p>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <CentralityTable
        entities={entities}
        onSelectEntity={onSelectEntity}
      />

    </div>
  );
};
