import { 
  DroneTelemetry, 
  HexapodTelemetry, 
  TriageEvent, 
  PheromoneCell, 
  AlertEntry, 
  ReasoningTraceLog, 
  SwarmMissionStats 
} from '../types';

// ============================================================================
// BASE GEODETIC REFERENCE: Urban Disaster Complex (120m x 120m Footprint)
// Downscaled for real-world drone & hexabot proportions on satellite view
// ============================================================================
export const BASE_CENTER = { lat: 28.61390, lng: 77.20900 };

// ---------------------------------------------------------------------------
// 1. AERIAL SWARM: 10 Autonomous Ant Quadcopters (4 Perimeter Ring + 6 Interior Core)
// Distributed across building quadrants without clustering
// ---------------------------------------------------------------------------
export const INITIAL_DRONES: DroneTelemetry[] = [
  // ================= INTERIOR CORE SEARCH GROUP (6 UAVs) =================
  {
    id: 'ANT-01',
    callsign: 'FORAGER-ALPHA',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.61430, lng: 77.20870, altitude: 28 }, // North Wing Roof Void
    heading: 45,
    groundSpeed: 5.8,
    verticalSpeed: 0.2,
    motorRpm: [6200, 6180, 6210, 6190],
    flightTimeSec: 840,
    distanceTraveledM: 920,
    battery: { 
      level: 84, 
      voltage: 24.6, 
      temperature: 31.2, 
      cellVoltages: [4.10, 4.10, 4.09, 4.11, 4.10, 4.10],
      capacityMah: 5000,
      cyclesCount: 42,
      isLow: false 
    },
    link: { 
      rssi: -58, 
      snr: 12.4, 
      packetLoss: 0.1, 
      frequencyMhz: 868.1, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.05, repulsionDelta: 0.0, highestTrailAngle: 50, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-03'],
      localObstacleDetected: false,
      obstacleDistanceM: 25.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.4,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'North Wing: Dispersed ACS raster survey over collapsed roof slab'
    },
    payload: { 
      type: 'LIFELINE_FIRST_AID', 
      weightKg: 0.85, 
      status: 'ARMED', 
      releaseMechanism: 'MAGNETIC_LATCH' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.2 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 40, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x Optical', gimbalPitchDeg: -35 }
    }
  },
  {
    id: 'ANT-02',
    callsign: 'RELAY-BRAVO',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.61350, lng: 77.20860, altitude: 22 }, // South-West Debris Cavity
    heading: 135,
    groundSpeed: 6.2,
    verticalSpeed: 0.0,
    motorRpm: [5900, 5920, 5890, 5910],
    flightTimeSec: 620,
    distanceTraveledM: 740,
    battery: { 
      level: 78, 
      voltage: 24.3, 
      temperature: 29.5, 
      cellVoltages: [4.05, 4.04, 4.05, 4.04, 4.05, 4.05],
      capacityMah: 5000,
      cyclesCount: 30,
      isLow: false 
    },
    link: { 
      rssi: -60, 
      snr: 11.2, 
      packetLoss: 0.0, 
      frequencyMhz: 868.1, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.02, repulsionDelta: 0.0, highestTrailAngle: 130, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-06'],
      localObstacleDetected: false,
      obstacleDistanceM: 30.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.2,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'South-West Annex: Acoustic seismic geophone alignment scan'
    },
    payload: { 
      type: 'LORA_MESH_REPEATER', 
      weightKg: 0.60, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.0 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 40, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '2x', gimbalPitchDeg: -45 }
    }
  },
  {
    id: 'ANT-03',
    callsign: 'ATRIUM-CHARLIE',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.61390, lng: 77.20900, altitude: 35 }, // Central Atrium
    heading: 90,
    groundSpeed: 4.5,
    verticalSpeed: 0.0,
    motorRpm: [5800, 5820, 5790, 5810],
    flightTimeSec: 1200,
    distanceTraveledM: 1100,
    battery: { 
      level: 76, 
      voltage: 24.2, 
      temperature: 28.5, 
      cellVoltages: [4.03, 4.04, 4.03, 4.04, 4.03, 4.03],
      capacityMah: 6500,
      cyclesCount: 54,
      isLow: false 
    },
    link: { 
      rssi: -52, 
      snr: 14.2, 
      packetLoss: 0.0, 
      frequencyMhz: 868.1, 
      txPowerDbm: 25, 
      meshHopCount: 0, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.02, repulsionDelta: 0.0, highestTrailAngle: 90, localDecayRate: 0.015 },
      nearbyDronesCount: 2,
      neighborIds: ['ANT-01', 'ANT-04'],
      localObstacleDetected: false,
      obstacleDistanceM: 50.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.1,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Central Atrium: Vertical multi-tier void inspection'
    },
    payload: { 
      type: 'LORA_MESH_REPEATER', 
      weightKg: 1.10, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 45, fps: 30, radiometricTempC: 15.0 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 60, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x', gimbalPitchDeg: -90 }
    }
  },
  {
    id: 'ANT-04',
    callsign: 'CARRIER-DELTA',
    role: 'ACS_PAYLOAD_ANT',
    status: 'SEARCHING',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.61435, lng: 77.20940, altitude: 24 }, // North-East Rubble Void
    heading: 220,
    groundSpeed: 5.4,
    verticalSpeed: -0.1,
    motorRpm: [6400, 6390, 6410, 6400],
    flightTimeSec: 950,
    distanceTraveledM: 880,
    battery: { 
      level: 68, 
      voltage: 23.9, 
      temperature: 32.5, 
      cellVoltages: [3.98, 3.99, 3.98, 3.98, 3.99, 3.98],
      capacityMah: 5000,
      cyclesCount: 38,
      isLow: false 
    },
    link: { 
      rssi: -62, 
      snr: 10.5, 
      packetLoss: 0.2, 
      frequencyMhz: 868.5, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.0, repulsionDelta: 0.0, highestTrailAngle: 220, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-03'],
      localObstacleDetected: false,
      obstacleDistanceM: 18.2,
      localThermalHotspot: false,
      thermalDeltaC: 0.0,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'North-East Rubble: Thermal gradient floor search'
    },
    payload: { 
      type: 'AUTOMATED_DEFIBRILLATOR', 
      weightKg: 1.40, 
      status: 'ARMED', 
      releaseMechanism: 'SERVO_DROP' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 16.1 },
      lidar: { status: 'ONLINE', pointRateKhz: 150, rangeM: 40, coverageDeg: 180 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '2x', gimbalPitchDeg: -20 }
    }
  },
  {
    id: 'ANT-05',
    callsign: 'RECRUIT-ECHO',
    role: 'ACS_RECRUITER',
    status: 'SEARCHING',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.61350, lng: 77.20945, altitude: 26 }, // South-East Column Shear
    heading: 315,
    groundSpeed: 6.0,
    verticalSpeed: 0.1,
    motorRpm: [6500, 6490, 6510, 6500],
    flightTimeSec: 720,
    distanceTraveledM: 670,
    battery: { 
      level: 72, 
      voltage: 24.1, 
      temperature: 31.0, 
      cellVoltages: [4.01, 4.02, 4.01, 4.02, 4.01, 4.01],
      capacityMah: 5000,
      cyclesCount: 22,
      isLow: false 
    },
    link: { 
      rssi: -59, 
      snr: 11.5, 
      packetLoss: 0.1, 
      frequencyMhz: 868.1, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.65, repulsionDelta: 0.0, highestTrailAngle: 320, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-02'],
      localObstacleDetected: false,
      obstacleDistanceM: 28.0,
      localThermalHotspot: true,
      thermalDeltaC: 5.4,
      currentStigmergicState: 'RECRUITING_SWARM',
      autonomousGoal: 'South-East Shear: Concentrating recruitment field over pancake collapse'
    },
    payload: { 
      type: 'THERMAL_OPTICAL_GIMBAL', 
      weightKg: 0.60, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 62, fps: 60, radiometricTempC: 22.4 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 50, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '8x Optical', gimbalPitchDeg: -60 }
    }
  },
  {
    id: 'ANT-06',
    callsign: 'FORAGER-FOXTROT',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.61395, lng: 77.20845, altitude: 20 }, // West Annex Ingress
    heading: 10,
    groundSpeed: 5.0,
    verticalSpeed: 0.0,
    motorRpm: [6100, 6090, 6110, 6100],
    flightTimeSec: 540,
    distanceTraveledM: 510,
    battery: { 
      level: 88, 
      voltage: 24.8, 
      temperature: 27.8, 
      cellVoltages: [4.13, 4.14, 4.13, 4.13, 4.14, 4.13],
      capacityMah: 5000,
      cyclesCount: 18,
      isLow: false 
    },
    link: { 
      rssi: -55, 
      snr: 13.8, 
      packetLoss: 0.0, 
      frequencyMhz: 868.1, 
      txPowerDbm: 20, 
      meshHopCount: 0, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.1, repulsionDelta: 0.0, highestTrailAngle: 10, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-02'],
      localObstacleDetected: false,
      obstacleDistanceM: 20.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.0,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'West Annex: Low-altitude breach penetration scout'
    },
    payload: { 
      type: 'LIFELINE_FIRST_AID', 
      weightKg: 0.85, 
      status: 'ARMED', 
      releaseMechanism: 'MAGNETIC_LATCH' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.4 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 30, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '2x', gimbalPitchDeg: -30 }
    }
  },

  // ================= PERIMETER RING SWARM GROUP (4 UAVs) =================
  {
    id: 'ANT-07',
    callsign: 'RING-NORTH',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'PERIMETER_RING',
    position: { lat: 28.61470, lng: 77.20900, altitude: 32 }, // North Airspace Orbit
    heading: 90,
    groundSpeed: 7.2,
    verticalSpeed: 0.0,
    motorRpm: [6800, 6790, 6810, 6800],
    flightTimeSec: 990,
    distanceTraveledM: 1400,
    battery: { 
      level: 65, 
      voltage: 23.6, 
      temperature: 33.5, 
      cellVoltages: [3.93, 3.94, 3.93, 3.94, 3.93, 3.94],
      capacityMah: 5000,
      cyclesCount: 45,
      isLow: false 
    },
    link: { 
      rssi: -64, 
      snr: 10.2, 
      packetLoss: 0.3, 
      frequencyMhz: 868.3, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.1, repulsionDelta: 0.0, highestTrailAngle: 90, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-01'],
      localObstacleDetected: false,
      obstacleDistanceM: 40.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.0,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Perimeter Ring: North Building Facade surveillance orbit'
    },
    payload: { 
      type: 'LORA_MESH_REPEATER', 
      weightKg: 0.60, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.0 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 60, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x', gimbalPitchDeg: -35 }
    }
  },
  {
    id: 'ANT-08',
    callsign: 'RING-EAST',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'PERIMETER_RING',
    position: { lat: 28.61390, lng: 77.20980, altitude: 30 }, // East Airspace Orbit
    heading: 180,
    groundSpeed: 7.0,
    verticalSpeed: 0.0,
    motorRpm: [6700, 6690, 6710, 6700],
    flightTimeSec: 880,
    distanceTraveledM: 1250,
    battery: { 
      level: 70, 
      voltage: 23.9, 
      temperature: 30.8, 
      cellVoltages: [3.99, 3.98, 3.99, 3.98, 3.99, 3.99],
      capacityMah: 5000,
      cyclesCount: 34,
      isLow: false 
    },
    link: { 
      rssi: -60, 
      snr: 11.5, 
      packetLoss: 0.1, 
      frequencyMhz: 868.3, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.1, repulsionDelta: 0.0, highestTrailAngle: 180, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-04'],
      localObstacleDetected: false,
      obstacleDistanceM: 45.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.0,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Perimeter Ring: East Loading Dock and Rubble wall orbit'
    },
    payload: { 
      type: 'LIFELINE_FIRST_AID', 
      weightKg: 0.85, 
      status: 'ARMED', 
      releaseMechanism: 'MAGNETIC_LATCH' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.3 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 60, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x', gimbalPitchDeg: -35 }
    }
  },
  {
    id: 'ANT-09',
    callsign: 'RING-SOUTH',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'PERIMETER_RING',
    position: { lat: 28.61310, lng: 77.20900, altitude: 30 }, // South Airspace Orbit
    heading: 270,
    groundSpeed: 7.2,
    verticalSpeed: 0.0,
    motorRpm: [6800, 6790, 6810, 6800],
    flightTimeSec: 1040,
    distanceTraveledM: 1500,
    battery: { 
      level: 62, 
      voltage: 23.4, 
      temperature: 34.0, 
      cellVoltages: [3.90, 3.91, 3.90, 3.90, 3.91, 3.90],
      capacityMah: 5000,
      cyclesCount: 48,
      isLow: false 
    },
    link: { 
      rssi: -62, 
      snr: 10.8, 
      packetLoss: 0.2, 
      frequencyMhz: 868.3, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.1, repulsionDelta: 0.0, highestTrailAngle: 270, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-02'],
      localObstacleDetected: false,
      obstacleDistanceM: 40.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.0,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Perimeter Ring: South Staging Zone and Access Ramp orbit'
    },
    payload: { 
      type: 'LORA_MESH_REPEATER', 
      weightKg: 0.60, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 14.8 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 60, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x', gimbalPitchDeg: -35 }
    }
  },
  {
    id: 'ANT-10',
    callsign: 'RING-WEST',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'PERIMETER_RING',
    position: { lat: 28.61390, lng: 77.20815, altitude: 32 }, // West Airspace Orbit
    heading: 0,
    groundSpeed: 7.1,
    verticalSpeed: 0.0,
    motorRpm: [6750, 6740, 6760, 6750],
    flightTimeSec: 910,
    distanceTraveledM: 1320,
    battery: { 
      level: 67, 
      voltage: 23.7, 
      temperature: 32.0, 
      cellVoltages: [3.95, 3.96, 3.95, 3.95, 3.96, 3.95],
      capacityMah: 5000,
      cyclesCount: 40,
      isLow: false 
    },
    link: { 
      rssi: -61, 
      snr: 11.0, 
      packetLoss: 0.2, 
      frequencyMhz: 868.3, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.1, repulsionDelta: 0.0, highestTrailAngle: 0, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-06'],
      localObstacleDetected: false,
      obstacleDistanceM: 40.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.0,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Perimeter Ring: West Structural Collapse Anchor alignment orbit'
    },
    payload: { 
      type: 'AUTOMATED_DEFIBRILLATOR', 
      weightKg: 1.40, 
      status: 'ARMED', 
      releaseMechanism: 'SERVO_DROP' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.1 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 60, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x', gimbalPitchDeg: -35 }
    }
  }
];

