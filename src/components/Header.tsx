import React from 'react';
import { Radio, Cpu, Wifi, Shield, AlertTriangle, Layers } from 'lucide-react';

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

interface MetricPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  borderColor: string;
  bg: string;
}

const MetricPill: React.FC<MetricPillProps> = ({ icon, label, value, color, borderColor, bg }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
    style={{ background: bg, border: `1px solid ${borderColor}` }}
  >
    <div style={{ color }}>{icon}</div>
    <div className="font-mono leading-none">
      <div className="text-[7.5px] text-slate-600 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-[10.5px] font-bold whitespace-nowrap" style={{ color }}>{value}</div>
    </div>
  </div>
);

export const Header: React.FC<HeaderProps> = ({
  activeDronesCount,
  activeHexapodsCount = 6,
  searchedPercentage,
  meshHealthScore,
  geofenceIntegrityScore = 99.4,
  missionMode,
  onToggleMode
}) => {
  return (
    <header
      className="fixed top-0 w-full z-50"
      style={{
        height: '58px',
        background: 'rgba(4,6,12,0.97)',
        backdropFilter: 'blur(32px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(255,107,44,0.1), 0 4px 30px rgba(0,0,0,0.9)',
      }}
    >
      <div className="h-full w-full px-4 flex items-center gap-3">

        {/* ── LOGO ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
            style={{
              background: 'linear-gradient(135deg, #ff4b1f 0%, #ff6b2c 100%)',
              boxShadow: '0 0 20px rgba(255,107,44,0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >⚡</div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-extrabold tracking-[0.14em] uppercase leading-none text-white">
                NNP
              </span>
              <span
                className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}
              >
                <AlertTriangle size={8} className="animate-pulse" />
                USAR
              </span>
            </div>
            <span className="text-[8px] font-mono text-slate-600 tracking-widest uppercase leading-none">
              Air-Ground GCS · EQ M7.2
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="w-px h-7 shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* ── METRIC PILLS ── */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-none min-w-0">
          <MetricPill
            icon={<Radio size={12} className="animate-pulse" />}
            label="Active Hazard"
            value="EARTHQUAKE M7.2"
            color="#f87171"
            borderColor="rgba(239,68,68,0.28)"
            bg="rgba(239,68,68,0.07)"
          />
          <MetricPill
            icon={<Cpu size={12} />}
            label="Swarm Fleet"
            value={`${activeDronesCount} UAV + ${activeHexapodsCount} Hexa`}
            color="#fb923c"
            borderColor="rgba(255,107,44,0.22)"
            bg="rgba(255,107,44,0.06)"
          />
          <MetricPill
            icon={<Shield size={12} />}
            label="Geofence"
            value={`${geofenceIntegrityScore}% Locked`}
            color="#67e8f9"
            borderColor="rgba(6,182,212,0.22)"
            bg="rgba(6,182,212,0.06)"
          />
          <MetricPill
            icon={<Layers size={12} />}
            label="Coverage"
            value={`${searchedPercentage}%`}
            color="#fde68a"
            borderColor="rgba(245,158,11,0.22)"
            bg="rgba(245,158,11,0.06)"
          />
          <MetricPill
            icon={<Wifi size={12} />}
            label="868MHz Mesh"
            value={`${meshHealthScore}%`}
            color="#6ee7b7"
            borderColor="rgba(16,185,129,0.22)"
            bg="rgba(16,185,129,0.06)"
          />
        </div>

        {/* ── LIVE INDICATOR ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[9px] text-slate-500 hidden md:block">LIVE</span>
        </div>

        {/* ── Divider ── */}
        <div className="w-px h-7 shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* ── MODE SWITCHER ── */}
        <div
          className="flex items-center gap-0.5 p-0.5 rounded-lg shrink-0"
          style={{ background: 'rgba(15,18,30,0.95)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {(['MOCK_SIMULATION', 'LIVE_HARDWARE'] as const).map((mode) => {
            const isActive = missionMode === mode;
            const label = mode === 'MOCK_SIMULATION' ? 'SIM' : 'HW';
            return (
              <button
                key={mode}
                onClick={() => onToggleMode(mode)}
                className="px-3 py-1.5 rounded-md font-mono text-[10px] font-bold transition-all"
                style={isActive ? {
                  background: mode === 'MOCK_SIMULATION'
                    ? 'linear-gradient(135deg,#ff4b1f,#ff6b2c)'
                    : 'linear-gradient(135deg,#0891b2,#06b6d4)',
                  color: '#fff',
                  boxShadow: mode === 'MOCK_SIMULATION'
                    ? '0 2px 10px rgba(255,107,44,0.45)'
                    : '0 2px 10px rgba(6,182,212,0.45)',
                } : { color: '#475569' }}
              >
                {label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,107,44,0.35) 30%,rgba(255,107,44,0.35) 70%,transparent)' }} />
    </header>
  );
};
