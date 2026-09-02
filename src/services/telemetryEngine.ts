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

// Strict Geofence Bounds (120m x 120m Disaster Complex)
const GEOFENCE_LIMITS = {
  minLat: 28.61335,
  maxLat: 28.61455,
  minLng: 77.20835,
  maxLng: 77.20965,
};

// Practical SAR Flight Sector Definitions for 10 UAVs
interface FlightPlan {
  pattern: 'RASTER_EW' | 'RASTER_NS' | 'PERIMETER_ORBIT' | 'CENTRAL_LOITER';
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  cruiseSpeed: number;
  baseAltitude: number;
  dirLat: number; // current sweep direction
  dirLng: number;
  hoverTimer: number; // remaining ticks of hover inspection
}

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
  private tickCounter: number = 0;

  // Individual practical flight state for each drone
  private flightPlans: Map<string, FlightPlan> = new Map();

  constructor() {
    this.initFlightPlans();
    this.start();
  }

  private initFlightPlans() {
    // Distribute realistic SAR mission corridors across the 120m complex
    this.drones.forEach((d, idx) => {
      const isPerimeter = d.zoneAssignment === 'PERIMETER_RING';
      if (isPerimeter) {
        this.flightPlans.set(d.id, {
          pattern: 'PERIMETER_ORBIT',
          minLat: 28.61340,
          maxLat: 28.61450,
          minLng: 77.20840,
          maxLng: 77.20960,
          cruiseSpeed: 7.2 + (idx % 3) * 0.4,
          baseAltitude: 30 + (idx % 3) * 2,
          dirLat: 1,
          dirLng: 1,
          hoverTimer: 0
        });
      } else if (d.id === 'ANT-03') {
        // Central Atrium inspection loiter
        this.flightPlans.set(d.id, {
          pattern: 'CENTRAL_LOITER',
          minLat: 28.61375,
          maxLat: 28.61410,
          minLng: 77.20885,
          maxLng: 77.20925,
          cruiseSpeed: 4.8,
          baseAltitude: 22,
          dirLat: 1,
          dirLng: 1,
          hoverTimer: 0
        });
      } else if (idx % 2 === 0) {
        // Lawnmower Raster East-West
        const latOffset = ((idx / 2) % 3) * 0.00030;
        this.flightPlans.set(d.id, {
          pattern: 'RASTER_EW',
          minLat: 28.61345 + latOffset,
          maxLat: 28.61375 + latOffset,
          minLng: 77.20845,
          maxLng: 77.20955,
          cruiseSpeed: 6.2 + (idx % 3) * 0.5,
          baseAltitude: 24 + (idx % 4),
          dirLat: 1,
          dirLng: idx % 4 === 0 ? 1 : -1,
          hoverTimer: 0
        });
      } else {
        // Lawnmower Raster North-South
        const lngOffset = ((idx % 3)) * 0.00032;
        this.flightPlans.set(d.id, {
          pattern: 'RASTER_NS',
          minLat: 28.61345,
          maxLat: 28.61445,
          minLng: 77.20845 + lngOffset,
          maxLng: 77.20875 + lngOffset,
          cruiseSpeed: 6.0 + (idx % 3) * 0.4,
          baseAltitude: 26 + (idx % 3),
          dirLat: idx % 3 === 0 ? 1 : -1,
          dirLng: 1,
          hoverTimer: 0
        });
      }
    });
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
        ? 'Switched to LIVE Hardware Gateway link.' 
        : 'Switched to High-Fidelity Swarm Simulation mode.',
      location: BASE_CENTER
    });
    this.notify();
  }

  public start() {
    if (this.timer) return;
    // 100ms tick for ultra-smooth 10Hz flight kinematics
    this.timer = window.setInterval(() => {
      this.tick();
    }, 100);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public dispatchMedicalDrone(victimId: string) {
    const victim = this.triageEvents.find(t => t.id === victimId);
    if (!victim) return;

    let nearestDrone = this.drones[0];
    let minDist = Infinity;

    for (const d of this.drones) {
      if (d.battery.level > 25 && d.status !== 'ENGAGED') {
        const dist = Math.hypot(d.position.lat - victim.location.lat, d.position.lng - victim.location.lng);
        if (dist < minDist) {
          minDist = dist;
          nearestDrone = d;
        }
      }
    }

    nearestDrone.status = 'ENGAGED';
    nearestDrone.perception.autonomousGoal = `Direct Intercept: Urgent triage delivery to ${victim.id}`;
    victim.assignedDroneId = nearestDrone.id;
    victim.rescueStatus = 'MEDIC_DISPATCHED';

    this.addAlert({
      id: `ALT-DISPATCH-${Date.now()}`,
      timestamp: Date.now(),
      tier: 'TIER_1_CRITICAL',
      hazardType: 'SURVIVOR_FOUND',
      sourceDroneId: nearestDrone.id,
      message: `Direct Intercept Tasked: ${nearestDrone.id} dispatched to ${victim.id}`,
      location: { lat: victim.location.lat, lng: victim.location.lng }
    });

    this.notify();
  }

  public dispatchHexapodInfiltration(victimId: string, hexapodId: string) {
    const victim = this.triageEvents.find(t => t.id === victimId);
    const hexapod = this.hexapods.find(h => h.id === hexapodId);
    if (!victim || !hexapod) return;

    hexapod.status = 'INFILTRATING_RUBBLE';
    hexapod.gaitMode = 'WAVE_STABLE';
    victim.rescueStatus = 'INFILTRATING';

    this.addAlert({
      id: `ALT-HEXA-INFILTRATE-${Date.now()}`,
      timestamp: Date.now(),
      tier: 'TIER_1_CRITICAL',
      hazardType: 'STRUCTURAL_COLLAPSE',
      sourceDroneId: hexapod.id,
      message: `Ground Penetration Active: ${hexapod.id} crawling into collapsed rubble void for ${victim.id}`,
      location: { lat: victim.location.lat, lng: victim.location.lng }
    });

    this.notify();
  }

  public acknowledgeAlert(alertId: string) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.notify();
  }

  public addAlert(alert: AlertEntry) {
    this.alerts.unshift(alert);
    if (this.alerts.length > 20) {
      this.alerts.pop();
    }
  }

  // =========================================================================
  // HIGH-FIDELITY PRACTICAL SAR FLIGHT KINEMATICS ENGINE (100ms / 10Hz)
  // =========================================================================
  private tick() {
    this.tickCounter += 1;
    if (this.tickCounter % 10 === 0) {
      this.missionStats.missionElapsedSeconds += 1;
    }

    const { minLat, maxLat, minLng, maxLng } = GEOFENCE_LIMITS;

    // 1. UPDATE 10 AUTONOMOUS DRONES WITH REALISTIC TACTICAL SAR FLIGHT DYNAMICS
    this.drones = this.drones.map((drone, idx) => {
      let plan = this.flightPlans.get(drone.id);
      if (!plan) {
        plan = {
          pattern: 'RASTER_EW',
          minLat: 28.61350,
          maxLat: 28.61440,
          minLng: 77.20845,
          maxLng: 77.20955,
          cruiseSpeed: 6.5,
          baseAltitude: 24,
          dirLat: 1,
          dirLng: 1,
          hoverTimer: 0
        };
        this.flightPlans.set(drone.id, plan);
      }

      let targetHeading = drone.heading;
      let targetSpeed = plan.cruiseSpeed;
      let targetAlt = plan.baseAltitude;
      let currentState = drone.perception.currentStigmergicState;
      let currentGoal = drone.perception.autonomousGoal;

      // ── Priority 1: Engaged Direct Intercept to Casualty ──
      if (drone.status === 'ENGAGED') {
        const victim = this.triageEvents.find(t => t.assignedDroneId === drone.id && t.rescueStatus !== 'RESCUED');
        if (victim) {
          const dLat = victim.location.lat - drone.position.lat;
          const dLng = victim.location.lng - drone.position.lng;
          const dist = Math.hypot(dLat, dLng);

          if (dist > 0.00004) {
            // Direct approach with deceleration on final approach
            targetHeading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
            targetSpeed = dist > 0.0002 ? 8.0 : 4.2;
            targetAlt = 18; // descend smoothly for delivery
            currentState = 'FOLLOWING_TRAIL';
            currentGoal = `Direct Intercept: Urgent payload transit to ${victim.id}`;
          } else {
            // Geostationary hover over casualty for delivery
            targetHeading = (drone.heading + 2) % 360;
            targetSpeed = 0.4;
            targetAlt = 15;
            currentState = 'RECRUITING_SWARM';
            currentGoal = `Geostationary Delivery Hover over ${victim.id}`;
          }
        }
      } 
      // ── Priority 2: Perimeter Ring Orbit ──
      else if (plan.pattern === 'PERIMETER_ORBIT') {
        currentState = 'FORAGING_SCOUT';
        currentGoal = `Perimeter Ring: 360° geofence boundary patrol orbit`;
        targetSpeed = plan.cruiseSpeed;
        targetAlt = plan.baseAltitude;

        // Smooth elliptical orbit along inner perimeter
        const dLat = drone.position.lat - BASE_CENTER.lat;
        const dLng = drone.position.lng - BASE_CENTER.lng;
        const angle = Math.atan2(dLng, dLat);
        // Tangential velocity vector
        const tangentAngle = ((angle + Math.PI / 2) * 180) / Math.PI;
        targetHeading = (tangentAngle + 360) % 360;
      }
      // ── Priority 3: Central Loiter & 360° Observation Scan ──
      else if (plan.pattern === 'CENTRAL_LOITER') {
        currentState = 'FORAGING_SCOUT';
        currentGoal = 'Central Atrium: Multi-angle thermal & acoustic inspection';

        const centerLat = BASE_CENTER.lat;
        const centerLng = BASE_CENTER.lng;
        const dLat = drone.position.lat - centerLat;
        const dLng = drone.position.lng - centerLng;
        const distFromCenter = Math.hypot(dLat, dLng);

        if (distFromCenter > 0.00022) {
          // Steer back to central atrium
          targetHeading = ((Math.atan2(-dLng, -dLat) * 180) / Math.PI + 360) % 360;
          targetSpeed = 4.5;
        } else {
          // Slow coordinated observation turn with gentle loiter
          targetHeading = (drone.heading + 3.5) % 360;
          targetSpeed = 1.8;
          targetAlt = 22 + Math.sin(this.tickCounter * 0.04) * 1.2;
        }
      }
      // ── Priority 4: Structured Lawnmower / Raster Sector Search ──
      else if (plan.pattern === 'RASTER_EW') {
        currentState = 'FORAGING_SCOUT';
        currentGoal = `Sector Raster: East-West thermal survey leg (Row ${Math.round((drone.position.lat - minLat) * 10000)})`;

        // Check if currently executing a momentary hover inspection
        if (plan.hoverTimer > 0) {
          plan.hoverTimer -= 1;
          targetSpeed = 0.8;
          targetHeading = (drone.heading + 4) % 360; // slow panoramic look
          currentGoal = 'Thermal Hotspot Hover Inspection (LiDAR + FLIR active)';
        } else {
          // Moving along East-West line
          if (plan.dirLng > 0 && drone.position.lng >= plan.maxLng - 0.00008) {
            // Reached East turn point -> step North/South and reverse
            plan.dirLng = -1;
            plan.dirLat = (drone.position.lat > plan.maxLat - 0.00008) ? -1 : (drone.position.lat < plan.minLat + 0.00008) ? 1 : plan.dirLat;
            targetHeading = plan.dirLat > 0 ? 0 : 180;
            plan.hoverTimer = 12; // brief 1.2s hover look at turn point
          } else if (plan.dirLng < 0 && drone.position.lng <= plan.minLng + 0.00008) {
            // Reached West turn point
            plan.dirLng = 1;
            plan.dirLat = (drone.position.lat > plan.maxLat - 0.00008) ? -1 : (drone.position.lat < plan.minLat + 0.00008) ? 1 : plan.dirLat;
            targetHeading = plan.dirLat > 0 ? 0 : 180;
            plan.hoverTimer = 12;
          } else {
            // Straight sweep line
            targetHeading = plan.dirLng > 0 ? 90 : 270;
            targetSpeed = plan.cruiseSpeed;
          }
        }
      } 
      else { // RASTER_NS
        currentState = 'FORAGING_SCOUT';
        currentGoal = `Sector Raster: North-South rubble sweep (Col ${Math.round((drone.position.lng - minLng) * 10000)})`;

        if (plan.hoverTimer > 0) {
          plan.hoverTimer -= 1;
          targetSpeed = 0.8;
          targetHeading = (drone.heading + 4) % 360;
        } else {
          if (plan.dirLat > 0 && drone.position.lat >= plan.maxLat - 0.00008) {
            plan.dirLat = -1;
            plan.dirLng = (drone.position.lng > plan.maxLng - 0.00008) ? -1 : (drone.position.lng < plan.minLng + 0.00008) ? 1 : plan.dirLng;
            targetHeading = plan.dirLng > 0 ? 90 : 270;
            plan.hoverTimer = 12;
          } else if (plan.dirLat < 0 && drone.position.lat <= plan.minLat + 0.00008) {
            plan.dirLat = 1;
            plan.dirLng = (drone.position.lng > plan.maxLng - 0.00008) ? -1 : (drone.position.lng < plan.minLng + 0.00008) ? 1 : plan.dirLng;
            targetHeading = plan.dirLng > 0 ? 90 : 270;
            plan.hoverTimer = 12;
          } else {
            targetHeading = plan.dirLat > 0 ? 0 : 180;
            targetSpeed = plan.cruiseSpeed;
          }
        }
      }

      // ── Smooth Coordinated Anti-Clustering (Artificial Potential Fields) ──
      const neighborIds: string[] = [];
      for (const other of this.drones) {
        if (other.id !== drone.id) {
          const dLat = other.position.lat - drone.position.lat;
          const dLng = other.position.lng - drone.position.lng;
          const dist = Math.hypot(dLat, dLng);

          if (dist < 0.00025) {
            neighborIds.push(other.id);
          }

          // Gentle separation bias if closer than 14m
          if (dist < 0.00013 && dist > 0.00001) {
            const avoidHeading = ((Math.atan2(-dLng, -dLat) * 180) / Math.PI + 360) % 360;
            const diff = (avoidHeading - targetHeading + 540) % 360 - 180;
            targetHeading = (targetHeading + diff * 0.35 + 360) % 360;
          }
        }
      }

      // ── Realistic Aerodynamic Turn Kinematics (Banked Turn Rate Limit) ──
      const headingDiff = (targetHeading - drone.heading + 540) % 360 - 180;
      // Max 14 degrees per 100ms tick = smooth, realistic 140 deg/s coordinated turn
      const maxTurn = 14;
      const turnStep = Math.max(-maxTurn, Math.min(maxTurn, headingDiff * 0.18));
      const newHeading = (drone.heading + turnStep + 360) % 360;

      // ── Smooth Speed Acceleration / Deceleration ──
      const speedDiff = targetSpeed - drone.groundSpeed;
      const newSpeed = drone.groundSpeed + Math.max(-0.6, Math.min(0.6, speedDiff * 0.2));

      // ── Smooth Altitude Loiter Variation ──
      const altDiff = targetAlt - drone.position.altitude;
      const newAltitude = Math.round((drone.position.altitude + altDiff * 0.08 + Math.sin((this.tickCounter + idx * 7) * 0.05) * 0.08) * 10) / 10;

      // ── Coordinate Step Advance (100ms tick) ──
      const speedMagnitude = (newSpeed / 3.6) * 0.00000095;
      const angleRad = (newHeading * Math.PI) / 180;
      let nextLat = drone.position.lat + Math.cos(angleRad) * speedMagnitude;
      let nextLng = drone.position.lng + Math.sin(angleRad) * speedMagnitude;

      // ── 100% Strict Hard Geofence Containment Clamp ──
      const hardMinLat = minLat + 0.00004;
      const hardMaxLat = maxLat - 0.00004;
      const hardMinLng = minLng + 0.00004;
      const hardMaxLng = maxLng - 0.00004;

      if (nextLat < hardMinLat || nextLat > hardMaxLat || nextLng < hardMinLng || nextLng > hardMaxLng) {
        nextLat = Math.max(hardMinLat, Math.min(hardMaxLat, nextLat));
        nextLng = Math.max(hardMinLng, Math.min(hardMaxLng, nextLng));
        // Reverse direction smoothly
        plan.dirLat *= -1;
        plan.dirLng *= -1;
      }

      // Battery slow realistic drain
      const newBatt = Math.max(5, parseFloat((drone.battery.level - 0.0007).toFixed(2)));

      return {
        ...drone,
        position: {
          ...drone.position,
          lat: Number(nextLat.toFixed(7)),
          lng: Number(nextLng.toFixed(7)),
          altitude: newAltitude
        },
        heading: Math.round(newHeading),
        groundSpeed: Number(newSpeed.toFixed(1)),
        battery: {
          ...drone.battery,
          level: newBatt,
        },
        perception: {
          ...drone.perception,
          nearbyDronesCount: neighborIds.length,
          neighborIds,
          currentStigmergicState: currentState,
          autonomousGoal: currentGoal,
        }
      };
    });

    // 2. UPDATE 6 GROUND HEXAPODS (Realistic Stepped Crawl with Seismic Listening Stops)
    this.hexapods = this.hexapods.map((hexa, idx) => {
      let nextHeading = hexa.heading;
      let nextLat = hexa.position.lat;
      let nextLng = hexa.position.lng;
      let nextStatus = hexa.status;

      // Hexapod infiltration crawl
      if (hexa.status === 'INFILTRATING_RUBBLE') {
        const targetVictim = this.triageEvents.find(t => t.rescueStatus === 'INFILTRATING');
        if (targetVictim) {
          const dLat = targetVictim.location.lat - hexa.position.lat;
          const dLng = targetVictim.location.lng - hexa.position.lng;
          const dist = Math.hypot(dLat, dLng);

          if (dist > 0.00002) {
            nextHeading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
            const angleRad = (nextHeading * Math.PI) / 180;
            // Realistic deliberate ground crawl speed (~0.6 m/s)
            nextLat += Math.cos(angleRad) * 0.00000012;
            nextLng += Math.sin(angleRad) * 0.00000012;
          }
        }
      }

      return {
        ...hexa,
        status: nextStatus,
        position: {
          ...hexa.position,
          lat: Number(nextLat.toFixed(7)),
          lng: Number(nextLng.toFixed(7)),
        },
        heading: Math.round(nextHeading)
      };
    });

    this.notify();
  }
}

export const telemetryEngine = new SwarmTelemetryEngine();