// ---------------------------------------------------------------------------
// 2. GROUND HEXAPOD ROBOTS: 6 Autonomous Ground Anchors (Building Perimeter)
// ---------------------------------------------------------------------------
export const INITIAL_HEXAPODS: HexapodTelemetry[] = [
  {
    id: 'HEXA-01',
    callsign: 'TITAN-CRAWLER-1',
    role: 'PERIMETER_ANCHOR',
    status: 'ANCHORED',
    perimeterVertexName: 'North Gate Perimeter Anchor',
    position: { lat: 28.61455, lng: 77.20900, altitude: 4, terrainSlopeDeg: 6 },
    heading: 180,
    crawlSpeed: 0.4,
    gaitMode: 'ANCHOR_LOCK',
    legServoAnglesDeg: [45, 46, 44, 45, 45, 46],
    groundStabilityIndex: 96,
    seismicAcoustic: {
      vibrationMmS: 0.4,
      acousticDecibels: 28,
      tapEchoConfidence: 12,
      tremorDetected: false
    },
    soilMoisturePercent: 32,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-02',
      laserRangeM: 85,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 1420,
    battery: {
      level: 92,
      voltage: 25.2,
      temperature: 28.4,
      cellVoltages: [4.20, 4.20, 4.19, 4.20, 4.20, 4.21],
      capacityMah: 12000,
      cyclesCount: 14,
      isLow: false
    },
    link: {
      rssi: -55,
      snr: 14.5,
      packetLoss: 0.0,
      frequencyMhz: 868.1,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'SEISMIC_ANCHOR_GROUND_STAKE',
      status: 'ANCHOR_DEPLOYED',
      weightKg: 3.5
    },
    sensors: {
      geophone: 'ONLINE',
      groundLiDAR: 'ONLINE',
      microFLIR: 'ONLINE'
    }
  },
  {
    id: 'HEXA-02',
    callsign: 'GEO-WATCHER-2',
    role: 'GEOFENCE_BEACON',
    status: 'ANCHORED',
    perimeterVertexName: 'North-East Rubble Void Anchor',
    position: { lat: 28.61445, lng: 77.20965, altitude: 6, terrainSlopeDeg: 14 },
    heading: 235,
    crawlSpeed: 0.3,
    gaitMode: 'ANCHOR_LOCK',
    legServoAnglesDeg: [52, 54, 50, 53, 51, 52],
    groundStabilityIndex: 88,
    seismicAcoustic: {
      vibrationMmS: 0.8,
      acousticDecibels: 35,
      tapEchoConfidence: 22,
      tremorDetected: false
    },
    soilMoisturePercent: 40,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-03',
      laserRangeM: 110,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 1890,
    battery: {
      level: 86,
      voltage: 24.8,
      temperature: 30.1,
      cellVoltages: [4.13, 4.14, 4.13, 4.13, 4.14, 4.13],
      capacityMah: 12000,
      cyclesCount: 20,
      isLow: false
    },
    link: {
      rssi: -58,
      snr: 12.8,
      packetLoss: 0.0,
      frequencyMhz: 868.3,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'OPTICAL_LASER_GEOFENCE_EMITTER',
      status: 'ARMED',
      weightKg: 2.8
    },
    sensors: {
      geophone: 'ONLINE',
      groundLiDAR: 'ONLINE',
      microFLIR: 'ONLINE'
    }
  },
  {
    id: 'HEXA-03',
    callsign: 'RUBBLE-CRAWLER-3',
    role: 'RUBBLE_INFILTRATOR',
    status: 'INFILTRATING_RUBBLE',
    perimeterVertexName: 'South-East Wall Breach Anchor',
    position: { lat: 28.61335, lng: 77.20965, altitude: 5, terrainSlopeDeg: 28 },
    heading: 300,
    crawlSpeed: 0.5,
    gaitMode: 'WAVE_STABLE',
    legServoAnglesDeg: [60, 58, 62, 61, 59, 60],
    groundStabilityIndex: 78,
    seismicAcoustic: {
      vibrationMmS: 2.4,
      acousticDecibels: 54,
      tapEchoConfidence: 89,
      tremorDetected: true
    },
    soilMoisturePercent: 52,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-04',
      laserRangeM: 85,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 2120,
    battery: {
      level: 80,
      voltage: 24.5,
      temperature: 32.6,
      cellVoltages: [4.08, 4.09, 4.08, 4.09, 4.08, 4.08],
      capacityMah: 12000,
      cyclesCount: 26,
      isLow: false
    },
    link: {
      rssi: -62,
      snr: 10.9,
      packetLoss: 0.1,
      frequencyMhz: 868.5,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'MICRO_RUBBLE_ENDOSCOPE_PROBE',
      status: 'ARMED',
      weightKg: 2.2
    },
    sensors: {
      geophone: 'ONLINE',
      groundLiDAR: 'ONLINE',
      microFLIR: 'ONLINE'
    }
  },
  {
    id: 'HEXA-04',
    callsign: 'SEISMIC-LISTENER-4',
    role: 'SEISMIC_LISTENER',
    status: 'ANCHORED',
    perimeterVertexName: 'South Loading Dock Anchor',
    position: { lat: 28.61325, lng: 77.20900, altitude: 3, terrainSlopeDeg: 4 },
    heading: 0,
    crawlSpeed: 0.3,
    gaitMode: 'ANCHOR_LOCK',
    legServoAnglesDeg: [48, 48, 49, 47, 48, 48],
    groundStabilityIndex: 94,
    seismicAcoustic: {
      vibrationMmS: 0.6,
      acousticDecibels: 42,
      tapEchoConfidence: 74,
      tremorDetected: false
    },
    soilMoisturePercent: 35,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-05',
      laserRangeM: 80,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 1650,
    battery: {
      level: 90,
      voltage: 25.1,
      temperature: 29.0,
      cellVoltages: [4.18, 4.19, 4.18, 4.18, 4.19, 4.18],
      capacityMah: 12000,
      cyclesCount: 16,
      isLow: false
    },
    link: {
      rssi: -56,
      snr: 13.8,
      packetLoss: 0.0,
      frequencyMhz: 868.1,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'HIGH_SENSITIVITY_GEOPHONE_ARRAY',
      status: 'MONITORING_TAP_CODES',
      weightKg: 4.1
    },
    sensors: {
      geophone: 'ONLINE',
      groundLiDAR: 'ONLINE',
      microFLIR: 'ONLINE'
    }
  },
  {
    id: 'HEXA-05',
    callsign: 'PERIMETER-GUARD-5',
    role: 'GEOFENCE_BEACON',
    status: 'ANCHORED',
    perimeterVertexName: 'South-West Staging Anchor',
    position: { lat: 28.61335, lng: 77.20835, altitude: 4, terrainSlopeDeg: 8 },
    heading: 45,
    crawlSpeed: 0.4,
    gaitMode: 'ANCHOR_LOCK',
    legServoAnglesDeg: [46, 45, 47, 46, 45, 46],
    groundStabilityIndex: 92,
    seismicAcoustic: {
      vibrationMmS: 0.5,
      acousticDecibels: 30,
      tapEchoConfidence: 15,
      tremorDetected: false
    },
    soilMoisturePercent: 38,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-06',
      laserRangeM: 115,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 1530,
    battery: {
      level: 88,
      voltage: 24.9,
      temperature: 29.8,
      cellVoltages: [4.15, 4.16, 4.15, 4.15, 4.16, 4.15],
      capacityMah: 12000,
      cyclesCount: 19,
      isLow: false
    },
    link: {
      rssi: -57,
      snr: 13.2,
      packetLoss: 0.0,
      frequencyMhz: 868.3,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'OPTICAL_LASER_GEOFENCE_EMITTER',
      status: 'ARMED',
      weightKg: 2.8
    },
    sensors: {
      geophone: 'ONLINE',
      groundLiDAR: 'ONLINE',
      microFLIR: 'ONLINE'
    }
  },
  {
    id: 'HEXA-06',
    callsign: 'CAVERN-SCOUT-6',
    role: 'RUBBLE_INFILTRATOR',
    status: 'INFILTRATING_RUBBLE',
    perimeterVertexName: 'North-West Column Collapse Anchor',
    position: { lat: 28.61445, lng: 77.20835, altitude: 5, terrainSlopeDeg: 22 },
    heading: 120,
    crawlSpeed: 0.6,
    gaitMode: 'WAVE_STABLE',
    legServoAnglesDeg: [55, 54, 56, 55, 54, 55],
    groundStabilityIndex: 82,
    seismicAcoustic: {
      vibrationMmS: 1.8,
      acousticDecibels: 48,
      tapEchoConfidence: 68,
      tremorDetected: false
    },
    soilMoisturePercent: 44,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-01',
      laserRangeM: 80,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 1980,
    battery: {
      level: 84,
      voltage: 24.7,
      temperature: 31.4,
      cellVoltages: [4.11, 4.12, 4.11, 4.12, 4.11, 4.11],
      capacityMah: 12000,
      cyclesCount: 24,
      isLow: false
    },
    link: {
      rssi: -60,
      snr: 12.0,
      packetLoss: 0.1,
      frequencyMhz: 868.5,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'MICRO_RUBBLE_ENDOSCOPE_PROBE',
      status: 'ARMED',
      weightKg: 2.2
    },
    sensors: {
      geophone: 'ONLINE',
      groundLiDAR: 'ONLINE',
      microFLIR: 'ONLINE'
    }
  }
];

