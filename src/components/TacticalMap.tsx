import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Rectangle, 
  Polygon, 
  Polyline, 
  CircleMarker, 
  ZoomControl,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { 
  DroneTelemetry, 
  HexapodTelemetry, 
  TriageEvent, 
  PheromoneCell, 
  MissionLocation,
  RescueRoute
} from '../types';
import { MISSION_LOCATIONS, INITIAL_RESCUE_ROUTES } from '../data/mockData';
import { 
  Compass, 
  ZoomOut, 
  Radio, 
  Layers, 
  Globe, 
  Moon, 
  Navigation, 
  Crosshair, 
  Route, 
  Eye, 
  Shield, 
  Activity 
} from 'lucide-react';

interface TacticalMapProps {
  drones: DroneTelemetry[];
  hexapods: HexapodTelemetry[];
  triageEvents: TriageEvent[];
  pheromoneGrid: PheromoneCell[];
  rescueRoutes?: RescueRoute[];
  currentLocation?: MissionLocation;
  onSelectLocation?: (location: MissionLocation) => void;
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
// 1. Drone Icon — Bold High-Contrast Tactical Stealth Quadcopter
// ---------------------------------------------------------------------------
function createDroneIcon(drone: DroneTelemetry, isSelected: boolean) {
  const isEngaged = drone.status === 'ENGAGED';
  const isLowBatt = drone.battery.level < 25;
  const isPerim   = drone.zoneAssignment === 'PERIMETER_RING';

  const color = isEngaged ? '#ef4444'
    : isLowBatt           ? '#f59e0b'
    : isPerim             ? '#0284c7'
    :                       '#ff6b2c';

  const size = isSelected ? 52 : 42;
  const half = size / 2;
  const unitCode = drone.id.replace('UAV-', 'UAV-');

  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <!-- Selected targeting bracket reticle -->
      ${isSelected ? `
        <div style="position:absolute;inset:-8px;border-radius:50%;border:1.5px dashed ${color};animation:spin 6s linear infinite;opacity:0.85;"></div>
        <div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};animation:casualtyPulse 2.5s ease-in-out infinite;opacity:0.7;"></div>
      ` : ''}

      <!-- Rotated Airframe Chassis -->
      <div style="position:relative;width:${size*0.75}px;height:${size*0.75}px;display:flex;align-items:center;justify-content:center;transform:rotate(${drone.heading}deg);transition:transform 0.15s linear;">
        <!-- Forward Directional Arrow / Chevron with glowing tip -->
        <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:7px solid ${color};filter:drop-shadow(0 0 5px ${color});"></div>

        <!-- High-contrast Heavy-duty Booms (X configuration) -->
        <div style="position:absolute;width:${size*0.72}px;height:3px;background:#080c14;border-radius:2px;transform:rotate(45deg);border:1px solid ${color};box-shadow:0 0 6px ${color}55;"></div>
        <div style="position:absolute;width:${size*0.72}px;height:3px;background:#080c14;border-radius:2px;transform:rotate(-45deg);border:1px solid ${color};box-shadow:0 0 6px ${color}55;"></div>

        <!-- 4 Spinning Rotor Pods with Aerodynamic Discs -->
        <div style="position:absolute;top:-2px;left:-2px;width:12px;height:12px;border-radius:50%;background:${color}25;border:1.5px solid ${color};box-shadow:0 0 8px ${color};">
          <div style="position:absolute;inset:1px;border-radius:50%;border:1px dashed ${color};animation:rotorSpin 0.25s linear infinite;"></div>
        </div>
        <div style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:${color}25;border:1.5px solid ${color};box-shadow:0 0 8px ${color};">
          <div style="position:absolute;inset:1px;border-radius:50%;border:1px dashed ${color};animation:rotorSpin 0.25s linear infinite;"></div>
        </div>
        <div style="position:absolute;bottom:-2px;left:-2px;width:12px;height:12px;border-radius:50%;background:${color}25;border:1.5px solid ${color};box-shadow:0 0 8px ${color};">
          <div style="position:absolute;inset:1px;border-radius:50%;border:1px dashed ${color};animation:rotorSpin 0.25s linear infinite;"></div>
        </div>
        <div style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:${color}25;border:1.5px solid ${color};box-shadow:0 0 8px ${color};">
          <div style="position:absolute;inset:1px;border-radius:50%;border:1px dashed ${color};animation:rotorSpin 0.25s linear infinite;"></div>
        </div>

        <!-- Central Stealth Fuselage Avionics Hub -->
        <div style="width:13px;height:13px;border-radius:3px;background:radial-gradient(circle, #1a2234 0%, #080a10 100%);border:1.5px solid ${color};box-shadow:0 0 10px ${color};display:flex;align-items:center;justify-content:center;">
          <div style="width:5px;height:5px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color};"></div>
        </div>
      </div>

      <!-- On-Hover Tactical Name Tag (Smoothly pops in only when cursor hovers over unit) -->
      <div class="tactical-hover-tag" style="position:absolute;top:100%;margin-top:7px;left:50%;transform:translateX(-50%);background:rgba(4,8,18,0.96);border:1.5px solid ${color};border-radius:5px;padding:2px 7px;box-shadow:0 0 14px ${color}88, 0 3px 10px rgba(0,0,0,0.9);white-space:nowrap;pointer-events:none;z-index:9999;">
        <span style="font-family:monospace;font-size:8.5px;font-weight:900;color:#ffffff;letter-spacing:0.04em;">${drone.id}</span>
        <span style="font-family:monospace;font-size:7.5px;font-weight:700;color:${color};margin-left:4px;">${drone.callsign}</span>
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
  const color = hexa.status === 'ANCHORED' ? '#c084fc' : '#a855f7';
  const size = isSelected ? 46 : 38;
  const half = size / 2;
  const unitCode = hexa.id.replace('HEXA-', 'HEX-');

  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      ${isSelected ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:1.5px solid ${color};animation:casualtyPulse 2.5s ease-in-out infinite;opacity:0.8;"></div>` : ''}
      <div style="position:relative;width:${size*0.75}px;height:${size*0.75}px;display:flex;align-items:center;justify-content:center;transform:rotate(${hexa.heading}deg);transition:transform 0.15s linear;">
        <div style="position:absolute;width:${size*0.78}px;height:2px;background:${color};border-radius:2px;transform:rotate(30deg);box-shadow:0 0 6px ${color};"></div>
        <div style="position:absolute;width:${size*0.78}px;height:2px;background:${color};border-radius:2px;transform:rotate(90deg);box-shadow:0 0 6px ${color};"></div>
        <div style="position:absolute;width:${size*0.78}px;height:2px;background:${color};border-radius:2px;transform:rotate(150deg);box-shadow:0 0 6px ${color};"></div>
        <div style="width:13px;height:13px;border-radius:3px;background:rgba(22,10,36,0.98);border:1.5px solid ${color};box-shadow:0 0 8px ${color};display:flex;align-items:center;justify-content:center;">
          <div style="width:5px;height:5px;border-radius:50%;background:${color};box-shadow:0 0 5px ${color};"></div>
        </div>
      </div>

      <!-- On-Hover Tactical Name Tag -->
      <div class="tactical-hover-tag" style="position:absolute;top:100%;margin-top:7px;left:50%;transform:translateX(-50%);background:rgba(4,8,18,0.96);border:1.5px solid ${color};border-radius:5px;padding:2px 7px;box-shadow:0 0 14px ${color}88, 0 3px 10px rgba(0,0,0,0.9);white-space:nowrap;pointer-events:none;z-index:9999;">
        <span style="font-family:monospace;font-size:8.5px;font-weight:900;color:#ffffff;letter-spacing:0.04em;">${hexa.id}</span>
        <span style="font-family:monospace;font-size:7.5px;font-weight:700;color:${color};margin-left:4px;">${hexa.callsign}</span>
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
// 3. Triage Casualty Icon — Calm Slow Sonar Pulse (3.5s) & Medical Cross
// ---------------------------------------------------------------------------
function createTriageIcon(triage: TriageEvent, isSelected: boolean) {
  const rescued  = triage.rescueStatus === 'RESCUED';
  const critical = triage.severity === 'CRITICAL';
  const color    = rescued ? '#10b981' : critical ? '#ef4444' : '#f59e0b';
  const size = isSelected ? 38 : 32;
  const half = size / 2;

  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <!-- Calm slow breathing sonar pulse -->
      ${!rescued ? `
        <div style="position:absolute;inset:-8px;border-radius:50%;border:1.5px solid ${color};opacity:0.5;animation:casualtyPulse 3.5s ease-in-out infinite;"></div>
        <div style="position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:0.2;animation:casualtyPulse 3.5s ease-in-out infinite;animation-delay:0.7s;"></div>
      ` : ''}
      <div style="width:${size*0.75}px;height:${size*0.75}px;border-radius:50%;background:#090d16;border:2px solid ${color};box-shadow:0 0 12px ${color};display:flex;align-items:center;justify-content:center;">
        <span style="font-size:10px;font-weight:900;color:${color};font-family:monospace;">${rescued ? '✓' : '✚'}</span>
      </div>

      <!-- On-Hover Casualty Tag -->
      <div class="tactical-hover-tag" style="position:absolute;top:100%;margin-top:7px;left:50%;transform:translateX(-50%);background:rgba(4,8,18,0.96);border:1.5px solid ${color};border-radius:5px;padding:2px 7px;box-shadow:0 0 14px ${color}88, 0 3px 10px rgba(0,0,0,0.9);white-space:nowrap;pointer-events:none;z-index:9999;">
        <span style="font-family:monospace;font-size:8.5px;font-weight:900;color:#ffffff;">${triage.victimCallsign || triage.id}</span>
        <span style="font-family:monospace;font-size:7.5px;font-weight:800;color:${color};margin-left:4px;">${triage.severity}</span>
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
// 4. Drone FOV Fan Polygon Calculator
// ---------------------------------------------------------------------------
function calculateDroneFov(drone: DroneTelemetry): [number, number][] {
  const lat = drone.position.lat;
  const lng = drone.position.lng;
  const headingRad = (drone.heading * Math.PI) / 180;
  const fovSpread = (27 * Math.PI) / 180; // ±27° (54° wide camera FOV)
  const range = 0.00038; // ~42 meters ground cone

  const leftAngle = headingRad - fovSpread;
  const rightAngle = headingRad + fovSpread;

  const p0: [number, number] = [lat, lng];
  const pLeft: [number, number] = [
    lat + range * Math.cos(leftAngle),
    lng + range * 1.15 * Math.sin(leftAngle)
  ];
  const pCenterArc: [number, number] = [
    lat + range * 1.18 * Math.cos(headingRad),
    lng + range * 1.35 * Math.sin(headingRad)
  ];
  const pRight: [number, number] = [
    lat + range * Math.cos(rightAngle),
    lng + range * 1.15 * Math.sin(rightAngle)
  ];

  return [p0, pLeft, pCenterArc, pRight, p0];
}

// ---------------------------------------------------------------------------
// Map Click Handler — click outside markers to reset zoom
// ---------------------------------------------------------------------------
function MapClickHandler({ onMapClick }: { onMapClick?: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick?.();
    },
    popupclose: () => {
      onMapClick?.();
    }
  });
  return null;
}

// ---------------------------------------------------------------------------
// Map View Controller — smooth flyTo on select, flyBack on deselect
// ---------------------------------------------------------------------------
function MapViewController({ 
  focusCoords, 
  centerCoords 
}: { 
  focusCoords: [number, number] | null; 
  centerCoords: [number, number]; 
}) {
  const map = useMap();
  const prevFocusRef = useRef<[number, number] | null>(null);
  const prevCenterRef = useRef<[number, number]>(centerCoords);

  useEffect(() => {
    if (centerCoords[0] !== prevCenterRef.current[0] || centerCoords[1] !== prevCenterRef.current[1]) {
      map.flyTo(centerCoords, 18, { animate: true, duration: 1.2 });
      prevCenterRef.current = centerCoords;
    }
  }, [centerCoords, map]);

  useEffect(() => {
    if (focusCoords) {
      map.flyTo(focusCoords, 20.5, { animate: true, duration: 1.0 });
      prevFocusRef.current = focusCoords;
    } else if (prevFocusRef.current !== null) {
      map.flyTo(centerCoords, 18, { animate: true, duration: 0.9 });
      prevFocusRef.current = null;
    }
  }, [focusCoords, centerCoords, map]);

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
  rescueRoutes = INITIAL_RESCUE_ROUTES,
  currentLocation = MISSION_LOCATIONS[0],
  onSelectLocation,
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
  const [showFov, setShowFov] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showRescueRoutes, setShowRescueRoutes] = useState(true);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  // Drone historical flight trails
  const [droneTrails, setDroneTrails] = useState<Record<string, [number, number][]>>({});

  useEffect(() => {
    setDroneTrails(prev => {
      const next = { ...prev };
      drones.forEach(d => {
        const currentPos: [number, number] = [d.position.lat, d.position.lng];
        const existing = next[d.id] || [];
        const last = existing[existing.length - 1];
        if (!last || Math.hypot(last[0] - currentPos[0], last[1] - currentPos[1]) > 0.000015) {
          const updated = [...existing, currentPos];
          if (updated.length > 22) {
            updated.shift();
          }
          next[d.id] = updated;
        }
      });
      return next;
    });
  }, [drones]);

  const activeCenterCoords: [number, number] = [currentLocation.center.lat, currentLocation.center.lng];
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

  const layerOptions: { key: LayerKey; label: string; icon: React.ReactNode }[] = [
    { key: 'GOOGLE_SATELLITE', label: 'Google Satellite', icon: <Radio size={12} className="text-orange-400" /> },
    { key: 'GOOGLE_HYBRID',    label: 'Google Hybrid',    icon: <Layers size={12} className="text-cyan-400" /> },
    { key: 'ESRI_SATELLITE',   label: 'ESRI Satellite',   icon: <Globe size={12} className="text-emerald-400" /> },
    { key: 'CARTODB_DARK',     label: 'Tactical Dark',    icon: <Moon size={12} className="text-purple-400" /> },
  ];

  // Unit click handlers with toggle zoom-in / zoom-out behavior
  const handleDroneClick = (droneId: string) => {
    if (selectedDroneId === droneId) {
      onResetFocus?.();
    } else {
      onSelectDrone(droneId);
    }
  };

  const handleHexapodClick = (hexapodId: string) => {
    if (selectedHexapodId === hexapodId) {
      onResetFocus?.();
    } else {
      onSelectHexapod?.(hexapodId);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col rounded-xl overflow-hidden select-none"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#06080f' }}
    >
      {/* ── TOP HUD OVERLAY ── */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] flex items-center justify-between pointer-events-none">

        {/* ── LEFT: Unified Geodetic & Target Location Capsule ── */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#04060e]/92 border border-white/10 backdrop-blur-xl shadow-2xl">
          <Compass size={13} className="text-orange-400 animate-spin" style={{ animationDuration: '24s' }} />
          <span className="font-mono text-[10.5px] font-bold text-slate-100">
            {currentLocation.center.lat.toFixed(4)}°N {currentLocation.center.lng.toFixed(4)}°E
          </span>
          <span className="text-slate-600 text-xs">|</span>

          {/* Target Location Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setLocationMenuOpen(o => !o); setLayerMenuOpen(false); }}
              className="flex items-center gap-1.5 text-[10.5px] font-bold text-orange-400 hover:text-orange-300 font-mono transition-colors"
              title="Click to switch Mission Target Building / AO"
            >
              <Navigation size={11} className="text-orange-400" />
              <span className="max-w-[140px] truncate">{currentLocation.shortName}</span>
              <span className="text-[7.5px] text-slate-400">▼</span>
            </button>

            {locationMenuOpen && (
              <div
                className="absolute top-full left-0 mt-2 rounded-xl overflow-hidden shadow-2xl min-w-[270px] z-[1200] flex flex-col font-mono text-xs bg-[#070912]/98 border border-orange-500/35 backdrop-blur-2xl"
              >
                <div className="px-3 py-1.5 text-[8.5px] font-bold text-slate-300 uppercase tracking-widest border-b border-white/10">
                  Select Mission Target Building / AO
                </div>
                {MISSION_LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation?.(loc);
                      setLocationMenuOpen(false);
                    }}
                    className="w-full flex flex-col items-start px-3 py-2 text-left transition-all hover:bg-white/10"
                    style={currentLocation.id === loc.id ? {
                      background: 'rgba(255,107,44,0.18)',
                      color: '#ff6b2c',
                    } : { color: '#cbd5e1' }}
                  >
                    <div className="flex items-center w-full justify-between">
                      <span className="font-bold text-[11px] text-white">{loc.name}</span>
                      {currentLocation.id === loc.id && <span className="text-orange-400 text-[9px] font-bold">✓ ACTIVE</span>}
                    </div>
                    <span className="text-[9.5px] text-slate-300 mt-0.5">{loc.subtitle}</span>
                    <span className="text-[8.5px] text-slate-400 font-mono mt-0.5">
                      {loc.center.lat.toFixed(5)}°N, {loc.center.lng.toFixed(5)}°E
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Focused Unit Chip */}
          {isUnitFocused && (
            <div className="flex items-center gap-1.5 ml-0.5 px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/50 font-mono text-[9px] font-extrabold text-orange-400 animate-pulse">
              <span>⊕ {selectedDroneId || selectedHexapodId}</span>
              <button onClick={onResetFocus} className="hover:text-white text-[10px] ml-0.5" title="Reset view">✕</button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Proportional Consolidated Controls ── */}
        <div className="pointer-events-auto flex items-center gap-2">

          {/* Overview / Zoom Out Button (Visible when focused) */}
          {isUnitFocused && onResetFocus && (
            <button
              onClick={onResetFocus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/50 backdrop-blur-xl hover:bg-rose-500/30 transition-all shadow-lg"
              title="Reset focus and zoom out to mission overview"
            >
              <ZoomOut size={12} />
              <span>OVERVIEW</span>
            </button>
          )}

          {/* Basemap Selector Pill */}
          <div className="relative">
            <button
              onClick={() => { setLayerMenuOpen(o => !o); setLocationMenuOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10.5px] font-bold text-slate-100 bg-[#04060e]/92 border border-white/10 backdrop-blur-xl hover:border-white/25 transition-all shadow-xl"
              title="Change satellite imagery layer"
            >
              {layerOptions.find(l => l.key === activeLayer)?.icon}
              <span>{layerOptions.find(l => l.key === activeLayer)?.label.split(' ')[1]}</span>
              <span className="text-[7.5px] text-slate-400">▼</span>
            </button>

            {layerMenuOpen && (
              <div
                className="absolute top-full right-0 mt-2 rounded-xl overflow-hidden shadow-2xl min-w-[170px] z-[1200] bg-[#070912]/98 border border-white/15 backdrop-blur-2xl"
              >
                {layerOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setActiveLayer(opt.key); setLayerMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 font-mono text-[10.5px] font-semibold text-left transition-all hover:bg-white/10"
                    style={activeLayer === opt.key ? {
                      background: 'rgba(255,107,44,0.18)',
                      color: '#ff6b2c',
                    } : { color: '#cbd5e1' }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                    {activeLayer === opt.key && <span className="ml-auto text-orange-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Consolidated Segmented Overlays Control Bar */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#04060e]/92 border border-white/10 backdrop-blur-xl shadow-2xl font-mono text-[9.5px]">
            {/* Routes */}
            <button
              onClick={() => setShowRescueRoutes(s => !s)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                showRescueRoutes
                  ? 'bg-emerald-600/25 text-emerald-400 shadow-sm border border-emerald-600/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Ground Rescue Routes"
            >
              <Route size={10} />
              <span>Routes</span>
            </button>

            {/* Drone FOV */}
            <button
              onClick={() => setShowFov(s => !s)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                showFov
                  ? 'bg-orange-500/25 text-orange-300 shadow-sm border border-orange-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Drone Sensor FOV Beams"
            >
              <Eye size={10} />
              <span>FOV</span>
            </button>

            {/* Flight Trails */}
            <button
              onClick={() => setShowTrails(s => !s)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                showTrails
                  ? 'bg-sky-500/25 text-sky-300 shadow-sm border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Flight Path Trails"
            >
              <Activity size={10} />
              <span>Trails</span>
            </button>

            {/* Pheromone Heatmap */}
            <button
              onClick={() => setShowPheromones(s => !s)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                showPheromones
                  ? 'bg-yellow-500/25 text-yellow-300 shadow-sm border border-yellow-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Pheromone Coverage Grid"
            >
              <Layers size={10} />
              <span>Grid</span>
            </button>

            {/* Geofence */}
            <button
              onClick={() => setShowGeofence(s => !s)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                showGeofence
                  ? 'bg-fuchsia-500/25 text-fuchsia-300 shadow-sm border border-fuchsia-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle 6-Node Laser Perimeter Geofence"
            >
              <Shield size={10} />
              <span>Geofence</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── LEAFLET INTERACTIVE MAP CANVAS ── */}
      <div className="flex-grow w-full h-full z-0">
        <MapContainer
          center={activeCenterCoords}
          zoom={currentLocation.defaultZoom || 18}
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#06080f' }}
        >
          <ZoomControl position="bottomright" />
          
          {/* Map View Controller for smooth flyTo zoom-in / fly-back zoom-out */}
          <MapViewController focusCoords={focusCoords} centerCoords={activeCenterCoords} />

          {/* Map Click Handler — clicking outside any marker automatically zooms out */}
          <MapClickHandler onMapClick={onResetFocus} />

          {/* Active Map Tile Layer */}
          <TileLayer
            key={activeLayer}
            url={layer.url}
            maxZoom={layer.maxZoom}
            attribution={layer.attribution}
          />

          {/* ══════════════════════════════════════════════════════ */}
          {/* A. 6-NODE IRREGULAR OPTICAL LASER GEOFENCE PERIMETER  */}
          {/* ══════════════════════════════════════════════════════ */}
          {showGeofence && hexapods.length >= 6 && (
            <>
              {/* Semi-transparent Irregular Polygon Zone Fill */}
              <Polygon
                positions={hexaCoords}
                pathOptions={{
                  color: '#a855f7',
                  fillColor: '#8b5cf6',
                  fillOpacity: 0.16,
                  weight: 2.0,
                  dashArray: '5, 5',
                }}
              />

              {/* Optical Laser Boundary Beam connecting the 6 nodes */}
              <Polyline
                positions={hexaLoop}
                pathOptions={{
                  color: '#c084fc',
                  weight: 2.8,
                  opacity: 0.95,
                  dashArray: '8, 6',
                }}
              />
            </>
          )}

          {/* ══════════════════════════════════════════════════════ */}
          {/* B. OPTIMAL RESCUE INGRESS EXTRACTION CORRIDORS        */}
          {/* High-visibility multi-layer tactical glow vector     */}
          {/* ══════════════════════════════════════════════════════ */}
          {showRescueRoutes && rescueRoutes.map(route => {
            const isSelected = selectedTriageId === route.triageId;
            const isHazardous = route.status === 'HAZARDOUS';
            const glowColor = isHazardous ? '#d97706' : '#059669';
            const coreColor = isHazardous ? '#f59e0b' : '#10b981';



            return (
              <React.Fragment key={`rescue-route-${route.triageId}`}>
                {/* 1. Black High-Contrast Backdrop Line (Prevents washing out against roofs/roads) */}
                <Polyline
                  positions={route.waypoints}
                  pathOptions={{
                    color: '#000000',
                    weight: isSelected ? 10 : 8,
                    opacity: 0.95,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />

                {/* 2. Fluorescent Neon Outer Glow Ribbon */}
                <Polyline
                  positions={route.waypoints}
                  pathOptions={{
                    color: glowColor,
                    weight: isSelected ? 7 : 5.5,
                    opacity: isSelected ? 0.95 : 0.8,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />

                {/* 3. Luminous High-Intensity Core Dashed Line */}
                <Polyline
                  positions={route.waypoints}
                  pathOptions={{
                    color: '#ffffff',
                    weight: isSelected ? 3.2 : 2.5,
                    opacity: 1.0,
                    dashArray: '7, 9',
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                >
                  <Popup>
                    <div className="p-2.5 font-mono text-xs bg-[#070b14] text-white rounded-lg border border-emerald-400/50 shadow-2xl min-w-[220px]">
                      <div className="font-extrabold text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-white/10">
                        <span className="text-sm">➔</span>
                        <span>OPTIMAL EXTRACTION ROUTE</span>
                      </div>
                      <div className="text-[11px] font-bold text-white mt-1.5">{route.victimCallsign} ({route.triageId})</div>
                      <div className="text-[10px] text-slate-300 mt-0.5">Ingress: {route.ingressPointName}</div>
                      <div className="text-[10px] text-slate-300">Total Distance: <span className="font-bold text-emerald-300">{route.totalDistanceM}m</span></div>
                      <div className="text-[10px] text-slate-300">Est. Transit: <span className="font-bold text-white">{route.estimatedTransitTimeMin} min</span></div>
                      <div className="text-[10px] text-emerald-400 font-extrabold mt-0.5">Passage Clearance: {route.clearancePct}%</div>
                      <div className="text-[9.5px] text-slate-400 mt-1 border-t border-white/5 pt-1">Assigned: {route.recommendedTeam}</div>
                    </div>
                  </Popup>
                </Polyline>

                {/* 4. Waypoint Turn Junction Rings along the corridor */}
                {route.waypoints.slice(1, -1).map((pt, wpIdx) => (
                  <CircleMarker
                    key={`wp-turn-${route.triageId}-${wpIdx}`}
                    center={pt}
                    radius={isSelected ? 4 : 3}
                    pathOptions={{
                      color: '#ffffff',
                      fillColor: coreColor,
                      fillOpacity: 1,
                      weight: 1.5
                    }}
                  />
                ))}

                {/* 5. Ingress Staging & Route Clearance Pill (Positioned OUTSIDE the geofence perimeter) */}
                <Marker
                  position={route.ingressCoords}
                  icon={L.divIcon({
                    html: `
                      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(4,8,18,0.96);border:1.5px solid ${glowColor};border-radius:20px;padding:3px 10px;box-shadow:0 0 16px ${glowColor}77, 0 4px 12px rgba(0,0,0,0.9);white-space:nowrap;width:max-content;cursor:pointer;">
                        <span style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:${glowColor}25;color:${glowColor};font-size:9px;font-weight:900;">➔</span>
                        <span style="font-family:monospace;font-size:8.5px;font-weight:900;color:#ffffff;letter-spacing:0.04em;">ROUTE ${route.triageId.replace('TRI-', '')}</span>
                        <span style="font-family:monospace;font-size:8px;font-weight:800;color:${coreColor};background:${coreColor}22;border:1px solid ${coreColor}55;padding:1px 5px;border-radius:10px;">${route.clearancePct}% CLEAR</span>
                        <span style="font-family:monospace;font-size:7.5px;font-weight:700;color:#94a3b8;">${route.totalDistanceM}M</span>
                      </div>
                    `,
                    className: 'tactical-ingress-pill',
                    iconSize: [210, 24],
                    iconAnchor: [105, 12]
                  })}
                  eventHandlers={{
                    click: () => {
                      const casualty = triageEvents.find(t => t.id === route.triageId);
                      if (casualty) onSelectTriage(casualty);
                    }
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* ══════════════════════════════════════════════════════ */}
          {/* C. 8x8 STIGMERGIC PHEROMONE HEATMAP CELLS             */}
          {/* ══════════════════════════════════════════════════════ */}
          {showPheromones && pheromoneGrid.map(cell => {
            const { bounds, coverageScore } = cell;
            // Entire grid uniformly styled in sleek tactical cyber yellow with lowered translucent opacity
            const fillColor = '#eab308';
            const fillOpacity = Math.min(0.16, Math.max(0.04, coverageScore * 0.14));

            return (
              <Rectangle
                key={cell.cellId}
                bounds={[
                  [bounds.south, bounds.west],
                  [bounds.north, bounds.east]
                ]}
                pathOptions={{
                  fillColor,
                  fillOpacity,
                  weight: 0.75,
                  color: '#eab308',
                  opacity: 0.22
                }}
              />
            );
          })}

          {/* ══════════════════════════════════════════════════════ */}
          {/* D. DRONE FLIGHT TRAILS & FOV CONES                    */}
          {/* ══════════════════════════════════════════════════════ */}
          {showTrails && drones.map(d => {
            const trail = droneTrails[d.id];
            if (!trail || trail.length < 2) return null;
            const isSelected = selectedDroneId === d.id;
            const color = d.status === 'ENGAGED' ? '#ef4444' : d.zoneAssignment === 'PERIMETER_RING' ? '#0284c7' : '#ff6b2c';
            return (
              <Polyline
                key={`trail-${d.id}`}
                positions={trail}
                pathOptions={{
                  color,
                  weight: isSelected ? 2.8 : 1.6,
                  opacity: isSelected ? 0.85 : 0.45,
                  dashArray: isSelected ? '4, 4' : '2, 5',
                }}
              />
            );
          })}

          {showFov && drones.map(d => {
            const fovCoords = calculateDroneFov(d);
            const isSelected = selectedDroneId === d.id;
            const color = d.status === 'ENGAGED' ? '#ef4444' : d.zoneAssignment === 'PERIMETER_RING' ? '#0284c7' : '#ff6b2c';

            return (
              <Polygon
                key={`fov-${d.id}`}
                positions={fovCoords}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.22 : 0.10,
                  weight: 1,
                  dashArray: '2, 3'
                }}
              />
            );
          })}

          {/* ══════════════════════════════════════════════════════ */}
          {/* E. CASUALTY TRIAGE MARKERS                            */}
          {/* ══════════════════════════════════════════════════════ */}
          {triageEvents.map(triage => (
            <Marker
              key={triage.id}
              position={[triage.location.lat, triage.location.lng]}
              icon={createTriageIcon(triage, selectedTriageId === triage.id)}
              eventHandlers={{
                click: () => onSelectTriage(triage)
              }}
            >
              <Popup>
                <div className="p-2.5 font-mono text-xs bg-[#090c15] text-white rounded border border-orange-500/40 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
                    <span className="font-extrabold text-orange-400">{triage.victimCallsign || triage.id}</span>
                    <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded ${triage.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {triage.severity}
                    </span>
                  </div>
                  <div className="text-slate-200 text-[10px] font-semibold">{triage.location.zone}</div>
                  <div className="text-slate-300 text-[9.5px] mt-1">Status: <span className="text-emerald-400 font-bold">{triage.rescueStatus}</span></div>
                  <div className="text-slate-300 text-[9.5px]">Thermal Diff: +{triage.thermal?.differential || 21.5}°C</div>
                  <div className="text-slate-300 text-[9.5px]">Heart Rate: {triage.heartRateBpm || 104} BPM</div>
                  <div className="text-slate-300 text-[9.5px] mt-1">{triage.recommendedAction}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ══════════════════════════════════════════════════════ */}
          {/* F. GROUND HEXAPOD ROBOT ANCHORS                       */}
          {/* ══════════════════════════════════════════════════════ */}
          {hexapods.map(hexa => (
            <Marker
              key={hexa.id}
              position={[hexa.position.lat, hexa.position.lng]}
              icon={createHexapodIcon(hexa, selectedHexapodId === hexa.id)}
              eventHandlers={{
                click: () => handleHexapodClick(hexa.id)
              }}
            >
              <Popup>
                <div className="p-2 font-mono text-xs bg-[#080b14] text-white rounded border border-cyan-500/40">
                  <div className="font-bold text-cyan-400">{hexa.callsign} ({hexa.id})</div>
                  <div className="text-[10px] text-slate-200 font-medium">{hexa.perimeterVertexName}</div>
                  <div className="text-[10px] text-slate-300 mt-1">Status: {hexa.status} · Battery: {Math.round(hexa.battery.level)}%</div>
                  <div className="text-[10px] text-slate-300">Soil Stability: {hexa.groundStabilityIndex}% · Slope: {hexa.position.terrainSlopeDeg}°</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ══════════════════════════════════════════════════════ */}
          {/* G. 10 AUTONOMOUS AERIAL SWARM UAVs                    */}
          {/* ══════════════════════════════════════════════════════ */}
          {drones.map(drone => (
            <Marker
              key={drone.id}
              position={[drone.position.lat, drone.position.lng]}
              icon={createDroneIcon(drone, selectedDroneId === drone.id)}
              eventHandlers={{
                click: () => handleDroneClick(drone.id)
              }}
            >
              <Popup>
                <div className="p-2 font-mono text-xs bg-[#080b14] text-white rounded border border-orange-500/40">
                  <div className="font-bold text-orange-400">{drone.callsign} ({drone.id})</div>
                  <div className="text-[10px] text-slate-200 font-semibold">{drone.perception.autonomousGoal}</div>
                  <div className="text-[10px] text-slate-300 mt-1">Altitude: {Math.round(drone.position.altitude)}m AGL · Speed: {drone.groundSpeed.toFixed(1)} m/s</div>
                  <div className="text-[10px] text-slate-300">Battery: {Math.round(drone.battery.level)}% · Link RSSI: {drone.link.rssi} dBm</div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>

      {/* ── DOCKED LIVE UNIT TELEMETRY DOSSIER (Shows when unit is clicked) ── */}
      {isUnitFocused && (focusedDrone || focusedHexapod) && (
        <div
          className="absolute bottom-4 left-4 z-[1000] p-3 rounded-2xl bg-[#04060f]/95 border border-orange-500/40 backdrop-blur-2xl shadow-2xl min-w-[280px] max-w-[340px] font-mono select-text pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{ boxShadow: '0 0 30px rgba(0,0,0,0.85), 0 0 15px rgba(255,107,44,0.2)' }}
        >
          {focusedDrone && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="font-extrabold text-sm text-white">{focusedDrone.id}</span>
                  <span className="text-[10px] text-orange-400 font-bold px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/40">
                    {focusedDrone.callsign}
                  </span>
                </div>
                <button
                  onClick={onResetFocus}
                  className="w-5 h-5 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs"
                  title="Close & Zoom Out"
                >
                  ✕
                </button>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-3 gap-1.5 text-center mb-2">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[7.5px] text-slate-400 font-bold uppercase">Altitude</div>
                  <div className="text-[11px] font-extrabold text-slate-100">{Math.round(focusedDrone.position.altitude)}m AGL</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[7.5px] text-slate-400 font-bold uppercase">Speed</div>
                  <div className="text-[11px] font-extrabold text-cyan-400">{focusedDrone.groundSpeed.toFixed(1)} m/s</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[7.5px] text-slate-400 font-bold uppercase">Battery</div>
                  <div className={`text-[11px] font-extrabold ${focusedDrone.battery.level < 25 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Math.round(focusedDrone.battery.level)}%
                  </div>
                </div>
              </div>

              {/* Mission Goal */}
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/25 mb-2">
                <div className="text-[7.5px] text-orange-400 font-extrabold uppercase tracking-wider mb-0.5">Autonomous Mission Goal</div>
                <div className="text-[9.5px] text-slate-200 leading-snug font-medium">
                  {focusedDrone.perception.autonomousGoal}
                </div>
              </div>

              {/* Footer details */}
              <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1 border-t border-white/5">
                <span>RSSI: {focusedDrone.link.rssi} dBm</span>
                <span>ZONE: {focusedDrone.zoneAssignment}</span>
                <span className="text-emerald-400 font-bold">STATUS: {focusedDrone.status}</span>
              </div>
            </div>
          )}

          {focusedHexapod && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="font-extrabold text-sm text-white">{focusedHexapod.id}</span>
                  <span className="text-[10px] text-purple-300 font-bold px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40">
                    {focusedHexapod.callsign}
                  </span>
                </div>
                <button
                  onClick={onResetFocus}
                  className="w-5 h-5 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs"
                  title="Close & Zoom Out"
                >
                  ✕
                </button>
              </div>

              {/* Vertex & Anchor */}
              <div className="text-[10px] text-slate-200 font-semibold mb-2">
                {focusedHexapod.perimeterVertexName}
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-3 gap-1.5 text-center mb-2">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[7.5px] text-slate-400 font-bold uppercase">Stability</div>
                  <div className="text-[11px] font-extrabold text-emerald-400">{focusedHexapod.groundStabilityIndex}%</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[7.5px] text-slate-400 font-bold uppercase">Slope</div>
                  <div className="text-[11px] font-extrabold text-slate-100">{focusedHexapod.position.terrainSlopeDeg}°</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[7.5px] text-slate-400 font-bold uppercase">Battery</div>
                  <div className="text-[11px] font-extrabold text-cyan-400">{Math.round(focusedHexapod.battery.level)}%</div>
                </div>
              </div>

              {/* Laser Status */}
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-[8.5px] text-slate-200">
                Laser Range: {focusedHexapod.geofenceLaser.laserRangeM}m · Gait: {focusedHexapod.gaitMode}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
