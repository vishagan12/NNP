import { 
  DroneTelemetry, 
  HexapodTelemetry, 
  TriageEvent, 
  PheromoneCell, 
  AlertEntry, 
  SwarmMissionStats,
  MissionLocation,
  RescueRoute
} from '../types';
import { 
  INITIAL_DRONES, 
  INITIAL_HEXAPODS, 
  INITIAL_TRIAGE_EVENTS, 
  INITIAL_ALERTS, 
  INITIAL_MISSION_STATS, 
  INITIAL_RESCUE_ROUTES,
  generateInitialPheromoneGrid, 
  generateRescueRoutes,
  BASE_CENTER,
  MISSION_LOCATIONS
} from '../data/mockData';

// Dynamic geofence calculation relative to active Mission Location

interface FlightPlan {
  pattern: 'RASTER_EW' | 'RASTER_NS' | 'PERIMETER_ORBIT' | 'CENTRAL_LOITER';
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  sectorCenterLat: number;
  sectorCenterLng: number;
  orbitAngleDeg?: number;
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
  private currentLocation: MissionLocation = MISSION_LOCATIONS[0];
  private baseCenter: { lat: number; lng: number } = { ...MISSION_LOCATIONS[0].center };
  private rescueRoutes: RescueRoute[] = JSON.parse(JSON.stringify(INITIAL_RESCUE_ROUTES));

  // =========================================================================
  // 6-SIDED IRREGULAR POLYGON GEOFENCE ENGINE
  // =========================================================================
  private getGeofencePolygon(): [number, number][] {
    return this.hexapods.map(h => [h.position.lat, h.position.lng]);
  }

  // Scaled inward safety polygon (18m inward buffer inside laser boundary)
  private getSafetyPolygon(scale: number = 0.82): [number, number][] {
    return this.hexapods.map(h => {
      const dLat = h.position.lat - this.baseCenter.lat;
      const dLng = h.position.lng - this.baseCenter.lng;
      return [
        this.baseCenter.lat + dLat * scale,
        this.baseCenter.lng + dLng * scale
      ];
    });
  }