// ---------------------------------------------------------------------------
// 3. EARTHQUAKE DISASTER CASUALTY & HAZARD TRIAGE EVENTS
// ---------------------------------------------------------------------------
export const INITIAL_TRIAGE_EVENTS: TriageEvent[] = [
  {
    id: 'TRI-884A',
    victimCallsign: 'SURVIVOR-ALPHA',
    timestamp: Date.now() - 1000 * 60 * 4,
    location: { lat: 28.61392, lng: 77.20905, altitude: 2, zone: 'Central Atrium Floor Void' },
    sector: 'Sector 7-G Central Atrium',
    severity: 'CRITICAL',
    entrapmentType: 'COLLAPSED_CONCRETE_VOID',
    crushSyndromeRisk: 'HIGH',
    acousticEchoDetected: true,
    soilShearStressKPa: 142.5,
    thermal: {
      bodyTemp: 37.1,
      ambientTemp: 14.5,
      differential: 22.6,
      thermalGradient: 0.88
    },
    thermalSignatureC: 37.1,
    heartRateBpm: 112,
    respirationBpm: 24,
    vitals: {
      respirationRate: 24,
      estimatedMovementScore: 42
    },
    confidenceScore: 0.96,
    confidence: 0.96,
    detectedByDroneId: 'ANT-03',
    assignedDroneId: 'ANT-01',
    rescueStatus: 'PENDING_EXTRACTION',
    hazardContext: 'EARTHQUAKE_PANCAKE_COLLAPSE',
    structuralIntegrityPct: 24,
    airborneGasDetected: false,
    tapFrequencyHz: 2.8,
    trappedPersonsCount: 2,
    recommendedExtraction: 'HEXAPOD_RUBBLE_MICRO_INFILTRATION',
    recommendedAction: 'Deploy hydraulic spreader squad via Central Atrium corridor. Thermal hot-spot confirmed alive.',
    notes: 'FLIR radiometric imaging detected dual heat signatures under reinforced slab. 2.8Hz acoustic rhythmic tapping confirmed conscious victim.'
  },
  {
    id: 'TRI-902B',
    victimCallsign: 'SURVIVOR-BRAVO',
    timestamp: Date.now() - 1000 * 60 * 12,
    location: { lat: 28.61430, lng: 77.20875, altitude: 3, zone: 'North Wing Stairwell Cavity' },
    sector: 'Sector 7-G North Wing',
    severity: 'URGENT',
    entrapmentType: 'BASEMENT_CAVE_IN',
    crushSyndromeRisk: 'MODERATE',
    acousticEchoDetected: true,
    soilShearStressKPa: 98.2,
    thermal: {
      bodyTemp: 36.8,
      ambientTemp: 15.2,
      differential: 21.6,
      thermalGradient: 0.74
    },
    thermalSignatureC: 36.8,
    heartRateBpm: 94,
    respirationBpm: 19,
    vitals: {
      respirationRate: 19,
      estimatedMovementScore: 65
    },
    confidenceScore: 0.91,
    confidence: 0.91,
    detectedByDroneId: 'ANT-01',
    assignedDroneId: 'ANT-04',
    rescueStatus: 'MEDIC_DISPATCHED',
    hazardContext: 'STAIRWELL_SHEAR_FAILURE',
    structuralIntegrityPct: 42,
    airborneGasDetected: false,
    tapFrequencyHz: 1.5,
    trappedPersonsCount: 1,
    recommendedExtraction: 'UAV_LIFELINE_AIRDROP',
    recommendedAction: 'First aid drone ANT-04 deployed with automated oxygen mask and radio beacon.',
    notes: 'Stairwell concrete debris wedge. Survivor responsive, mild hypothermia onset. Medical supply payload in transit.'
  },
  {
    id: 'TRI-731C',
    victimCallsign: 'SURVIVOR-CHARLIE',
    timestamp: Date.now() - 1000 * 60 * 20,
    location: { lat: 28.61350, lng: 77.20920, altitude: 1, zone: 'South Wing Basement Column Void' },
    sector: 'Sector 7-G South Basement',
    severity: 'CRITICAL',
    entrapmentType: 'COLLAPSED_CONCRETE_VOID',
    crushSyndromeRisk: 'HIGH',
    acousticEchoDetected: true,
    soilShearStressKPa: 186.0,
    thermal: {
      bodyTemp: 37.4,
      ambientTemp: 13.8,
      differential: 23.6,
      thermalGradient: 0.92
    },
    thermalSignatureC: 37.4,
    heartRateBpm: 128,
    respirationBpm: 28,
    vitals: {
      respirationRate: 28,
      estimatedMovementScore: 30
    },
    confidenceScore: 0.94,
    confidence: 0.94,
    detectedByDroneId: 'ANT-05',
    assignedDroneId: 'ANT-05',
    rescueStatus: 'PENDING_EXTRACTION',
    hazardContext: 'EARTHQUAKE_BASEMENT_CRUSH',
    structuralIntegrityPct: 18,
    airborneGasDetected: true,
    tapFrequencyHz: 3.2,
    trappedPersonsCount: 3,
    recommendedExtraction: 'GROUND_USAR_TEAM',
    recommendedAction: 'Active methane gas line breach nearby. Hexapod HEXA-03 tasked for endoscopic pipe inspection.',
    notes: 'Severe multi-column collapse. 3 persons trapped in basement storage cavity. VOC methane sensor triggered. Requires extraction team.'
  },
  {
    id: 'TRI-610D',
    victimCallsign: 'SURVIVOR-DELTA',
    timestamp: Date.now() - 1000 * 60 * 35,
    location: { lat: 28.61385, lng: 77.20855, altitude: 4, zone: 'West Annex Rubble Ingress' },
    sector: 'Sector 7-G West Annex',
    severity: 'STABLE',
    entrapmentType: 'TIMBER_DEBRIS_CANOPY',
    crushSyndromeRisk: 'LOW',
    acousticEchoDetected: false,
    soilShearStressKPa: 45.0,
    thermal: {
      bodyTemp: 36.5,
      ambientTemp: 16.0,
      differential: 20.5,
      thermalGradient: 0.62
    },
    thermalSignatureC: 36.5,
    heartRateBpm: 82,
    respirationBpm: 16,
    vitals: {
      respirationRate: 16,
      estimatedMovementScore: 85
    },
    confidenceScore: 0.88,
    confidence: 0.88,
    detectedByDroneId: 'ANT-06',
    assignedDroneId: 'ANT-06',
    rescueStatus: 'IN_ASSESSMENT',
    hazardContext: 'PERIMETER_WALL_DEBRIS',
    structuralIntegrityPct: 58,
    airborneGasDetected: false,
    trappedPersonsCount: 1,
    recommendedExtraction: 'GROUND_USAR_TEAM',
    recommendedAction: 'Light drywall entrapment. Ground team with portable cutting torches can extract in under 10 mins.',
    notes: 'Survivor conscious and communicating verbally through air vent. Minimal debris obstruction.'
  }
];

