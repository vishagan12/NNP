import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Rectangle, 
  Polygon, 
  Polyline, 
  ZoomControl,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { DroneTelemetry, HexapodTelemetry, TriageEvent, PheromoneCell } from '../types';
import { 
  Compass, 
  ZoomOut,
  Map
} from 'lucide-react';

interface TacticalMapProps {
  drones: DroneTelemetry[];
  hexapods: HexapodTelemetry[];
  triageEvents: TriageEvent[];
  pheromoneGrid: PheromoneCell[];
  selectedDroneId: string | null;
  onSelectDrone: (droneId: string) => void;
  selectedHexapodId?: string | null;
  onSelectHexapod?: (hexapodId: string) => void;
  onResetFocus?: () => void;
  selectedTriageId: string | null;
  onSelectTriage: (triage: TriageEvent) => void;
  onDispatchMedicalDrone?: (victimId: string) => void;
  onDispatchHexapodInfiltration?: (victimId: string, hexapodId: string) => void;
}

// ---------------------------------------------------------------------------
// Map Layer Configs — Google Maps Satellite + Hybrid + ESRI + CartoDB Dark
// ---------------------------------------------------------------------------
const MAP_LAYERS = {
  GOOGLE_SATELLITE: {
    id: 'GOOGLE_SATELLITE',
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    maxZoom: 22,
    subdomains: [],
    attribution: '&copy; Google Maps'
  },
  GOOGLE_HYBRID: {
    id: 'GOOGLE_HYBRID',
    name: 'Google Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    maxZoom: 22,
    subdomains: [],
    attribution: '&copy; Google Maps'
  },
  ESRI_SATELLITE: {
    id: 'ESRI_SATELLITE',
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 22,
    subdomains: [],
    attribution: '&copy; Esri'
  },
  CARTODB_DARK: {
    id: 'CARTODB_DARK',
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; CartoDB'
  }
};

type LayerKey = keyof typeof MAP_LAYERS;

// ---------------------------------------------------------------------------
// 1. Drone Icon — Quadcopter with heading vector
// ---------------------------------------------------------------------------
function createDroneIcon(drone: DroneTelemetry, isSelected: boolean) {
  const isEngaged = drone.status === 'ENGAGED';
  const isLowBatt = drone.battery.level < 25;
  const isPerim   = drone.zoneAssignment === 'PERIMETER_RING';

  const color = isEngaged ? '#ef4444'
    : isLowBatt           ? '#f59e0b'
    : isPerim             ? '#a855f7'
    :                       '#ff6b2c';

  const size = isSelected ? 48 : 38;
  const half = size / 2;

  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      ${isSelected ? `
        <div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;opacity:0.8;"></div>
        <div style="position:absolute;inset:-8px;border-radius:50%;border:1px dashed ${color};animation:spin 4s linear infinite;opacity:0.6;"></div>
      ` : ''}
      <div style="position:relative;width:${size*0.8}px;height:${size*0.8}px;display:flex;align-items:center;justify-content:center;transform:rotate(${drone.heading}deg);transition:transform 0.15s linear;">
        <!-- Heading vector -->
        <div style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};"></div>
        <!-- X Arms -->
        <div style="position:absolute;width:${size*0.7}px;height:2px;background:rgba(20,28,45,0.95);border-radius:2px;transform:rotate(45deg);border:1px solid rgba(255,255,255,0.3);"></div>
        <div style="position:absolute;width:${size*0.7}px;height:2px;background:rgba(20,28,45,0.95);border-radius:2px;transform:rotate(-45deg);border:1px solid rgba(255,255,255,0.3);"></div>
        <!-- 4 Rotors -->
        <div style="position:absolute;top:0;left:0;width:10px;height:10px;border-radius:50%;background:${color}33;border:1.5px solid ${color};box-shadow:0 0 6px ${color};"></div>
        <div style="position:absolute;top:0;right:0;width:10px;height:10px;border-radius:50%;background:${color}33;border:1.5px solid ${color};box-shadow:0 0 6px ${color};"></div>
        <div style="position:absolute;bottom:0;left:0;width:10px;height:10px;border-radius:50%;background:${color}33;border:1.5px solid ${color};box-shadow:0 0 6px ${color};"></div>
        <div style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:${color}33;border:1.5px solid ${color};box-shadow:0 0 6px ${color};"></div>
        <!-- Center Avionics -->
        <div style="width:9px;height:9px;border-radius:50%;background:radial-gradient(circle,${color},#0d0f16);border:1px solid rgba(255,255,255,0.9);box-shadow:0 0 10px ${color};"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'tactical-drone-marker',
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

