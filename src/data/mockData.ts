import { 
  DroneTelemetry, 
  HexapodTelemetry, 
  TriageEvent, 
  PheromoneCell, 
  AlertEntry, 
  ReasoningTraceLog, 
  SwarmMissionStats 
} from '../types';

export const BASE_CENTER = { lat: 28.6139, lng: 77.2090 };

// ---------------------------------------------------------------------------
// 1. AERIAL SWARM: 10 Autonomous Ant Quadcopters (4 Perimeter Ring + 6 Interior Core)
// ---------------------------------------------------------------------------
export const INITIAL_DRONES: DroneTelemetry[] = [
  // ================= INTERIOR CORE SEARCH GROUP (6 UAVs) =================
  {
    id: 'ANT-01',
    callsign: 'FORAGER-ALPHA',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.6145, lng: 77.2098, altitude: 45 },
    heading: 48,
    groundSpeed: 14.8,
    verticalSpeed: 0.2,
    motorRpm: [6200, 6180, 6210, 6190],
    flightTimeSec: 840,
    distanceTraveledM: 3420,
    battery: { 
      level: 82, 
      voltage: 24.6, 
      temperature: 31.2, 
      cellVoltages: [4.10, 4.10, 4.09, 4.11, 4.10, 4.10],
      capacityMah: 5000,
      cyclesCount: 42,
      isLow: false 
    },
    link: { 
      rssi: -62, 
      snr: 11.4, 
      packetLoss: 0.1, 
      frequencyMhz: 868.1, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.05, repulsionDelta: 0.0, highestTrailAngle: 50, localDecayRate: 0.015 },
      nearbyDronesCount: 2,
      neighborIds: ['ANT-03', 'ANT-07'],
      localObstacleDetected: false,
      obstacleDistanceM: 45.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.4,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Interior Core: Dispersed ACS grid survey over Sector 7-G rubble slab'
    },
    payload: { 
      type: 'LIFELINE_FIRST_AID', 
      weightKg: 0.85, 
      status: 'ARMED', 
      releaseMechanism: 'MAGNETIC_LATCH' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.2 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 100, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x Optical', gimbalPitchDeg: -35 }
    }
  },
  {
    id: 'ANT-03',
    callsign: 'RELAY-CHARLIE',
    role: 'ACS_FORAGER',
    status: 'PATROL',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.6110, lng: 77.2050, altitude: 120 },
    heading: 95,
    groundSpeed: 8.5,
    verticalSpeed: 0.0,
    motorRpm: [5800, 5820, 5790, 5810],
    flightTimeSec: 1200,
    distanceTraveledM: 2100,
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
      rssi: -54, 
      snr: 14.2, 
      packetLoss: 0.0, 
      frequencyMhz: 868.1, 
      txPowerDbm: 25, 
      meshHopCount: 0, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.02, repulsionDelta: 0.0, highestTrailAngle: 90, localDecayRate: 0.015 },
      nearbyDronesCount: 3,
      neighborIds: ['ANT-01', 'ANT-04', 'ANT-09'],
      localObstacleDetected: false,
      obstacleDistanceM: 120.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.1,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Interior Core: High-altitude air-ground mesh bridge linking UAVs to Hexapods'
    },
    payload: { 
      type: 'LORA_MESH_REPEATER', 
      weightKg: 1.10, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'STANDBY', fovDeg: 45, fps: 15, radiometricTempC: 15.0 },
      lidar: { status: 'ONLINE', pointRateKhz: 100, rangeM: 150, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '1080p Tactical', zoomLevel: '2x', gimbalPitchDeg: -90 }
    }
  },
  {
    id: 'ANT-04',
    callsign: 'CARRIER-DELTA',
    role: 'ACS_PAYLOAD_ANT',
    status: 'LOW BATT',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.6095, lng: 77.2030, altitude: 55 },
    heading: 260,
    groundSpeed: 18.0,
    verticalSpeed: -0.4,
    motorRpm: [6800, 6790, 6810, 6800],
    flightTimeSec: 1450,
    distanceTraveledM: 5200,
    battery: { 
      level: 21, 
      voltage: 21.8, 
      temperature: 39.5, 
      cellVoltages: [3.63, 3.64, 3.62, 3.63, 3.64, 3.64],
      capacityMah: 5000,
      cyclesCount: 68,
      isLow: true 
    },
    link: { 
      rssi: -82, 
      snr: 4.5, 
      packetLoss: 2.1, 
      frequencyMhz: 868.5, 
      txPowerDbm: 20, 
      meshHopCount: 2, 
      status: 'DEGRADED' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.0, repulsionDelta: 0.8, highestTrailAngle: 260, localDecayRate: 0.015 },
      nearbyDronesCount: 0,
      neighborIds: [],
      localObstacleDetected: true,
      obstacleDistanceM: 18.2,
      localThermalHotspot: false,
      thermalDeltaC: 0.0,
      currentStigmergicState: 'RETURNING_NEST',
      autonomousGoal: 'Interior Core: Low-battery emergency RTH trajectory to central pad'
    },
    payload: { 
      type: 'AUTOMATED_DEFIBRILLATOR', 
      weightKg: 1.40, 
      status: 'STANDBY', 
      releaseMechanism: 'SERVO_DROP' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 16.1 },
      lidar: { status: 'STANDBY', pointRateKhz: 50, rangeM: 40, coverageDeg: 180 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '1x', gimbalPitchDeg: -20 }
    }
  },
  {
    id: 'ANT-05',
    callsign: 'RECRUIT-ECHO',
    role: 'ACS_RECRUITER',
    status: 'SEARCHING',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.6168, lng: 77.2062, altitude: 60 },
    heading: 315,
    groundSpeed: 16.2,
    verticalSpeed: 0.1,
    motorRpm: [6500, 6490, 6510, 6500],
    flightTimeSec: 720,
    distanceTraveledM: 3100,
    battery: { 
      level: 67, 
      voltage: 23.9, 
      temperature: 31.0, 
      cellVoltages: [3.98, 3.98, 3.99, 3.98, 3.98, 3.99],
      capacityMah: 5000,
      cyclesCount: 22,
      isLow: false 
    },
    link: { 
      rssi: -65, 
      snr: 10.5, 
      packetLoss: 0.4, 
      frequencyMhz: 868.1, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.65, repulsionDelta: 0.0, highestTrailAngle: 320, localDecayRate: 0.015 },
      nearbyDronesCount: 2,
      neighborIds: ['ANT-08', 'ANT-10'],
      localObstacleDetected: false,
      obstacleDistanceM: 65.0,
      localThermalHotspot: true,
      thermalDeltaC: 6.8,
      currentStigmergicState: 'RECRUITING_SWARM',
      autonomousGoal: 'Interior Core: Concentrating recruitment field over pancake collapse void'
    },
    payload: { 
      type: 'THERMAL_OPTICAL_GIMBAL', 
      weightKg: 0.60, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 62, fps: 60, radiometricTempC: 22.4 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 100, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '8x Optical', gimbalPitchDeg: -60 }
    }
  },
  {
    id: 'ANT-07',
    callsign: 'FORAGER-GOLF',
    role: 'ACS_FORAGER',
    status: 'ENGAGED',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.6150, lng: 77.2105, altitude: 50 },
    heading: 30,
    groundSpeed: 21.0,
    verticalSpeed: 0.3,
    motorRpm: [7300, 7290, 7310, 7300],
    flightTimeSec: 990,
    distanceTraveledM: 4800,
    battery: { 
      level: 56, 
      voltage: 23.3, 
      temperature: 33.5, 
      cellVoltages: [3.88, 3.89, 3.88, 3.88, 3.89, 3.88],
      capacityMah: 5000,
      cyclesCount: 45,
      isLow: false 
    },
    link: { 
      rssi: -64, 
      snr: 10.8, 
      packetLoss: 0.2, 
      frequencyMhz: 868.1, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.85, repulsionDelta: 0.0, highestTrailAngle: 30, localDecayRate: 0.015 },
      nearbyDronesCount: 3,
      neighborIds: ['ANT-01', 'ANT-05', 'ANT-09'],
      localObstacleDetected: false,
      obstacleDistanceM: 52.0,
      localThermalHotspot: true,
      thermalDeltaC: 18.2,
      currentStigmergicState: 'FOLLOWING_TRAIL',
      autonomousGoal: 'Interior Core: Rapid delivery trajectory to casualty CAS-EQ-01'
    },
    payload: { 
      type: 'RAPID_TRAUMA_KIT', 
      weightKg: 1.20, 
      status: 'ARMED', 
      releaseMechanism: 'MAGNETIC_LATCH' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 62, fps: 60, radiometricTempC: 34.2 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 100, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '8x Optical', gimbalPitchDeg: -70 }
    }
  },
  {
    id: 'ANT-09',
    callsign: 'CARRIER-INDIA',
    role: 'ACS_PAYLOAD_ANT',
    status: 'PATROL',
    zoneAssignment: 'INTERIOR_CORE',
    position: { lat: 28.6105, lng: 77.2120, altitude: 80 },
    heading: 110,
    groundSpeed: 15.0,
    verticalSpeed: 0.0,
    motorRpm: [6300, 6310, 6290, 6300],
    flightTimeSec: 810,
    distanceTraveledM: 3500,
    battery: { 
      level: 69, 
      voltage: 23.8, 
      temperature: 31.8, 
      cellVoltages: [3.96, 3.97, 3.96, 3.97, 3.96, 3.97],
      capacityMah: 5000,
      cyclesCount: 38,
      isLow: false 
    },
    link: { 
      rssi: -67, 
      snr: 9.5, 
      packetLoss: 0.3, 
      frequencyMhz: 868.3, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.3, repulsionDelta: 0.0, highestTrailAngle: 110, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-03'],
      localObstacleDetected: false,
      obstacleDistanceM: 85.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.2,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Interior Core: Southeast mudslide debris corridor patrol'
    },
    payload: { 
      type: 'SURVIVAL_RATION_DEPLOYER', 
      weightKg: 1.30, 
      status: 'ARMED', 
      releaseMechanism: 'SERVO_DROP' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.5 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 100, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x', gimbalPitchDeg: -50 }
    }
  },

  // ================= PERIMETER RING SURROUND PATROL GROUP (4 UAVs) =================
  {
    id: 'ANT-02',
    callsign: 'SCOUT-BRAVO',
    role: 'ACS_TRAIL_BLAZER',
    status: 'PATROL',
    zoneAssignment: 'PERIMETER_RING',
    position: { lat: 28.6220, lng: 77.2320, altitude: 85 },
    heading: 175,
    groundSpeed: 22.4,
    verticalSpeed: -0.1,
    motorRpm: [7400, 7380, 7420, 7390],
    flightTimeSec: 920,
    distanceTraveledM: 4120,
    battery: { 
      level: 88, 
      voltage: 24.9, 
      temperature: 29.8, 
      cellVoltages: [4.15, 4.14, 4.15, 4.15, 4.14, 4.15],
      capacityMah: 5000,
      cyclesCount: 31,
      isLow: false 
    },
    link: { 
      rssi: -68, 
      snr: 9.8, 
      packetLoss: 0.2, 
      frequencyMhz: 868.3, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.15, repulsionDelta: 0.0, highestTrailAngle: 170, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-06'],
      localObstacleDetected: false,
      obstacleDistanceM: 80.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.2,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Perimeter Ring: East Ridge Boundary patrol & Hexapod-3 laser sync'
    },
    payload: { 
      type: 'SENSOR_POD_ADVANCED', 
      weightKg: 0.40, 
      status: 'STANDBY', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 14.8 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 100, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '10x Optical', gimbalPitchDeg: -45 }
    }
  },
  {
    id: 'ANT-06',
    callsign: 'BLAZER-FOXTROT',
    role: 'ACS_TRAIL_BLAZER',
    status: 'PATROL',
    zoneAssignment: 'PERIMETER_RING',
    position: { lat: 28.5975, lng: 77.2080, altitude: 75 },
    heading: 90,
    groundSpeed: 19.5,
    verticalSpeed: 0.0,
    motorRpm: [7100, 7090, 7120, 7100],
    flightTimeSec: 680,
    distanceTraveledM: 3600,
    battery: { 
      level: 73, 
      voltage: 24.1, 
      temperature: 30.1, 
      cellVoltages: [4.02, 4.01, 4.02, 4.02, 4.01, 4.02],
      capacityMah: 5000,
      cyclesCount: 19,
      isLow: false 
    },
    link: { 
      rssi: -71, 
      snr: 8.9, 
      packetLoss: 0.5, 
      frequencyMhz: 868.3, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.1, repulsionDelta: 0.0, highestTrailAngle: 140, localDecayRate: 0.015 },
      nearbyDronesCount: 1,
      neighborIds: ['ANT-02'],
      localObstacleDetected: false,
      obstacleDistanceM: 70.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.3,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Perimeter Ring: South Boundary patrol & Hexapod-1/2 link monitoring'
    },
    payload: { 
      type: 'BEACON_MARKER_DISPENSER', 
      weightKg: 0.70, 
      status: 'ARMED', 
      releaseMechanism: 'SERVO_DROP' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 15.0 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 100, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x', gimbalPitchDeg: -45 }
    }
  },
  {
    id: 'ANT-08',
    callsign: 'SCOUT-HOTEL',
    role: 'ACS_TRAIL_BLAZER',
    status: 'SEARCHING',
    zoneAssignment: 'PERIMETER_RING',
    position: { lat: 28.6305, lng: 77.2085, altitude: 90 },
    heading: 270,
    groundSpeed: 17.5,
    verticalSpeed: -0.1,
    motorRpm: [6600, 6580, 6610, 6590],
    flightTimeSec: 540,
    distanceTraveledM: 2800,
    battery: { 
      level: 91, 
      voltage: 25.1, 
      temperature: 28.2, 
      cellVoltages: [4.18, 4.19, 4.18, 4.18, 4.19, 4.18],
      capacityMah: 5000,
      cyclesCount: 12,
      isLow: false 
    },
    link: { 
      rssi: -60, 
      snr: 12.5, 
      packetLoss: 0.0, 
      frequencyMhz: 868.5, 
      txPowerDbm: 20, 
      meshHopCount: 1, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.2, repulsionDelta: 0.1, highestTrailAngle: 215, localDecayRate: 0.015 },
      nearbyDronesCount: 2,
      neighborIds: ['ANT-05', 'ANT-10'],
      localObstacleDetected: false,
      obstacleDistanceM: 90.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.5,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Perimeter Ring: North Escarpment patrol & Hexapod-4/5 laser boundary'
    },
    payload: { 
      type: 'MULTI_SPECTRAL_POD', 
      weightKg: 0.50, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 14.5 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 100, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '4x', gimbalPitchDeg: -45 }
    }
  },
  {
    id: 'ANT-10',
    callsign: 'RECRUIT-JULIETT',
    role: 'ACS_RECRUITER',
    status: 'PATROL',
    zoneAssignment: 'PERIMETER_RING',
    position: { lat: 28.6140, lng: 77.1870, altitude: 80 },
    heading: 0,
    groundSpeed: 19.0,
    verticalSpeed: 0.1,
    motorRpm: [7000, 6990, 7010, 7000],
    flightTimeSec: 600,
    distanceTraveledM: 3200,
    battery: { 
      level: 85, 
      voltage: 24.7, 
      temperature: 29.1, 
      cellVoltages: [4.12, 4.11, 4.12, 4.12, 4.11, 4.12],
      capacityMah: 5000,
      cyclesCount: 15,
      isLow: false 
    },
    link: { 
      rssi: -58, 
      snr: 13.0, 
      packetLoss: 0.1, 
      frequencyMhz: 868.5, 
      txPowerDbm: 20, 
      meshHopCount: 0, 
      status: 'OPTIMAL' 
    },
    perception: {
      sensedPheromoneGradient: { recruitmentDelta: 0.4, repulsionDelta: 0.0, highestTrailAngle: 280, localDecayRate: 0.015 },
      nearbyDronesCount: 2,
      neighborIds: ['ANT-05', 'ANT-08'],
      localObstacleDetected: false,
      obstacleDistanceM: 75.0,
      localThermalHotspot: false,
      thermalDeltaC: 0.4,
      currentStigmergicState: 'FORAGING_SCOUT',
      autonomousGoal: 'Perimeter Ring: West Canyon Gate patrol & Hexapod-6 anchor alignment'
    },
    payload: { 
      type: 'RF_LOCATOR_HOMING', 
      weightKg: 0.65, 
      status: 'ARMED', 
      releaseMechanism: 'INTERNAL_BAY' 
    },
    sensors: { 
      thermal: { status: 'ONLINE', fovDeg: 57, fps: 30, radiometricTempC: 14.9 },
      lidar: { status: 'ONLINE', pointRateKhz: 200, rangeM: 100, coverageDeg: 360 },
      optical: { status: 'ONLINE', resolution: '4K UltraHD', zoomLevel: '6x', gimbalPitchDeg: -40 }
    }
  }
];

