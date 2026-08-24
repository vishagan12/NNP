import React from 'react';
import { ReasoningTraceLog } from '../types';
import { BrainCircuit, Cpu, ShieldCheck, Mountain, AlertTriangle, Info, Terminal, Sparkles, Shield } from 'lucide-react';

interface ReasonTraceViewProps {
  traces: ReasoningTraceLog[];
}

export const ReasonTraceView: React.FC<ReasonTraceViewProps> = ({ traces }) => {
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-96px)] overflow-hidden">
      {/* 1. Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#ff4b1f] to-[#ff6b2c] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,107,44,0.4)] border border-orange-400/40">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Decentralized Edge AI Reasoning & Seismic Sensor Fusion Trace
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Autonomous on-drone & on-hexapod edge inference, borehole geophone tap correlation, and dynamic geofence arbitration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-cyan-950/60 text-cyan-300 px-3.5 py-1.5 rounded-xl border border-cyan-700/50 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            16x AIR-GROUND EDGE NODES ACTIVE
          </span>
        </div>
      </div>

      {/* 2. Traces Timeline */}
      <div className="flex-grow overflow-y-auto space-y-3.5 pr-1 min-h-0">
        {traces.map((trace) => (
          <div
            key={trace.id}
            className="glass-panel rounded-2xl border border-white/10 shadow-xl p-4 flex flex-col gap-3"
          >
            {/* Trace Title & Metadata */}
            <div className="flex items-start justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  trace.severity === 'CRITICAL' ? 'bg-[#ff4b1f]/20 text-[#ff4b1f] border border-[#ff4b1f]/40' :
                  trace.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {trace.severity}
                </span>
                <div>
                  <h3 className="font-mono text-sm font-bold text-white">{trace.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
                    <span>TRACE ID: {trace.id}</span>
                    <span>•</span>
                    <span className="text-[#ff6b2c] font-bold">SOURCE: {trace.droneId}</span>
                    <span>•</span>
                    <span>TIME: {trace.timestamp} UTC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inference Steps (Chain of Thought) */}
            <div className="bg-[#12151e] rounded-xl p-3.5 border border-white/10">
              <span className="text-[10px] font-mono text-[#ff6b2c] uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Chain of Local Inference Steps (YOLOv9 + Triaxial Geophone Fusion)
              </span>
              <div className="space-y-1.5">
                {trace.inferencePath.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-md bg-[#ff6b2c]/20 text-[#ff6b2c] font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-[#ff6b2c]/30">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Autonomous Swarm Directive Output */}
            <div className="bg-[#ff6b2c]/10 rounded-xl p-3.5 border border-[#ff6b2c]/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#ff6b2c] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono text-[#ff6b2c] uppercase font-bold block">
                  Autonomous Swarm Directive Executed
                </span>
                <p className="text-xs font-mono text-white mt-0.5 font-semibold leading-relaxed">
                  {trace.autonomousDecision}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