// ---------------------------------------------------------------------------
// 2. Hexapod Icon — 6-legged ground crawler
// ---------------------------------------------------------------------------
function createHexapodIcon(hexa: HexapodTelemetry, isSelected: boolean) {
  const color = hexa.status === 'ANCHORED' ? '#10b981' : '#06b6d4';
  const size = isSelected ? 42 : 36;
  const half = size / 2;

  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      ${isSelected ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;opacity:0.8;"></div>` : ''}
      <div style="position:relative;width:${size*0.75}px;height:${size*0.75}px;display:flex;align-items:center;justify-content:center;transform:rotate(${hexa.heading}deg);transition:transform 0.15s linear;">
        <div style="position:absolute;width:${size*0.75}px;height:1.5px;background:${color};border-radius:2px;transform:rotate(30deg);box-shadow:0 0 6px ${color};"></div>
        <div style="position:absolute;width:${size*0.75}px;height:1.5px;background:${color};border-radius:2px;transform:rotate(90deg);box-shadow:0 0 6px ${color};"></div>
        <div style="position:absolute;width:${size*0.75}px;height:1.5px;background:${color};border-radius:2px;transform:rotate(150deg);box-shadow:0 0 6px ${color};"></div>
        <div style="width:12px;height:12px;border-radius:3px;background:rgba(6,30,46,0.95);border:1.5px solid ${color};box-shadow:0 0 8px ${color};display:flex;align-items:center;justify-content:center;">
          <div style="width:4px;height:4px;border-radius:50%;background:${color};"></div>
        </div>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'tactical-hexapod-marker',
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

// ---------------------------------------------------------------------------
// 3. Triage Icon
// ---------------------------------------------------------------------------
function createTriageIcon(triage: TriageEvent, isSelected: boolean) {
  const rescued  = triage.rescueStatus === 'RESCUED';
  const critical = triage.severity === 'CRITICAL';
  const color    = rescued ? '#10b981' : critical ? '#ef4444' : '#f59e0b';
  const size = isSelected ? 34 : 28;
  const half = size / 2;

  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      ${!rescued ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.4;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
      <div style="width:${size*0.65}px;height:${size*0.65}px;border-radius:50%;background:#0d1017;border:2px solid ${color};box-shadow:0 0 14px ${color};display:flex;align-items:center;justify-content:center;">
        <span style="font-size:8px;font-weight:900;color:${color};">${rescued ? '✓' : '!'}</span>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'tactical-triage-marker',
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

// ---------------------------------------------------------------------------
// Map Click Handler — click outside markers to reset zoom
// ---------------------------------------------------------------------------
function MapClickHandler({ onMapClick }: { onMapClick?: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick?.();
    }
  });
  return null;
}

// ---------------------------------------------------------------------------
// Map View Controller — smooth flyTo on select, flyBack on deselect
// ---------------------------------------------------------------------------
function MapViewController({ focusCoords }: { focusCoords: [number, number] | null }) {
  const map = useMap();
  const prevRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (focusCoords) {
      map.flyTo(focusCoords, 20, { animate: true, duration: 1.0 });
      prevRef.current = focusCoords;
    } else if (prevRef.current !== null) {
      map.flyTo([28.61390, 77.20900], 18, { animate: true, duration: 0.9 });
      prevRef.current = null;
    }
  }, [focusCoords, map]);

  return null;
}

