// ============================================================
// AtratoCentinela AI — Centralized Station Configuration
// ============================================================
//
// HOW TO ADD A NEW STATION:
//   1. Add a new object to the STATIONS array below
//   2. Required fields: id, name, node, lat, lng
//   3. Optional: riskLevel, connectionStatus, autonomousMode, sensors
//
// HOW TO CHANGE COORDINATES:
//   Edit the lat / lng values for the station object
//
// HOW TO CHANGE STATUS (offline, autonomous, critical):
//   connectionStatus: "online" | "offline"
//   autonomousMode: true | false
//   riskLevel: "normal" | "warning" | "critical"
//
// HOW TO MARK A STATION OFFLINE:
//   connectionStatus: "offline",
//   lastSeen: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
//
// HOW TO ACTIVATE AUTONOMOUS MODE:
//   autonomousMode: true,
//   connectionStatus: "offline",
//   meshRelay: "NHD-QBD-01",  // nearest online node
//
// HOW TO ADD 5, 20, OR 100 STATIONS:
//   Just add more objects to the array. All logic reads from this list.
//   No internal code changes needed.
//
// ============================================================

export type StationRisk = "normal" | "warning" | "critical";
export type StationConnection = "online" | "offline";

export interface StationSensor {
  id: string;
  name: string;
  variable: string;
  unit: string;
  threshold: number;
  critical: number;
}

export interface StationData {
  id: number;
  name: string;
  node: string;
  lat: number;
  lng: number;
  type?: string;
  riskLevel: StationRisk;
  connectionStatus: StationConnection;
  autonomousMode: boolean;
  lastSeen: string;
  meshRelay: string | null;
  sensors: StationSensor[];
}

// ─── SIMULATION CONTROL ──────────────────────────────────────────
// Set to true to periodically toggle some stations between
// online/offline/autonomous for demo purposes.
//
// To disable: set to false
// ============================================================
export const ENABLE_CONNECTION_SIMULATION = true;
export const SIMULATION_INTERVAL_MS = 25000; // check every 25s

// ─── STATIONS ────────────────────────────────────────────────────
// Add new stations at the end of this array.
// The system reads all stations from this list.
// ============================================================

