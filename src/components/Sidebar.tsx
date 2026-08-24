import React from 'react';
import { 
  Map, 
  Cpu, 
  Heart, 
  Radio, 
  BarChart3, 
  Layers, 
  History, 
  BrainCircuit,
  Activity,
  Wifi,
  Shield
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'triage-list' 
  | 'drone-detail' 
  | 'swarm-metrics' 
  | 'reason-trace' 
  | 'mission-playback';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  criticalTriageCount: number;
  activeDronesCount: number;
  activeHexapodsCount?: number;
  missionMode: 'MOCK_SIMULATION' | 'LIVE_HARDWARE';
  onToggleMode: (mode: 'MOCK_SIMULATION' | 'LIVE_HARDWARE') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  criticalTriageCount,
  activeDronesCount,
  activeHexapodsCount = 6,
  missionMode,
  onToggleMode
}) => {
  const navItems: { id: NavTab; label: string; sublabel: string; icon: React.FC<{ className?: string }>; badge?: string; badgeColor?: string }[] = [
    { 
      id: 'dashboard', 
      label: 'Live Tactical Radar', 
      sublabel: 'Hexapod Geofence & Map',
      icon: Map 
    },
    { 
      id: 'triage-list', 
      label: 'Casualty Triage Hub', 
      sublabel: 'Rubble Void & Landslide',
      icon: Heart,
      badge: criticalTriageCount > 0 ? `${criticalTriageCount} Entrapped` : 'Clear',
      badgeColor: criticalTriageCount > 0 ? 'bg-[#ff4b1f]/20 text-[#ff4b1f] border-[#ff4b1f]/50 animate-pulse' : 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50'
    },
    { 
      id: 'drone-detail', 
      label: 'Air-Ground Fleet Telemetry', 
      sublabel: `${activeDronesCount} UAVs + ${activeHexapodsCount} Hexapods`,
      icon: Cpu,
      badge: `${activeDronesCount + activeHexapodsCount} Active`,
      badgeColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
    },
    { 
      id: 'swarm-metrics', 
      label: 'ACS & Seismic Analytics', 
      sublabel: 'Geofence & Shear Stats',
      icon: BarChart3 
    },
    { 
      id: 'reason-trace', 
      label: 'Edge AI Reasoning', 
      sublabel: 'Seismic & Void Fusion',
      icon: BrainCircuit 
    },
    { 
      id: 'mission-playback', 
      label: 'Blackbox Mission Replay', 
      sublabel: '150s Air-Ground Buffer',
      icon: History 
    },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-[#0d0f16]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between select-none z-40">
      {/* Navigation Modules */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
          Tactical Command Views
        </div>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff6b2c] to-[#ff4b1f] text-white font-bold shadow-[0_4px_20px_rgba(255,107,44,0.4)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#ff6b2c]'}`} />
                  <div>
                    <div className="text-xs font-semibold tracking-tight">{item.label}</div>
                    <div className={`text-[10px] font-mono ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mesh Health & Subsystem Footer */}
      <div className="p-4 border-t border-white/10 bg-[#090b10]/90 space-y-3">
        <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            NNP AIR-GROUND MESH
          </span>
          <span className="text-emerald-400 font-bold">99.4%</span>
        </div>

        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#ff6b2c] w-[99.4%] shadow-[0_0_8px_#ff6b2c]"></div>
        </div>

        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span>LATENCY: 12ms</span>
          <span>NODES: 16 UNITS</span>
        </div>
      </div>
    </aside>
  );
};
