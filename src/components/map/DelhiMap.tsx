import React, { useState } from 'react';
import { MapPin, Navigation, Shield, Eye, Car, Phone, Building, User, Info, ArrowRight } from 'lucide-react';
import { Entity } from '../../types';

interface DelhiMapProps {
  entities: Entity[];
  onSelectEntity: (entityId: string) => void;
  onNavigateToGraph: () => void;
}

interface MapLocationMarker {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  x: number; // SVG % x
  y: number; // SVG % y
  type: 'POLICE_STATION' | 'ANPR_CAMERA' | 'SUSPECT_HUB' | 'CELL_TOWER';
  entityId?: string;
  detail: string;
  cases: string[];
}

export const DELHI_LOCATIONS: MapLocationMarker[] = [
  {
    id: 'LOC-DL-01',
    name: 'Delhi Police HQ (Jai Singh Road)',
    district: 'New Delhi',
    lat: 28.6271,
    lng: 77.2166,
    x: 48,
    y: 42,
    type: 'POLICE_STATION',
    detail: 'Central Command Center & Special Cell Operations',
    cases: ['FIR-42/2026', 'FIR-108/2026']
  },
  {
    id: 'LOC-DL-02',
    name: 'Dwarka Sector 21 Junction',
    district: 'South West Delhi',
    lat: 28.5522,
    lng: 77.0588,
    x: 22,
    y: 65,
    type: 'SUSPECT_HUB',
    entityId: 'ENT-LOC-401',
    detail: 'Primary suspect co-presence hub (Rajesh Kumar & Phone X)',
    cases: ['FIR-42/2026', 'FIR-215/2026']
  },
  {
    id: 'LOC-DL-03',
    name: 'DND Expressway Toll Plaza',
    district: 'South East Delhi / Noida Border',
    lat: 28.5688,
    lng: 77.2911,
    x: 75,
    y: 58,
    type: 'ANPR_CAMERA',
    entityId: 'ENT-LOC-402',
    detail: 'ANPR Toll Checkpoint (Vehicle DL-01-AB-1234 flagged)',
    cases: ['FIR-108/2026']
  },
  {
    id: 'LOC-DL-04',
    name: 'Barakhamba Road, Connaught Place',
    district: 'Central Delhi',
    lat: 28.6289,
    lng: 77.2219,
    x: 52,
    y: 38,
    type: 'SUSPECT_HUB',
    entityId: 'ENT-ORG-501',
    detail: 'Apex Transport Delhi Registered Shell Office',
    cases: ['FIR-42/2026']
  },
  {
    id: 'LOC-DL-05',
    name: 'Special Cell PS (Lodhi Road)',
    district: 'South Delhi',
    lat: 28.5880,
    lng: 77.2280,
    x: 54,
    y: 52,
    type: 'POLICE_STATION',
    detail: 'Special Cell Field Station & Evidence Storage',
    cases: ['FIR-42/2026']
  },
  {
    id: 'LOC-DL-06',
    name: 'Okhla Industrial Estate Phase III',
    district: 'South Delhi',
    lat: 28.5355,
    lng: 77.2633,
    x: 68,
    y: 72,
    type: 'CELL_TOWER',
    entityId: 'ENT-LOC-402',
    detail: 'Jio Tower sector ping matching nocturnal activity',
    cases: ['FIR-215/2026']
  }
];

