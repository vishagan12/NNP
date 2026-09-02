import React, { useState } from 'react';
import { TriageEvent } from '../types';
import { 
  Heart, 
  Send, 
  AlertTriangle, 
  Radio, 
  Target, 
  Thermometer, 
  Activity, 
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Search,
  Check
} from 'lucide-react';

interface TriageListViewProps {
  victims: TriageEvent[];
  onDispatchMedicalDrone: (victimId: string) => void;
  onDispatchHexapodInfiltration?: (victimId: string, hexapodId: string) => void;
}

export const TriageListView: React.FC<TriageListViewProps> = ({ 
  victims, 
  onDispatchMedicalDrone,
  onDispatchHexapodInfiltration
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedVictimId, setSelectedVictimId] = useState<string>(victims[0]?.id || '');
  const [dispatchedUnits, setDispatchedUnits] = useState<Record<string, string>>({});

  const selectedVictim = victims.find(v => v.id === selectedVictimId) || victims[0] || null;

  const filteredVictims = victims.filter(v => {
    if (selectedSeverity === 'ALL') return true;
    return v.severity === selectedSeverity;
  });

  const handleDispatchAir = (victimId: string) => {
    onDispatchMedicalDrone(victimId);
    setDispatchedUnits(prev => ({ ...prev, [victimId]: 'AIR_DISPATCHED' }));
  };

  const handleDispatchGround = (victimId: string) => {
    if (onDispatchHexapodInfiltration) {
      onDispatchHexapodInfiltration(victimId, 'HEXA-03');
    }
    setDispatchedUnits(prev => ({ ...prev, [victimId]: 'HEXA_DISPATCHED' }));
  };

  return (
    <div className="flex flex-col gap-2 h-[calc(100vh-74px)] overflow-hidden">
      
      {/* ── 1. Top Incident Command Header ── */}
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
              background: 'linear-gradient(135deg, #ef4444, #ff6b2c)',
              boxShadow: '0 0 16px rgba(239,68,68,0.4)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <Heart size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Post-Earthquake Casualty Triage Hub
              </h2>
              <span 
                className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold border"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', borderColor: 'rgba(239,68,68,0.35)' }}
              >
                {victims.filter(v => v.severity === 'CRITICAL').length} CRITICAL VOIDS
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Acoustic geophone tap correlation · FLIR radiometric signature fusion · Automated dual-dispatch
            </p>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div 
          className="flex items-center gap-1 p-1 rounded-lg border shrink-0"
          style={{ background: 'rgba(7,9,16,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {['ALL', 'CRITICAL', 'URGENT', 'STABLE'].map((sev) => {
            const isSelected = selectedSeverity === sev;
            const count = sev === 'ALL' ? victims.length : victims.filter(v => v.severity === sev).length;
            return (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className="px-2.5 py-1 rounded-md font-mono text-[9.5px] font-bold transition-all flex items-center gap-1.5"
                style={isSelected ? {
                  background: sev === 'CRITICAL' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' :
                              sev === 'URGENT'   ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                              sev === 'STABLE'   ? 'linear-gradient(135deg, #10b981, #059669)' :
                              'linear-gradient(135deg, #ff4b1f, #ff6b2c)',
                  color: '#ffffff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                } : {
                  color: '#64748b'
                }}
              >
                <span>{sev}</span>
                <span className="text-[8px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Master-Detail Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-2 flex-1 min-h-0 overflow-hidden">
        
        {/* Casualty Table List */}
        <div 
          className="rounded-xl border flex flex-col min-h-0 overflow-hidden shadow-xl"
          style={{
            background: 'rgba(10,12,20,0.95)',
            borderColor: 'rgba(255,255,255,0.07)'
          }}
        >
          <div 
            className="p-3 border-b flex items-center justify-between shrink-0 font-mono text-[10px]"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(15,18,30,0.6)' }}
          >
            <span className="text-white font-bold tracking-wider uppercase">
              Identified Survivor Cavities ({filteredVictims.length})
            </span>
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <Radio size={11} className="animate-pulse" /> ACOUSTIC & THERMAL VERIFIED
            </span>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-thin">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr 
                  className="border-b text-[9px] uppercase tracking-wider sticky top-0 z-10"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,10,18,0.98)', color: '#64748b' }}
                >
                  <th className="p-3">ID / Cavity Location</th>
                  <th className="p-3">Severity & Entrapment</th>
                  <th className="p-3">Acoustic Tap</th>
                  <th className="p-3">Body Temp</th>
                  <th className="p-3">Tasked Unit</th>
                  <th className="p-3 text-right">Rapid Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                {filteredVictims.map((v) => {
                  const isSelected = selectedVictim?.id === v.id;
                  const bodyTemp = v.thermal?.bodyTemp ?? v.thermalSignatureC ?? 37.0;
                  const entrapmentLabel = v.entrapmentType ? v.entrapmentType.replace(/_/g, ' ') : 'STRUCTURAL VOID';
                  const zoneLabel = v.location?.zone || v.sector || 'Sector 7-G';
                  const isDispatched = dispatchedUnits[v.id] || v.rescueStatus === 'MEDIC_DISPATCHED' || v.rescueStatus === 'INFILTRATING';

                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVictimId(v.id)}
                      className="transition-colors cursor-pointer"
                      style={isSelected ? {
                        background: 'rgba(255,107,44,0.12)',
                        boxShadow: 'inset 3px 0 0 #ff6b2c'
                      } : {
                        background: 'transparent'
                      }}
                    >
                      {/* ID / Location */}
                      <td className="p-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{v.id}</span>
                          {v.trappedPersonsCount && v.trappedPersonsCount > 1 && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-purple-950 text-purple-300 border border-purple-800/40">
                              {v.trappedPersonsCount} Trapped
                            </span>
                          )}
                        </div>
                        <div className="text-[9.5px] text-slate-400 truncate max-w-[150px]">{zoneLabel}</div>
                      </td>

                      {/* Severity & Entrapment */}
                      <td className="p-3">
                        <span 
                          className="px-2 py-0.5 rounded text-[9px] font-bold inline-block mb-1 border"
                          style={
                            v.severity === 'CRITICAL' ? { background: 'rgba(239,68,68,0.18)', color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' } :
                            v.severity === 'URGENT'   ? { background: 'rgba(245,158,11,0.18)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.4)' } :
                            { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.35)' }
                          }
                        >
                          {v.severity}
                        </span>
                        <div className="text-[9px] text-slate-400 truncate max-w-[140px]">{entrapmentLabel}</div>
                      </td>

                      {/* Acoustic Tap */}
                      <td className="p-3">
                        {v.acousticEchoDetected || v.tapFrequencyHz ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                            <Radio size={11} className="animate-pulse text-emerald-400" />
                            {v.tapFrequencyHz || 2.8}Hz Tap
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">No tap code</span>
                        )}
                      </td>

                      {/* Body Temp */}
                      <td className="p-3">
                        <div className="text-white font-semibold flex items-center gap-1">
                          <Thermometer size={12} className={bodyTemp > 37.0 ? 'text-red-400' : 'text-cyan-400'} />
                          <span>{bodyTemp.toFixed(1)}°C</span>
                        </div>
                        <div className="text-[8.5px] text-emerald-400 font-mono">
                          HR: {v.heartRateBpm || 108} bpm
                        </div>
                      </td>

                      {/* Tasked Unit */}
                      <td className="p-3">
                        <span className="text-slate-300 text-[10px]">
                          {v.assignedDroneId || 'Standby'}
                        </span>
                      </td>

                      {/* Rapid Action */}
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchAir(v.id);
                          }}
                          className="px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 ml-auto transition-all shadow"
                          style={isDispatched ? {
                            background: 'rgba(16,185,129,0.2)',
                            color: '#6ee7b7',
                            border: '1px solid rgba(16,185,129,0.4)'
                          } : {
                            background: 'linear-gradient(135deg, #ff4b1f, #ff6b2c)',
                            color: '#ffffff',
                            boxShadow: '0 2px 10px rgba(255,107,44,0.4)'
                          }}
                        >
                          {isDispatched ? <Check size={11} /> : <Send size={10} />}
                          <span>{isDispatched ? 'Dispatched' : 'Air Drop'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Victim Dossier */}
        {selectedVictim && (
          <div 
            className="rounded-xl border p-3.5 flex flex-col gap-3 overflow-y-auto min-h-0 shadow-xl"
            style={{
              background: 'rgba(10,12,20,0.95)',
              borderColor: 'rgba(255,255,255,0.07)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2 shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div>
                <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                  SURVIVOR DOSSIER
                </span>
                <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                  <span>{selectedVictim.id}</span>
                  <span className="text-slate-400 font-normal">· {selectedVictim.victimCallsign || selectedVictim.id}</span>
                </h3>
              </div>
              <span 
                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold border"
                style={
                  selectedVictim.severity === 'CRITICAL' ? { background: 'rgba(239,68,68,0.2)', color: '#f87171', borderColor: 'rgba(239,68,68,0.5)' } :
                  selectedVictim.severity === 'URGENT'   ? { background: 'rgba(245,158,11,0.2)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.5)' } :
                  { background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.5)' }
                }
              >
                {selectedVictim.severity}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(15,18,30,0.8)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[8px] text-slate-500 block uppercase">ENTRAPMENT TYPE</span>
                <span className="text-[10.5px] font-bold text-amber-300 mt-0.5 block truncate">
                  {selectedVictim.entrapmentType ? selectedVictim.entrapmentType.replace(/_/g, ' ') : 'CONCRETE VOID'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(15,18,30,0.8)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[8px] text-slate-500 block uppercase">CRUSH SYNDROME RISK</span>
                <span className={`text-[10.5px] font-bold mt-0.5 block ${
                  selectedVictim.crushSyndromeRisk === 'HIGH' ? 'text-red-400 font-extrabold' : 'text-emerald-400'
                }`}>
                  {selectedVictim.crushSyndromeRisk || 'MODERATE'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(15,18,30,0.8)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[8px] text-slate-500 block uppercase">SOIL SHEAR STRESS</span>
                <span className="text-[11px] font-bold text-white mt-0.5 block">
                  {selectedVictim.soilShearStressKPa ?? 142.5} <span className="text-[8.5px] font-normal text-slate-500">kPa</span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(15,18,30,0.8)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[8px] text-slate-500 block uppercase">ACOUSTIC CADENCE</span>
                <span className="text-[10px] font-bold text-emerald-400 mt-0.5 block">
                  {selectedVictim.acousticEchoDetected ? '2.8Hz RHYTHMIC TAP' : 'NO ECHO DETECTED'}
                </span>
              </div>
            </div>

            {/* Vitals & FLIR Assessment */}
            <div className="p-2.5 rounded-lg border font-mono" style={{ background: 'rgba(15,18,30,0.8)', borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-orange-400 uppercase font-bold">FLIR & Geophone Assessment</span>
                <span className="text-[8px] text-slate-500">CONF: {Math.round((selectedVictim.confidenceScore || 0.94) * 100)}%</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                {selectedVictim.notes || selectedVictim.recommendedAction || 'Radiometric thermal signature confirmed alive. Rhythmic acoustic vibration detected through concrete slab.'}
              </p>
            </div>

            {/* Dual Dispatch CTA */}
            <div className="mt-auto pt-2 border-t flex flex-col gap-1.5 shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => handleDispatchAir(selectedVictim.id)}
                className="w-full py-2 rounded-lg text-white font-mono font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ff4b1f, #ff6b2c)',
                  boxShadow: '0 2px 12px rgba(255,107,44,0.45)'
                }}
              >
                <Send size={12} />
                <span>Dispatch Air-Ant UAV [Lifeline Air Drop]</span>
              </button>

              <button
                onClick={() => handleDispatchGround(selectedVictim.id)}
                className="w-full py-2 rounded-lg text-white font-mono font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                  boxShadow: '0 2px 12px rgba(6,182,212,0.4)'
                }}
              >
                <Target size={12} />
                <span>Deploy Hexapod [Void Infiltration]</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
