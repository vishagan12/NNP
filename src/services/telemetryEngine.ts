import { 
  DroneTelemetry, 
  HexapodTelemetry, 
  TriageEvent, 
  PheromoneCell, 
  AlertEntry, 
  SwarmMissionStats 
} from '../types';
import { 
  INITIAL_DRONES, 
  INITIAL_HEXAPODS, 
  INITIAL_TRIAGE_EVENTS, 
  INITIAL_ALERTS, 
  INITIAL_MISSION_STATS, 
  generateInitialPheromoneGrid, 
  BASE_CENTER 
} from '../data/mockData';

export class SwarmTelemetryEngine {
  private drones: DroneTelemetry[] = JSON.parse(JSON.stringify(INITIAL_DRONES));
  private hexapods: HexapodTelemetry[] = JSON.parse(JSON.stringify(INITIAL_HEXAPODS));
  private triageEvents: TriageEvent[] = JSON.parse(JSON.stringify(INITIAL_TRIAGE_EVENTS));
  private pheromoneGrid: PheromoneCell[] = generateInitialPheromoneGrid();
  private alerts: AlertEntry[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
  private missionStats: SwarmMissionStats = JSON.parse(JSON.stringify(INITIAL_MISSION_STATS));
  private missionMode: 'MOCK_SIMULATION' | 'LIVE_HARDWARE' = 'MOCK_SIMULATION';

  private listeners: Array<() => void> = [];
  private timer: number | null = null;

  constructor() {
    this.start();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getDrones(): DroneTelemetry[] {
    return this.drones;
  }

  public getHexapods(): HexapodTelemetry[] {
    return this.hexapods;
  }

  public getTriageEvents(): TriageEvent[] {
    return this.triageEvents;
  }

  public getPheromoneGrid(): PheromoneCell[] {
    return this.pheromoneGrid;
  }

  public getAlerts(): AlertEntry[] {
    return this.alerts;
  }

  public getMissionStats(): SwarmMissionStats {
    const totalCells = this.pheromoneGrid.length;
    const coveredCells = this.pheromoneGrid.filter(c => c.coverageScore > 0.4).length;
    const searchedPercentage = Math.min(100, parseFloat(((coveredCells / totalCells) * 100).toFixed(1)));

    return {
      ...this.missionStats,
      searchedPercentage,
      activeDronesCount: this.drones.length,
      activeHexapodsCount: this.hexapods.length,
      interiorDronesCount: this.drones.filter(d => d.zoneAssignment === 'INTERIOR_CORE').length,
      perimeterDronesCount: this.drones.filter(d => d.zoneAssignment === 'PERIMETER_RING').length,
      triageCount: {
        total: this.triageEvents.length,
        critical: this.triageEvents.filter(t => t.severity === 'CRITICAL' && t.rescueStatus !== 'RESCUED').length,
        urgent: this.triageEvents.filter(t => t.severity === 'URGENT' && t.rescueStatus !== 'RESCUED').length,
        stable: this.triageEvents.filter(t => t.severity === 'STABLE' && t.rescueStatus !== 'RESCUED').length,
        rescued: this.triageEvents.filter(t => t.rescueStatus === 'RESCUED').length,
      }
    };
  }

  public getMode(): 'MOCK_SIMULATION' | 'LIVE_HARDWARE' {
    return this.missionMode;
  }

  public setMode(newMode: 'MOCK_SIMULATION' | 'LIVE_HARDWARE') {
    this.missionMode = newMode;
    this.addAlert({
      id: `ALT-MODE-${Date.now()}`,
      timestamp: Date.now(),
      tier: 'TIER_3_INFO',
      hazardType: 'COMM_JAM',
      sourceDroneId: newMode === 'LIVE_HARDWARE' ? 'HARDWARE_BRIDGE' : 'SIMULATOR',
      message: newMode === 'LIVE_HARDWARE' 
        ? 'Switched to LIVE Gateway (10 UAVs + 6 Hexapods on LoRa 868MHz Mesh).' 
        : 'Switched to Synthetic ACS Multi-Agent Air-Ground Simulator.',
      acknowledged: false
    });
    this.notify();
  }

  public acknowledgeAlert(alertId: string) {
    this.alerts = this.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a);
    this.notify();
  }

  // Decentralized payload trigger: nearest autonomous UAV or Hexapod responds
  public dispatchMedicalDrone(victimId: string) {
    const targetVictim = this.triageEvents.find(t => t.id === victimId);
    if (!targetVictim) return;

    // Find nearest available ant drone
    let closestDrone = this.drones[0];
    let minDistance = Infinity;

    for (const drone of this.drones) {
      if (drone.status !== 'LOW BATT') {
        const dLat = targetVictim.location.lat - drone.position.lat;
        const dLng = targetVictim.location.lng - drone.position.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < minDistance) {
          minDistance = dist;
          closestDrone = drone;
        }
      }
    }

    const assignedDroneId = closestDrone.id;

    this.triageEvents = this.triageEvents.map(t => {
      if (t.id === victimId) {
        return {
          ...t,
          rescueStatus: 'DISPATCHED',
          assignedDroneId: `${assignedDroneId} [LIFELINE]`
        };
      }
      return t;
    });

    this.drones = this.drones.map(d => {
      if (d.id === assignedDroneId) {
        const dLat = targetVictim.location.lat - d.position.lat;
        const dLng = targetVictim.location.lng - d.position.lng;
        const targetHeading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

        return {
          ...d,
          status: 'ENGAGED',
          heading: Math.round(targetHeading),
          groundSpeed: 24.5,
          perception: {
            ...d.perception,
            currentStigmergicState: 'FOLLOWING_TRAIL',
            autonomousGoal: `Rapid intercept and relief delivery to victim ${victimId}`,
            sensedPheromoneGradient: {
              ...d.perception.sensedPheromoneGradient,
              recruitmentDelta: 0.95,
              repulsionDelta: 0.0,
              highestTrailAngle: Math.round(targetHeading)
            }
          },
          payload: {
            ...d.payload,
            status: 'DISPATCHED'
          }
        };
      }
      return d;
    });

    this.addAlert({
      id: `ALT-DISPATCH-${Date.now()}`,
      timestamp: Date.now(),
      tier: 'TIER_1_CRITICAL',
      hazardType: 'SURVIVOR_FOUND',
      sourceDroneId: assignedDroneId,
      message: `Air-Ground Stigmergic Response: ${assignedDroneId} dispatched to casualty ${victimId}!`,
      acknowledged: false
    });

    this.notify();
  }

