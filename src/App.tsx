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
import { INITIAL_REASONING_LOGS } from './data/mockData';
import { MissionLocation } from './types';

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
  const [currentLocation, setCurrentLocation] = useState<MissionLocation>(() => telemetryEngine.getLocation());
  const [rescueRoutes, setRescueRoutes] = useState(() => telemetryEngine.getRescueRoutes());

  // Default to null so map starts in full overview without auto-zooming into any unit
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [selectedHexapodId, setSelectedHexapodId] = useState<string | null>(null);
  const [selectedTriageId, setSelectedTriageId] = useState<string | null>(null);

  // Subscribe to real-time telemetry ticks
  useEffect(() => {
    const unsubscribe = telemetryEngine.subscribe(() => {
      setDrones([...telemetryEngine.getDrones()]);
      setHexapods([...telemetryEngine.getHexapods()]);
      setTriageEvents([...telemetryEngine.getTriageEvents()]);
      setPheromoneGrid([...telemetryEngine.getPheromoneGrid()]);
      setAlerts([...telemetryEngine.getAlerts()]);
      setRescueRoutes([...telemetryEngine.getRescueRoutes()]);
      setMissionStats({ ...telemetryEngine.getMissionStats() });
      setMissionMode(telemetryEngine.getMode());
      setCurrentLocation(telemetryEngine.getLocation());
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

  // Focus drone on map when clicked in scrolling ticker or on map (toggle zoom)
  const handleSelectDrone = (droneId: string) => {
    if (selectedDroneId === droneId) {
      setSelectedDroneId(null);
    } else {
      setSelectedDroneId(droneId);
      setSelectedHexapodId(null);
    }
  };

  // Focus hexapod on map when clicked in scrolling ticker or on map (toggle zoom)
  const handleSelectHexapod = (hexapodId: string) => {
    if (selectedHexapodId === hexapodId) {
      setSelectedHexapodId(null);
    } else {
      setSelectedHexapodId(hexapodId);
      setSelectedDroneId(null);
    }
  };

  const handleResetFocus = () => {
    setSelectedDroneId(null);
    setSelectedHexapodId(null);
  };

  const handleSelectTriage = (triage: typeof triageEvents[0]) => {
    if (selectedTriageId === triage.id) {
      setSelectedTriageId(null);
    } else {
      setSelectedTriageId(triage.id);
    }
  };

  const handleSelectLocation = (loc: MissionLocation) => {
    telemetryEngine.setLocation(loc);
  };

  return (
    <div className="min-h-screen bg-[#08090d] font-sans text-slate-100 flex flex-col antialiased select-none">
      {/* Top Tactical Command Header */}
      <Header
        missionId="OP-SEISMIC-RECON-7"
        activeDronesCount={drones.length}
        activeHexapodsCount={hexapods.length}
        interiorDronesCount={missionStats.interiorDronesCount}
        perimeterDronesCount={missionStats.perimeterDronesCount}
        totalAreaSqKm={missionStats.totalAreaSqKm}
        searchedPercentage={missionStats.searchedPercentage}
        meshHealthScore={missionStats.meshHealthScore}
        geofenceIntegrityScore={missionStats.geofenceIntegrityScore}
        missionMode={missionMode}
        onToggleMode={handleToggleMode}
      />

      {/* Main Viewport Container */}
      <div className="flex flex-1 pt-[58px] h-screen overflow-hidden">
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
        <main className="flex-1 ml-[220px] p-2 min-h-[calc(100vh-58px)] max-h-[calc(100vh-58px)] bg-[#060810] overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              drones={drones}
              hexapods={hexapods}
              triageEvents={triageEvents}
              pheromoneGrid={pheromoneGrid}
              alerts={alerts}
              rescueRoutes={rescueRoutes}
              currentLocation={currentLocation}
              onSelectLocation={handleSelectLocation}
              selectedDroneId={selectedDroneId}
              onSelectDrone={handleSelectDrone}
              selectedHexapodId={selectedHexapodId}
              onSelectHexapod={handleSelectHexapod}
              onResetFocus={handleResetFocus}
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
              onDispatchHexapodInfiltration={handleDispatchHexapodInfiltration}
            />
          )}

          {activeTab === 'drone-detail' && (
            <DroneDetailView
              drones={drones}
              hexapods={hexapods}
              selectedDroneId={selectedDroneId || 'UAV-01'}
              onSelectDrone={setSelectedDroneId}
              selectedHexapodId={selectedHexapodId || 'HEXA-01'}
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
            <ReasonTraceView traces={INITIAL_REASONING_LOGS as any} />
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
