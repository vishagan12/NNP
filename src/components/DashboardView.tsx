import React, { useState } from 'react';
import { DroneTelemetry, HexapodTelemetry, TriageEvent, PheromoneCell, AlertEntry } from '../types';
import { TacticalMap } from './TacticalMap';
import { 
  ShieldAlert, 
  Cpu, 
  Battery, 
  Radio, 
  Navigation, 
  Eye, 
  Layers, 
  Bell, 
  Activity, 
  Compass, 
  MapPin, 
  Mountain,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Shield,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  drones: DroneTelemetry[];
  hexapods: HexapodTelemetry[];
  triageEvents: TriageEvent[];
  pheromoneGrid: PheromoneCell[];
  alerts: AlertEntry[];
  selectedDroneId: string | null;
  onSelectDrone: (droneId: string) => void;
  selectedHexapodId?: string | null;
  onSelectHexapod?: (hexapodId: string) => void;
  selectedTriageId: string | null;
  onSelectTriage: (triage: TriageEvent) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onDispatchMedicalDrone?: (victimId: string) => void;
  onDispatchHexapodInfiltration?: (victimId: string, hexapodId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  drones,
  hexapods = [],
  triageEvents,
  pheromoneGrid,
  alerts,
  selectedDroneId,
  onSelectDrone,
  selectedHexapodId,
  onSelectHexapod,
  selectedTriageId,
  onSelectTriage,
  onAcknowledgeAlert,
  onDispatchMedicalDrone,
  onDispatchHexapodInfiltration
}) => {
  const [fleetViewFilter, setFleetViewFilter] = useState<'ALL' | 'INTERIOR_UAV' | 'PERIMETER_UAV' | 'HEXAPODS'>('ALL');

  const interiorDrones = drones.filter(d => d.zoneAssignment === 'INTERIOR_CORE');
  const perimeterDrones = drones.filter(d => d.zoneAssignment === 'PERIMETER_RING');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-4 h-[calc(100vh-96px)] overflow-hidden">
      
      {/* 1. Tactical GIS Map with Expanded Geofence (~140 km²) */}
      <div className="h-full flex flex-col min-h-0">
        <TacticalMap
          drones={drones}
          hexapods={hexapods}
          triageEvents={triageEvents}
          pheromoneGrid={pheromoneGrid}
          selectedDroneId={selectedDroneId}
          onSelectDrone={onSelectDrone}
          selectedHexapodId={selectedHexapodId}
          onSelectHexapod={onSelectHexapod}
          selectedTriageId={selectedTriageId}
          onSelectTriage={onSelectTriage}
          onDispatchMedicalDrone={onDispatchMedicalDrone}
          onDispatchHexapodInfiltration={onDispatchHexapodInfiltration}
        />
      </div>

      {/* 2. Right Side Tactical Command Column: Live Air-Ground Fleet Matrix & Alerts */}
      <div className="flex flex-col gap-4 h-full overflow-hidden min-h-0">
        
        {/* Active Air-Ground Live Telemetry Matrix (All 16 Units) */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3 shadow-xl border border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#ff6b2c]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Air-Ground Live Matrix ({drones.length + hexapods.length})
              </span>
            </div>

            {/* Tactical Zone Filter Pills */}
            <div className="flex items-center bg-[#12151e] p-0.5 rounded-lg border border-white/10 text-[9px] font-mono font-bold">
              <button
                onClick={() => setFleetViewFilter('ALL')}
                className={`px-2 py-0.5 rounded transition-all ${
                  fleetViewFilter === 'ALL' ? 'bg-[#ff6b2c] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (16)
              </button>
              <button
                onClick={() => setFleetViewFilter('INTERIOR_UAV')}
                className={`px-2 py-0.5 rounded transition-all ${
                  fleetViewFilter === 'INTERIOR_UAV' ? 'bg-[#ff4b1f] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Core (6)
              </button>
              <button
                onClick={() => setFleetViewFilter('PERIMETER_UAV')}
                className={`px-2 py-0.5 rounded transition-all ${
                  fleetViewFilter === 'PERIMETER_UAV' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ring (4)
              </button>
              <button
                onClick={() => setFleetViewFilter('HEXAPODS')}
                className={`px-2 py-0.5 rounded transition-all ${
                  fleetViewFilter === 'HEXAPODS' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hexa (6)
              </button>
            </div>
          </div>

          {/* Real-Time Unified Unit Stream */}
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {/* 1. Interior Core UAVs */}
            {(fleetViewFilter === 'ALL' || fleetViewFilter === 'INTERIOR_UAV') && (
              <>
                {fleetViewFilter === 'ALL' && (
                  <span className="text-[9px] font-mono text-[#ff6b2c] uppercase font-bold tracking-wider px-1">
                    ▼ Interior Core Rubble Search Group ({interiorDrones.length} UAVs)
                  </span>
                )}
                {interiorDrones.map((drone) => {
                  const isSelected = selectedDroneId === drone.id;
                  return (
                    <div
                      key={drone.id}
                      onClick={() => onSelectDrone(drone.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer border ${
                        isSelected 
                          ? 'bg-gradient-to-r from-[#ff6b2c]/20 to-[#ff4b1f]/20 border-[#ff6b2c] shadow-[0_0_15px_rgba(255,107,44,0.3)]' 
                          : 'glass-card hover:border-[#ff6b2c]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[#ff6b2c]/20 text-[#ff6b2c] border border-[#ff6b2c]/40 flex items-center justify-center font-bold text-[10px] font-mono">
                            {drone.id.replace('ANT-', 'A')}
                          </div>
                          <div>
                            <div className="font-mono text-xs font-bold text-white flex items-center gap-1">
                              {drone.id}
                              <span className="text-[9px] text-[#ff6b2c] font-normal">[CORE]</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              {drone.position.altitude}m ALT | {drone.groundSpeed}m/s | {drone.heading}°
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-[9px] text-emerald-400 font-bold">
                            {drone.battery.level}% ({drone.battery.voltage}V)
                          </span>
                          <div className="font-mono text-[9px] text-slate-400">
                            RSSI: <span className="text-emerald-400">{drone.link.rssi}dBm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* 2. Perimeter Ring Patrol UAVs */}
            {(fleetViewFilter === 'ALL' || fleetViewFilter === 'PERIMETER_UAV') && (
              <>
                {fleetViewFilter === 'ALL' && (
                  <span className="text-[9px] font-mono text-purple-300 uppercase font-bold tracking-wider px-1 mt-1">
                    ▼ Perimeter Ring Patrol Group ({perimeterDrones.length} UAVs)
                  </span>
                )}
                {perimeterDrones.map((drone) => {
                  const isSelected = selectedDroneId === drone.id;
                  return (
                    <div
                      key={drone.id}
                      onClick={() => onSelectDrone(drone.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer border ${
                        isSelected 
                          ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                          : 'glass-card hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-[10px] font-mono">
                            {drone.id.replace('ANT-', 'A')}
                          </div>
                          <div>
                            <div className="font-mono text-xs font-bold text-white flex items-center gap-1">
                              {drone.id}
                              <span className="text-[9px] text-purple-300 font-normal">[RING PATROL]</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              {drone.position.altitude}m ALT | {drone.groundSpeed}m/s | Boundary Lock
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-[9px] text-purple-300 font-bold">
                            {drone.battery.level}% ({drone.battery.voltage}V)
                          </span>
                          <div className="font-mono text-[9px] text-slate-400">
                            RSSI: <span className="text-emerald-400">{drone.link.rssi}dBm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* 3. Ground Hexapod Anchors */}
            {(fleetViewFilter === 'ALL' || fleetViewFilter === 'HEXAPODS') && (
              <>
                {fleetViewFilter === 'ALL' && (
                  <span className="text-[9px] font-mono text-cyan-300 uppercase font-bold tracking-wider px-1 mt-1">
                    ▼ Ground Hexapod Geofence Anchors ({hexapods.length} Nodes)
                  </span>
                )}
                {hexapods.map((hexa) => {
                  const isSelected = selectedHexapodId === hexa.id;
                  return (
                    <div
                      key={hexa.id}
                      onClick={() => onSelectHexapod && onSelectHexapod(hexa.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer border ${
                        isSelected 
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                          : 'glass-card hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-[10px] font-mono">
                            🕷️
                          </div>
                          <div>
                            <div className="font-mono text-xs font-bold text-white flex items-center gap-1">
                              {hexa.id}
                              <span className="text-[9px] text-cyan-300 font-normal">[{hexa.perimeterVertexName}]</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              Stability: <strong className="text-emerald-400">{hexa.groundStabilityIndex}%</strong> | Vib: {hexa.seismicAcoustic.vibrationMmS}mm/s
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                            {hexa.status}
                          </span>
                          <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                            Laser: <strong className="text-cyan-400">{hexa.geofenceLaser.laserRangeM}m</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Priority Post-Earthquake & Landslide Hazard Alert Feed */}
        <div className="flex-grow glass-panel rounded-2xl flex flex-col overflow-hidden shadow-xl border border-white/10 min-h-0">
          <div className="p-3.5 bg-[#12151e] flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#ff6b2c]" />
              <span className="text-xs font-bold text-white tracking-tight uppercase">
                Seismic & Landslide Alert Stream
              </span>
            </div>
            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/50 font-bold">
              142.8 km² BOUNDARY GUARD
            </span>
          </div>

          <div className="flex-grow overflow-y-auto p-2.5 flex flex-col gap-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2.5 rounded-xl bg-[#141722]/80 hover:bg-[#181c2a] transition-all cursor-pointer border-l-4 ${
                  alert.tier === 'TIER_1_CRITICAL' ? 'border-[#ff4b1f] bg-red-950/20' :
                  alert.tier === 'TIER_2_WARNING' ? 'border-amber-500 bg-amber-950/20' : 'border-cyan-500 bg-cyan-950/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {alert.tier === 'TIER_1_CRITICAL' ? (
                      <Mountain className="w-3.5 h-3.5 text-[#ff4b1f]" />
                    ) : alert.tier === 'TIER_2_WARNING' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span className="font-mono text-xs text-white font-bold">
                      {alert.sourceDroneId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-slate-500">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="text-[9px] font-mono text-[#ff6b2c] hover:underline font-bold px-1.5 py-0.5 rounded bg-[#ff6b2c]/10 border border-[#ff6b2c]/30"
                      >
                        ACK
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
