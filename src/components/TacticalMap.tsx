import React, { useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Rectangle, 
  Polygon, 
  Polyline, 
  ZoomControl 
} from 'react-leaflet';
import L from 'leaflet';
import { DroneTelemetry, HexapodTelemetry, TriageEvent, PheromoneCell } from '../types';
import { 
  Layers, 
  Compass, 
  MapPin, 
  Shield, 
  Radio, 
  Heart, 
  Navigation, 
  Activity, 
  Gauge, 
  Maximize2,
  Minimize2,
  CheckCircle2,
  Send,
  Sparkles,
  Mountain,
  AlertTriangle,
  Zap,
  Target,
  Eye
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
  selectedTriageId: string | null;
  onSelectTriage: (triage: TriageEvent) => void;
  onDispatchMedicalDrone?: (victimId: string) => void;
  onDispatchHexapodInfiltration?: (victimId: string, hexapodId: string) => void;
}

// Map Tile Layers
const MAP_LAYERS = {
  CARTODB_DARK: {
    id: 'CARTODB_DARK',
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 20,
    attribution: '&copy; CartoDB'
  },
  ESRI_SATELLITE: {
    id: 'ESRI_SATELLITE',
    name: 'Satellite Photoreal',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server'],
    maxZoom: 19,
    attribution: '&copy; Esri World Imagery'
  },
  CARTODB_VOYAGER: {
    id: 'CARTODB_VOYAGER',
    name: 'High-Contrast Topo',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '&copy; CartoDB Voyager'
  }
};

// 1. Realistic Quadcopter Marker with Zone Badging (Interior vs Perimeter)
function createRealisticDroneIcon(drone: DroneTelemetry, isSelected: boolean) {
  const isEngaged = drone.status === 'ENGAGED';
  const isLowBatt = drone.battery.level < 25;
  const isPerimeter = drone.zoneAssignment === 'PERIMETER_RING';
  
  const primaryColor = isEngaged ? '#ff4b1f' : isLowBatt ? '#f59e0b' : isPerimeter ? '#a855f7' : '#ff6b2c';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer select-none" style="width: 76px; height: 76px;">
      ${isSelected ? `
        <div class="absolute inset-0 rounded-full border-2 border-[#ff6b2c] animate-ping opacity-60"></div>
        <div class="absolute inset-[-4px] rounded-full border border-dashed border-orange-400 animate-spin" style="animation-duration: 8s;"></div>
      ` : ''}

      <div class="relative w-12 h-12 flex items-center justify-center transition-transform duration-300" style="transform: rotate(${drone.heading}deg);">
        <!-- Heading Vector -->
        <div class="absolute -top-3.5 w-1.5 h-3.5 rounded-full shadow-[0_0_10px_${primaryColor}]" style="background-color: ${primaryColor};"></div>
        
        <!-- Carbon Frame -->
        <div class="absolute w-10 h-1.5 bg-[#171b26] rounded-full rotate-45 border border-white/25 shadow-md"></div>
        <div class="absolute w-10 h-1.5 bg-[#171b26] rounded-full -rotate-45 border border-white/25 shadow-md"></div>

        <!-- 4 Spinning Rotor Discs -->
        <div class="absolute top-0 left-0 w-3.5 h-3.5 rounded-full border border-[#ff6b2c] bg-[#ff6b2c]/30 spin-rotor shadow-[0_0_8px_#ff6b2c]"></div>
        <div class="absolute top-0 right-0 w-3.5 h-3.5 rounded-full border border-[#ff6b2c] bg-[#ff6b2c]/30 spin-rotor shadow-[0_0_8px_#ff6b2c]"></div>
        <div class="absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full border border-[#ff6b2c] bg-[#ff6b2c]/30 spin-rotor shadow-[0_0_8px_#ff6b2c]"></div>
        <div class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border border-[#ff6b2c] bg-[#ff6b2c]/30 spin-rotor shadow-[0_0_8px_#ff6b2c]"></div>

        <!-- Center Avionics Core -->
        <div class="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_14px_${primaryColor}]" style="background: radial-gradient(circle, ${primaryColor}, #0d0f16);">
          <div class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
        </div>
      </div>

      <!-- Telemetry Live Pill -->
      <div class="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-[#0a0d14]/95 border shadow-2xl flex items-center gap-1 text-[8px] font-mono font-bold text-white backdrop-blur-md" style="border-color: ${primaryColor};">
        <span style="color: ${primaryColor}; font-weight: 900;">${drone.id}</span>
        <span class="text-slate-500">|</span>
        <span class="${drone.battery.level < 30 ? 'text-red-400 font-extrabold' : 'text-emerald-400'}">${drone.battery.level}%</span>
        <span class="text-slate-500">|</span>
        <span class="${isPerimeter ? 'text-purple-300' : 'text-amber-300'}">${isPerimeter ? 'RING' : 'CORE'}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-drone-tactical-icon',
    iconSize: [76, 76],
    iconAnchor: [38, 38],
  });
}

