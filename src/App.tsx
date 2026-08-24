import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TriageListView } from './components/TriageListView';
import { ReasonTraceView } from './components/ReasonTraceView';
import { DroneDetailView } from './components/DroneDetailView';
import { SwarmMetricsView } from './components/SwarmMetricsView';
import { MissionPlaybackView } from './components/MissionPlaybackView';
import { telemetryEngine } from './services/telemetryEngine';
import { INITIAL_REASONING_TRACES } from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  
  // Real-time dynamic state synced from telemetryEngine
  const [drones, setDrones] = useState(() => telemetryEngine.getDrones());
  const [hexapods, setHexapods] = useState(() => telemetryEngine.getHexapods());
  const [triageEvents, setTriageEvents] = useState(() => telemetryEngine.getTriageEvents());
  const [pheromoneGrid, setPheromoneGrid] = useState(() => telemetryEngine.getPheromoneGrid());
  const [alerts, setAlerts] = useState(() => telemetryEngine.getAlerts());
  const [missionStats, setMissionStats] = useState(() => telemetryEngine.getMissionStats());
  const [missionMode, setMissionMode] = useState<'MOCK_SIMULATION' | 'LIVE_HARDWARE'>(() => telemetryEngine.getMode());

  const [selectedDroneId, setSelectedDroneId] = useState<string | null>('ANT-01');
  const [selectedHexapodId, setSelectedHexapodId] = useState<string | null>('HEXA-01');
  const [selectedTriageId, setSelectedTriageId] = useState<string | null>('CAS-EQ-01');

  // Subscribe to real-time 500ms multi-agent physics & telemetry ticks
  useEffect(() => {
    const unsubscribe = telemetryEngine.subscribe(() => {
      setDrones([...telemetryEngine.getDrones()]);
      setHexapods([...telemetryEngine.getHexapods()]);
      setTriageEvents([...telemetryEngine.getTriageEvents()]);
      setPheromoneGrid([...telemetryEngine.getPheromoneGrid()]);
      setAlerts([...telemetryEngine.getAlerts()]);
      setMissionStats({ ...telemetryEngine.getMissionStats() });
      setMissionMode(telemetryEngine.getMode());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDispatchMedicalDrone = (victimId: string) => {
    telemetryEngine.dispatchMedicalDrone(victimId);
  };

  const handleDispatchHexapodInfiltration = (victimId: string, hexapodId: string) => {
    telemetryEngine.dispatchHexapodInfiltration(victimId, hexapodId);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    telemetryEngine.acknowledgeAlert(alertId);
  };

  const handleToggleMode = (mode: 'MOCK_SIMULATION' | 'LIVE_HARDWARE') => {
    telemetryEngine.setMode(mode);
  };

  const handleSelectDrone = (droneId: string) => {
    setSelectedDroneId(droneId);
    setActiveTab('drone-detail');
  };

  const handleSelectHexapod = (hexapodId: string) => {
    setSelectedHexapodId(hexapodId);
    setActiveTab('drone-detail');
  };

  const handleSelectTriage = (triage: typeof triageEvents[0]) => {
    setSelectedTriageId(triage.id);
    setActiveTab('triage-list');
  };

  return (
    <div className="min-h-screen bg-[#08090d] font-sans text-slate-100 flex flex-col antialiased select-none">
      {/* Top Tactical Command Header */}
      <Header
        activeTab={activeTab}
        droneCount={drones.length}
        hexapodCount={hexapods.length}
        criticalPobCount={missionStats.triageCount.critical}
        meshHealthScore={missionStats.meshHealthScore}
        geofenceIntegrityScore={missionStats.geofenceIntegrityScore}
        missionMode={missionMode}
        onToggleMode={handleToggleMode}
      />

      {/* Main Viewport Container */}
      <div className="flex flex-1 pt-16 h-screen overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          criticalTriageCount={missionStats.triageCount.critical}
          activeDronesCount={drones.length}
          activeHexapodsCount={hexapods.length}
          missionMode={missionMode}
          onToggleMode={handleToggleMode}
        />

        {/* Dynamic Center Canvas View */}
        <main className="flex-1 ml-64 p-4 min-h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] bg-[#08090d] overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              drones={drones}
              hexapods={hexapods}
              triageEvents={triageEvents}
              pheromoneGrid={pheromoneGrid}
              alerts={alerts}
              selectedDroneId={selectedDroneId}
              onSelectDrone={handleSelectDrone}
              selectedHexapodId={selectedHexapodId}
              onSelectHexapod={handleSelectHexapod}
              selectedTriageId={selectedTriageId}
              onSelectTriage={handleSelectTriage}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onDispatchMedicalDrone={handleDispatchMedicalDrone}
              onDispatchHexapodInfiltration={handleDispatchHexapodInfiltration}
            />
          )}

          {activeTab === 'triage-list' && (
            <TriageListView
              victims={triageEvents}
              onDispatchMedicalDrone={handleDispatchMedicalDrone}
            />
          )}

          {activeTab === 'drone-detail' && (
            <DroneDetailView
              drones={drones}
              hexapods={hexapods}
              selectedDroneId={selectedDroneId}
              onSelectDrone={setSelectedDroneId}
              selectedHexapodId={selectedHexapodId}
              onSelectHexapod={setSelectedHexapodId}
            />
          )}

          {activeTab === 'swarm-metrics' && (
            <SwarmMetricsView
              stats={missionStats}
              pheromoneGrid={pheromoneGrid}
              drones={drones}
              hexapods={hexapods}
            />
          )}

          {activeTab === 'reason-trace' && (
            <ReasonTraceView traces={INITIAL_REASONING_TRACES} />
          )}

          {activeTab === 'mission-playback' && (
            <MissionPlaybackView drones={drones} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
