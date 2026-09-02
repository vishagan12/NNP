import React from 'react';
import {
  Map,
  Cpu,
  Heart,
  BarChart3,
  History,
  BrainCircuit,
  Wifi,
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
}) => {
  type BadgeVariant = 'critical' | 'info' | 'ok';

  const navItems: {
    id: NavTab;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string; size?: number | string }>;
    badge?: string;
    variant?: BadgeVariant;
  }[] = [
      { id: 'dashboard', label: 'Tactical Map', sublabel: 'Live Satellite View', icon: Map },
      {
        id: 'triage-list', label: 'Casualty Triage', sublabel: 'Rescue Queue & Dispatch', icon: Heart,
        badge: criticalTriageCount > 0 ? `${criticalTriageCount} Critical` : 'Clear',
        variant: criticalTriageCount > 0 ? 'critical' : 'ok'
      },
      {
        id: 'drone-detail', label: 'Fleet Telemetry', sublabel: `${activeDronesCount + activeHexapodsCount} Units Active`, icon: Cpu,
        badge: `${activeDronesCount + activeHexapodsCount}`,
        variant: 'info'
      },
      { id: 'swarm-metrics', label: 'ACS Analytics', sublabel: 'Swarm & Seismic Stats', icon: BarChart3 },
      { id: 'reason-trace', label: 'Edge AI Reasoning', sublabel: 'Multi-Modal Fusion', icon: BrainCircuit },
      { id: 'mission-playback', label: 'Blackbox Replay', sublabel: '150s Mission Buffer', icon: History },
    ];

  const badgeStyle: Record<BadgeVariant, React.CSSProperties> = {
    critical: { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' },
    info: { background: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.35)' },
    ok: { background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' },
  };

  return (
    <aside
      className="fixed left-0 top-[58px] h-[calc(100vh-58px)] w-[220px] flex flex-col justify-between select-none z-40"
      style={{
        background: 'rgba(5,7,14,0.98)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.6)',
      }}
    >
      {/* Section label */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <span className="font-mono text-[9.5px] text-slate-300 uppercase tracking-[0.2em] font-bold">
          Command Views
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all group"
              style={isActive ? {
                background: 'rgba(255,107,44,0.12)',
                boxShadow: 'inset 0 0 0 1px rgba(255,107,44,0.35)',
              } : { background: 'transparent' }}
            >
              {/* Icon box */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={isActive
                  ? { background: 'rgba(255,107,44,0.18)', boxShadow: '0 0 10px rgba(255,107,44,0.25)' }
                  : { background: 'rgba(255,255,255,0.04)' }
                }
              >
                <Icon
                  size={14}
                  className={`transition-colors ${isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                />
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0 text-left">
                <div className={`text-[11.5px] font-semibold leading-tight truncate transition-colors ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                  {item.label}
                </div>
                <div className={`text-[9px] font-mono leading-tight mt-0.5 truncate transition-colors ${isActive ? 'text-orange-300/85' : 'text-slate-300 group-hover:text-slate-200 font-medium'}`}>
                  {item.sublabel}
                </div>
              </div>

              {/* Badge */}
              {item.badge && item.variant && (
                <span
                  className="shrink-0 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap"
                  style={badgeStyle[item.variant]}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mesh health footer */}
      <div
        className="px-4 py-3 shrink-0 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.25)' }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] text-slate-300 font-semibold">
            <Wifi size={10} className="text-emerald-400 animate-pulse" />
            <span>MESH LINK</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-emerald-400">99.4%</span>
        </div>

        {/* Health bar */}
        <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full" style={{
            width: '99.4%',
            background: 'linear-gradient(90deg, #10b981, #06b6d4, #ff6b2c)',
            boxShadow: '0 0 6px rgba(16,185,129,0.5)'
          }} />
        </div>

        <div className="flex justify-between font-mono text-[8.5px] text-slate-300 font-semibold">
          <span>LAT 12ms</span>
          <span>16 NODES</span>
        </div>

        <div className="mt-2 px-2 py-1 rounded-lg text-center font-mono text-[8.5px] text-slate-300 font-medium border"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
        >
          OP-SEISMIC-RECON-7 · ACS v5.0
        </div>
      </div>
    </aside>
  );
};
