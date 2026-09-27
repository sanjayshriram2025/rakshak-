import React from 'react';
import { DelhiMap } from '../components/map/DelhiMap';
import { Entity } from '../types';

interface DelhiMapViewProps {
  entities: Entity[];
  onSelectEntity: (entityId: string) => void;
  onNavigateToGraph: () => void;
}

export const DelhiMapView: React.FC<DelhiMapViewProps> = ({
  entities,
  onSelectEntity,
  onNavigateToGraph
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <DelhiMap
        entities={entities}
        onSelectEntity={onSelectEntity}
        onNavigateToGraph={onNavigateToGraph}
      />
    </div>
  );
};