// ---------------------------------------------------------------------------
// 2. GROUND HEXAPOD ROBOTS: 6 Autonomous Anchors Forming Expansive Geofence (~140 km²)
// ---------------------------------------------------------------------------
export const INITIAL_HEXAPODS: HexapodTelemetry[] = [
  {
    id: 'HEXA-01',
    callsign: 'TITAN-CRAWLER-1',
    role: 'PERIMETER_ANCHOR',
    status: 'ANCHORED',
    perimeterVertexName: 'South-West Ridge Node',
    position: { lat: 28.5980, lng: 77.1890, altitude: 215, terrainSlopeDeg: 12 },
    heading: 45,
    crawlSpeed: 0.8,
    gaitMode: 'ANCHOR_LOCK',
    legServoAnglesDeg: [45, 46, 44, 45, 45, 46],
    groundStabilityIndex: 94,
    seismicAcoustic: {
      vibrationMmS: 0.4,
      acousticDecibels: 28,
      tapEchoConfidence: 12,
      tremorDetected: false
    },
    soilMoisturePercent: 32,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-02',
      laserRangeM: 3950,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 4120,
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
      rssi: -58,
      snr: 13.5,
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
    status: 'PATROLLING_PERIMETER',
    perimeterVertexName: 'South-East Flank Node',
    position: { lat: 28.5970, lng: 77.2280, altitude: 228, terrainSlopeDeg: 24 },
    heading: 350,
    crawlSpeed: 1.2,
    gaitMode: 'RIPPLE_SLOPE',
    legServoAnglesDeg: [52, 54, 50, 53, 51, 52],
    groundStabilityIndex: 81,
    seismicAcoustic: {
      vibrationMmS: 1.2,
      acousticDecibels: 35,
      tapEchoConfidence: 22,
      tremorDetected: false
    },
    soilMoisturePercent: 48,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-03',
      laserRangeM: 2150,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 5890,
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
      rssi: -62,
      snr: 11.8,
      packetLoss: 0.1,
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
    perimeterVertexName: 'East Fault Scarp Node',
    position: { lat: 28.6140, lng: 77.2340, altitude: 242, terrainSlopeDeg: 38 },
    heading: 280,
    crawlSpeed: 0.5,
    gaitMode: 'WAVE_STABLE',
    legServoAnglesDeg: [60, 58, 62, 61, 59, 60],
    groundStabilityIndex: 68,
    seismicAcoustic: {
      vibrationMmS: 2.8,
      acousticDecibels: 54,
      tapEchoConfidence: 89,
      tremorDetected: true
    },
    soilMoisturePercent: 62,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-04',
      laserRangeM: 2050,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 7120,
    battery: {
      level: 74,
      voltage: 24.2,
      temperature: 34.6,
      cellVoltages: [4.03, 4.04, 4.03, 4.04, 4.03, 4.03],
      capacityMah: 12000,
      cyclesCount: 35,
      isLow: false
    },
    link: {
      rssi: -70,
      snr: 8.9,
      packetLoss: 0.4,
      frequencyMhz: 868.5,
      txPowerDbm: 24,
      meshHopCount: 1,
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
    perimeterVertexName: 'North-East Peak Node',
    position: { lat: 28.6300, lng: 77.2290, altitude: 255, terrainSlopeDeg: 18 },
    heading: 220,
    crawlSpeed: 0.4,
    gaitMode: 'ANCHOR_LOCK',
    legServoAnglesDeg: [48, 48, 49, 47, 48, 48],
    groundStabilityIndex: 91,
    seismicAcoustic: {
      vibrationMmS: 0.8,
      acousticDecibels: 42,
      tapEchoConfidence: 74,
      tremorDetected: false
    },
    soilMoisturePercent: 41,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-05',
      laserRangeM: 4100,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 3980,
    battery: {
      level: 89,
      voltage: 24.9,
      temperature: 29.0,
      cellVoltages: [4.15, 4.15, 4.14, 4.15, 4.15, 4.14],
      capacityMah: 12000,
      cyclesCount: 18,
      isLow: false
    },
    link: {
      rssi: -56,
      snr: 13.9,
      packetLoss: 0.0,
      frequencyMhz: 868.1,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'TRIAXIAL_BOREHOLE_GEOPHONE',
      status: 'ANCHOR_DEPLOYED',
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
    callsign: 'SLOPE-GUARD-5',
    role: 'PERIMETER_ANCHOR',
    status: 'PATROLLING_PERIMETER',
    perimeterVertexName: 'North-West Escarpment Node',
    position: { lat: 28.6310, lng: 77.1880, altitude: 238, terrainSlopeDeg: 28 },
    heading: 175,
    crawlSpeed: 1.0,
    gaitMode: 'TRIPOD_FAST',
    legServoAnglesDeg: [50, 52, 49, 51, 50, 51],
    groundStabilityIndex: 78,
    seismicAcoustic: {
      vibrationMmS: 1.9,
      acousticDecibels: 38,
      tapEchoConfidence: 15,
      tremorDetected: false
    },
    soilMoisturePercent: 55,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-06',
      laserRangeM: 1980,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 6340,
    battery: {
      level: 81,
      voltage: 24.5,
      temperature: 31.8,
      cellVoltages: [4.08, 4.09, 4.08, 4.09, 4.08, 4.08],
      capacityMah: 12000,
      cyclesCount: 26,
      isLow: false
    },
    link: {
      rssi: -65,
      snr: 10.4,
      packetLoss: 0.1,
      frequencyMhz: 868.3,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'GROUND_STABILIZATION_GROUT_INJECTOR',
      status: 'ARMED',
      weightKg: 3.2
    },
    sensors: {
      geophone: 'ONLINE',
      groundLiDAR: 'ONLINE',
      microFLIR: 'ONLINE'
    }
  },
  {
    id: 'HEXA-06',
    callsign: 'PERIMETER-CLOSER-6',
    role: 'GEOFENCE_BEACON',
    status: 'ANCHORED',
    perimeterVertexName: 'West Canyon Gate Node',
    position: { lat: 28.6145, lng: 77.1860, altitude: 220, terrainSlopeDeg: 15 },
    heading: 90,
    crawlSpeed: 0.7,
    gaitMode: 'ANCHOR_LOCK',
    legServoAnglesDeg: [46, 45, 46, 46, 45, 46],
    groundStabilityIndex: 96,
    seismicAcoustic: {
      vibrationMmS: 0.5,
      acousticDecibels: 26,
      tapEchoConfidence: 8,
      tremorDetected: false
    },
    soilMoisturePercent: 35,
    geofenceLaser: {
      connectedToHexaId: 'HEXA-01',
      laserRangeM: 1920,
      perimeterLock: true,
      activeLaserSignal: true
    },
    stepCycleCount: 4890,
    battery: {
      level: 94,
      voltage: 25.3,
      temperature: 27.9,
      cellVoltages: [4.21, 4.22, 4.21, 4.21, 4.22, 4.21],
      capacityMah: 12000,
      cyclesCount: 11,
      isLow: false
    },
    link: {
      rssi: -55,
      snr: 14.0,
      packetLoss: 0.0,
      frequencyMhz: 868.1,
      txPowerDbm: 24,
      meshHopCount: 0,
      status: 'OPTIMAL'
    },
    payload: {
      type: 'OPTICAL_LASER_GEOFENCE_EMITTER',
      status: 'ANCHOR_DEPLOYED',
      weightKg: 2.8
    },
    sensors: {
      geophone: 'ONLINE',
      groundLiDAR: 'ONLINE',
      microFLIR: 'ONLINE'
    }
  }
];

// ---------------------------------------------------------------------------
// 3. POST-EARTHQUAKE & LANDSLIDE CASUALTY TRIAGE REGISTRY
// ---------------------------------------------------------------------------
export const INITIAL_TRIAGE_EVENTS: TriageEvent[] = [
  {
    id: 'CAS-EQ-01',
    victimCallsign: 'SURVIVOR-ALPHA [Entrapped]',
    location: { lat: 28.6152, lng: 77.2110, altitude: 230 },
    sector: 'Sector 7-G (Collapsed Structural Slab - Interior)',
    timestamp: Date.now() - 120000,
    severity: 'CRITICAL',
    entrapmentType: 'COLLAPSED_CONCRETE_VOID',
    crushSyndromeRisk: 'HIGH',
    acousticEchoDetected: true,
    soilShearStressKPa: 142.5,
    thermal: { bodyTemp: 34.2, ambientTemp: 14.1, differential: 20.1, thermalGradient: 4.8 },
    vitals: { respirationRate: 11, estimatedMovementScore: 0.15 },
    confidence: 96.4,
    rescueStatus: 'DISPATCHED',
    assignedDroneId: 'ANT-07',
    recommendedExtraction: 'HEXAPOD_RUBBLE_MICRO_INFILTRATION',
    notes: 'Severe void entrapment beneath pre-stressed concrete slab. HEXA-03 acoustic geophone isolated rhythmic tapping signal at 2.8Hz.'
  },
  {
    id: 'CAS-EQ-02',
    victimCallsign: 'SURVIVOR-BRAVO [Slope Burial]',
    location: { lat: 28.6185, lng: 77.2142, altitude: 248 },
    sector: 'Sector 4-B (Active Landslide Slip Scarp - East Perimeter)',
    timestamp: Date.now() - 340000,
    severity: 'URGENT',
    entrapmentType: 'MUD_SLOPE_BURIAL',
    crushSyndromeRisk: 'MODERATE',
    acousticEchoDetected: true,
    soilShearStressKPa: 98.2,
    thermal: { bodyTemp: 36.1, ambientTemp: 15.0, differential: 21.1, thermalGradient: 3.2 },
    vitals: { respirationRate: 18, estimatedMovementScore: 0.65 },
    confidence: 91.2,
    rescueStatus: 'PENDING',
    assignedDroneId: null,
    recommendedExtraction: 'UAV_LIFELINE_AIRDROP',
    notes: 'Debris toe slide burial. Two subjects sheltered inside vehicle void. HEXA-02 maintaining stability perimeter anchor.'
  },
  {
    id: 'CAS-EQ-03',
    victimCallsign: 'SURVIVOR-CHARLIE [Basement Void]',
    location: { lat: 28.6102, lng: 77.2038, altitude: 212 },
    sector: 'Sector 9-A (Pancake Collapse Void - Interior Core)',
    timestamp: Date.now() - 890000,
    severity: 'STABLE',
    entrapmentType: 'BASEMENT_CAVE_IN',
    crushSyndromeRisk: 'LOW',
    acousticEchoDetected: false,
    soilShearStressKPa: 45.0,
    thermal: { bodyTemp: 36.8, ambientTemp: 16.2, differential: 20.6, thermalGradient: 2.1 },
    vitals: { respirationRate: 16, estimatedMovementScore: 0.90 },
    confidence: 88.7,
    rescueStatus: 'IN_TRANSIT',
    assignedDroneId: 'ANT-01',
    recommendedExtraction: 'GROUND_USAR_TEAM',
    notes: 'Micro-FLIR verified survivor in stable basement pocket. Oxygen line & beacon delivered by ANT-01.'
  },
  {
    id: 'CAS-EQ-04',
    victimCallsign: 'SURVIVOR-DELTA [Extracted]',
    location: { lat: 28.6190, lng: 77.2065, altitude: 224 },
    sector: 'Sector 2-C (North Ravine Toe - North Boundary)',
    timestamp: Date.now() - 1600000,
    severity: 'STABLE',
    entrapmentType: 'TIMBER_DEBRIS_CANOPY',
    crushSyndromeRisk: 'LOW',
    acousticEchoDetected: false,
    soilShearStressKPa: 32.0,
    thermal: { bodyTemp: 37.0, ambientTemp: 16.5, differential: 20.5, thermalGradient: 1.8 },
    vitals: { respirationRate: 15, estimatedMovementScore: 1.0 },
    confidence: 99.1,
    rescueStatus: 'RESCUED',
    assignedDroneId: 'GROUND_USAR_ALPHA',
    recommendedExtraction: 'GROUND_USAR_TEAM',
    notes: 'Extraction completed by USAR Team Bravo via HEXA-05 stabilized corridor.'
  }
];

// ---------------------------------------------------------------------------
// 4. EXPANDED ACS PHEROMONE & SLOPE FAILURE RISK GRID (~140 km²)
// ---------------------------------------------------------------------------
export function generateInitialPheromoneGrid(): PheromoneCell[] {
  const cells: PheromoneCell[] = [];
  const minLat = 28.5950;
  const maxLat = 28.6330;
  const minLng = 77.1850;
  const maxLng = 77.2350;
  const stepLat = 0.0035;
  const stepLng = 0.0045;

  let idCount = 0;
  for (let lat = minLat; lat < maxLat; lat += stepLat) {
    for (let lng = minLng; lng < maxLng; lng += stepLng) {
      idCount++;
      const distFromCenter = Math.sqrt(Math.pow(lat - BASE_CENTER.lat, 2) + Math.pow(lng - BASE_CENTER.lng, 2));
      const isNearCenter = distFromCenter < 0.012;

      // Slope failure risk along outer north/east ridges
      const slopeRiskLevel = (lat > 28.618 && lng > 77.215) ? 0.85 : (lat < 28.602 && lng < 77.195) ? 0.65 : 0.15;

      cells.push({
        cellId: `CELL-${idCount}`,
        gridX: Math.round((lng - minLng) / stepLng),
        gridY: Math.round((lat - minLat) / stepLat),
        bounds: {
          south: lat,
          north: lat + stepLat,
          west: lng,
          east: lng + stepLng
        },
        coverageScore: isNearCenter ? Math.min(1.0, 0.4 + Math.random() * 0.6) : (Math.random() > 0.5 ? Math.random() * 0.35 : 0.0),
        recruitmentLevel: (lat > 28.612 && lng > 77.208 && Math.random() > 0.7) ? 0.8 : 0.05,
        repulsionLevel: slopeRiskLevel > 0.8 ? 0.75 : 0.0,
        slopeRiskLevel,
        lastUpdated: Date.now()
      });
    }
  }
  return cells;
}

// ---------------------------------------------------------------------------
// 5. POST-EARTHQUAKE & LANDSLIDE INCIDENT ALERTS
// ---------------------------------------------------------------------------
export const INITIAL_ALERTS: AlertEntry[] = [
  {
    id: 'ALT-EQ-1092',
    timestamp: Date.now() - 45000,
    tier: 'TIER_1_CRITICAL',
    hazardType: 'RUBBLE_VOID_ENTRAPMENT',
    sourceDroneId: 'HEXA-03',
    message: 'Acoustic Geophone detected rhythmic tapping echo (2.8Hz) beneath Sector 7-G concrete slab.',
    acknowledged: false
  },
  {
    id: 'ALT-EQ-1091',
    timestamp: Date.now() - 180000,
    tier: 'TIER_2_WARNING',
    hazardType: 'LANDSLIDE_SLIP',
    sourceDroneId: 'HEXA-02',
    message: 'Slope shear stress spiked to 98.2 kPa in Sector 4-B. Hexapod laser perimeter adjusted +15m outward.',
    acknowledged: false
  },
  {
    id: 'ALT-EQ-1090',
    timestamp: Date.now() - 320000,
    tier: 'TIER_3_INFO',
    hazardType: 'GEOFENCE_BREACH',
    sourceDroneId: 'HEXA-01',
    message: 'Hexapod laser perimeter geofence locked across 6 ground boundary nodes (~142 km² envelope).',
    acknowledged: true
  }
];

// ---------------------------------------------------------------------------
// 6. DECENTRALIZED AI SEISMIC & MULTI-AGENT INFERENCE TRACES
// ---------------------------------------------------------------------------
export const INITIAL_REASONING_TRACES: ReasoningTraceLog[] = [
  {
    id: 'TRACE-EQ-894',
    timestamp: '14:02:11',
    severity: 'CRITICAL',
    category: 'ACOUSTIC_TAP_CORRELATION',
    title: 'ACOUSTIC GEOPHONE + FLIR RUBBLE VOID CORRELATION',
    droneId: 'HEXA-03',
    inferencePath: [
      'HEXA-03 triaxial geophone anchored on East Fault Scarp recorded 2.8Hz acoustic tap cadence (SNR: 18.4dB).',
      'Airborne ANT-01 FLIR radiometric camera confirmed +20.1°C differential thermal plume rising through slab fissure.',
      'Edge YOLOv9 USAR model correlated survivor trapped in 1.4m concrete void pocket.',
      'Decentralized air-ground response triggered: ANT-07 vectorized for rapid trauma kit delivery.'
    ],
    autonomousDecision: 'Autonomous Hexapod Infiltration: HEXA-03 deployed micro-endoscope probe; ANT-07 payload armed.',
    operatorRequired: false
  },
  {
    id: 'TRACE-EQ-893',
    timestamp: '13:59:44',
    severity: 'HIGH',
    category: 'SLOPE_STABILITY_FAILURE',
    title: 'EXPANDED LANDSLIDE SCARP SHEAR FAILURE EARLY WARNING',
    droneId: 'HEXA-02',
    inferencePath: [
      'Soil moisture sensor registered 48% saturation following seismic water main rupture.',
      'LiDAR point-cloud differential detected 4.2cm micro-displacement along slip scarp.',
      'Factor of Safety (FoS) dropped from 1.35 to 1.08.',
      'Autonomous geofence realignment: HEXA-02 and HEXA-03 laser perimeter shifted to establish 120m exclusion buffer.'
    ],
    autonomousDecision: 'Hexapod Boundary Expansion: Re-anchored perimeter laser line to prevent USAR team entry into active slip zone.',
    operatorRequired: false
  },
  {
    id: 'TRACE-EQ-892',
    timestamp: '13:52:10',
    severity: 'MEDIUM',
    category: 'SWARM_AIR_GROUND_COORDINATION',
    title: 'HETEROGENEOUS AIR-GROUND STIGMERGIC ROUTING',
    droneId: 'ANT-03',
    inferencePath: [
      'Ground Hexapods HEXA-04 and HEXA-05 reported RF shadowing across deep north canyon.',
      'Airborne UAV ANT-03 autonomously climbed to 120m AGL above the central ridgeline.',
      'Established high-throughput LoRa/WiFi mesh bridge between all 10 UAVs and 6 Hexapods.'
    ],
    autonomousDecision: 'Elevated Relay Orbit: Maintained zero-packet-loss air-ground telemetry trunk.',
    operatorRequired: false
  }
];

// ---------------------------------------------------------------------------
// 7. EXPANDED COMPREHENSIVE MISSION STATS (~140 km²)
// ---------------------------------------------------------------------------
export const INITIAL_MISSION_STATS: SwarmMissionStats = {
  missionId: 'OP-SEISMIC-SHIELD-EXPANDED',
  missionName: 'Regional Post-Earthquake Air-Ground USAR Operation',
  missionStartTime: Date.now() - 2535000,
  totalAreaSqKm: 142.8,
  searchedPercentage: 89.2,
  activeDronesCount: 10,
  activeHexapodsCount: 6,
  interiorDronesCount: 6,
  perimeterDronesCount: 4,
  geofenceIntegrityScore: 99.2,
  seismicRiskScore: 74.8,
  meshHealthScore: 99.4,
  triageCount: {
    total: 4,
    critical: 1,
    urgent: 1,
    stable: 2,
    rescued: 1
  }
};
