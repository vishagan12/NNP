export interface BatteryStatus {
  level: number;
  voltage: number;
  temperature: number;
  cellVoltages: [number, number, number, number, number, number]; // 6S individual cell voltages
  capacityMah: number;
  cyclesCount: number;
  isLow: boolean;
}

export interface RadioLink {
  rssi: number;
  snr: number;
  packetLoss: number;
  frequencyMhz: number;
  txPowerDbm: number;
  meshHopCount: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
}

// Local Stigmergic Perception model for each autonomous aerial ant agent
export interface LocalAntPerception {
  sensedPheromoneGradient: {
    recruitmentDelta: number;
    repulsionDelta: number;
    highestTrailAngle: number;
    localDecayRate: number;
  };
  nearbyDronesCount: number;
  neighborIds: string[];
  localObstacleDetected: boolean;
  obstacleDistanceM: number;
  localThermalHotspot: boolean;
  thermalDeltaC: number;
  currentStigmergicState: 'FORAGING_SCOUT' | 'FOLLOWING_TRAIL' | 'RECRUITING_SWARM' | 'RETURNING_NEST';
  autonomousGoal: string;
}

export interface DroneSensors {
  thermal: {
    status: 'ONLINE' | 'STANDBY' | 'CALIBRATING';
    fovDeg: number;
    fps: number;
    radiometricTempC: number;
  };
  lidar: {
    status: 'ONLINE' | 'STANDBY' | 'OFFLINE';
    pointRateKhz: number;
    rangeM: number;
    coverageDeg: number;
  };
  optical: {
    status: 'ONLINE' | 'STANDBY' | 'OFFLINE';
    resolution: string;
    zoomLevel: string;
    gimbalPitchDeg: number;
  };
}

// Aerial UAV Telemetry Model with Zone Assignment (Interior vs Perimeter)
export interface DroneTelemetry {
  id: string;
  callsign: string;
  role: 'ACS_FORAGER' | 'ACS_RECRUITER' | 'ACS_TRAIL_BLAZER' | 'ACS_PAYLOAD_ANT';
  status: 'PATROL' | 'ENGAGED' | 'LOW BATT' | 'STANDBY' | 'SEARCHING' | 'RETURNING';
  zoneAssignment: 'INTERIOR_CORE' | 'PERIMETER_RING'; // Operational deployment zone
  position: {
    lat: number;
    lng: number;
    altitude: number; // AGL (Above Ground Level in meters)
  };
  heading: number;
  groundSpeed: number; // m/s
  verticalSpeed: number; // m/s
  motorRpm: [number, number, number, number]; // 4 motors
  flightTimeSec: number;
  distanceTraveledM: number;
  battery: BatteryStatus;
  link: RadioLink;
  perception: LocalAntPerception;
  payload: {
    type: string;
    weightKg: number;
    status: 'ARMED' | 'DISPATCHED' | 'STANDBY';
    releaseMechanism: 'MAGNETIC_LATCH' | 'SERVO_DROP' | 'INTERNAL_BAY';
  };
  sensors: DroneSensors;
}

// Autonomous Hexapod Ground Robot Model (6-legged USAR / Geofencing unit)
export interface HexapodTelemetry {
  id: string;
  callsign: string;
  role: 'PERIMETER_ANCHOR' | 'SEISMIC_LISTENER' | 'RUBBLE_INFILTRATOR' | 'GEOFENCE_BEACON';
  status: 'ANCHORED' | 'PATROLLING_PERIMETER' | 'INFILTRATING_RUBBLE' | 'LOW_BATT' | 'STABILIZING_SLOPE';
  perimeterVertexName: string; // e.g. "South-West Ridge Node"
  position: {
    lat: number;
    lng: number;
    altitude: number; // Terrain Elevation in meters
    terrainSlopeDeg: number;
  };
  heading: number;
  crawlSpeed: number; // m/s (0.2 - 2.0 m/s)
  gaitMode: 'TRIPOD_FAST' | 'WAVE_STABLE' | 'RIPPLE_SLOPE' | 'ANCHOR_LOCK';
  legServoAnglesDeg: [number, number, number, number, number, number]; // 6 legs
  groundStabilityIndex: number; // 0 - 100% soil shear integrity
  seismicAcoustic: {
    vibrationMmS: number;
    acousticDecibels: number;
    tapEchoConfidence: number;
    tremorDetected: boolean;
  };
  soilMoisturePercent: number;
  geofenceLaser: {
    connectedToHexaId: string;
    laserRangeM: number;
    perimeterLock: boolean;
    activeLaserSignal: boolean;
  };
  stepCycleCount: number;
  battery: BatteryStatus;
  link: RadioLink;
  payload: {
    type: string;
    status: 'ARMED' | 'ANCHOR_DEPLOYED' | 'STANDBY';
    weightKg: number;
  };
  sensors: {
    geophone: 'ONLINE' | 'STANDBY' | 'CALIBRATING';
    groundLiDAR: 'ONLINE' | 'STANDBY' | 'OFFLINE';
    microFLIR: 'ONLINE' | 'STANDBY' | 'OFFLINE';
  };
}