export const DelhiMap: React.FC<DelhiMapProps> = ({
  entities,
  onSelectEntity,
  onNavigateToGraph
}) => {
  const [selectedMarker, setSelectedMarker] = useState<MapLocationMarker | null>(DELHI_LOCATIONS[1]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filteredLocations = DELHI_LOCATIONS.filter(loc => 
    activeFilter === 'ALL' || loc.type === activeFilter
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-6 text-slate-800">
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Delhi NCR Spatial Tracking & Case Map</h2>
              <p className="text-xs text-slate-500">Real-time geospatial plotting of Police Stations, ANPR Cameras & Suspect Cell Tower Pings</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Markers' },
            { id: 'POLICE_STATION', label: 'Police Stations' },
            { id: 'ANPR_CAMERA', label: 'ANPR Cameras' },
            { id: 'SUSPECT_HUB', label: 'Suspect Hubs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === tab.id
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Side Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Interactive Delhi Map Canvas (2 Cols) */}
        <div className="lg:col-span-2 relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden h-[480px] shadow-inner flex flex-col">
          
          {/* Map Controls Watermark */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 border border-slate-200 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm text-xs font-medium text-slate-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Delhi NCR Live Surveillance Grid</span>
          </div>

          {/* District Labels */}
          <div className="absolute top-4 right-4 z-10 bg-white/90 border border-slate-200 px-3 py-1 rounded-lg text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            UT of Delhi • NCR Region
          </div>

          {/* SVG Map Canvas */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            
            {/* Delhi State Boundary Outline Polygon */}
            <path
              d="M 15 30 L 35 15 L 65 18 L 85 35 L 82 70 L 60 85 L 30 80 L 15 55 Z"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="0.8"
              strokeDasharray="2 1"
            />

            {/* Yamuna River Line */}
            <path
              d="M 62 15 Q 58 45 74 85"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <text x="68" y="28" fill="#3b82f6" fontSize="2" fontWeight="bold" opacity="0.6">Yamuna River</text>

            {/* Major Arterial Highways */}
            <line x1="15" y1="55" x2="82" y2="70" stroke="#e2e8f0" strokeWidth="1" /> {/* Ring Road */}
            <line x1="48" y1="42" x2="75" y2="58" stroke="#e2e8f0" strokeWidth="1" /> {/* DND Flyway */}
            <line x1="22" y1="65" x2="48" y2="42" stroke="#e2e8f0" strokeWidth="1" /> {/* Dwarka Expressway */}

            {/* District Names in Background */}
            <text x="32" y="32" fill="#94a3b8" fontSize="2.5" fontWeight="bold">NORTH DELHI</text>
            <text x="44" y="46" fill="#94a3b8" fontSize="2.5" fontWeight="bold">CENTRAL DELHI</text>
            <text x="24" y="60" fill="#94a3b8" fontSize="2.5" fontWeight="bold">SOUTH WEST DELHI</text>
            <text x="56" y="66" fill="#94a3b8" fontSize="2.5" fontWeight="bold">SOUTH EAST DELHI</text>
            <text x="76" y="52" fill="#64748b" fontSize="2.2" fontWeight="bold">NOIDA (UP)</text>
            <text x="18" y="78" fill="#64748b" fontSize="2.2" fontWeight="bold">GURUGRAM (HR)</text>

            {/* Render Location Markers */}
            {filteredLocations.map(loc => {
              const isSelected = selectedMarker?.id === loc.id;
              
              let markerColor = '#2563eb'; // Blue for police station
              if (loc.type === 'ANPR_CAMERA') markerColor = '#d97706'; // Amber for camera
              if (loc.type === 'SUSPECT_HUB') markerColor = '#dc2626'; // Red for suspect hub
              if (loc.type === 'CELL_TOWER') markerColor = '#7c3aed'; // Purple for cell tower

              return (
                <g
                  key={loc.id}
                  transform={`translate(${loc.x}, ${loc.y})`}
                  onClick={() => setSelectedMarker(loc)}
                  className="cursor-pointer group"
                >
                  {/* Outer Pulsing Aura */}
                  {isSelected && (
                    <circle
                      r="4"
                      fill="none"
                      stroke={markerColor}
                      strokeWidth="0.8"
                      className="animate-ping"
                    />
                  )}

                  {/* Marker Pin Circle */}
                  <circle
                    r="2.5"
                    fill={markerColor}
                    stroke="#ffffff"
                    strokeWidth="0.6"
                    className="transition-transform group-hover:scale-125 shadow-md"
                  />

                  {/* Marker Label */}
                  <text
                    x="0"
                    y="5.5"
                    fill="#1e293b"
                    fontSize="2.2"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-sm font-sans"
                  >
                    {loc.name.split(' (')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-200 p-2.5 rounded-xl text-[11px] shadow-sm flex items-center gap-3">
            <span className="font-bold text-slate-700">Legend:</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Police Station
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> ANPR Toll Camera
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Suspect Co-Location
            </span>
          </div>

        </div>

        {/* Selected Marker Detail Card (1 Col) */}
        <div className="space-y-4">
          {selectedMarker ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                    {selectedMarker.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">
                    {selectedMarker.district}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedMarker.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedMarker.detail}</p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10.5px] text-slate-500 font-mono block">GPS Coordinates:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedMarker.lat}° N, {selectedMarker.lng}° E</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">Linked Crime Files:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedMarker.cases.map(c => (
                      <span key={c} className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                {selectedMarker.entityId && (
                  <button
                    onClick={() => onSelectEntity(selectedMarker.entityId!)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors"
                  >
                    <span>Inspect Linked Entity Dossier</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onNavigateToGraph}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Open Location in Link Graph</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs">
              Click any location marker on the Delhi NCR map to view spatial intelligence.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