export const STATIONS: StationData[] = [
  {
    id: 1,
    name: "Quibdo",
    node: "NHD-QBD-01",
    lat: 5.69188,
    lng: -76.65835,
    type: "Hidrologica",
    riskLevel: "normal",
    connectionStatus: "online",
    autonomousMode: false,
    lastSeen: new Date().toISOString(),
    meshRelay: null,
    sensors: [
      { id: "s1", name: "Limnigraph LG-200", variable: "Nivel", unit: "m", threshold: 5.0, critical: 6.5 },
      { id: "s2", name: "Turbidimetro TB-4100", variable: "Turbiedad", unit: "NTU", threshold: 100, critical: 200 },
      { id: "s3", name: "Electrodo pH EP-7", variable: "pH", unit: "pH", threshold: 9.0, critical: 9.5 },
      { id: "s4", name: "Oximetro OX-200", variable: "Oxigeno disuelto", unit: "mg/L", threshold: 4.0, critical: 2.0 },
      { id: "s5", name: "Termistor TS-100", variable: "Temperatura", unit: "°C", threshold: 32, critical: 35 },
      { id: "s6", name: "Pluviometro PR-300", variable: "Precipitacion", unit: "mm", threshold: 80, critical: 150 },
    ],
  },
  {
    id: 2,
    name: "Bojaya",
    node: "NHD-BJY-02",
    lat: 6.52,
    lng: -76.97,
    type: "Hidrologica",
    riskLevel: "warning",
    connectionStatus: "online",
    autonomousMode: false,
    lastSeen: new Date().toISOString(),
    meshRelay: null,
    sensors: [
      { id: "s7", name: "Limnigraph LG-201", variable: "Nivel", unit: "m", threshold: 5.0, critical: 6.5 },
      { id: "s8", name: "Turbidimetro TB-4101", variable: "Turbiedad", unit: "NTU", threshold: 100, critical: 200 },
      { id: "s9", name: "Conductimetro CD-300", variable: "Conductividad", unit: "uS/cm", threshold: 400, critical: 600 },
      { id: "s10", name: "Pluviometro PR-301", variable: "Precipitacion", unit: "mm", threshold: 80, critical: 150 },
    ],
  },
  {
    id: 3,
    name: "Vigia del Fuerte",
    node: "NHD-VDF-03",
    lat: 6.58,
    lng: -76.89,
    type: "Hidrologica",
    riskLevel: "warning",
    connectionStatus: "online",
    autonomousMode: false,
    lastSeen: new Date().toISOString(),
    meshRelay: null,
    sensors: [
      { id: "s11", name: "Limnigraph LG-202", variable: "Nivel", unit: "m", threshold: 5.0, critical: 6.5 },
      { id: "s12", name: "Turbidimetro TB-4102", variable: "Turbiedad", unit: "NTU", threshold: 100, critical: 200 },
      { id: "s13", name: "Electrodo pH EP-8", variable: "pH", unit: "pH", threshold: 9.0, critical: 9.5 },
      { id: "s14", name: "Pluviometro PR-302", variable: "Precipitacion", unit: "mm", threshold: 80, critical: 150 },
    ],
  },
  {
    id: 4,
    name: "Tutunendo",
    node: "NHD-TTN-04",
    lat: 5.72,
    lng: -76.65,
    type: "Meteorologica",
    riskLevel: "normal",
    connectionStatus: "online",
    autonomousMode: false,
    lastSeen: new Date().toISOString(),
    meshRelay: null,
    sensors: [
      { id: "s15", name: "Termistor TS-101", variable: "Temperatura", unit: "°C", threshold: 32, critical: 35 },
      { id: "s16", name: "Pluviometro PR-303", variable: "Precipitacion", unit: "mm", threshold: 80, critical: 150 },
    ],
  },
  {
    id: 5,
    name: "Lloro",
    node: "NHD-LLR-05",
    lat: 5.5,
    lng: -76.55,
    type: "Hidrologica",
    riskLevel: "normal",
    connectionStatus: "online",
    autonomousMode: false,
    lastSeen: new Date().toISOString(),
    meshRelay: null,
    sensors: [
      { id: "s17", name: "Limnigraph LG-203", variable: "Nivel", unit: "m", threshold: 5.0, critical: 6.5 },
      { id: "s18", name: "Turbidimetro TB-4103", variable: "Turbiedad", unit: "NTU", threshold: 100, critical: 200 },
      { id: "s19", name: "Conductimetro CD-301", variable: "Conductividad", unit: "uS/cm", threshold: 400, critical: 600 },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────

export function getStationById(id: number): StationData | undefined {
  return STATIONS.find((s) => s.id === id);
}

export function getStationByNode(node: string): StationData | undefined {
  return STATIONS.find((s) => s.node === node);
}

export function getCriticalStations(): StationData[] {
  return STATIONS.filter((s) => s.riskLevel === "critical");
}

export function getOnlineStations(): StationData[] {
  return STATIONS.filter((s) => s.connectionStatus === "online" && !s.autonomousMode);
}

export function getOfflineStations(): StationData[] {
  return STATIONS.filter((s) => s.connectionStatus === "offline" && !s.autonomousMode);
}

export function getAutonomousStations(): StationData[] {
  return STATIONS.filter((s) => s.autonomousMode);
}

export function getStationStatusSummary() {
  return {
    total: STATIONS.length,
    online: getOnlineStations().length,
    offline: getOfflineStations().length,
    autonomous: getAutonomousStations().length,
    critical: getCriticalStations().length,
  };
}

// ─── MESH NETWORK ─────────────────────────────────────────────────
// Defines neighbor relationships between stations for mesh routing.
// When a station is offline, its nearest online neighbor
// can relay its data.

export interface MeshLink {
  from: string;
  to: string;
}

export const MESH_NETWORK: MeshLink[] = [
  { from: "NHD-QBD-01", to: "NHD-TTN-04" },
  { from: "NHD-QBD-01", to: "NHD-LLR-05" },
  { from: "NHD-TTN-04", to: "NHD-LLR-05" },
  { from: "NHD-BJY-02", to: "NHD-VDF-03" },
  { from: "NHD-QBD-01", to: "NHD-BJY-02" },
];