// 2. Realistic 6-Legged Hexapod Ground Robot Marker with Boundary Anchor Tag
function createRealisticHexapodIcon(hexa: HexapodTelemetry, isSelected: boolean) {
  const isAnchored = hexa.status === 'ANCHORED';
  const primaryColor = isAnchored ? '#10b981' : '#06b6d4';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer select-none" style="width: 72px; height: 72px;">
      ${isSelected ? `
        <div class="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-60"></div>
      ` : ''}

      <!-- Hexapod Mechanical Chassis -->
      <div class="relative w-10 h-10 flex items-center justify-center transition-transform duration-300" style="transform: rotate(${hexa.heading}deg);">
        <!-- 6 Articulated Spider Legs -->
        <div class="absolute w-12 h-1 bg-cyan-600 rounded-full rotate-[30deg] shadow-[0_0_6px_#06b6d4]"></div>
        <div class="absolute w-12 h-1 bg-cyan-600 rounded-full rotate-[90deg] shadow-[0_0_6px_#06b6d4]"></div>
        <div class="absolute w-12 h-1 bg-cyan-600 rounded-full rotate-[150deg] shadow-[0_0_6px_#06b6d4]"></div>

        <!-- Center Ruggedized Ground Hull -->
        <div class="w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center shadow-[0_0_12px_#06b6d4] bg-gradient-to-tr from-[#083344] to-[#0891b2]">
          <span style="font-size: 10px;">🕷️</span>
        </div>

        <!-- Laser Geofence Beacon Anchor Point -->
        <div class="absolute -top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_10px_#22d3ee]"></div>
      </div>

      <!-- Hexapod Telemetry Live Pill -->
      <div class="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-[#041d24]/95 border border-cyan-500/50 shadow-xl flex items-center gap-1 text-[8px] font-mono font-bold text-white backdrop-blur-md">
        <span class="text-cyan-400 font-black">${hexa.id}</span>
        <span class="text-slate-500">|</span>
        <span class="text-emerald-400">${hexa.groundStabilityIndex}% STAB</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-hexapod-tactical-icon',
    iconSize: [72, 72],
    iconAnchor: [36, 36],
  });
}

