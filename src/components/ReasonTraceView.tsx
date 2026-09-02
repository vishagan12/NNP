import React, { useState } from 'react';
import { ReasoningTraceLog } from '../types';
import { 
  BrainCircuit, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  Radio, 
  Activity, 
  ShieldAlert, 
  AlertTriangle,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface ReasonTraceViewProps {
  traces: ReasoningTraceLog[];
}

export const ReasonTraceView: React.FC<ReasonTraceViewProps> = ({ traces = [] }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredTraces = traces.filter(t => {
    if (selectedSeverity !== 'ALL' && t.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-74px)] overflow-hidden">
      
      {/* ── 1. Top Header Banner ── */}
      <div 
        className="rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 border"
        style={{
          background: 'linear-gradient(135deg, rgba(14,17,28,0.95) 0%, rgba(20,24,40,0.98) 100%)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #ff4b1f, #ff6b2c)',
              boxShadow: '0 0 16px rgba(255,107,44,0.4)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <BrainCircuit size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Decentralized Edge AI Reasoning & Sensor Fusion
              </h2>
              <span 
                className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold border"
                style={{ background: 'rgba(6,182,212,0.15)', color: '#67e8f9', borderColor: 'rgba(6,182,212,0.35)' }}
              >
                16 AIR-GROUND EDGE CORES
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Autonomous on-drone inference · Borehole geophone tap cadence correlation · Optical geofence arbitration
            </p>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div 
          className="flex items-center gap-1 p-1 rounded-lg border shrink-0"
          style={{ background: 'rgba(7,9,16,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map((sev) => {
            const isSelected = selectedSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className="px-2.5 py-1 rounded-md font-mono text-[9.5px] font-bold transition-all"
                style={isSelected ? {
                  background: sev === 'CRITICAL' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' :
                              sev === 'HIGH'     ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                              sev === 'MEDIUM'   ? 'linear-gradient(135deg, #06b6d4, #0891b2)' :
                              'linear-gradient(135deg, #ff4b1f, #ff6b2c)',
                  color: '#ffffff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                } : {
                  color: '#64748b'
                }}
              >
                {sev}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Traces Timeline ── */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0 scrollbar-thin">
        {filteredTraces.length === 0 ? (
          <div className="rounded-xl border p-8 text-center font-mono text-slate-500" style={{ background: 'rgba(10,12,20,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}>
            No reasoning logs match the selected filter.
          </div>
        ) : (
          filteredTraces.map((trace) => {
            const steps = Array.isArray(trace.inferencePath) ? trace.inferencePath : [];
            const isCrit = trace.severity === 'CRITICAL';
            const isHigh = trace.severity === 'HIGH';

            return (
              <div
                key={trace.id}
                className="rounded-xl border p-3.5 flex flex-col gap-3 shadow-xl transition-all"
                style={{
                  background: 'rgba(10,12,20,0.95)',
                  borderColor: isCrit ? 'rgba(239,68,68,0.3)' : isHigh ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)',
                  boxShadow: isCrit ? '0 4px 20px rgba(239,68,68,0.08)' : '0 4px 16px rgba(0,0,0,0.4)'
                }}
              >
                {/* Trace Header & Source Info */}
                <div className="flex items-start justify-between border-b pb-2.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span 
                      className="px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 border"
                      style={
                        isCrit ? { background: 'rgba(239,68,68,0.2)', color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' } :
                        isHigh ? { background: 'rgba(245,158,11,0.2)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.4)' } :
                        { background: 'rgba(6,182,212,0.15)', color: '#67e8f9', borderColor: 'rgba(6,182,212,0.35)' }
                      }
                    >
                      {trace.severity}
                    </span>

                    <div className="min-w-0">
                      <h3 className="font-mono text-xs font-bold text-white truncate">
                        {trace.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[9.5px] font-mono text-slate-500 mt-0.5">
                        <span>{trace.id}</span>
                        <span>·</span>
                        <span className="text-orange-400 font-bold">{trace.droneId}</span>
                        <span>·</span>
                        <span>{trace.timestamp} UTC</span>
                        <span>·</span>
                        <span className="text-cyan-400">{trace.category ? trace.category.replace(/_/g, ' ') : 'INFERENCE'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 font-mono text-[9px]">
                    {trace.operatorRequired ? (
                      <span className="px-2 py-0.5 rounded font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        OP VERIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                        <CheckCircle2 size={10} /> AUTO AUTONOMOUS
                      </span>
                    )}
                  </div>
                </div>

                {/* Inference Steps (Chain of Thought) */}
                <div 
                  className="rounded-lg p-3 border font-mono"
                  style={{ background: 'rgba(14,17,28,0.85)', borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="text-[8.5px] text-orange-400 uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
                    <Terminal size={11} className="text-orange-400" />
                    Chain of Local Edge Inference Steps (YOLOv9 + Triaxial Geophone Fusion)
                  </span>
                  <div className="space-y-1.5">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <span 
                          className="w-4 h-4 rounded text-orange-400 font-bold text-[8.5px] flex items-center justify-center shrink-0 mt-0.5 border"
                          style={{ background: 'rgba(255,107,44,0.15)', borderColor: 'rgba(255,107,44,0.3)' }}
                        >
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Autonomous Swarm Directive Output */}
                <div 
                  className="rounded-lg p-2.5 border flex items-start gap-2.5 font-mono"
                  style={{
                    background: 'rgba(255,107,44,0.08)',
                    borderColor: 'rgba(255,107,44,0.25)'
                  }}
                >
                  <ShieldCheck size={16} className="text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[8.5px] text-orange-400 uppercase font-bold block leading-none">
                      Autonomous Swarm Directive Executed
                    </span>
                    <p className="text-[11px] text-white mt-1 font-semibold leading-relaxed">
                      {trace.autonomousDecision}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
