import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  Activity, 
  Clock, 
  Shield, 
  SkipForward, 
  SkipBack, 
  Cpu,
  Compass
} from 'lucide-react';
import { DroneTelemetry, HexapodTelemetry } from '../types';

interface MissionPlaybackViewProps {
  drones?: DroneTelemetry[];
  hexapods?: HexapodTelemetry[];
}

export const MissionPlaybackView: React.FC<MissionPlaybackViewProps> = ({ 
  drones = [],
  hexapods = []
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(68);

  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-74px)] overflow-hidden">
      {/* 1. Playback Header */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#ff4b1f] to-[#ff6b2c] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,107,44,0.4)] border border-orange-400/40">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              NNP Air-Ground Blackbox Telemetry & Geofence Replay
            </h2>
            <p className="text-xs font-mono text-slate-400">
              150-second continuous circular telemetry flight buffer across 10 Ant UAVs & 6 Hexapod Ground Units
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTimeSec(150)}
            className="px-4 py-2 rounded-xl gradient-orange-btn text-white font-bold text-xs uppercase shadow-md flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            Return To Live Feed
          </button>
        </div>
      </div>

      {/* 2. Main Playback Visualizer & Multi-Drone Stream Pods */}
      <div className="flex-grow glass-panel rounded-2xl border border-white/10 shadow-2xl p-4 flex flex-col justify-between overflow-hidden min-h-0">
        
        {/* Virtual 16-Agent Air-Ground Synchronizer */}
        <div className="relative flex-grow rounded-2xl bg-[#08090d] border border-white/10 p-3.5 flex flex-col justify-between overflow-y-auto min-h-[220px]">
          {/* Top Frame Overlay */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ff6b2c] animate-pulse" />
              <span className="text-white font-bold">16-UNIT HETEROGENEOUS BLACKBOX FRAME #{currentTimeSec * 4}</span>
            </div>
            <span className="text-cyan-400 font-bold">GEOFENCE LOCK: ACTIVE (150s BUFFER)</span>
          </div>

          {/* Air & Ground Node Grid */}
          <div className="space-y-3 my-auto py-2">
            {/* Aerial UAV Strip */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase font-bold">
                Aerial Ant UAV Flight Channels (10 Units)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const antId = `ANT-${idx < 9 ? '0' : ''}${idx + 1}`;
                  const batt = Math.max(15, Math.round(92 - (idx * 6) - (150 - currentTimeSec) * 0.05));
                  return (
                    <div key={idx} className="p-2 bg-[#12151e] rounded-xl border border-white/5 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px] font-bold text-white">
                        <span className="text-[#ff6b2c]">🐜 {antId}</span>
                        <span className={batt < 25 ? 'text-red-400' : 'text-emerald-400'}>{batt}%</span>
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">ALT: {45 + idx * 6}m</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ground Hexapod Strip */}
            <div>
              <span className="text-[10px] font-mono text-cyan-300 block mb-1.5 uppercase font-bold">
                Ground Hexapod Perimeter Channels (6 Units)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const hexId = `HEXA-0${idx + 1}`;
                  const stab = 85 + ((idx * 3) % 15);
                  return (
                    <div key={idx} className="p-2 bg-[#041d24] rounded-xl border border-cyan-500/30 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px] font-bold text-white">
                        <span className="text-cyan-300">🕷️ {hexId}</span>
                        <span className="text-emerald-400">{stab}%</span>
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">LOCKED</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Timestamp */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/10 pt-2">
            <span>TIMELINE OFFSET: -{150 - currentTimeSec}s</span>
            <span className="text-white font-bold">TIMESTAMP: 14:02:{currentTimeSec < 10 ? `0${currentTimeSec}` : currentTimeSec} UTC</span>
          </div>
        </div>

        {/* 3. Scrubber Timeline Slider & Controls */}
        <div className="mt-3 bg-[#12151e] p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2.5 shadow-lg shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTimeSec(Math.max(0, currentTimeSec - 10))}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="-10s"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl gradient-orange-btn text-white flex items-center justify-center hover:opacity-95 transition-opacity shadow-lg"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentTimeSec(Math.min(150, currentTimeSec + 10))}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="+10s"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <span className="font-mono text-sm text-white font-bold ml-2">
                {Math.floor(currentTimeSec / 60)}:{currentTimeSec % 60 < 10 ? '0' : ''}{currentTimeSec % 60} / 02:30
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              ALL 16 AIR-GROUND CHANNELS SYNCHRONIZED
            </div>
          </div>

          {/* Interactive Timeline Slider */}
          <input
            type="range"
            min="0"
            max="150"
            value={currentTimeSec}
            onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
            className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#ff6b2c]"
          />
        </div>
      </div>
    </div>
  );
};