// 3. Post-Earthquake Triage Marker
function createRealisticTriageIcon(triage: TriageEvent, isSelected: boolean) {
  const isRescued = triage.rescueStatus === 'RESCUED';
  const isCritical = triage.severity === 'CRITICAL';
  const color = isRescued ? '#10b981' : isCritical ? '#ff4b1f' : '#f59e0b';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer select-none" style="width: 52px; height: 52px;">
      ${!isRescued ? `<div class="absolute inset-1 rounded-full opacity-50 animate-ping" style="background-color: ${color};"></div>` : ''}
      <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-[0_0_16px_${color}] flex items-center justify-center" style="background-color: #0d1017; border-color: ${color};">
        <span style="font-size: 13px; font-weight: bold; color: ${color};">${isRescued ? '✓' : isCritical ? '⚠️' : '🚨'}</span>
      </div>
      <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.2 rounded bg-[#0a0d14]/95 border text-[8.5px] font-mono font-bold text-white shadow-lg" style="border-color: ${color};">
        ${triage.id}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-triage-marker-icon',
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  drones,
  hexapods = [],
  triageEvents,
  pheromoneGrid,
  selectedDroneId,
  onSelectDrone,
  selectedHexapodId,
  onSelectHexapod,
  selectedTriageId,
  onSelectTriage,
  onDispatchMedicalDrone,
  onDispatchHexapodInfiltration
}) => {
  const [activeLayerKey, setActiveLayerKey] = useState<keyof typeof MAP_LAYERS>('CARTODB_DARK');
  const [showPheromones, setShowPheromones] = useState<boolean>(true);
  const [showGeofenceLaser, setShowGeofenceLaser] = useState<boolean>(true);
  const [showHexapods, setShowHexapods] = useState<boolean>(true);

  const activeLayer = MAP_LAYERS[activeLayerKey];

  // Dynamic Polygon Boundary from 6 Hexapods on outer ridge vertices (~140 km²)
  const hexapodGeofenceCoords = hexapods.map(h => [h.position.lat, h.position.lng] as [number, number]);
  const hexapodGeofenceLoop = hexapods.length > 0 ? [...hexapodGeofenceCoords, hexapodGeofenceCoords[0]] : [];

  const interiorDrones = drones.filter(d => d.zoneAssignment === 'INTERIOR_CORE');
  const perimeterDrones = drones.filter(d => d.zoneAssignment === 'PERIMETER_RING');

  return (
    <div className="relative w-full h-full flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#08090d]">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP TACTICAL CONTROL BAR (Clean, non-overlapping HUD)          */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        
        {/* Top Left: Coordinates & Air-Ground Swarm Partition Counters */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#0d0f17]/90 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl shadow-2xl">
          <Compass className="w-4 h-4 text-[#ff6b2c] animate-spin" style={{ animationDuration: '24s' }} />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            28.6139° N, 77.2090° E
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-[#ff6b2c] font-bold flex items-center gap-1">
            <span>6 Interior</span>
          </span>
          <span className="text-slate-600">+</span>
          <span className="text-xs font-mono text-purple-300 font-bold flex items-center gap-1">
            <span>4 Perimeter</span>
          </span>
          <span className="text-slate-600">+</span>
          <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1">
            <span>6 Hexapods</span>
          </span>
        </div>

        {/* Top Right: Layer Switcher & Overlay Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0d0f17]/90 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-2xl">
          {/* Layer Selector */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/5 mr-1">
            {(Object.keys(MAP_LAYERS) as Array<keyof typeof MAP_LAYERS>).map((key) => {
              const layer = MAP_LAYERS[key];
              const isSelected = activeLayerKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveLayerKey(key)}
                  className={`px-2.5 py-1 text-[10.5px] font-mono font-bold rounded-md transition-all ${
                    isSelected
                      ? 'bg-[#ff6b2c] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {layer.name}
                </button>
              );
            })}
          </div>

          {/* Hexapod Laser Geofence Toggle */}
          <button
            onClick={() => setShowGeofenceLaser(!showGeofenceLaser)}
            className={`px-2.5 py-1 text-[10.5px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
              showGeofenceLaser
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            Laser Geofence
          </button>

          {/* ACS Slope Risk Heatmap Toggle */}
          <button
            onClick={() => setShowPheromones(!showPheromones)}
            className={`px-2.5 py-1 text-[10.5px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
              showPheromones
                ? 'bg-[#ff6b2c]/20 text-[#ff6b2c] border-[#ff6b2c]/50 shadow-[0_0_10px_rgba(255,107,44,0.3)]'
                : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Slope Heatmap
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LEAFLET INTERACTIVE MAP CANVAS (Expanded Zoom 13 for ~140km²)  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-grow w-full h-full relative z-0">
        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={13}
          zoomControl={false}
          className="w-full h-full"
          style={{ background: '#08090d' }}
        >
          <ZoomControl position="bottomright" />

          {/* Dynamic Tile Layer */}
          <TileLayer
            key={activeLayerKey}
            url={activeLayer.url}
            subdomains={activeLayer.subdomains}
            maxZoom={activeLayer.maxZoom}
            attribution={activeLayer.attribution}
          />

          {/* 1. ACS Stigmergic Search & Slope Hazard Grid (~140 km²) */}
          {showPheromones && pheromoneGrid.map((cell) => {
            const isHazardSlope = cell.slopeRiskLevel > 0.6;
            const isRecruitment = cell.recruitmentLevel > 0.4;
            const isSearched = cell.coverageScore > 0.3;

            const fillColor = isHazardSlope
              ? '#dc2626'
              : isRecruitment
              ? '#ff6b2c'
              : isSearched
              ? '#10b981'
              : 'transparent';

            const fillOpacity = isHazardSlope ? 0.30 : isRecruitment ? 0.35 : isSearched ? 0.12 : 0.0;

            return (
              <Rectangle
                key={cell.cellId}
                bounds={[
                  [cell.bounds.south, cell.bounds.west],
                  [cell.bounds.north, cell.bounds.east]
                ]}
                pathOptions={{
                  fillColor,
                  fillOpacity,
                  weight: 0.5,
                  color: isHazardSlope ? '#ef4444' : isRecruitment ? '#ff6b2c' : '#334155',
                  dashArray: isHazardSlope ? '3, 3' : undefined
                }}
              />
            );
          })}

          {/* 2. Expansive Autonomous Hexapod Dynamic Laser Geofence Perimeter */}
          {showGeofenceLaser && hexapodGeofenceCoords.length > 2 && (
            <>
              {/* Shaded Safety Polygon Corridor */}
              <Polygon
                positions={hexapodGeofenceCoords}
                pathOptions={{
                  fillColor: '#06b6d4',
                  fillOpacity: 0.09,
                  color: '#06b6d4',
                  weight: 2,
                  dashArray: '8, 6'
                }}
              />

              {/* Glowing High-Power Laser Link Lines */}
              <Polyline
                positions={hexapodGeofenceLoop}
                pathOptions={{
                  color: '#22d3ee',
                  weight: 2.8,
                  opacity: 0.9
                }}
              />
            </>
          )}

          {/* 3. Regional Landslide Scarp & Collapsed Rubble Areas */}
          <Polygon
            positions={[
              [28.6220, 77.2180],
              [28.6280, 77.2280],
              [28.6230, 77.2310],
              [28.6180, 77.2200]
            ]}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#b45309',
              fillOpacity: 0.3,
              weight: 1.5,
              dashArray: '4, 4'
            }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 font-mono text-xs text-white">
                <strong className="text-amber-400 block">⚠️ ACTIVE LANDSLIDE SLIP SCARP</strong>
                <span>East Perimeter Ridge | Soil Shear: 98.2 kPa</span>
              </div>
            </Popup>
          </Polygon>

          <Polygon
            positions={[
              [28.6135, 77.2080],
              [28.6165, 77.2130],
              [28.6140, 77.2145],
              [28.6115, 77.2095]
            ]}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#991b1b',
              fillOpacity: 0.35,
              weight: 1.5
            }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 font-mono text-xs text-white">
                <strong className="text-red-400 block">🚨 COLLAPSED CONCRETE SLAB VOID</strong>
                <span>Sector 7-G Interior Core | Acoustic Tap at 2.8Hz</span>
              </div>
            </Popup>
          </Polygon>

          {/* 4. Ground Hexapod Anchors (6 Perimeter Nodes) */}
          {showHexapods && hexapods.map((hexa) => (
            <Marker
              key={hexa.id}
              position={[hexa.position.lat, hexa.position.lng]}
              icon={createRealisticHexapodIcon(hexa, selectedHexapodId === hexa.id)}
              eventHandlers={{
                click: () => onSelectHexapod && onSelectHexapod(hexa.id)
              }}
            >
              <Popup className="custom-leaflet-popup" closeButton={false}>
                <div className="p-3 bg-[#0a0d14] text-slate-100 rounded-xl font-mono text-xs border border-cyan-500/40 min-w-[240px] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      🕷️ {hexa.id} [{hexa.callsign}]
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60">
                      {hexa.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] mb-3 text-slate-300">
                    <div className="flex justify-between"><span>Boundary Node:</span> <strong className="text-white">{hexa.perimeterVertexName}</strong></div>
                    <div className="flex justify-between"><span>Role:</span> <strong className="text-cyan-300">{hexa.role}</strong></div>
                    <div className="flex justify-between"><span>Ground Stability:</span> <strong className="text-emerald-400">{hexa.groundStabilityIndex}%</strong></div>
                    <div className="flex justify-between"><span>Seismic Acoustic:</span> <strong className="text-amber-300">{hexa.seismicAcoustic.vibrationMmS} mm/s</strong></div>
                    <div className="flex justify-between"><span>Laser Geofence:</span> <strong className="text-cyan-400">Locked to {hexa.geofenceLaser.connectedToHexaId} ({hexa.geofenceLaser.laserRangeM}m)</strong></div>
                  </div>

                  <button
                    onClick={() => onDispatchHexapodInfiltration && onDispatchHexapodInfiltration('CAS-EQ-01', hexa.id)}
                    className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10.5px] uppercase shadow-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5" /> Deploy Rubble Infiltration Probe
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 5. 10 Aerial Ant Quadcopters (4 Perimeter Ring + 6 Interior Core) */}
          {drones.map((drone) => (
            <Marker
              key={drone.id}
              position={[drone.position.lat, drone.position.lng]}
              icon={createRealisticDroneIcon(drone, selectedDroneId === drone.id)}
              eventHandlers={{
                click: () => onSelectDrone(drone.id)
              }}
            >
              <Popup className="custom-leaflet-popup" closeButton={false}>
                <div className="p-3 bg-[#0a0d14] text-slate-100 rounded-xl font-mono text-xs border border-[#ff6b2c]/40 min-w-[240px] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="font-bold text-[#ff6b2c] flex items-center gap-1.5">
                      🐜 {drone.id} [{drone.callsign}]
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      drone.zoneAssignment === 'PERIMETER_RING' ? 'bg-purple-950/80 text-purple-300 border-purple-700/60' : 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                    }`}>
                      {drone.zoneAssignment.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] mb-3 text-slate-300">
                    <div className="flex justify-between"><span>Tactical Goal:</span> <strong className="text-amber-300">{drone.perception.autonomousGoal}</strong></div>
                    <div className="flex justify-between"><span>Altitude (AGL):</span> <strong className="text-white">{drone.position.altitude} meters</strong></div>
                    <div className="flex justify-between"><span>Ground Speed:</span> <strong className="text-white">{drone.groundSpeed} m/s ({drone.heading}°)</strong></div>
                    <div className="flex justify-between"><span>6S LiPo Battery:</span> <strong className="text-emerald-400">{drone.battery.level}% ({drone.battery.voltage}V)</strong></div>
                    <div className="flex justify-between"><span>Payload:</span> <strong className="text-[#ff6b2c]">{drone.payload.type}</strong></div>
                  </div>

                  <button
                    onClick={() => onSelectDrone(drone.id)}
                    className="w-full py-1.5 rounded-lg gradient-orange-btn text-white font-bold text-[10.5px] uppercase shadow-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" /> Inspect Live Telemetry Pod
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 6. Post-Earthquake Triage Markers */}
          {triageEvents.map((triage) => (
            <Marker
              key={triage.id}
              position={[triage.location.lat, triage.location.lng]}
              icon={createRealisticTriageIcon(triage, selectedTriageId === triage.id)}
              eventHandlers={{
                click: () => onSelectTriage(triage)
              }}
            >
              <Popup className="custom-leaflet-popup" closeButton={false}>
                <div className="p-3.5 bg-[#0a0d14] text-slate-100 rounded-xl font-mono text-xs border border-white/20 min-w-[260px] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="font-bold text-white">{triage.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      triage.severity === 'CRITICAL' ? 'bg-[#ff4b1f] text-white shadow-[0_0_10px_#ff4b1f]' :
                      triage.severity === 'URGENT' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
                    }`}>
                      {triage.severity}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] mb-3 text-slate-300">
                    <div className="flex justify-between"><span>Callsign:</span> <strong className="text-white">{triage.victimCallsign}</strong></div>
                    <div className="flex justify-between"><span>Entrapment:</span> <strong className="text-amber-300">{triage.entrapmentType.replace(/_/g, ' ')}</strong></div>
                    <div className="flex justify-between"><span>Acoustic Tap:</span> <strong className={triage.acousticEchoDetected ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{triage.acousticEchoDetected ? '2.8Hz SIGNAL DETECTED' : 'NONE'}</strong></div>
                    <div className="flex justify-between"><span>Body Temp:</span> <strong className="text-white">{triage.thermal.bodyTemp}°C (Δ +{triage.thermal.differential}°C)</strong></div>
                  </div>

                  <button
                    onClick={() => onDispatchMedicalDrone && onDispatchMedicalDrone(triage.id)}
                    className="w-full py-2 rounded-lg gradient-orange-btn text-white font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Nearest Autonomous UAV
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM HUD OVERLAYS: Live Geofence & Air-Ground Swarm Status   */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-3 left-3 right-16 z-[1000] flex items-end justify-between pointer-events-none">
        
        {/* Bottom Left: Hexapod Geofence Status + Partition Legend */}
        <div className="pointer-events-auto bg-[#0d0f17]/90 backdrop-blur-md border border-white/10 p-2.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 border-r border-white/10 pr-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-cyan-300 font-bold">GEOFENCE ENVELOPE: 142.8 km²</span>
            <span className="text-slate-400">(6 Anchors • 99.2% Lock)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ff6b2c]"></span> 6 Interior UAVs</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span> 4 Perimeter UAVs</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> 6 Hexapods</span>
          </div>
        </div>

        {/* Bottom Right: Mission Coverage Stats */}
        <div className="pointer-events-auto bg-[#0d0f17]/90 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">EXPANDED SURVEY: <strong className="text-[#ff6b2c]">89.2%</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">TOTAL AREA: <strong className="text-white">142.8 km²</strong></span>
        </div>
      </div>

    </div>
  );
};