// Post-Earthquake & Landslide Triage Event Model
export interface TriageEvent {
  id: string;
  victimCallsign?: string;
  location: {
    lat: number;
    lng: number;
    altitude: number;
    zone?: string;
  };
  sector?: string;
  timestamp: number;
  severity: 'CRITICAL' | 'URGENT' | 'STABLE';
  entrapmentType?: 'COLLAPSED_CONCRETE_VOID' | 'MUD_SLOPE_BURIAL' | 'TIMBER_DEBRIS_CANOPY' | 'BASEMENT_CAVE_IN' | string;
  crushSyndromeRisk?: 'HIGH' | 'MODERATE' | 'LOW';
  acousticEchoDetected?: boolean;
  soilShearStressKPa?: number;
  thermal?: {
    bodyTemp: number;
    ambientTemp: number;
    differential: number;
    thermalGradient: number;
  };
  thermalSignatureC?: number;
  heartRateBpm?: number;
  respirationBpm?: number;
  vitals?: {
    respirationRate: number;
    estimatedMovementScore: number;
  };
  confidence?: number;
  confidenceScore?: number;
  rescueStatus: 'PENDING' | 'PENDING_EXTRACTION' | 'DISPATCHED' | 'MEDIC_DISPATCHED' | 'IN_TRANSIT' | 'IN_ASSESSMENT' | 'INFILTRATING' | 'RESCUED' | string;
  assignedDroneId: string | null;
  recommendedExtraction?: 'UAV_LIFELINE_AIRDROP' | 'HEXAPOD_RUBBLE_MICRO_INFILTRATION' | 'GROUND_USAR_TEAM' | string;
  notes?: string;
  detectedByDroneId?: string;
  hazardContext?: string;
  structuralIntegrityPct?: number;
  airborneGasDetected?: boolean;
  tapFrequencyHz?: number;
  trappedPersonsCount?: number;
  recommendedAction?: string;
}

export interface PheromoneCell {
  cellId: string;
  gridX: number;
  gridY: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  coverageScore: number;
  recruitmentLevel: number;
  repulsionLevel: number;
  slopeRiskLevel: number; // Landslide slope failure risk (0.0 to 1.0)
  lastUpdated: number;
}

export interface AlertEntry {
  id: string;
  timestamp: number;
  tier: 'TIER_1_CRITICAL' | 'TIER_2_WARNING' | 'TIER_3_INFO';
  hazardType:
  | 'LANDSLIDE_SLIP'
  | 'SEISMIC_AFTERSHOCK'
  | 'STRUCTURAL_COLLAPSE'
  | 'RUBBLE_VOID_ENTRAPMENT'
  | 'SOIL_LIQUEFACTION'
  | 'GEOFENCE_BREACH'
  | 'LOW_BATTERY'
  | 'COMM_JAM'
  | 'SURVIVOR_FOUND';
  sourceDroneId: string;
  message: string;
  acknowledged: boolean;
}

export interface ReasoningTraceLog {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  category:
  | 'SEISMIC_TREMOR_ANALYSIS'
  | 'SLOPE_STABILITY_FAILURE'
  | 'ACOUSTIC_TAP_CORRELATION'
  | 'HEXAPOD_GEOFENCE_REANCHOR'
  | 'SWARM_AIR_GROUND_COORDINATION';
  title: string;
  droneId: string;
  inferencePath: string[];
  autonomousDecision: string;
  operatorRequired: boolean;
}

export interface SwarmMissionStats {
  missionId: string;
  missionName: string;
  missionStartTime: number;
  totalAreaSqKm: number;
  searchedPercentage: number;
  activeDronesCount: number;
  activeHexapodsCount: number;
  interiorDronesCount: number;
  perimeterDronesCount: number;
  geofenceIntegrityScore: number;
  seismicRiskScore: number;
  meshHealthScore: number;
  triageCount: {
    total: number;
    critical: number;
    urgent: number;
    stable: number;
    rescued: number;
  };
}
