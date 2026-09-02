import React, { useState } from 'react';
import { DroneTelemetry, HexapodTelemetry } from '../types';
import { 
  Cpu, 
  BatteryCharging, 
  Navigation, 
  Radio, 
  Layers, 
  RotateCcw, 
  Sliders, 
  Activity,
  Zap,
  Gauge,
  Thermometer,
  Eye,
  Compass,
  Wifi,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Mountain,
  Target
} from 'lucide-react';

interface DroneDetailViewProps {
  drones: DroneTelemetry[];
  hexapods?: HexapodTelemetry[];
  selectedDroneId: string | null;
  onSelectDrone: (id: string) => void;
  selectedHexapodId?: string | null;
  onSelectHexapod?: (id: string) => void;
}

export const DroneDetailView: React.FC<DroneDetailViewProps> = ({ 
  drones, 
  hexapods = [],
  selectedDroneId, 
  onSelectDrone,
  selectedHexapodId,
  onSelectHexapod
}) => {
  const [fleetCategory, setFleetCategory] = useState<'AERIAL_UAV' | 'GROUND_HEXAPOD'>('AERIAL_UAV');
  const [activeSubTab, setActiveSubTab] = useState<'TELEMETRY' | 'PERCEPTION' | 'SENSORS' | 'PAYLOAD'>('TELEMETRY');

  const activeDrone = drones.find(d => d.id === selectedDroneId) || drones[0];
  const activeHexapod = hexapods.find(h => h.id === selectedHexapodId) || hexapods[0] || null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-2 h-[calc(100vh-74px)] overflow-hidden">
      
      {/* 1. Left Column: Fleet Unit Selector (10 UAVs + 6 Hexapods) */}
      <div className="glass-panel rounded-2xl border border-white/10 shadow-xl p-3 flex flex-col gap-2 overflow-hidden">
        
        {/* Fleet Header & Switcher */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
          <div>
            <span className="text-xs font-mono text-white font-bold uppercase block">
              Autonomous Fleet Roster
            </span>
            <span className="text-[9.5px] font-mono text-[#ff6b2c]">
              {fleetCategory === 'AERIAL_UAV' ? '10 AERIAL ANTS' : '6 GROUND HEXAPODS'}
            </span>
          </div>

          <div className="flex items-center bg-[#12151e] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setFleetCategory('AERIAL_UAV')}
              className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-md transition-all ${
                fleetCategory === 'AERIAL_UAV' ? 'bg-[#ff6b2c] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              UAVs (10)
            </button>
            <button
              onClick={() => setFleetCategory('GROUND_HEXAPOD')}
              className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-md transition-all ${
                fleetCategory === 'GROUND_HEXAPOD' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hexapods (6)
            </button>
          </div>
        </div>

        {/* Scrollable Unit Roster */}
        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-grow">
          {fleetCategory === 'AERIAL_UAV' ? (
            // 10 Aerial Ant UAVs (Grouped into Interior vs Perimeter)
            drones.map((d) => {
              const isSelected = d.id === activeDrone.id;
              const isPerimeter = d.zoneAssignment === 'PERIMETER_RING';
              return (
                <button
                  key={d.id}
                  onClick={() => onSelectDrone(d.id)}
                  className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? isPerimeter 
                        ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-gradient-to-r from-[#ff6b2c]/20 to-[#ff4b1f]/20 border-[#ff6b2c] shadow-[0_0_15px_rgba(255,107,44,0.3)]'
                      : 'glass-card border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      d.status === 'ENGAGED' ? 'bg-[#ff4b1f]/20 text-[#ff4b1f] border border-[#ff4b1f]/40' :
                      isPerimeter ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {d.id.replace('ANT-', 'A')}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-white flex items-center gap-1">
                        {d.id}
                        <span className={`text-[9px] font-normal ${isPerimeter ? 'text-purple-300' : 'text-[#ff6b2c]'}`}>
                          [{isPerimeter ? 'RING' : 'CORE'}]
                        </span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 truncate max-w-[140px]">
                        {d.callsign}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-white">{d.battery.level}%</div>
                    <div className="text-[9px] font-mono text-slate-400">{d.position.altitude}m | {d.groundSpeed}m/s</div>
                  </div>
                </button>
              );
            })
          ) : (
            // 6 Ground Hexapods
            hexapods.map((h) => {
              const isSelected = activeHexapod && h.id === activeHexapod.id;
              return (
                <button
                  key={h.id}
                  onClick={() => onSelectHexapod && onSelectHexapod(h.id)}
                  className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'glass-card border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs">
                      🕷️
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-white flex items-center gap-1">
                        {h.id}
                        <span className="text-[9px] text-cyan-300 font-normal">[{h.callsign}]</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 truncate max-w-[140px]">
                        {h.perimeterVertexName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-emerald-400">{h.groundStabilityIndex}%</div>
                    <div className="text-[9px] font-mono text-slate-400">{h.gaitMode}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Right Column: Dedicated Deep Subsystem Telemetry Pod */}
      <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl p-4 flex flex-col gap-4 overflow-y-auto min-h-0">
        
        {fleetCategory === 'AERIAL_UAV' ? (
          // =================================================================
          // AERIAL ANT QUADCOPTER TELEMETRY POD (10 UNITS)
          // =================================================================
          <>
            {/* Header Pod */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff4b1f] to-[#ff6b2c] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,44,0.5)] text-white font-extrabold text-xl border border-orange-400/40 shrink-0">
                  🐜
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">{activeDrone.id}</h2>
                    <span className="font-mono text-xs text-[#ff6b2c] px-2.5 py-0.5 rounded-md bg-[#ff6b2c]/10 border border-[#ff6b2c]/30 font-bold">
                      {activeDrone.callsign}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      activeDrone.zoneAssignment === 'PERIMETER_RING'
                        ? 'bg-purple-950/80 text-purple-300 border-purple-600'
                        : 'bg-emerald-950/80 text-emerald-400 border-emerald-600'
                    }`}>
                      {activeDrone.zoneAssignment.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Role: <span className="text-white font-semibold">{activeDrone.role.replace('ACS_', '')}</span> | Goal: <span className="text-amber-300 font-semibold">{activeDrone.perception.autonomousGoal}</span>
                  </p>
                </div>
              </div>

              {/* Subtabs */}
              <div className="flex items-center gap-1 bg-[#12151e] p-1 rounded-xl border border-white/10">
                {(['TELEMETRY', 'PERCEPTION', 'SENSORS', 'PAYLOAD'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                      activeSubTab === tab
                        ? 'bg-gradient-to-r from-[#ff6b2c] to-[#ff4b1f] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtab Contents for Drone */}
            {activeSubTab === 'TELEMETRY' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">6S LiPo BATTERY</span>
                    <span className="font-mono text-2xl font-bold text-emerald-400 mt-1 block">{activeDrone.battery.level}%</span>
                    <div className="h-1.5 w-full bg-black/40 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-400 shadow-[0_0_8px_#10b981]" style={{ width: `${activeDrone.battery.level}%` }}></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1.5 block">{activeDrone.battery.voltage}V | {activeDrone.battery.temperature}°C</span>
                  </div>

                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">ALTITUDE (AGL)</span>
                    <span className="font-mono text-2xl font-bold text-white mt-1 block">{activeDrone.position.altitude} <span className="text-xs font-normal text-slate-400">m</span></span>
                    <span className="text-[9.5px] font-mono text-[#ff6b2c] mt-1.5 block">Vertical: {activeDrone.verticalSpeed} m/s</span>
                  </div>

                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">GROUND SPEED</span>
                    <span className="font-mono text-2xl font-bold text-white mt-1 block">{activeDrone.groundSpeed} <span className="text-xs font-normal text-slate-400">m/s</span></span>
                    <span className="text-[9.5px] font-mono text-amber-300 mt-1.5 block">Heading: {activeDrone.heading}°</span>
                  </div>

                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">PEER LINK RSSI</span>
                    <span className="font-mono text-2xl font-bold text-[#ff6b2c] mt-1 block">{activeDrone.link.rssi} <span className="text-xs font-normal text-slate-400">dBm</span></span>
                    <span className="text-[9.5px] font-mono text-emerald-400 mt-1.5 block">SNR: +{activeDrone.link.snr} dB</span>
                  </div>
                </div>

                {/* 6S Cell Voltages */}
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10 shadow-lg">
                  <span className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-[#ff6b2c]" /> 6S Lithium-Polymer Cell Voltage Array
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {activeDrone.battery.cellVoltages.map((v, i) => (
                      <div key={i} className="p-2.5 bg-[#0a0d14] rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] font-mono text-slate-400 block">CELL #{i + 1}</span>
                        <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">{v.toFixed(2)} V</span>
                        <div className="h-1 w-full bg-black/40 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${((v - 3.2) / 1.0) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motor RPM */}
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10 shadow-lg">
                  <span className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-[#ff6b2c]" /> 4x Brushless Motor RPM
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeDrone.motorRpm.map((rpm, i) => (
                      <div key={i} className="p-2.5 bg-[#0a0d14] rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400">M{i + 1}</span>
                        <span className="text-xs font-mono font-bold text-amber-300">{rpm} RPM</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'PERCEPTION' && (
              <div className="bg-[#12151e] p-4 rounded-2xl border border-[#ff6b2c]/40 shadow-lg space-y-3">
                <span className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff6b2c]" /> Individual Ant Perception Matrix
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">PHEROMONE GRADIENT</span>
                    <div className="text-lg font-mono font-bold text-[#ff6b2c] mt-1">
                      +{(activeDrone.perception.sensedPheromoneGradient.recruitmentDelta * 100).toFixed(0)}% Delta
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">NEIGHBORING PEERS</span>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                      {activeDrone.perception.nearbyDronesCount} UAVs in range
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">STIGMERGIC STATE</span>
                    <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                      {activeDrone.perception.currentStigmergicState.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'SENSORS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10">
                  <span className="text-xs font-mono text-white font-bold block mb-2">FLIR Radiometric Thermal</span>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Status: <strong className="text-emerald-400">{activeDrone.sensors.thermal.status}</strong></div>
                    <div>FOV: <strong className="text-white">{activeDrone.sensors.thermal.fovDeg}°</strong></div>
                    <div>FPS: <strong className="text-white">{activeDrone.sensors.thermal.fps} FPS</strong></div>
                  </div>
                </div>
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10">
                  <span className="text-xs font-mono text-white font-bold block mb-2">360° Solid LiDAR</span>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Status: <strong className="text-emerald-400">{activeDrone.sensors.lidar.status}</strong></div>
                    <div>Range: <strong className="text-white">{activeDrone.sensors.lidar.rangeM}m</strong></div>
                    <div>Rate: <strong className="text-white">{activeDrone.sensors.lidar.pointRateKhz} kHz</strong></div>
                  </div>
                </div>
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10">
                  <span className="text-xs font-mono text-white font-bold block mb-2">4K Optical Gimbal</span>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Status: <strong className="text-emerald-400">{activeDrone.sensors.optical.status}</strong></div>
                    <div>Zoom: <strong className="text-white">{activeDrone.sensors.optical.zoomLevel}</strong></div>
                    <div>Pitch: <strong className="text-amber-300">{activeDrone.sensors.optical.gimbalPitchDeg}°</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'PAYLOAD' && (
              <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10 space-y-3">
                <span className="text-xs font-mono text-white font-bold uppercase">Emergency Delivery Payload</span>
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[9.5px] text-slate-400 uppercase block">TYPE</span>
                    <strong className="text-white text-sm block mt-0.5">{activeDrone.payload.type}</strong>
                  </div>
                  <div className="p-3 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[9.5px] text-slate-400 uppercase block">WEIGHT</span>
                    <strong className="text-white text-sm block mt-0.5">{activeDrone.payload.weightKg} kg</strong>
                  </div>
                  <div className="p-3 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[9.5px] text-slate-400 uppercase block">STATUS</span>
                    <strong className="text-emerald-400 text-sm block mt-0.5">{activeDrone.payload.status}</strong>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : activeHexapod ? (
          // =================================================================
          // GROUND HEXAPOD ROBOT TELEMETRY POD (6 UNITS)
          // =================================================================
          <>
            {/* Hexapod Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#083344] to-[#0891b2] flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] text-white font-extrabold text-xl border border-cyan-400/40 shrink-0">
                  🕷️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">{activeHexapod.id}</h2>
                    <span className="font-mono text-xs text-cyan-300 px-2.5 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 font-bold">
                      {activeHexapod.callsign}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border bg-cyan-950 text-cyan-300 border-cyan-600">
                      {activeHexapod.perimeterVertexName}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Role: <span className="text-white font-semibold">{activeHexapod.role}</span> | Gait: <span className="text-cyan-300 font-semibold">{activeHexapod.gaitMode}</span>
                  </p>
                </div>
              </div>

              {/* Subtabs */}
              <div className="flex items-center gap-1 bg-[#12151e] p-1 rounded-xl border border-white/10">
                {(['TELEMETRY', 'PERCEPTION', 'SENSORS', 'PAYLOAD'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                      activeSubTab === tab
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtab Contents for Hexapod */}
            {activeSubTab === 'TELEMETRY' && (
              <div className="space-y-4">
                {/* 4 Hexapod Telemetry KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">GROUND STABILITY</span>
                    <span className="font-mono text-2xl font-bold text-emerald-400 mt-1 block">{activeHexapod.groundStabilityIndex}%</span>
                    <div className="h-1.5 w-full bg-black/40 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${activeHexapod.groundStabilityIndex}%` }}></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1.5 block">Soil Moisture: {activeHexapod.soilMoisturePercent}%</span>
                  </div>

                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">SEISMIC VIBRATION</span>
                    <span className="font-mono text-2xl font-bold text-amber-300 mt-1 block">{activeHexapod.seismicAcoustic.vibrationMmS} <span className="text-xs font-normal text-slate-400">mm/s</span></span>
                    <span className="text-[9.5px] font-mono text-slate-400 mt-1.5 block">Acoustic: {activeHexapod.seismicAcoustic.acousticDecibels} dB</span>
                  </div>

                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">GEOFENCE LASER LOCK</span>
                    <span className="font-mono text-2xl font-bold text-cyan-400 mt-1 block">{activeHexapod.geofenceLaser.laserRangeM} <span className="text-xs font-normal text-slate-400">m</span></span>
                    <span className="text-[9.5px] font-mono text-emerald-400 mt-1.5 block">Linked to {activeHexapod.geofenceLaser.connectedToHexaId}</span>
                  </div>

                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 shadow-lg">
                    <span className="text-[9.5px] font-mono text-slate-400 block uppercase">BATTERY (12Ah)</span>
                    <span className="font-mono text-2xl font-bold text-emerald-400 mt-1 block">{activeHexapod.battery.level}%</span>
                    <span className="text-[9.5px] font-mono text-slate-400 mt-1.5 block">{activeHexapod.battery.voltage}V | {activeHexapod.battery.temperature}°C</span>
                  </div>
                </div>

                {/* 6-Legged Articulated Servo Kinematics */}
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10 shadow-lg">
                  <span className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-cyan-400" /> 6-Legged Articulated Servo Kinematics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {activeHexapod.legServoAnglesDeg.map((angle, i) => (
                      <div key={i} className="p-2.5 bg-[#0a0d14] rounded-xl border border-white/5 text-center">
                        <span className="text-[9px] font-mono text-slate-400 block">LEG #{i + 1} ({['Front-L', 'Mid-L', 'Rear-L', 'Front-R', 'Mid-R', 'Rear-R'][i]})</span>
                        <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5 block">{angle}° Joint</span>
                        <div className="h-1 w-full bg-black/40 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${(angle / 90) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Cycle Counter & Terrain Slope */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 text-xs font-mono">
                    <span className="text-slate-400 uppercase block mb-1">TOTAL STEP GAIT CYCLES</span>
                    <span className="text-lg font-bold text-white block">{activeHexapod.stepCycleCount.toLocaleString()} steps</span>
                    <span className="text-[9.5px] text-cyan-300">Inverse kinematics dynamically balancing slope</span>
                  </div>
                  <div className="bg-[#12151e] p-3.5 rounded-2xl border border-white/10 text-xs font-mono">
                    <span className="text-slate-400 uppercase block mb-1">TERRAIN SLOPE INCLINOMETER</span>
                    <span className="text-lg font-bold text-amber-300 block">{activeHexapod.position.terrainSlopeDeg}° Gradient</span>
                    <span className="text-[9.5px] text-emerald-400">Within safe anti-rollover stability threshold</span>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'PERCEPTION' && (
              <div className="bg-[#12151e] p-4 rounded-2xl border border-cyan-500/40 shadow-lg space-y-3">
                <span className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" /> Geofence Boundary & Seismic Perception Core
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">SEISMIC TAP CADENCE</span>
                    <div className="text-lg font-mono font-bold text-amber-300 mt-1">
                      {activeHexapod.seismicAcoustic.tapEchoConfidence}% Confidence
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Borehole Geophone Locked</span>
                  </div>

                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">GEOFENCE PERIMETER</span>
                    <div className="text-lg font-mono font-bold text-cyan-400 mt-1">
                      LOCKED (99.2%)
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{activeHexapod.perimeterVertexName}</span>
                  </div>

                  <div className="p-3.5 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">SOIL SHEAR INTEGRITY</span>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
                      {activeHexapod.groundStabilityIndex > 80 ? 'STABLE FOUNDATION' : 'HIGH SHEAR RISK'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'SENSORS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10">
                  <span className="text-xs font-mono text-white font-bold block mb-2">Triaxial Geophone</span>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Status: <strong className="text-emerald-400">{activeHexapod.sensors.geophone}</strong></div>
                    <div>Sensitivity: <strong className="text-white">0.05 mm/s</strong></div>
                    <div>Bandwidth: <strong className="text-white">1 - 500 Hz</strong></div>
                  </div>
                </div>
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10">
                  <span className="text-xs font-mono text-white font-bold block mb-2">Ground Micro-LiDAR</span>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Status: <strong className="text-emerald-400">{activeHexapod.sensors.groundLiDAR}</strong></div>
                    <div>Range: <strong className="text-white">40m Ground Mesh</strong></div>
                  </div>
                </div>
                <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10">
                  <span className="text-xs font-mono text-white font-bold block mb-2">Rubble Micro-FLIR</span>
                  <div className="text-xs font-mono text-slate-300 space-y-1">
                    <div>Status: <strong className="text-emerald-400">{activeHexapod.sensors.microFLIR}</strong></div>
                    <div>Endoscope: <strong className="text-cyan-300">Armed 1.8m probe</strong></div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'PAYLOAD' && (
              <div className="bg-[#12151e] p-4 rounded-2xl border border-white/10 space-y-3">
                <span className="text-xs font-mono text-white font-bold uppercase">Ground Unit Tooling & Anchor</span>
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[9.5px] text-slate-400 uppercase block">TOOL TYPE</span>
                    <strong className="text-white text-sm block mt-0.5">{activeHexapod.payload.type}</strong>
                  </div>
                  <div className="p-3 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[9.5px] text-slate-400 uppercase block">WEIGHT</span>
                    <strong className="text-white text-sm block mt-0.5">{activeHexapod.payload.weightKg} kg</strong>
                  </div>
                  <div className="p-3 bg-[#0a0d14] rounded-xl border border-white/5">
                    <span className="text-[9.5px] text-slate-400 uppercase block">STATUS</span>
                    <strong className="text-cyan-400 text-sm block mt-0.5">{activeHexapod.payload.status}</strong>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}

      </div>
    </div>
  );
};