// ---------------------------------------------------------------------------
// 4. EARTHQUAKE DISASTER SYSTEM ALERTS
// ---------------------------------------------------------------------------
export const INITIAL_ALERTS: AlertEntry[] = [
  {
    id: 'ALT-EQ-01',
    timestamp: Date.now() - 1000 * 60 * 2,
    tier: 'TIER_1_CRITICAL',
    hazardType: 'SEISMIC_AFTERSHOCK',
    sourceDroneId: 'HEXA-03',
    message: 'MAJOR EARTHQUAKE RECON: Sector 7-G structural integrity reduced to 24%. 2 victims identified in central void.',
    location: { lat: 28.61392, lng: 77.20905 }
  },
  {
    id: 'ALT-EQ-02',
    timestamp: Date.now() - 1000 * 60 * 8,
    tier: 'TIER_2_WARNING',
    hazardType: 'GAS_LEAK',
    sourceDroneId: 'HEXA-03',
    message: 'South Wing gas line leak detected: VOC plume expanding NW. Airflow isolation activated.',
    location: { lat: 28.61350, lng: 77.20920 }
  },
  {
    id: 'ALT-EQ-03',
    timestamp: Date.now() - 1000 * 60 * 15,
    tier: 'TIER_3_INFO',
    hazardType: 'GEOFENCE_BREACH',
    sourceDroneId: 'HEXA-01',
    message: '6-Node Optical Laser Geofence locked around building footprint. Perimeter barrier active.',
    location: { lat: 28.61390, lng: 77.20900 }
  }
];

