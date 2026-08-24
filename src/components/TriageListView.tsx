import React, { useState } from 'react';
import { TriageEvent } from '../types';
import { 
  Heart, 
  Mountain, 
  Activity, 
  Navigation, 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  Thermometer, 
  Eye, 
  MapPin,
  Sparkles,
  AlertTriangle,
  Radio,
  Target
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
  const [selectedVictim, setSelectedVictim] = useState<TriageEvent | null>(victims[0] || null);

  const filteredVictims = victims.filter(v => {
    if (selectedSeverity === 'ALL') return true;
    return v.severity === selectedSeverity;
  });

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-96px)] overflow-hidden">
      {/* 1. Header Bar with Severity Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-panel rounded-2xl p-4 border border-white/10 shadow-xl shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#ff4b1f] to-[#ff6b2c] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,107,44,0.4)] border border-orange-400/40">
            <Mountain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Post-Earthquake & Landslide Casualty Triage Hub
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Rubble void entrapment classification, borehole geophone acoustic tap cadence & air-ground extraction dispatch
            </p>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-2 bg-[#12151d] p-1.5 rounded-xl border border-white/10">
          {['ALL', 'CRITICAL', 'URGENT', 'STABLE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                selectedSeverity === sev
                  ? 'bg-gradient-to-r from-[#ff6b2c] to-[#ff4b1f] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Grid: Triage Table & Victim Detail Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_430px] gap-4 flex-grow overflow-hidden min-h-0">
        
        {/* Casualty Table List */}
        <div className="glass-panel rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col min-h-0">
          <div className="p-3.5 bg-[#12151e] border-b border-white/10 flex items-center justify-between shrink-0">
            <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">
              Disaster Void Survivors ({filteredVictims.length})
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">ACOUSTIC & THERMAL FUSED</span>
          </div>

          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0f121a] text-[10px] font-mono text-slate-400 uppercase sticky top-0 z-10">
                  <th className="p-3">ID / Sector</th>
                  <th className="p-3">Entrapment / Severity</th>
                  <th className="p-3">Acoustic Tap</th>
                  <th className="p-3">Body Temp</th>
                  <th className="p-3">Assigned Unit</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono">
                {filteredVictims.map((v) => {
                  const isSelected = selectedVictim?.id === v.id;
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVictim(v)}
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${
                        isSelected ? 'bg-gradient-to-r from-[#ff6b2c]/15 to-transparent border-l-4 border-[#ff6b2c]' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-white">{v.id}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{v.sector}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold block w-fit mb-1 ${
                          v.severity === 'CRITICAL' ? 'bg-[#ff4b1f]/20 text-[#ff4b1f] border border-[#ff4b1f]/40' :
                          v.severity === 'URGENT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {v.severity}
                        </span>
                        <span className="text-[9.5px] text-slate-400">{v.entrapmentType.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="p-3">
                        {v.acousticEchoDetected ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Radio className="w-3 h-3 animate-pulse" /> 2.8Hz Tap
                          </span>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-white font-semibold">{v.thermal.bodyTemp.toFixed(1)}°C</div>
                        <div className="text-[10px] text-emerald-400">Δ +{v.thermal.differential.toFixed(1)}°C</div>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-300 text-[11px]">{v.assignedDroneId || 'UNASSIGNED'}</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDispatchMedicalDrone(v.id);
                          }}
                          className="px-2.5 py-1 rounded-lg gradient-orange-btn text-white font-bold text-[10px] uppercase shadow-md flex items-center gap-1 ml-auto"
                        >
                          <Send className="w-3 h-3" /> Air Drop
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Victim Detail Inspection Dossier */}
        {selectedVictim && (
          <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl p-4 flex flex-col gap-3.5 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
              <div>
                <span className="text-[9.5px] font-mono text-slate-400 uppercase font-bold">SEISMIC CASUALTY DOSSIER</span>
                <h3 className="text-sm font-bold text-white">{selectedVictim.id} - {selectedVictim.victimCallsign}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold ${
                selectedVictim.severity === 'CRITICAL' ? 'bg-[#ff4b1f] text-white shadow-[0_0_12px_#ff4b1f]' :
                selectedVictim.severity === 'URGENT' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
              }`}>
                {selectedVictim.severity}
              </span>
            </div>

            {/* Post-Earthquake Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#12151e] p-3 rounded-xl border border-white/10">
                <span className="text-[9.5px] font-mono text-slate-400 block uppercase">ENTRAPMENT TYPE</span>
                <span className="font-mono text-xs font-bold text-amber-300 mt-0.5 block">{selectedVictim.entrapmentType.replace(/_/g, ' ')}</span>
              </div>
              <div className="bg-[#12151e] p-3 rounded-xl border border-white/10">
                <span className="text-[9.5px] font-mono text-slate-400 block uppercase">CRUSH SYNDROME RISK</span>
                <span className={`font-mono text-xs font-bold mt-0.5 block ${
                  selectedVictim.crushSyndromeRisk === 'HIGH' ? 'text-red-400 font-extrabold' : 'text-emerald-400'
                }`}>{selectedVictim.crushSyndromeRisk}</span>
              </div>
              <div className="bg-[#12151e] p-3 rounded-xl border border-white/10">
                <span className="text-[9.5px] font-mono text-slate-400 block uppercase">SOIL SHEAR STRESS</span>
                <span className="font-mono text-base font-bold text-white mt-0.5 block">{selectedVictim.soilShearStressKPa} <span className="text-xs font-normal text-slate-400">kPa</span></span>
              </div>
              <div className="bg-[#12151e] p-3 rounded-xl border border-white/10">
                <span className="text-[9.5px] font-mono text-slate-400 block uppercase">ACOUSTIC GEOPHONE</span>
                <span className="font-mono text-xs font-bold text-emerald-400 mt-0.5 block">
                  {selectedVictim.acousticEchoDetected ? '2.8Hz RHYTHMIC CADENCE' : 'NO ECHO DETECTED'}
                </span>
              </div>
            </div>

            {/* Field Notes & Description */}
            <div className="bg-[#12151e] p-3 rounded-xl border border-white/10">
              <span className="text-[9.5px] font-mono text-[#ff6b2c] uppercase block mb-1 font-bold">FLIR & Geophone Assessment</span>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedVictim.notes}</p>
            </div>

            {/* Dual Dispatch CTA */}
            <div className="mt-auto pt-2 border-t border-white/10 flex flex-col gap-2 shrink-0">
              <button
                onClick={() => onDispatchMedicalDrone(selectedVictim.id)}
                className="w-full py-2.5 rounded-xl gradient-orange-btn text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Dispatch Aerial Ant UAV [Lifeline Air Drop]
              </button>

              <button
                onClick={() => onDispatchHexapodInfiltration && onDispatchHexapodInfiltration(selectedVictim.id, 'HEXA-03')}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Target className="w-4 h-4" />
                Deploy Ground Hexapod [Rubble Void Infiltration]
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
