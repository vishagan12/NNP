import React from 'react';
import { Radio, ShieldAlert, Cpu, Activity, Signal, Layers, Wifi, Shield, Mountain } from 'lucide-react';

interface HeaderProps {
  missionId: string;
  activeDronesCount: number;
  activeHexapodsCount?: number;
  interiorDronesCount?: number;
  perimeterDronesCount?: number;
  totalAreaSqKm: number;
  searchedPercentage: number;
  meshHealthScore: number;
  geofenceIntegrityScore?: number;
  missionMode: 'MOCK_SIMULATION' | 'LIVE_HARDWARE';
  onToggleMode: (mode: 'MOCK_SIMULATION' | 'LIVE_HARDWARE') => void;
}

export const Header: React.FC<HeaderProps> = ({
  missionId,
  activeDronesCount,
  activeHexapodsCount = 6,
  interiorDronesCount = 6,
  perimeterDronesCount = 4,
  totalAreaSqKm,
  searchedPercentage,
  meshHealthScore,
  geofenceIntegrityScore = 99.2,
  missionMode,
  onToggleMode
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0c0f16]/95 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="h-16 w-full px-5 flex items-center justify-between">
        {/* NNP Brand Accent */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4b1f] to-[#ff6b2c] flex items-center justify-center shadow-[0_0_20px_rgba(255,107,44,0.5)] border border-orange-400/40 text-white font-black text-lg">
            ⚡
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-widest uppercase bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                NNP
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ff6b2c]/20 text-[#ff6b2c] border border-[#ff6b2c]/40 font-mono font-bold">
                SEISMIC USAR GCS v5.0
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Air-Ground Swarm • Hexapod Geofencing • Disaster Response
            </span>
          </div>
        </div>

        {/* Tactical Metric Strip */}
        <div className="hidden lg:flex items-center gap-5 bg-[#141722]/90 px-5 py-2 rounded-xl border border-white/10 shadow-inner">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#ff6b2c] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase">MISSION OPERATION</span>
              <span className="text-xs font-mono font-bold text-white tracking-wider">SEISMIC SHIELD</span>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-white/10"></div>

          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-[#ff6b2c]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase">AIR-GROUND FLEET</span>
              <span className="text-xs font-mono font-bold text-white">
                {activeDronesCount} UAVs + {activeHexapodsCount} Hexa
              </span>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-white/10"></div>

          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase">GEOFENCE LOCK</span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {geofenceIntegrityScore}% (6 Anchors)
              </span>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-white/10"></div>

          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase">SEARCH COVERAGE</span>
              <span className="text-xs font-mono font-bold text-white">{searchedPercentage}%</span>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-white/10"></div>

          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase">868MHz MESH LINK</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{meshHealthScore}%</span>
            </div>
          </div>
        </div>

        {/* Right Status Actions & Mode Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#141722] p-1 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => onToggleMode('MOCK_SIMULATION')}
              className={`px-3 py-1 text-[10.5px] font-mono font-bold rounded-lg transition-all ${
                missionMode === 'MOCK_SIMULATION'
                  ? 'bg-gradient-to-r from-[#ff4b1f] to-[#ff6b2c] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ACS SIM
            </button>
            <button
              onClick={() => onToggleMode('LIVE_HARDWARE')}
              className={`px-3 py-1 text-[10.5px] font-mono font-bold rounded-lg transition-all ${
                missionMode === 'LIVE_HARDWARE'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LIVE HARDWARE
            </button>
          </div>

          <div className="text-right hidden xl:block">
            <div className="text-[9px] font-mono text-slate-400">COMMAND GCS</div>
            <div className="text-xs font-mono text-white font-semibold">ALPHA_COMMAND_01</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff6b2c] to-[#ff4b1f] p-0.5 shadow-md">
            <div className="w-full h-full bg-[#0e1118] rounded-[10px] flex items-center justify-center text-white text-xs font-bold font-mono">
              NNP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