export const INITIAL_MISSION_STATS: SwarmMissionStats = {
  missionId: 'MSN-EQ-7G',
  missionName: 'OPERATION SEISMIC RECON 7',
  missionStartTime: Date.now() - 1000 * 60 * 72,
  missionElapsedSeconds: 4320,
  activeDronesCount: 10,
  activeHexapodsCount: 6,
  interiorDronesCount: 6,
  perimeterDronesCount: 4,
  totalAreaSqKm: 0.015, // 120m x 120m building complex
  searchedPercentage: 74.8,
  meshHealthScore: 98.6,
  geofenceIntegrityScore: 99.4,
  seismicRiskScore: 68.4,
  triageCount: {
    total: 4,
    critical: 2,
    urgent: 1,
    stable: 1,
    rescued: 0
  }
};

// ---------------------------------------------------------------------------
// 5. BUILDING-SCALE 8x8 PHEROMONE GRID (120m x 120m Footprint)
// ---------------------------------------------------------------------------
export function generateInitialPheromoneGrid(): PheromoneCell[] {
  const cells: PheromoneCell[] = [];
  const rows = 8;
  const cols = 8;
  const startLat = 28.61320;
  const startLng = 28.61320;
  const southBound = 28.61320;
  const westBound = 77.20820;
  const stepLat = 0.00020; // ~22 meters per cell
  const stepLng = 0.00022; // ~22 meters per cell

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = `CELL-${r}-${c}`;
      const south = southBound + r * stepLat;
      const north = south + stepLat;
      const west = westBound + c * stepLng;
      const east = west + stepLng;

      const distFromCenter = Math.hypot(r - 3.5, c - 3.5);
      const isCenter = distFromCenter < 2.0;

      cells.push({
        cellId,
        bounds: { north, south, east, west },
        coverageScore: isCenter ? 0.92 : Math.max(0.2, 0.8 - distFromCenter * 0.15),
        recruitmentLevel: (r === 4 && c === 4) ? 0.95 : (r === 2 && c === 5) ? 0.75 : 0.05,
        repulsionLevel: 0.0,
        slopeRiskLevel: (r === 1 && c === 2) ? 0.85 : 0.1,
        lastVisitedTimestamp: Date.now() - Math.random() * 1000 * 60 * 5,
        evaporationHalfLifeSec: 120
      });
    }
  }
  return cells;
}