  // Jordan curve ray-casting point-in-polygon containment test
  private isPointInPolygon(point: [number, number], vs: [number, number][]): boolean {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private getGeofenceLimits() {
    return {
      minLat: this.baseCenter.lat - 0.00115,
      maxLat: this.baseCenter.lat + 0.00120,
      minLng: this.baseCenter.lng - 0.00120,
      maxLng: this.baseCenter.lng + 0.00130,
    };
  }

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
    const lat = this.baseCenter.lat;
    const lng = this.baseCenter.lng;

    // Dedicated search sector allocations (dispersed across campus with zero swarming)
    const sectorConfig: Record<string, {
      pattern: 'RASTER_EW' | 'RASTER_NS' | 'PERIMETER_ORBIT' | 'CENTRAL_LOITER';
      cLat: number;
      cLng: number;
      spanLat: number;
      spanLng: number;
      speed: number;
      alt: number;
      orbitAngle?: number;
    }> = {
      // ── Core Quadrants ──
      'UAV-01': { pattern: 'RASTER_EW', cLat: lat + 0.00038, cLng: lng + 0.00042, spanLat: 0.00026, spanLng: 0.00045, speed: 6.0, alt: 25 },
      'UAV-02': { pattern: 'RASTER_NS', cLat: lat + 0.00038, cLng: lng - 0.00042, spanLat: 0.00028, spanLng: 0.00042, speed: 5.8, alt: 28 },
      'UAV-03': { pattern: 'CENTRAL_LOITER', cLat: lat, cLng: lng, spanLat: 0.00018, spanLng: 0.00020, speed: 4.2, alt: 32 },
      'UAV-04': { pattern: 'RASTER_EW', cLat: lat - 0.00042, cLng: lng + 0.00042, spanLat: 0.00026, spanLng: 0.00045, speed: 6.2, alt: 24 },
      'UAV-05': { pattern: 'RASTER_NS', cLat: lat - 0.00040, cLng: lng - 0.00042, spanLat: 0.00028, spanLng: 0.00042, speed: 5.9, alt: 27 },
      'UAV-06': { pattern: 'RASTER_EW', cLat: lat, cLng: lng - 0.00048, spanLat: 0.00024, spanLng: 0.00035, speed: 5.6, alt: 23 },
      
      // ── Perimeter Patrol (Phase-locked 90° apart so they NEVER cluster) ──
      'UAV-07': { pattern: 'PERIMETER_ORBIT', cLat: lat, cLng: lng, spanLat: 0.00055, spanLng: 0.00060, speed: 6.5, alt: 33, orbitAngle: 0 },
      'UAV-08': { pattern: 'PERIMETER_ORBIT', cLat: lat, cLng: lng, spanLat: 0.00055, spanLng: 0.00060, speed: 6.5, alt: 35, orbitAngle: 90 },
      'UAV-09': { pattern: 'PERIMETER_ORBIT', cLat: lat, cLng: lng, spanLat: 0.00055, spanLng: 0.00060, speed: 6.5, alt: 32, orbitAngle: 180 },
      'UAV-10': { pattern: 'PERIMETER_ORBIT', cLat: lat, cLng: lng, spanLat: 0.00055, spanLng: 0.00060, speed: 6.5, alt: 34, orbitAngle: 270 },
    };

    this.drones.forEach((d, idx) => {
      const cfg = sectorConfig[d.id] || {
        pattern: 'RASTER_EW',
        cLat: lat,
        cLng: lng,
        spanLat: 0.0003,
        spanLng: 0.0004,
        speed: 5.5,
        alt: 25
      };

      this.flightPlans.set(d.id, {
        pattern: cfg.pattern,
        minLat: cfg.cLat - cfg.spanLat / 2,
        maxLat: cfg.cLat + cfg.spanLat / 2,
        minLng: cfg.cLng - cfg.spanLng / 2,
        maxLng: cfg.cLng + cfg.spanLng / 2,
        sectorCenterLat: cfg.cLat,
        sectorCenterLng: cfg.cLng,
        orbitAngleDeg: cfg.orbitAngle || (idx * 36),
        cruiseSpeed: cfg.speed,
        baseAltitude: cfg.alt,
        dirLat: 1,
        dirLng: idx % 2 === 0 ? 1 : -1,
        hoverTimer: 0
      });
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

  public getLocation(): MissionLocation {
    return this.currentLocation;
  }

  public setLocation(locationIdOrLoc: string | MissionLocation) {
    let targetLoc: MissionLocation | undefined;
    if (typeof locationIdOrLoc === 'string') {
      targetLoc = MISSION_LOCATIONS.find(l => l.id === locationIdOrLoc);
    } else {
      targetLoc = locationIdOrLoc;
    }
    if (!targetLoc) return;

    const prevCenter = { ...this.baseCenter };
    this.currentLocation = targetLoc;
    this.baseCenter = { ...targetLoc.center };
    const deltaLat = this.baseCenter.lat - prevCenter.lat;
    const deltaLng = this.baseCenter.lng - prevCenter.lng;

    // Shift all active drones to new AO
    this.drones = this.drones.map(d => ({
      ...d,
      position: {
        ...d.position,
        lat: d.position.lat + deltaLat,
        lng: d.position.lng + deltaLng,
      }
    }));

    // Shift all hexapods to new AO
    this.hexapods = this.hexapods.map(h => ({
      ...h,
      position: {
        ...h.position,
        lat: h.position.lat + deltaLat,
        lng: h.position.lng + deltaLng,
      }
    }));

    // Shift all casualty triage events to new AO
    this.triageEvents = this.triageEvents.map(t => ({
      ...t,
      location: {
        ...t.location,
        lat: t.location.lat + deltaLat,
        lng: t.location.lng + deltaLng,
      }
    }));

    // Re-generate pheromone grid over new AO
    this.pheromoneGrid = generateInitialPheromoneGrid(this.baseCenter);

    // Re-generate rescue routes over new AO
    this.rescueRoutes = generateRescueRoutes(this.baseCenter);

    // Reinitialize flight paths for new geodetic bounds
    this.initFlightPlans();

    this.addAlert({
      id: `ALT-LOC-${Date.now()}`,
      timestamp: Date.now(),
      tier: 'TIER_1_CRITICAL',
      hazardType: 'SEISMIC_AFTERSHOCK',
      sourceDroneId: 'MISSION_CONTROL',
      message: `Mission AO retargeted to ${targetLoc.name} (${targetLoc.center.lat.toFixed(5)}°N, ${targetLoc.center.lng.toFixed(5)}°E)`,
      location: this.baseCenter
    });

    this.notify();
  }

  public getRescueRoutes(): RescueRoute[] {
    return this.rescueRoutes;
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
      location: this.baseCenter
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
      this.missionStats.missionElapsedSeconds = (this.missionStats.missionElapsedSeconds || 0) + 1;
    }

    const { minLat, maxLat, minLng, maxLng } = this.getGeofenceLimits();

    // 1. UPDATE 10 AUTONOMOUS DRONES WITH REALISTIC TACTICAL SAR FLIGHT DYNAMICS
    this.drones = this.drones.map((drone, idx) => {
      const plan = this.flightPlans.get(drone.id) || {
        pattern: 'RASTER_EW' as const,
        minLat: this.baseCenter.lat - 0.0003,
        maxLat: this.baseCenter.lat + 0.0003,
        minLng: this.baseCenter.lng - 0.0003,
        maxLng: this.baseCenter.lng + 0.0003,
        sectorCenterLat: this.baseCenter.lat,
        sectorCenterLng: this.baseCenter.lng,
        cruiseSpeed: 5.8,
        baseAltitude: 25,
        dirLat: 1,
        dirLng: 1,
        hoverTimer: 0
      };
      this.flightPlans.set(drone.id, plan);

      let targetHeading = drone.heading;
      let targetSpeed = plan.cruiseSpeed;
      let targetAlt = plan.baseAltitude;
      let currentState = drone.perception.currentStigmergicState;
      let currentGoal = drone.perception.autonomousGoal;

      // ── A. Perimeter Orbital Patrol (Equidistant 90° Phase-Locked Ring) ──
      if (plan.pattern === 'PERIMETER_ORBIT') {
        currentState = 'FORAGING_SCOUT';
        currentGoal = `Perimeter Ring: 360° laser fence patrol orbit`;
        targetSpeed = plan.cruiseSpeed;
        targetAlt = plan.baseAltitude;

        // Advance orbital angle smoothly (approx 2.4 deg per second)
        plan.orbitAngleDeg = ((plan.orbitAngleDeg || 0) + 0.32) % 360;
        const rad = (plan.orbitAngleDeg * Math.PI) / 180;

        // Elliptical inner orbit (~60m radius) well inside the 110m geofence
        const orbitTargetLat = this.baseCenter.lat + Math.cos(rad) * 0.00054;
        const orbitTargetLng = this.baseCenter.lng + Math.sin(rad) * 0.00058;

        const dLat = orbitTargetLat - drone.position.lat;
        const dLng = orbitTargetLng - drone.position.lng;
        targetHeading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;
      }
      // ── B. Central Loiter (Slow gentle 360° pan) ──
      else if (plan.pattern === 'CENTRAL_LOITER') {
        currentState = 'FORAGING_SCOUT';
        currentGoal = 'Central Atrium: Multi-tier void inspection & mesh relay';

        const dLat = drone.position.lat - plan.sectorCenterLat;
        const dLng = drone.position.lng - plan.sectorCenterLng;
        const dist = Math.hypot(dLat, dLng);

        if (dist > 0.00016) {
          // Steer gently back toward sector center
          targetHeading = ((Math.atan2(-dLng, -dLat) * 180) / Math.PI + 360) % 360;
          targetSpeed = 3.8;
        } else {
          // Smooth slow observation circle
          targetHeading = (drone.heading + 2.5) % 360;
          targetSpeed = 2.2;
          targetAlt = 30 + Math.sin(this.tickCounter * 0.03) * 1.5;
        }
      }
      // ── C. Dedicated Sector Raster East-West ──
      else if (plan.pattern === 'RASTER_EW') {
        currentState = 'FORAGING_SCOUT';
        currentGoal = `Sector Sweep: E-W thermal raster leg (Sector ${drone.id})`;

        if (plan.hoverTimer > 0) {
          plan.hoverTimer -= 1;
          targetSpeed = 1.0;
          targetHeading = (drone.heading + 3) % 360;
        } else {
          if (plan.dirLng > 0 && drone.position.lng >= plan.maxLng) {
            plan.dirLng = -1;
            plan.dirLat = (drone.position.lat > plan.maxLat) ? -1 : (drone.position.lat < plan.minLat) ? 1 : plan.dirLat;
            targetHeading = 270;
            plan.hoverTimer = 8;
          } else if (plan.dirLng < 0 && drone.position.lng <= plan.minLng) {
            plan.dirLng = 1;
            plan.dirLat = (drone.position.lat > plan.maxLat) ? -1 : (drone.position.lat < plan.minLat) ? 1 : plan.dirLat;
            targetHeading = 90;
            plan.hoverTimer = 8;
          } else {
            targetHeading = plan.dirLng > 0 ? 90 : 270;
            targetSpeed = plan.cruiseSpeed;
          }
        }
      }
      // ── D. Dedicated Sector Raster North-South ──
      else {
        currentState = 'FORAGING_SCOUT';
        currentGoal = `Sector Sweep: N-S structural sweep (Sector ${drone.id})`;

        if (plan.hoverTimer > 0) {
          plan.hoverTimer -= 1;
          targetSpeed = 1.0;
          targetHeading = (drone.heading + 3) % 360;
        } else {
          if (plan.dirLat > 0 && drone.position.lat >= plan.maxLat) {
            plan.dirLat = -1;
            plan.dirLng = (drone.position.lng > plan.maxLng) ? -1 : (drone.position.lng < plan.minLng) ? 1 : plan.dirLng;
            targetHeading = 180;
            plan.hoverTimer = 8;
          } else if (plan.dirLat < 0 && drone.position.lat <= plan.minLat) {
            plan.dirLat = 1;
            plan.dirLng = (drone.position.lng > plan.maxLng) ? -1 : (drone.position.lng < plan.minLng) ? 1 : plan.dirLng;
            targetHeading = 0;
            plan.hoverTimer = 8;
          } else {
            targetHeading = plan.dirLat > 0 ? 0 : 180;
            targetSpeed = plan.cruiseSpeed;
          }
        }
      }

      // ── E. ARTIFICIAL POTENTIAL FIELD (Strict Anti-Swarm Repulsion) ──
      // Drones must never cluster: strong mutual repulsion if closer than 32 meters
      const neighborIds: string[] = [];
      for (const other of this.drones) {
        if (other.id !== drone.id) {
          const dLat = other.position.lat - drone.position.lat;
          const dLng = other.position.lng - drone.position.lng;
          const dist = Math.hypot(dLat, dLng);

          if (dist < 0.00035) {
            neighborIds.push(other.id);
            // Repulsion vector pointing away from neighbor
            if (dist > 0.00001) {
              const repulseHeading = ((Math.atan2(-dLng, -dLat) * 180) / Math.PI + 360) % 360;
              const repulseDiff = (repulseHeading - targetHeading + 540) % 360 - 180;
              const weight = Math.min(0.65, (0.00035 - dist) / 0.00035);
              targetHeading = (targetHeading + repulseDiff * weight + 360) % 360;
            }
          }
        }
      }

      // ── F. Realistic Smooth Coordinated Turn Kinematics (Max 10 deg/tick) ──
      const headingDiff = (targetHeading - drone.heading + 540) % 360 - 180;
      const maxTurn = 10;
      const turnStep = Math.max(-maxTurn, Math.min(maxTurn, headingDiff * 0.18));
      const newHeading = (drone.heading + turnStep + 360) % 360;

      // ── G. Smooth Speed & Altitude Updates ──
      const speedDiff = targetSpeed - drone.groundSpeed;
      const newSpeed = drone.groundSpeed + Math.max(-0.4, Math.min(0.4, speedDiff * 0.18));

      const altDiff = targetAlt - drone.position.altitude;
      const newAltitude = Math.round((drone.position.altitude + altDiff * 0.06 + Math.sin((this.tickCounter + idx * 7) * 0.04) * 0.05) * 10) / 10;

      // ── H. Forward Integration (100ms step) ──
      const speedMagnitude = (newSpeed / 3.6) * 0.00000092;
      const angleRad = (newHeading * Math.PI) / 180;
      let nextLat = drone.position.lat + Math.cos(angleRad) * speedMagnitude;
      let nextLng = drone.position.lng + Math.sin(angleRad) * speedMagnitude;

      // ── I. STRICT 6-SIDED POLYGON GEOFENCE CONTAINMENT ──
      const safetyPolygon = this.getSafetyPolygon(0.80);
      const physicalPolygon = this.getGeofencePolygon();

      if (!this.isPointInPolygon([nextLat, nextLng], safetyPolygon)) {
        // Steer back towards drone's OWN SECTOR CENTER (prevents converging on baseCenter!)
        const toSectorHeading = ((Math.atan2(plan.sectorCenterLng - drone.position.lng, plan.sectorCenterLat - drone.position.lat) * 180) / Math.PI + 360) % 360;
        targetHeading = toSectorHeading;

        nextLat = drone.position.lat + (plan.sectorCenterLat - drone.position.lat) * 0.08;
        nextLng = drone.position.lng + (plan.sectorCenterLng - drone.position.lng) * 0.08;

        plan.dirLat *= -1;
        plan.dirLng *= -1;
      }

      // Hard physical polygon containment failsafe
      if (!this.isPointInPolygon([nextLat, nextLng], physicalPolygon)) {
        nextLat = plan.sectorCenterLat + (drone.position.lat - plan.sectorCenterLat) * 0.70;
        nextLng = plan.sectorCenterLng + (drone.position.lng - plan.sectorCenterLng) * 0.70;
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