// ---------------------------------------------------------------------------
// Main TacticalMap Component
// ---------------------------------------------------------------------------
export const TacticalMap: React.FC<TacticalMapProps> = ({
  drones,
  hexapods = [],
  triageEvents,
  pheromoneGrid,
  selectedDroneId,
  onSelectDrone,
  selectedHexapodId,
  onSelectHexapod,
  onResetFocus,
  selectedTriageId,
  onSelectTriage
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerKey>('GOOGLE_SATELLITE');
  const [showPheromones, setShowPheromones] = useState(true);
  const [showGeofence, setShowGeofence] = useState(true);
  const [showHexapods, setShowHexapods] = useState(true);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);

  const layer = MAP_LAYERS[activeLayer];

  const focusedDrone = drones.find(d => d.id === selectedDroneId);
  const focusedHexapod = hexapods.find(h => h.id === selectedHexapodId);
  const focusCoords: [number, number] | null = focusedDrone
    ? [focusedDrone.position.lat, focusedDrone.position.lng]
    : focusedHexapod
    ? [focusedHexapod.position.lat, focusedHexapod.position.lng]
    : null;

  const isUnitFocused = focusCoords !== null;
  const hexaCoords = hexapods.map(h => [h.position.lat, h.position.lng] as [number, number]);
  const hexaLoop = hexapods.length > 0 ? [...hexaCoords, hexaCoords[0]] : [];

  const layerOptions: { key: LayerKey; label: string; icon: string }[] = [
    { key: 'GOOGLE_SATELLITE', label: 'Google Satellite', icon: '🛰' },
    { key: 'GOOGLE_HYBRID',    label: 'Google Hybrid',    icon: '🗺' },
    { key: 'ESRI_SATELLITE',   label: 'ESRI Satellite',   icon: '📡' },
    { key: 'CARTODB_DARK',     label: 'Tactical Dark',    icon: '🌑' },
  ];

  return (
    <div
      className="relative w-full h-full flex flex-col rounded-xl overflow-hidden select-none"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#06080f' }}
    >

      {/* ── TOP HUD OVERLAY ── */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">

        {/* Left: Coordinates & Active Unit Indicator */}
        <div
          className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-2xl"
          style={{ background: 'rgba(4,6,12,0.94)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <Compass size={12} className="text-orange-400 animate-spin" style={{ animationDuration: '18s' }} />
          <span className="font-mono text-[10px] font-bold text-white">28.6139°N 77.2090°E</span>
          <span className="text-slate-700 text-xs">·</span>
          <span className="font-mono text-[10px] font-semibold text-orange-400">SECTOR 7-G · 120M</span>
          {isUnitFocused && (
            <span
              className="px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold animate-pulse ml-1"
              style={{ background: 'rgba(255,107,44,0.2)', color: '#ff6b2c', border: '1px solid rgba(255,107,44,0.5)' }}
            >
              ⊕ FOCUSED: {selectedDroneId || selectedHexapodId}
            </span>
          )}
        </div>

        {/* Right: Map Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">

          {/* Explicit Overview / Reset Button */}
          {isUnitFocused && onResetFocus && (
            <button
              onClick={onResetFocus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all shadow-lg"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.5)', backdropFilter: 'blur(12px)' }}
              title="Click or touch map outside to zoom out"
            >
              <ZoomOut size={11} />
              <span>ZOOM OUT</span>
            </button>
          )}

          {/* Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setLayerMenuOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all shadow-lg"
              style={{ background: 'rgba(255,107,44,0.12)', color: '#ff6b2c', border: '1px solid rgba(255,107,44,0.35)', backdropFilter: 'blur(12px)' }}
            >
              <Map size={11} />
              <span>{layerOptions.find(l => l.key === activeLayer)?.icon} {layerOptions.find(l => l.key === activeLayer)?.label.split(' ')[1]}</span>
            </button>
            {layerMenuOpen && (
              <div
                className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden shadow-2xl min-w-[160px] z-[1200]"
                style={{ background: 'rgba(8,10,18,0.98)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                {layerOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setActiveLayer(opt.key); setLayerMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 font-mono text-[10px] text-left transition-all hover:bg-white/5"
                    style={activeLayer === opt.key ? {
                      background: 'rgba(255,107,44,0.15)',
                      color: '#ff6b2c',
                    } : { color: '#94a3b8' }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                    {activeLayer === opt.key && <span className="ml-auto text-orange-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pheromone heatmap toggle */}
          <button
            onClick={() => setShowPheromones(s => !s)}
            className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-semibold transition-all shadow-lg"
            style={showPheromones
              ? { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.4)', backdropFilter: 'blur(12px)' }
              : { background: 'rgba(4,6,12,0.8)',      color: '#475569', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }
            }
          >PHM</button>

          {/* Laser Geofence toggle */}
          <button
            onClick={() => setShowGeofence(s => !s)}
            className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-semibold transition-all shadow-lg"
            style={showGeofence
              ? { background: 'rgba(6,182,212,0.15)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.4)', backdropFilter: 'blur(12px)' }
              : { background: 'rgba(4,6,12,0.8)',     color: '#475569', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }
            }
          >GEO</button>

        </div>
      </div>

      {/* ── LEAFLET INTERACTIVE MAP CANVAS ── */}
      <div className="flex-grow w-full h-full z-0">
        <MapContainer
          center={[28.61390, 77.20900]}
          zoom={18}
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#06080f' }}
        >
          <ZoomControl position="bottomright" />
          
          {/* Map View Controller for smooth flyTo zoom-in / fly-back zoom-out */}
          <MapViewController focusCoords={focusCoords} />

          {/* Map Click Handler — clicking outside any marker automatically zooms out */}
          <MapClickHandler onMapClick={onResetFocus} />

          <TileLayer
            key={activeLayer}
            url={layer.url}
            subdomains={layer.subdomains as any}
            maxZoom={layer.maxZoom}
            attribution={layer.attribution}
          />

          {/* Building footprint outline (120m x 120m structure) */}
          <Polygon
            positions={[
              [28.61450, 77.20840],
              [28.61450, 77.20960],
              [28.61330, 77.20960],
              [28.61330, 77.20840]
            ]}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.05, weight: 1.5, dashArray: '5 5' }}
          />

          {/* Critical collapse zone */}
          <Polygon
            positions={[
              [28.61440, 77.20860],
              [28.61440, 77.20940],
              [28.61390, 77.20940],
              [28.61390, 77.20860]
            ]}
            pathOptions={{ color: '#ef4444', fillColor: '#991b1b', fillOpacity: 0.18, weight: 1.5 }}
          />

          {/* Pheromone heatmap */}
          {showPheromones && pheromoneGrid.map((cell) => {
            const isHazard    = cell.slopeRiskLevel > 0.6;
            const isRecruit   = cell.recruitmentLevel > 0.4;
            const isSearched  = cell.coverageScore > 0.3;
            const fillColor   = isHazard ? '#dc2626' : isRecruit ? '#ff6b2c' : isSearched ? '#10b981' : 'transparent';
            const fillOpacity = isHazard ? 0.28 : isRecruit ? 0.32 : isSearched ? 0.1 : 0;
            if (fillOpacity === 0) return null;
            return (
              <Rectangle
                key={cell.cellId}
                bounds={[[cell.bounds.south, cell.bounds.west], [cell.bounds.north, cell.bounds.east]]}
                pathOptions={{ fillColor, fillOpacity, weight: 0.4, color: isHazard ? '#ef4444' : isRecruit ? '#ff6b2c' : '#334155', dashArray: isHazard ? '3 3' : undefined }}
              />
            );
          })}

          {/* Hexapod geofence laser polygon */}
          {showGeofence && hexaCoords.length > 2 && (
            <>
              <Polygon
                positions={hexaCoords}
                pathOptions={{ fillColor: '#06b6d4', fillOpacity: 0.06, color: '#06b6d4', weight: 1.2, dashArray: '6 5' }}
              />
              <Polyline
                positions={hexaLoop}
                pathOptions={{ color: '#22d3ee', weight: 2.0, opacity: 0.8 }}
              />
            </>
          )}

          {/* Ground Hexapods */}
          {showHexapods && hexapods.map((hexa) => (
            <Marker
              key={hexa.id}
              position={[hexa.position.lat, hexa.position.lng]}
              icon={createHexapodIcon(hexa, selectedHexapodId === hexa.id)}
              eventHandlers={{ 
                click: (e: any) => {
                  if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                  if (selectedHexapodId === hexa.id) { 
                    onResetFocus?.(); 
                  } else { 
                    onSelectHexapod?.(hexa.id); 
                  }
                }
              }}
            >
              <Popup className="custom-leaflet-popup" closeButton={false}>
                <div className="p-3 font-mono text-xs min-w-[210px] rounded-xl"
                  style={{ background: '#0a0d14', border: '1px solid rgba(6,182,212,0.4)', color: '#e2e8f0' }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="font-extrabold text-cyan-400">{hexa.id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: 'rgba(6,182,212,0.15)', color: '#67e8f9' }}
                    >{hexa.status}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>PWR: <strong className="text-emerald-400">{hexa.battery.level}%</strong> · STAB: <strong>{hexa.groundStabilityIndex}%</strong></div>
                    <div>VERTEX: <span className="text-slate-400">{hexa.perimeterVertexName}</span></div>
                    <div>SEISMIC: <span className="text-amber-400">{hexa.seismicAcoustic.vibrationMmS} mm/s</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Aerial Drones */}
          {drones.map((drone) => (
            <Marker
              key={drone.id}
              position={[drone.position.lat, drone.position.lng]}
              icon={createDroneIcon(drone, selectedDroneId === drone.id)}
              eventHandlers={{ 
                click: (e: any) => {
                  if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                  if (selectedDroneId === drone.id) { 
                    onResetFocus?.(); 
                  } else { 
                    onSelectDrone(drone.id); 
                  }
                }
              }}
            >
              <Popup className="custom-leaflet-popup" closeButton={false}>
                <div className="p-3 font-mono text-xs min-w-[230px] rounded-xl"
                  style={{ background: '#0a0d14', border: '1px solid rgba(255,107,44,0.4)', color: '#e2e8f0' }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-orange-400">{drone.id}</span>
                      <span className="text-[9px] text-slate-500">({drone.callsign})</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: 'rgba(255,107,44,0.15)', color: '#fb923c' }}
                    >{drone.status}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>ALT: <strong className="text-white">{drone.position.altitude}m</strong> · SPD: <strong>{drone.groundSpeed} m/s</strong></div>
                    <div>BATT: <strong className={drone.battery.level < 30 ? 'text-red-400' : 'text-emerald-400'}>{drone.battery.level}%</strong></div>
                    <div>ZONE: <span className="text-purple-300">{drone.zoneAssignment}</span></div>
                    <div className="text-[9.5px] text-slate-500 italic pt-0.5 truncate">{drone.perception.autonomousGoal}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Triage casualty markers */}
          {triageEvents.map((triage) => (
            <Marker
              key={triage.id}
              position={[triage.location.lat, triage.location.lng]}
              icon={createTriageIcon(triage, selectedTriageId === triage.id)}
              eventHandlers={{ 
                click: (e: any) => {
                  if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                  onSelectTriage(triage);
                }
              }}
            >
              <Popup className="custom-leaflet-popup" closeButton={false}>
                <div className="p-3 font-mono text-xs min-w-[220px] rounded-xl"
                  style={{ background: '#0a0d14', border: '1px solid rgba(239,68,68,0.4)', color: '#e2e8f0' }}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="font-extrabold text-red-400">{triage.id}</span>
                    <span className="font-bold text-[10px]" style={{ color: triage.rescueStatus === 'RESCUED' ? '#6ee7b7' : '#fbbf24' }}>{triage.rescueStatus}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>SEVERITY: <strong style={{ color: triage.severity === 'CRITICAL' ? '#f87171' : '#fbbf24' }}>{triage.severity}</strong></div>
                    <div>ZONE: <span className="text-amber-300">{triage.location.zone || triage.sector || 'Central Atrium'}</span></div>
                    <div>HR: <strong className="text-white">{triage.heartRateBpm || 112} BPM</strong> · TEMP: {triage.thermal?.bodyTemp ?? triage.thermalSignatureC ?? 37.1}°C</div>
                    <div>TRAPPED: <strong className="text-white">{triage.trappedPersonsCount || 1}</strong></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── BOTTOM STATUS RIBBON ── */}
      <div
        className="h-[26px] flex items-center justify-between px-4 font-mono text-[9px] select-none z-10 shrink-0"
        style={{ background: 'rgba(4,6,12,0.97)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            GEOFENCE ACTIVE · 120M
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-500">{drones.length} UAV · {hexapods.length} HEXA</span>
          {isUnitFocused && (
            <>
              <span className="text-slate-700">·</span>
              <span className="text-orange-400 font-bold">TOUCH MAP OUTSIDE TO ZOOM OUT</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-700">28.6139°N 77.2090°E</span>
          <span className="text-orange-400 font-semibold">● {layerOptions.find(l => l.key === activeLayer)?.label}</span>
        </div>
      </div>

    </div>
  );
};
