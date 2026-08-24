import React, { useState } from 'react';
import { 
  BarChart3, 
  Layers, 
  Zap, 
  Activity, 
  Cpu, 
  Shield, 
  Mountain, 
  Radio, 
  Navigation, 
  Compass,
  SlidersHorizontal,
  TrendingUp,
  RefreshCw,
  Clock,
  Wifi,
  Sparkles
} from 'lucide-react';
import { PheromoneCell, SwarmMissionStats, DroneTelemetry, HexapodTelemetry } from '../types';

interface SwarmMetricsViewProps {
  stats: SwarmMissionStats;
  pheromoneGrid: PheromoneCell[];
  drones: DroneTelemetry[];
  hexapods?: HexapodTelemetry[];
}

export const SwarmMetricsView: React.FC<SwarmMetricsViewProps> = ({
  stats,
  pheromoneGrid,
  drones,
  hexapods = []
}) => {
  const [rhoParam, setRhoParam] = useState<number>(0.015);
  const [alphaParam, setAlphaParam] = useState<number>(1.80);
  const [geofenceBufferM, setGeofenceBufferM] = useState<number>(65);

  const totalCells = pheromoneGrid.length;
  const searchedCells = pheromoneGrid.filter(c => c.coverageScore > 0.4).length;
  const slopeRiskCells = pheromoneGrid.filter(c => c.slopeRiskLevel > 0.6).length;

  const avgUavBattery = Math.round(drones.reduce((acc, d) => acc + d.battery.level, 0) / (drones.length || 1));
  const avgHexaStability = Math.round(hexapods.reduce((acc, h) => acc + h.groundStabilityIndex, 0) / (hexapods.length || 1));
  const avgHexaVibration = (hexapods.reduce((acc, h) => acc + h.seismicAcoustic.vibrationMmS, 0) / (hexapods.length || 1)).toFixed(2);
  const totalRssi = Math.round(drones.reduce((acc, d) => acc + d.link.rssi, 0) / (drones.length || 1));

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-96px)] overflow-y-auto space-y-4 pr-1">
      
      {/* 1. Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#ff4b1f] to-[#ff6b2c] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,107,44,0.4)] border border-orange-400/40">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Air-Ground Heterogeneous Swarm & Seismic Analytics
            </h2>
            <p className="text-xs font-mono text-slate-400">
              10 Aerial Ant UAVs (ACS Stigmergy) + 6 Ground Hexapod Robots (Dynamic Laser Geofencing & Soil Shear Monitoring)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-cyan-950/60 text-cyan-300 px-3.5 py-1.5 rounded-xl border border-cyan-700/50 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            6/6 GEOFENCE ANCHORS LOCKED
          </span>
        </div>
      </div>

      {/* 2. Primary 4 KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#12151e] border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">AERIAL ACS SEARCH COVERAGE</span>
            <div className="text-3xl font-mono font-bold text-[#ff6b2c] mt-1">
              {stats.searchedPercentage}%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Rubble Grid Cells</span>
            <span className="text-white font-bold">{searchedCells} / {totalCells}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12151e] border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">HEXAPOD GEOFENCE INTEGRITY</span>
            <div className="text-3xl font-mono font-bold text-cyan-400 mt-1">
              {stats.geofenceIntegrityScore}%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Active Laser Links</span>
            <span className="text-cyan-300 font-bold">6 Connected Vertices</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12151e] border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">SLOPE FAILURE HAZARD RISK</span>
            <div className="text-3xl font-mono font-bold text-amber-400 mt-1">
              {stats.seismicRiskScore}%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Landslide Scarp Cells</span>
            <span className="text-amber-400 font-bold">{slopeRiskCells} Critical</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12151e] border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">AIR-GROUND MESH HEALTH</span>
            <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">
              {stats.meshHealthScore}%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Total Swarm Nodes</span>
            <span className="text-emerald-400 font-bold">16 Units (10 UAV + 6 UGV)</span>
          </div>
        </div>
      </div>

      {/* 3. Air-Ground Telemetry Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#12151e] border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white font-bold uppercase flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#ff6b2c]" /> 10 UAV Swarm Battery
            </span>
            <span className="text-sm font-mono font-bold text-emerald-400">{avgUavBattery}%</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-[#ff6b2c]" style={{ width: `${avgUavBattery}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
            <span>10x 6S LiPo Packs</span>
            <span>Est. Flight: 26 min</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12151e] border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white font-bold uppercase flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" /> Hexapod Ground Stability
            </span>
            <span className="text-sm font-mono font-bold text-cyan-300">{avgHexaStability}%</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${avgHexaStability}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
            <span>Avg Vibration: {avgHexaVibration} mm/s</span>
            <span>Soil Shear: Normal</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12151e] border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-white font-bold uppercase flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-400" /> Air-Ground Mesh RSSI
            </span>
            <span className="text-sm font-mono font-bold text-emerald-400">{totalRssi} dBm</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, Math.max(10, 100 - (Math.abs(totalRssi) - 40)))}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
            <span>LoRa 868MHz Mesh Bridge</span>
            <span>Latency: 12ms</span>
          </div>
        </div>
      </div>

      {/* 4. Real-Time Algorithm & Dynamic Geofence Parameter Tuning */}
      <div className="p-5 rounded-2xl bg-[#12151e] border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#ff6b2c]" />
            Autonomous Air-Ground Algorithmic Parameter Optimization
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Decentralized Multi-Agent Swarm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Parameter 1: Rho */}
          <div className="p-4 rounded-xl bg-[#0d0f16] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">EVAPORATION COEFFICIENT (ρ)</span>
                <span className="text-xs font-mono font-bold text-[#ff6b2c]">{rhoParam.toFixed(3)} / cycle</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.050"
                step="0.001"
                value={rhoParam}
                onChange={(e) => setRhoParam(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#ff6b2c] my-3"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Controls rate of pheromone decay over surveyed rubble sectors.
              </p>
            </div>
          </div>

          {/* Parameter 2: Alpha */}
          <div className="p-4 rounded-xl bg-[#0d0f16] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">ACS PHEROMONE WEIGHT (α)</span>
                <span className="text-xs font-mono font-bold text-white">{alphaParam.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={alphaParam}
                onChange={(e) => setAlphaParam(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#ff6b2c] my-3"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Attraction weight toward survivor void acoustic echoes and thermal plumes.
              </p>
            </div>
          </div>

          {/* Parameter 3: Hexapod Geofence Buffer */}
          <div className="p-4 rounded-xl bg-[#0d0f16] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">GEOFENCE BUFFER RADIUS</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{geofenceBufferM} meters</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={geofenceBufferM}
                onChange={(e) => setGeofenceBufferM(parseInt(e.target.value))}
                className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-cyan-400 my-3"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dynamic laser safety exclusion zone offset placed by the 6 perimeter Hexapod robots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
