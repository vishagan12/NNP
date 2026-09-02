import React, { useState, useEffect } from 'react';
import { DroneTelemetry, HexapodTelemetry, TriageEvent, PheromoneCell, AlertEntry, MissionLocation, RescueRoute } from '../types';
import { TacticalMap } from './TacticalMap';
import { 
  Battery, 
  Activity,
  AlertTriangle, 
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Zap
} from 'lucide-react';

interface DashboardViewProps {
  drones: DroneTelemetry[];
  hexapods: HexapodTelemetry[];
  triageEvents: TriageEvent[];
  pheromoneGrid: PheromoneCell[];
  alerts: AlertEntry[];
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
  onAcknowledgeAlert: (alertId: string) => void;
  onDispatchMedicalDrone: (victimId: string) => void;
  onDispatchHexapodInfiltration?: (victimId: string, hexapodId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  drones,
  hexapods,
  triageEvents,
  pheromoneGrid,
  rescueRoutes,
  currentLocation,
  onSelectLocation,
  selectedDroneId,
  onSelectDrone,
  selectedHexapodId,
  onSelectHexapod,
  onResetFocus,
  selectedTriageId,
  onSelectTriage,
  onDispatchMedicalDrone,
  onDispatchHexapodInfiltration
}) => {
  // ── Clock states
  const [actualTime, setActualTime] = useState<string>(() => 
    new Date().toLocaleTimeString('en-GB', { hour12: false })
  );
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);
  const [replayTimeSec, setReplayTimeSec] = useState<number>(150);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setActualTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    if (isPlayingReplay) {
      interval = window.setInterval(() => {
        setReplayTimeSec(prev => (prev >= 150 ? 0 : prev + 1));
      }, 1000 / playbackSpeed);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPlayingReplay, playbackSpeed]);

  // ── Fleet Units for Marquee
  const allFleetUnits = [
    ...drones.map(d => ({
      id: d.id,
      type: 'UAV' as const,
      status: d.status,
      battery: d.battery.level,
      label: d.callsign,
      tag: d.zoneAssignment === 'PERIMETER_RING' ? 'PERIM' : 'CORE'
    })),
    ...hexapods.map(h => ({
      id: h.id,
      type: 'HEXA' as const,
      status: h.status,
      battery: h.battery.level,
      label: h.callsign,
      tag: 'GROUND'
    }))
  ];

  const marqueeItems = [...allFleetUnits, ...allFleetUnits];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const replayProgress = (replayTimeSec / 150) * 100;
  const isLive = replayTimeSec >= 150;

  return (
    <div className="flex flex-col gap-1.5 h-[calc(100vh-74px)] overflow-hidden">

      {/* ══════════════════════════════════════════════════════ */}
      {/* 2. INFINITE SCROLLING SWARM TICKER                    */}
      {/* ══════════════════════════════════════════════════════ */}
      <div
        className="rounded-xl overflow-hidden shrink-0 border"
        style={{
          background: 'rgba(10,12,20,0.95)',
          borderColor: 'rgba(255,255,255,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <div className="flex items-stretch">
          {/* Label tab */}
          <div
            className="px-3 flex items-center gap-2 shrink-0 border-r"
            style={{ background: 'rgba(255,107,44,0.08)', borderColor: 'rgba(255,107,44,0.2)' }}
          >
            <Activity size={13} className="text-orange-400 animate-pulse" />
            <div className="font-mono">
              <div className="text-[8.5px] text-slate-500 uppercase tracking-wider leading-none">SWARM</div>
              <div className="text-[10px] font-bold text-orange-400 leading-none mt-0.5">{allFleetUnits.length} UNITS</div>
            </div>
          </div>

          {/* Scrolling strip */}
          <div className="flex-1 overflow-hidden py-1 px-2">
            <div className="animate-marquee-loop flex items-center gap-2">
              {marqueeItems.map((unit, idx) => {
                const isSelected = (unit.type === 'UAV' && selectedDroneId === unit.id) || 
                                   (unit.type === 'HEXA' && selectedHexapodId === unit.id);
                const isUAV = unit.type === 'UAV';

                return (
                  <div
                    key={`${unit.id}-${idx}`}
                    onClick={() => {
                      if (isSelected) {
                        if (onResetFocus) onResetFocus();
                      } else {
                        if (isUAV) {
                          onSelectDrone(unit.id);
                        } else if (onSelectHexapod) {
                          onSelectHexapod(unit.id);
                        }
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg shrink-0 cursor-pointer font-mono transition-all duration-200 ${
                      isSelected
                        ? 'scale-[1.04]'
                        : 'hover:bg-white/5'
                    }`}
                    style={isSelected ? {
                      background: isUAV ? 'rgba(255,107,44,0.22)' : 'rgba(168,85,247,0.22)',
                      border: isUAV ? '1px solid #ff6b2c' : '1px solid #a855f7',
                      boxShadow: isUAV ? '0 0 14px rgba(255,107,44,0.45)' : '0 0 14px rgba(168,85,247,0.45)'
                    } : {
                      background: 'rgba(15,18,30,0.85)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    {/* Type dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background: isUAV ? '#ff6b2c' : '#a855f7',
                        boxShadow: isUAV ? '0 0 6px #ff6b2c' : '0 0 6px #06b6d4'
                      }}
                    />

                    {/* Unit ID */}
                    <span className="font-bold text-[11px] text-white tracking-wide">
                      {unit.id}
                    </span>

                    {/* Tag */}
                    <span
                      className="text-[8px] font-bold px-1 rounded uppercase tracking-wider"
                      style={{
                        background: isUAV ? 'rgba(255,107,44,0.15)' : 'rgba(168,85,247,0.18)',
                        color: isUAV ? '#fb923c' : '#c084fc'
                      }}
                    >
                      {unit.tag}
                    </span>

                    {/* Battery */}
                    <div className="flex items-center gap-1">
                      <Battery
                        size={11}
                        className={unit.battery < 30 ? 'text-red-400' : 'text-emerald-400'}
                      />
                      <span className={`text-[10px] font-bold ${unit.battery < 30 ? 'text-red-400' : 'text-slate-300'}`}>
                        {Math.round(unit.battery)}%
                      </span>
                    </div>

                    {/* Status pill */}
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{
                        background: unit.status === 'ENGAGED' ? 'rgba(239,68,68,0.2)' :
                                    unit.status === 'ANCHORED' ? 'rgba(16,185,129,0.2)' :
                                    unit.status === 'LOW BATT' ? 'rgba(245,158,11,0.2)' :
                                    'rgba(255,255,255,0.06)',
                        color: unit.status === 'ENGAGED' ? '#f87171' :
                               unit.status === 'ANCHORED' ? '#6ee7b7' :
                               unit.status === 'LOW BATT' ? '#fbbf24' :
                               '#94a3b8'
                      }}
                    >
                      {unit.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 3. TACTICAL MAP CONTAINER                              */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden shadow-2xl">
        <TacticalMap
          drones={drones}
          hexapods={hexapods}
          triageEvents={triageEvents}
          pheromoneGrid={pheromoneGrid}
          rescueRoutes={rescueRoutes}
          currentLocation={currentLocation}
          onSelectLocation={onSelectLocation}
          selectedDroneId={selectedDroneId}
          onSelectDrone={onSelectDrone}
          selectedHexapodId={selectedHexapodId}
          onSelectHexapod={onSelectHexapod}
          onResetFocus={onResetFocus}
          selectedTriageId={selectedTriageId}
          onSelectTriage={onSelectTriage}
          onDispatchMedicalDrone={onDispatchMedicalDrone}
          onDispatchHexapodInfiltration={onDispatchHexapodInfiltration}
        />
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 4. BLACKBOX REPLAY BAR                                */}
      {/* ══════════════════════════════════════════════════════ */}
      <div
        className="rounded-xl px-4 py-1.5 flex items-center gap-4 shrink-0 border"
        style={{
          background: 'rgba(9,11,19,0.98)',
          borderColor: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)'
        }}
      >

        {/* Left: Labels + Clocks */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Blackbox chip */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border font-mono text-[9.5px] font-bold"
            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.35)', color: '#f87171' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <span>REC</span>
          </div>

          {/* Actual time */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono"
            style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)' }}
          >
            <Clock size={11} className="text-cyan-400 shrink-0" />
            <div>
              <div className="text-[7px] text-slate-300 font-semibold uppercase leading-none tracking-wider">ACTUAL</div>
              <div className="text-[11px] font-bold text-white leading-tight tracking-wider">{actualTime}</div>
            </div>
          </div>

          {/* Mission clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono"
            style={{ background: 'rgba(255,107,44,0.06)', borderColor: 'rgba(255,107,44,0.2)' }}
          >
            <Zap size={12} className="text-orange-400 shrink-0" />
            <div>
              <div className="text-[7.5px] text-slate-300 font-semibold uppercase leading-none tracking-wider">MISSION T+</div>
              <div className="text-[12px] font-bold text-orange-400 leading-tight tracking-wider">{formatTime(replayTimeSec)}</div>
            </div>
          </div>
        </div>

        {/* Center: Scrubber */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="font-mono text-[9px] text-slate-300 font-semibold shrink-0">00:00</span>
          
          <div className="relative flex-1 flex items-center">
            {/* Track background */}
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${replayProgress}%`,
                  background: 'linear-gradient(90deg, #ff4b1f, #ff6b2c)',
                  boxShadow: '0 0 8px rgba(255,107,44,0.6)'
                }}
              />
            </div>
            {/* Thumb input */}
            <input
              type="range"
              min={0}
              max={150}
              value={replayTimeSec}
              onChange={(e) => setReplayTimeSec(parseInt(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>

          <span className="font-mono text-[9px] text-slate-300 font-semibold shrink-0">02:30</span>
        </div>

        {/* Right: Transport controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Transport buttons */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border"
            style={{ background: 'rgba(17,20,32,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <button
              onClick={() => setReplayTimeSec(Math.max(0, replayTimeSec - 10))}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              title="Back 10s"
            >
              <SkipBack size={12} />
            </button>

            <button
              onClick={() => setIsPlayingReplay(!isPlayingReplay)}
              className="px-3 h-7 flex items-center gap-1 rounded-md font-mono text-[9.5px] font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #ff4b1f, #ff6b2c)', boxShadow: '0 2px 10px rgba(255,107,44,0.4)' }}
            >
              {isPlayingReplay ? <Pause size={10} /> : <Play size={10} />}
              <span>{isPlayingReplay ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => setReplayTimeSec(Math.min(150, replayTimeSec + 10))}
              className="w-7 h-7 flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              title="Fwd 10s"
            >
              <SkipForward size={12} />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border font-mono"
            style={{ background: 'rgba(17,20,32,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            {[1, 2, 4].map(spd => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded text-[9.5px] font-bold transition-all ${
                  playbackSpeed === spd ? 'text-orange-400 shadow-inner' : 'text-slate-300 hover:text-white'
                }`}
                style={playbackSpeed === spd ? { background: 'rgba(255,107,44,0.18)' } : {}}
              >
                {spd}×
              </button>
            ))}
          </div>

          {/* Live Button */}
          <button
            onClick={() => setReplayTimeSec(150)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all border"
            style={isLive ? {
              background: 'rgba(16,185,129,0.18)',
              borderColor: 'rgba(16,185,129,0.5)',
              color: '#6ee7b7',
              boxShadow: '0 0 12px rgba(16,185,129,0.35)'
            } : {
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: '#64748b'
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>LIVE</span>
          </button>
        </div>

      </div>

    </div>
  );
};