  // Hexapod Micro-Infiltration trigger for deep rubble voids
  public dispatchHexapodInfiltration(victimId: string, hexapodId: string = 'HEXA-03') {
    this.hexapods = this.hexapods.map(h => {
      if (h.id === hexapodId) {
        return {
          ...h,
          status: 'INFILTRATING_RUBBLE',
          gaitMode: 'WAVE_STABLE',
          crawlSpeed: 0.9,
          payload: {
            ...h.payload,
            status: 'ARMED'
          }
        };
      }
      return h;
    });

    this.addAlert({
      id: `ALT-HEXA-INFILTRATE-${Date.now()}`,
      timestamp: Date.now(),
      tier: 'TIER_1_CRITICAL',
      hazardType: 'RUBBLE_VOID_ENTRAPMENT',
      sourceDroneId: hexapodId,
      message: `Autonomous Hexapod ${hexapodId} deployed micro-endoscope probe into rubble void for ${victimId}!`,
      acknowledged: false
    });

    this.notify();
  }

  public addAlert(alert: AlertEntry) {
    this.alerts = [alert, ...this.alerts.slice(0, 39)];
    this.notify();
  }

  public start() {
    if (this.timer) return;
    this.timer = window.setInterval(() => {
      this.step();
    }, 500);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private step() {
    // -------------------------------------------------------------------------
    // 1. AERIAL SWARM SIMULATION: 10 Autonomous Ant UAVs
    //    - 6 Interior Core Drones: Moving in random directions via Ant Colony System
    //      with STRONG negative stigmergic repulsion preventing any clustering!
    //    - 4 Perimeter Ring Drones: Continuous boundary patrol surveillance
    // -------------------------------------------------------------------------
    const interiorDronesList = this.drones.filter(d => d.zoneAssignment === 'INTERIOR_CORE');

    this.drones = this.drones.map((drone, idx) => {
      let targetHeading = drone.heading;
      let targetSpeed = drone.groundSpeed;
      let currentState = drone.perception.currentStigmergicState;
      let sensedRecruitment = 0.0;
      let sensedRepulsion = 0.0;
      let currentGoal = drone.perception.autonomousGoal;

      // 1. Calculate proximity and repulsive forces from neighboring drones
      const neighborIds: string[] = [];
      let repulsionVecX = 0;
      let repulsionVecY = 0;
      let isClustered = false;

      for (const other of this.drones) {
        if (other.id !== drone.id) {
          const dLat = other.position.lat - drone.position.lat;
          const dLng = other.position.lng - drone.position.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          if (dist < 0.007) {
            neighborIds.push(other.id);
          }

          // Anti-Clustering Repulsion for Interior Drones: Strong distance-inverse vector
          if (drone.zoneAssignment === 'INTERIOR_CORE' && other.zoneAssignment === 'INTERIOR_CORE' && dist < 0.0055 && dist > 0.00001) {
            isClustered = true;
            // Vector pointing away from the other drone
            repulsionVecX += -(dLng / (dist * dist));
            repulsionVecY += -(dLat / (dist * dist));
          }
        }
      }

      // Check priority states
      if (drone.status === 'ENGAGED') {
        const victim = this.triageEvents.find(t => t.assignedDroneId?.includes(drone.id) && t.rescueStatus !== 'RESCUED');
        if (victim) {
          const dLat = victim.location.lat - drone.position.lat;
          const dLng = victim.location.lng - drone.position.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          if (dist > 0.0004) {
            targetHeading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
            targetSpeed = 24.0;
            currentState = 'FOLLOWING_TRAIL';
            sensedRecruitment = 0.95;
            currentGoal = `Intercept trajectory to casualty ${victim.id}`;
          } else {
            targetHeading = (drone.heading + 18) % 360;
            targetSpeed = 4.0;
            currentState = 'RECRUITING_SWARM';
            sensedRecruitment = 1.0;
            currentGoal = `Stationary hover orbit over ${victim.id}`;
          }
        }
      } else if (drone.status === 'LOW BATT' || drone.battery.level < 25) {
        const dLat = BASE_CENTER.lat - drone.position.lat;
        const dLng = BASE_CENTER.lng - drone.position.lng;
        targetHeading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
        targetSpeed = 16.0;
        currentState = 'RETURNING_NEST';
        sensedRepulsion = 0.7;
        currentGoal = 'Low-battery return to home nest pad';
      } else if (drone.zoneAssignment === 'PERIMETER_RING') {
        // PERIMETER RING DRONES: Smooth outer boundary patrol loop
        targetSpeed = 21.0;
        currentState = 'FORAGING_SCOUT';
        
        // Circular perimeter patrol orbit around regional center (radius ~0.022)
        const dLat = drone.position.lat - BASE_CENTER.lat;
        const dLng = drone.position.lng - BASE_CENTER.lng;
        const angle = Math.atan2(dLng, dLat);
        const tangentAngle = ((angle + Math.PI / 2) * 180) / Math.PI;
        targetHeading = (tangentAngle + 360) % 360;
        currentGoal = `Perimeter Ring: Outer boundary surveillance patrol`;
      } else {
        // =====================================================================
        // 6 INTERIOR CORE DRONES: Stochastic Ant Colony System Foraging
        // With Active Dispersion and ZERO Clustering
        // =====================================================================
        targetSpeed = 16.5 + (idx % 3) * 2.0; // 16.5 to 20.5 m/s active search speed
        currentState = 'FORAGING_SCOUT';

        const latDist = drone.position.lat - BASE_CENTER.lat;
        const lngDist = drone.position.lng - BASE_CENTER.lng;

        if (isClustered && (Math.abs(repulsionVecX) > 0.001 || Math.abs(repulsionVecY) > 0.001)) {
          // 1. ANTI-CLUSTERING REPULSION: Instantly steer away from peer ant swarm cluster
          const repulsionAngle = ((Math.atan2(repulsionVecX, repulsionVecY) * 180) / Math.PI + 360) % 360;
          targetHeading = repulsionAngle;
          sensedRepulsion = 0.85;
          currentGoal = 'ACS Anti-Clustering: Dispersing away from peer drones';
        } else if (Math.abs(latDist) > 0.012 || Math.abs(lngDist) > 0.015) {
          // 2. INTERIOR BOUNDARY REFLECTION: Soft bounce back towards interior center
          const inwardAngle = ((Math.atan2(-lngDist, -latDist) * 180) / Math.PI + (Math.random() * 50 - 25) + 360) % 360;
          targetHeading = inwardAngle;
          currentGoal = 'ACS Boundary Inward Redirection Vector';
        } else {
          // 3. STOCHASTIC ACS RANDOM FORAGING (Momentum-preserved Levy walk)
          // Continues on current heading with smooth stochastic adjustments
          if (Math.random() > 0.70) {
            const randomDelta = (Math.random() * 60 - 30); // Random turn -30° to +30°
            targetHeading = (drone.heading + randomDelta + 360) % 360;
          }
          currentGoal = 'ACS Stochastic Foraging: Unexplored void rastering';
        }
      }

      // Smooth heading angle interpolation (no snappy teleporting)
      const headingDiff = (targetHeading - drone.heading + 540) % 360 - 180;
      const newHeading = (drone.heading + headingDiff * 0.28 + 360) % 360;

      // Coordinate advancement
      const speedMagnitude = (targetSpeed / 3.6) * 0.0000065;
      const angleRad = (newHeading * Math.PI) / 180;
      const nextLat = drone.position.lat + Math.cos(angleRad) * speedMagnitude;
      const nextLng = drone.position.lng + Math.sin(angleRad) * speedMagnitude;

      // Realistic slow battery drain
      const newBatt = Math.max(5, parseFloat((drone.battery.level - 0.008).toFixed(2)));
      const isLow = newBatt < 25;

      const perCellV = parseFloat((3.5 + (newBatt / 100) * 0.7).toFixed(2));
      const cellVoltages: [number, number, number, number, number, number] = [
        perCellV,
        parseFloat((perCellV + (Math.random() * 0.02 - 0.01)).toFixed(2)),
        perCellV,
        parseFloat((perCellV + (Math.random() * 0.02 - 0.01)).toFixed(2)),
        perCellV,
        perCellV
      ];

      const rssiDelta = (Math.random() * 1.5 - 0.75);
      const newRssi = Math.min(-45, Math.max(-92, Math.round(drone.link.rssi + rssiDelta)));

      const baseRpm = 5600 + Math.round(targetSpeed * 100);
      const motorRpm: [number, number, number, number] = [
        baseRpm + Math.round(Math.random() * 40 - 20),
        baseRpm + Math.round(Math.random() * 40 - 20),
        baseRpm + Math.round(Math.random() * 40 - 20),
        baseRpm + Math.round(Math.random() * 40 - 20)
      ];

      return {
        ...drone,
        status: isLow && drone.status !== 'ENGAGED' ? 'LOW BATT' : drone.status,
        position: {
          lat: nextLat,
          lng: nextLng,
          altitude: Math.round(drone.position.altitude + (Math.random() * 0.8 - 0.4))
        },
        heading: Math.round(newHeading),
        groundSpeed: parseFloat(targetSpeed.toFixed(1)),
        verticalSpeed: parseFloat((Math.random() * 0.4 - 0.2).toFixed(1)),
        motorRpm,
        flightTimeSec: drone.flightTimeSec + 1,
        distanceTraveledM: drone.distanceTraveledM + Math.round(targetSpeed * 0.5),
        perception: {
          sensedPheromoneGradient: {
            recruitmentDelta: sensedRecruitment,
            repulsionDelta: sensedRepulsion,
            highestTrailAngle: Math.round(targetHeading),
            localDecayRate: 0.015
          },
          nearbyDronesCount: neighborIds.length,
          neighborIds,
          localObstacleDetected: Math.random() > 0.98,
          obstacleDistanceM: parseFloat((40 + Math.random() * 60).toFixed(1)),
          localThermalHotspot: sensedRecruitment > 0.6,
          thermalDeltaC: parseFloat((sensedRecruitment * 18.0 + Math.random() * 0.5).toFixed(1)),
          currentStigmergicState: currentState,
          autonomousGoal: currentGoal
        },
        battery: {
          ...drone.battery,
          level: newBatt,
          isLow,
          voltage: parseFloat((cellVoltages.reduce((a, b) => a + b, 0)).toFixed(1)),
          temperature: parseFloat((drone.battery.temperature + (Math.random() * 0.08 - 0.04)).toFixed(1)),
          cellVoltages
        },
        link: {
          ...drone.link,
          rssi: newRssi,
          snr: parseFloat((drone.link.snr + (Math.random() * 0.2 - 0.1)).toFixed(1))
        }
      };
    });

    // -------------------------------------------------------------------------
    // 2. GROUND HEXAPOD ROBOTS SIMULATION: 6 Autonomous Boundary Anchors
    // -------------------------------------------------------------------------
    this.hexapods = this.hexapods.map((hexa, idx) => {
      let nextHeading = hexa.heading;
      let crawlSpeed = hexa.crawlSpeed;

      if (hexa.status === 'PATROLLING_PERIMETER') {
        crawlSpeed = 1.0;
        if (Math.random() > 0.92) {
          nextHeading = (hexa.heading + (Math.random() * 30 - 15) + 360) % 360;
        }
      } else if (hexa.status === 'ANCHORED') {
        crawlSpeed = 0.0;
      } else if (hexa.status === 'INFILTRATING_RUBBLE') {
        crawlSpeed = 0.4;
      }

      const moveMag = (crawlSpeed / 3.6) * 0.0000008;
      const angleRad = (nextHeading * Math.PI) / 180;
      const nextLat = hexa.position.lat + Math.cos(angleRad) * moveMag;
      const nextLng = hexa.position.lng + Math.sin(angleRad) * moveMag;

      const baseAngle = 48;
      const servoJitter = Math.sin(Date.now() / 300 + idx) * 6;
      const legServoAnglesDeg: [number, number, number, number, number, number] = [
        Math.round(baseAngle + servoJitter),
        Math.round(baseAngle - servoJitter),
        Math.round(baseAngle + servoJitter * 0.8),
        Math.round(baseAngle - servoJitter * 0.8),
        Math.round(baseAngle + servoJitter * 1.1),
        Math.round(baseAngle - servoJitter * 1.1)
      ];

      const vibrationMmS = parseFloat(Math.max(0.2, Math.min(4.5, hexa.seismicAcoustic.vibrationMmS + (Math.random() * 0.1 - 0.05))).toFixed(2));
      const acousticDecibels = Math.round(Math.max(20, Math.min(80, hexa.seismicAcoustic.acousticDecibels + (Math.random() * 2 - 1))));
      const newBatt = Math.max(12, parseFloat((hexa.battery.level - 0.004).toFixed(2)));

      return {
        ...hexa,
        position: {
          ...hexa.position,
          lat: nextLat,
          lng: nextLng,
          terrainSlopeDeg: Math.round(hexa.position.terrainSlopeDeg + (Math.random() * 0.4 - 0.2))
        },
        heading: Math.round(nextHeading),
        crawlSpeed,
        legServoAnglesDeg,
        stepCycleCount: hexa.stepCycleCount + (crawlSpeed > 0 ? 1 : 0),
        seismicAcoustic: {
          ...hexa.seismicAcoustic,
          vibrationMmS,
          acousticDecibels
        },
        battery: {
          ...hexa.battery,
          level: newBatt
        }
      };
    });

    // -------------------------------------------------------------------------
    // 3. PHEROMONE & SLOPE RISK MATRIX
    // -------------------------------------------------------------------------
    this.pheromoneGrid = this.pheromoneGrid.map(cell => {
      let addedCoverage = 0;
      let addedRecruitment = 0;

      for (const drone of this.drones) {
        const latDist = Math.abs(drone.position.lat - (cell.bounds.south + cell.bounds.north) / 2);
        const lngDist = Math.abs(drone.position.lng - (cell.bounds.west + cell.bounds.east) / 2);
        if (latDist < 0.0025 && lngDist < 0.0035) {
          addedCoverage += 0.25;
          const nearVictim = this.triageEvents.some(t => {
            return Math.abs(t.location.lat - drone.position.lat) < 0.0035 &&
                   Math.abs(t.location.lng - drone.position.lng) < 0.0045;
          });
          if (nearVictim) {
            addedRecruitment += 0.45;
          }
        }
      }

      const coverageScore = Math.min(1.0, parseFloat((cell.coverageScore + addedCoverage).toFixed(2)));
      const recruitmentLevel = Math.max(0, Math.min(1.0, parseFloat((cell.recruitmentLevel * 0.988 + addedRecruitment).toFixed(2))));

      return {
        ...cell,
        coverageScore,
        recruitmentLevel,
        lastUpdated: addedCoverage > 0 ? Date.now() : cell.lastUpdated
      };
    });

    this.notify();
  }
}

export const telemetryEngine = new SwarmTelemetryEngine();
