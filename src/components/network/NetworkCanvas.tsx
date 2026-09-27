import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  User, 
  Phone, 
  Car, 
  MapPin, 
  Building, 
  FileText, 
  Maximize2,
  Sparkles
} from 'lucide-react';
import { Entity, Relationship, EntityType } from '../../types';

interface NetworkCanvasProps {
  entities: Entity[];
  relationships: Relationship[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  searchHighlightQuery?: string;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  entity: Entity;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  entities,
  relationships,
  selectedNodeId,
  onSelectNode,
  searchHighlightQuery = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node force positioning state
  const [positions, setPositions] = useState<NodePosition[]>([]);

  // Initialize node layout positions in a circular / force layout
  useEffect(() => {
    if (entities.length === 0) return;
    const width = 800;
    const height = 600;
    const radius = Math.min(width, height) * 0.35;

    const initialPositions: NodePosition[] = entities.map((entity, idx) => {
      const angle = (idx / entities.length) * 2 * Math.PI;
      const r = radius + (Math.random() - 0.5) * 80;
      return {
        id: entity.id,
        x: width / 2 + r * Math.cos(angle),
        y: height / 2 + r * Math.sin(angle),
        vx: 0,
        vy: 0,
        entity
      };
    });

    setPositions(initialPositions);
  }, [entities]);

  // Simple force physics simulation loop
  useEffect(() => {
    if (!isPhysicsRunning || positions.length === 0) return;

    let animId: number;
    const stepPhysics = () => {
      setPositions((prevPositions) => {
        const next = prevPositions.map(p => ({ ...p }));
        const width = 800;
        const height = 600;

        // Repulsion between all nodes
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[j].x - next[i].x;
            const dy = next[j].y - next[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 220) {
              const force = (220 - dist) * 0.08;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              next[i].vx -= fx;
              next[i].vy -= fy;
              next[j].vx += fx;
              next[j].vy += fy;
            }
          }
        }

        // Attraction along edges
        relationships.forEach((rel) => {
          const sourceNode = next.find(n => n.id === rel.source);
          const targetNode = next.find(n => n.id === rel.target);
          if (sourceNode && targetNode) {
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = 140;
            const force = (dist - desiredDist) * 0.04;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            sourceNode.vx += fx;
            sourceNode.vy += fy;
            targetNode.vx -= fx;
            targetNode.vy -= fy;
          }
        });

        // Center gravity & velocity dampening
        next.forEach((p) => {
          const dx = width / 2 - p.x;
          const dy = height / 2 - p.y;
          p.vx += dx * 0.005;
          p.vy += dy * 0.005;

          p.vx *= 0.85;
          p.vy *= 0.85;

          p.x += p.vx;
          p.y += p.vy;
        });

        return next;
      });

      animId = requestAnimationFrame(stepPhysics);
    };

    animId = requestAnimationFrame(stepPhysics);
    return () => cancelAnimationFrame(animId);
  }, [isPhysicsRunning, relationships]);

  // Determine connected neighbors for highlighting
  const activeHighlightId = hoveredNodeId || selectedNodeId;
  const connectedNodeIds = useMemo(() => {
    if (!activeHighlightId) return new Set<string>();
    const set = new Set<string>([activeHighlightId]);
    relationships.forEach(r => {
      if (r.source === activeHighlightId) set.add(r.target);
      if (r.target === activeHighlightId) set.add(r.source);
    });
    return set;
  }, [activeHighlightId, relationships]);

  // Color mapping per entity type
  const getTypeColor = (type: EntityType) => {
    switch (type) {
      case 'PERSON': return { bg: '#0ea5e9', border: '#38bdf8', glow: 'rgba(14, 165, 233, 0.4)' };
      case 'PHONE': return { bg: '#10b981', border: '#34d399', glow: 'rgba(16, 185, 129, 0.4)' };
      case 'VEHICLE': return { bg: '#f59e0b', border: '#fbbf24', glow: 'rgba(245, 158, 11, 0.4)' };
      case 'LOCATION': return { bg: '#f43f5e', border: '#fb7185', glow: 'rgba(244, 63, 94, 0.4)' };
      case 'ORGANIZATION': return { bg: '#a855f7', border: '#c084fc', glow: 'rgba(168, 85, 247, 0.4)' };
      default: return { bg: '#6366f1', border: '#818cf8', glow: 'rgba(99, 102, 241, 0.4)' };
    }
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      id="canvas-bg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full bg-slate-950 radar-grid overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Floating Graph Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-xl backdrop-blur-md">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-800" />
        <button
          onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
          className={`p-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold px-2 ${
            isPhysicsRunning ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle Physics Force Simulation"
        >
          {isPhysicsRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPhysicsRunning ? 'Physics Active' : 'Physics Paused'}</span>
        </button>
      </div>

      {/* Interactive Network Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-xl text-[10.5px] backdrop-blur-md flex items-center gap-3">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9.5px]">Nodes:</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sky-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Person
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Phone
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Vehicle
          </span>
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Location
          </span>
          <span className="flex items-center gap-1 text-purple-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Firm
          </span>
        </div>
      </div>

      {/* SVG Canvas for Graph rendering */}
      <svg
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Render Relationships / Edges */}
        {relationships.map((rel) => {
          const sourceNode = positions.find(p => p.id === rel.source);
          const targetNode = positions.find(p => p.id === rel.target);
          if (!sourceNode || !targetNode) return null;

          const isHighlight = activeHighlightId && 
            (rel.source === activeHighlightId || rel.target === activeHighlightId);
          const isDimmed = activeHighlightId && !isHighlight;

          return (
            <g key={rel.id}>
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHighlight ? '#0ea5e9' : '#334155'}
                strokeWidth={isHighlight ? 3.5 : Math.max(1.5, rel.weight * 0.4)}
                strokeDasharray={rel.type === 'SHARED_LOCATION' ? '4 3' : undefined}
                opacity={isDimmed ? 0.15 : isHighlight ? 1 : 0.6}
              />
              {/* Edge Label on hover or highlight */}
              {isHighlight && (
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - 6}
                  fill="#7dd3fc"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none font-mono"
                >
                  {rel.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Render Graph Nodes */}
        {positions.map((nodePos) => {
          const { entity } = nodePos;
          const isSelected = selectedNodeId === entity.id;
          const isHovered = hoveredNodeId === entity.id;
          const isSearchMatched = searchHighlightQuery && 
            entity.name.toLowerCase().includes(searchHighlightQuery.toLowerCase());
          
          const isDimmed = activeHighlightId && !connectedNodeIds.has(entity.id);
          const colors = getTypeColor(entity.type);

          return (
            <g
              key={entity.id}
              transform={`translate(${nodePos.x}, ${nodePos.y})`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(entity.id);
              }}
              onMouseEnter={() => setHoveredNodeId(entity.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className="cursor-pointer"
              style={{ opacity: isDimmed ? 0.2 : 1, transition: 'opacity 0.2s' }}
            >
              {/* Outer Selection Pulse Circle */}
              {(isSelected || isSearchMatched) && (
                <circle
                  r="28"
                  fill="none"
                  stroke={isSelected ? '#0ea5e9' : '#eab308'}
                  strokeWidth="3"
                  className="animate-node-pulse"
                />
              )}

              {/* Main Node Circle */}
              <circle
                r="20"
                fill={colors.bg}
                stroke={isSelected ? '#ffffff' : colors.border}
                strokeWidth={isSelected ? 3 : 2}
                filter={isSelected || isHovered ? 'url(#glow)' : undefined}
              />

              {/* Node Icon Indicator */}
              <text
                x="0"
                y="4"
                fill="#ffffff"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                className="pointer-events-none font-sans"
              >
                {entity.type.charAt(0)}
              </text>

              {/* Node Label underneath */}
              <text
                x="0"
                y="34"
                fill={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#cbd5e1'}
                fontSize="11"
                fontWeight={isSelected ? '700' : '500'}
                textAnchor="middle"
                className="pointer-events-none font-sans tracking-tight drop-shadow-md"
              >
                {entity.name}
              </text>

              {/* Centrality Tag */}
              <text
                x="0"
                y="46"
                fill="#94a3b8"
                fontSize="8.5"
                textAnchor="middle"
                className="pointer-events-none font-mono"
              >
                BC: {entity.centrality.betweennessCentrality}
              </text>
            </g>
          );
        })}
      </svg>

    </div>
  );
};