export const INITIAL_REASONING_LOGS: ReasoningTraceLog[] = [
  {
    id: 'LOG-EQ-001',
    timestamp: '16:12:04',
    severity: 'CRITICAL',
    category: 'ACOUSTIC_TAP_CORRELATION',
    title: 'Multi-Modal Void Entrapment & 2.8Hz Tap Resonance Confirmation',
    droneId: 'ANT-03',
    inferencePath: [
      'FLIR Radiometric sensor detected localized +22.6°C thermal differential under 40cm collapsed pre-stressed concrete slab.',
      'Hexapod HEXA-03 triaxial geophone registered persistent 2.8Hz rhythmic cadence (Morse tap pattern confidence 94.2%).',
      'LiDAR structural mesh reconstructed 1.8m x 2.4m survivable void pocket in Sector 7-G Central Atrium.',
      'Fused Edge-AI Bayesian classifier validated live human presence with 96.2% confidence.'
    ],
    autonomousDecision: 'Elevated triage status of TRI-884A to CRITICAL. Reassigned nearest Air-Ant UAV-01 for automated lifeline drop and alerted extraction squad.',
    operatorRequired: true
  },
  {
    id: 'LOG-EQ-002',
    timestamp: '16:10:48',
    severity: 'HIGH',
    category: 'SEISMIC_TREMOR_ANALYSIS',
    title: 'Aftershock S-Wave Attenuation & Dynamic Geofence Recalibration',
    droneId: 'HEXA-05',
    inferencePath: [
      'Subsurface seismic accelerometer registered 0.48g peak ground acceleration (PGA) from M7.2 aftershock wave packet.',
      'Soil shear stress at South Wing foundation spiked from 92 kPa to 186 kPa, indicating incipient slope failure.',
      'Cross-analyzed laser geofence perimeter links between HEXA-05 and HEXA-06: optical beam deflected by 12mm.',
      'Edge safety arbiter predicted 68% probability of secondary wall collapse along perimeter vertex 4.'
    ],
    autonomousDecision: 'Autonomous swarm perimeter retracted 8 meters inward. Shifted 4 perimeter surveillance UAVs to high-altitude 32m standoff orbit.',
    operatorRequired: false
  },
  {
    id: 'LOG-EQ-003',
    timestamp: '16:08:15',
    severity: 'CRITICAL',
    category: 'SWARM_AIR_GROUND_COORDINATION',
    title: 'Air-Ground Cross-Cueing: Aerial Thermal Anomaly to Ground Hexapod Infiltration',
    droneId: 'ANT-05',
    inferencePath: [
      'UAV ANT-05 aerial thermal camera isolated 37.4°C hot spot beneath dense South Basement rubble canopy.',
      'Aero-photo photogrammetry determined surface rubble too dense for direct aerial supply payload drop.',
      'Emitted high-priority ACS pheromone recruitment signal (cell recruitment level set to 0.95).',
      'Ground hexapod HEXA-03 received coordinates, switched gait from TRIPOD_FAST to WAVE_STABLE for rubble crawling.'
    ],
    autonomousDecision: 'Tasked HEXA-03 for micro-rubble void endoscopic camera probe penetration into basement cavity for casualty TRI-731C.',
    operatorRequired: true
  },
  {
    id: 'LOG-EQ-004',
    timestamp: '16:05:32',
    severity: 'MEDIUM',
    category: 'HEXAPOD_GEOFENCE_REANCHOR',
    title: 'Optical Laser Geofence Line-of-Sight Re-Establishment',
    droneId: 'HEXA-01',
    inferencePath: [
      'Optical laser receiver lost line-of-sight signal with node HEXA-02 due to collapsing masonry debris curtain.',
      'Mesh RSSI dropped from -56dBm to -78dBm along north quadrant corridor.',
      'Calculated alternate line-of-sight path requiring 1.4m westward crawl to stable granite bedrock anchor.',
      'Leg servo torque telemetry confirmed 96% ground shear stability index at new waypoint.'
    ],
    autonomousDecision: 'Autonomous re-anchoring completed. Re-established 85m optical laser geofence barrier with 100% boundary integrity lock.',
    operatorRequired: false
  },
  {
    id: 'LOG-EQ-005',
    timestamp: '16:01:19',
    severity: 'INFO',
    category: 'SLOPE_STABILITY_FAILURE',
    title: 'Stigmergic Pheromone Field Evaporation & Coverage Optimization',
    droneId: 'ANT-02',
    inferencePath: [
      'Grid cell coverage score in Sector 7-G North-East corner exceeded 0.88 search threshold.',
      'Pheromone evaporation engine decayed local recruitment pheromone (half-life 120s).',
      'Negative chemotaxis repulsion vector calculated away from over-surveyed roof quadrants.',
      'Gradient ascent redirected ANT-02 and ANT-07 toward unsearched East Void sector.'
    ],
    autonomousDecision: 'Executing anti-clustering dispersion. Increased building coverage by +12.4% while maintaining zero drone collision risk.',
    operatorRequired: false
  }
];
