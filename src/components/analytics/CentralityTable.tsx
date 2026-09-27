import React from 'react';
import { BarChart3, Activity, ArrowUpDown, Shield, ExternalLink, Cpu } from 'lucide-react';
import { Entity } from '../../types';
import { NeutralTermTooltip } from '../common/NeutralTermTooltip';

interface CentralityTableProps {
  entities: Entity[];
  onSelectEntity: (entityId: string) => void;
}

export const CentralityTable: React.FC<CentralityTableProps> = ({ entities, onSelectEntity }) => {
  const sortedEntities = [...entities].sort(
    (a, b) => b.centrality.betweennessCentrality - a.centrality.betweennessCentrality
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            Graph Centrality Leaderboard & Key Network Nodes
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by Betweenness Centrality (structural bridge importance across criminal sub-graphs).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10.5px] uppercase">
              <th className="py-2 px-3">Rank</th>
              <th className="py-2 px-3">Entity Name</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Legal Neutral Designation</th>
              <th className="py-2 px-3 text-right">Degree</th>
              <th className="py-2 px-3 text-right">Betweenness</th>
              <th className="py-2 px-3 text-right">Closeness</th>
              <th className="py-2 px-3 text-center">Cluster</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {sortedEntities.map((entity, idx) => (
              <tr 
                key={entity.id}
                className="hover:bg-slate-800/80 transition-colors"
              >
                <td className="py-2.5 px-3 font-mono font-bold text-slate-400">
                  #{idx + 1}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-100">
                  {entity.name}
                  <span className="block text-[10px] text-slate-400 font-normal">{entity.subtitle}</span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-slate-950 border border-slate-800">
                    {entity.type}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <NeutralTermTooltip term={entity.neutralTerm} />
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-400">
                  {entity.centrality.degreeCentrality}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                  {entity.centrality.betweennessCentrality}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                  {entity.centrality.closenessCentrality}
                </td>
                <td className="py-2.5 px-3 text-center font-mono">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                    Cluster #{entity.centrality.communityId}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onSelectEntity(entity.id)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition-colors"
                    title="View Entity Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
