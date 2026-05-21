export const MOCK_ALERTS = [
  {
    id: "a1",
    type: "critical" as const,
    message: "Nivel del río Atrato supera umbral crítico en Bojayá",
    station: "Bojayá",
    stationId: 3,
    timestamp: new Date().toISOString(),
    value: "5.82m",
    threshold: "5.0m",
    active: true,
  },
  {
    id: "a2",
    type: "warning" as const,
    message: "Precipitación intensa detectada en Quibdó (48mm/h)",
    station: "Quibdó",
    stationId: 1,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    value: "48mm/h",
    threshold: "30mm/h",
    active: true,
  },
  {
    id: "a3",
    type: "info" as const,
    message: "Tendencia de aumento en nivel del río en Vigía del Fuerte",
    station: "Vigía del Fuerte",
    stationId: 4,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    value: "3.21m",
    threshold: "4.0m",
    active: true,
  },
  {
    id: "a4",
    type: "critical" as const,
    message: "Velocidad de corriente crítica en estación hidrológica #7",
    station: "Estación H-7",
    stationId: 5,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    value: "8.4 m/s",
    threshold: "6.0 m/s",
    active: false,
  },
  {
    id: "a5",
    type: "warning" as const,
    message: "Temperatura elevada en estación meteorológica de Quibdó",
    station: "Quibdó",
    stationId: 1,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    value: "34.2°C",
    threshold: "32°C",
    active: false,
  },
  {
    id: "a6",
    type: "info" as const,
    message: "Mantenimiento programado para sensores de calidad de agua",
    station: "Todas las estaciones",
    stationId: 0,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    value: "-",
    threshold: "-",
    active: false,
  },
];

export const MOCK_CRITICAL_METRICS = [
  {
    id: "m1",
    label: "Nivel del Río",
    value: 4.82,
    unit: "m",
    status: "warning" as const,
    trend: "up" as const,
    change: "+0.32m en 1h",
    threshold: 5.0,
    icon: "🌊",
  },
  {
    id: "m2",
    label: "Precipitación",
    value: 38,
    unit: "mm/h",
    status: "critical" as const,
    trend: "up" as const,
    change: "+12mm/h en 30min",
    threshold: 30,
    icon: "🌧️",
  },
  {
    id: "m3",
    label: "Velocidad del Viento",
    value: 24,
    unit: "km/h",
    status: "normal" as const,
    trend: "stable" as const,
    change: "±0 km/h",
    threshold: 40,
    icon: "💨",
  },
  {
    id: "m4",
    label: "Humedad",
    value: 92,
    unit: "%",
    status: "warning" as const,
    trend: "up" as const,
    change: "+5% en 1h",
    threshold: 85,
    icon: "💧",
  },
  {
    id: "m5",
    label: "Temperatura",
    value: 28.5,
    unit: "°C",
    status: "normal" as const,
    trend: "down" as const,
    change: "-1.2°C en 2h",
    threshold: 35,
    icon: "🌡️",
  },
  {
    id: "m6",
    label: "Riesgo de Inundación",
    value: 72,
    unit: "%",
    status: "critical" as const,
    trend: "up" as const,
    change: "+15% en 1h",
    threshold: 50,
    icon: "⚠️",
  },
];

export const MOCK_RISK_ZONES = [
  { lat: 5.69188, lng: -76.65835, weight: 0.7, label: "Quibdó" },
  { lat: 6.52, lng: -76.97, weight: 0.95, label: "Bojayá" },
  { lat: 6.58, lng: -76.89, weight: 0.85, label: "Vigía del Fuerte" },
  { lat: 5.72, lng: -76.65, weight: 0.5, label: "Tutunendo" },
  { lat: 5.5, lng: -76.7, weight: 0.6, label: "Lloró" },
  { lat: 5.45, lng: -76.55, weight: 0.4, label: "Cértegui" },
  { lat: 6.1, lng: -76.8, weight: 0.55, label: "Unguía" },
  { lat: 5.3, lng: -76.6, weight: 0.45, label: "El Carmen" },
  { lat: 6.35, lng: -76.85, weight: 0.75, label: "Murindó" },
  { lat: 6.75, lng: -76.9, weight: 0.8, label: "Turbo (cuenca)" },
];

export const MOCK_PREDICTIONS = [
  {
    id: "p1",
    station: "Quibdó",
    timestamp: new Date().toISOString(),
    predictions: [
      { hoursFromNow: 1, level: 4.9, confidence: 85 },
      { hoursFromNow: 2, level: 5.1, confidence: 78 },
      { hoursFromNow: 3, level: 5.3, confidence: 70 },
      { hoursFromNow: 4, level: 5.4, confidence: 62 },
      { hoursFromNow: 5, level: 5.5, confidence: 55 },
      { hoursFromNow: 6, level: 5.45, confidence: 48 },
    ],
  },
  {
    id: "p2",
    station: "Bojayá",
    timestamp: new Date().toISOString(),
    predictions: [
      { hoursFromNow: 1, level: 5.9, confidence: 82 },
      { hoursFromNow: 2, level: 6.2, confidence: 74 },
      { hoursFromNow: 3, level: 6.4, confidence: 65 },
      { hoursFromNow: 4, level: 6.5, confidence: 58 },
      { hoursFromNow: 5, level: 6.45, confidence: 50 },
      { hoursFromNow: 6, level: 6.3, confidence: 42 },
    ],
  },
];

export const MOCK_STATIONS = [
  { id: 1, nombre: "Quibdó", descripcion: "Estación principal Quibdó", lat: "5.69188", lng: "-76.65835", id_tipo_estacion: 1, tipo_estacion_nombre: "Meteorológica", estacion_mrv: 101 },
  { id: 2, nombre: "Bojayá", descripcion: "Estación Bojayá - Río Atrato", lat: "6.52", lng: "-76.97", id_tipo_estacion: 2, tipo_estacion_nombre: "Hidrológica", estacion_mrv: 102 },
  { id: 3, nombre: "Vigía del Fuerte", descripcion: "Estación Vigía del Fuerte", lat: "6.58", lng: "-76.89", id_tipo_estacion: 1, tipo_estacion_nombre: "Meteorológica", estacion_mrv: 103 },
  { id: 4, nombre: "Tutunendo", descripcion: "Estación Tutunendo", lat: "5.72", lng: "-76.65", id_tipo_estacion: 3, tipo_estacion_nombre: "Calidad Aire", estacion_mrv: 104 },
  { id: 5, nombre: "Lloró", descripcion: "Estación Lloró", lat: "5.5", lng: "-76.7", id_tipo_estacion: 4, tipo_estacion_nombre: "Sísmica", estacion_mrv: 105 },
];

export const MOCK_CHATBOT_RESPONSES: Record<string, string> = {
  "nivel": "El nivel actual del río Atrato en Quibdó es de 4.82m. El umbral crítico es 5.0m. Se recomienda monitoreo constante.",
  "inundacion": "Actualmente hay un 72% de riesgo de inundación en la cuenca del Atrato. Las zonas más vulnerables son Bojayá y Vigía del Fuerte.",
  "alerta": "Hay 3 alertas activas: 1 crítica (Bojayá - nivel del río) y 2 preventivas. ¿Quieres ver el panel de crisis?",
  "ayuda": "Puedo informarte sobre: nivel del río, riesgo de inundación, alertas activas, estaciones de monitoreo, recomendaciones de seguridad.",
  "rio": "El río Atrato tiene una longitud de 750km. Actualmente hay 5 estaciones de monitoreo activas a lo largo de su cauce.",
  "default": "Soy el asistente inteligente del Sistema AtratoCentinela AI. Puedo ayudarte con información sobre niveles, alertas, riesgos y estaciones. ¿Qué deseas saber?",
};

// ─── Node Tracking: Nodes & Sensors ───────────────────────────────────────

export interface NodeInfo {
  id: string;
  code: string;
  station: string;
  stationId: number;
  lat: string;
  lng: string;
  type: string;
  sensors: SensorDef[];
  battery: number;
  signal: number;
  lastUpdate: string;
  status: "online" | "warning" | "offline";
  risk: "low" | "medium" | "high";
}

export interface SensorDef {
  id: string;
  name: string;
  variable: string;
  unit: string;
  threshold: number;
  critical: number;
  active: boolean;
}

export const NODES: NodeInfo[] = [
  {
    id: "n1", code: "NHD-QBD-01", station: "Quibdó", stationId: 1,
    lat: "5.69188", lng: "-76.65835", type: "Hidrológica",
    sensors: [
      { id: "s1", name: "Limnigraph LG-200", variable: "Nivel", unit: "m", threshold: 5.0, critical: 6.5, active: true },
      { id: "s2", name: "Turbidímetro TB-4100", variable: "Turbiedad", unit: "NTU", threshold: 100, critical: 200, active: true },
      { id: "s3", name: "Electrodo pH EP-7", variable: "pH", unit: "pH", threshold: 9.0, critical: 9.5, active: true },
      { id: "s4", name: "Oxímetro OX-200", variable: "Oxígeno disuelto", unit: "mg/L", threshold: 4.0, critical: 2.0, active: true },
      { id: "s5", name: "Termistor TS-100", variable: "Temperatura", unit: "°C", threshold: 32, critical: 35, active: true },
      { id: "s6", name: "Pluviómetro PR-300", variable: "Precipitación", unit: "mm", threshold: 80, critical: 150, active: true },
    ],
    battery: 87, signal: 92, lastUpdate: new Date().toISOString(), status: "online", risk: "medium",
  },
  {
    id: "n2", code: "NHD-BJY-02", station: "Bojayá", stationId: 2,
    lat: "6.52", lng: "-76.97", type: "Hidrológica",
    sensors: [
      { id: "s7", name: "Limnigraph LG-201", variable: "Nivel", unit: "m", threshold: 5.0, critical: 6.5, active: true },
      { id: "s8", name: "Turbidímetro TB-4101", variable: "Turbiedad", unit: "NTU", threshold: 100, critical: 200, active: true },
      { id: "s9", name: "Conductímetro CD-300", variable: "Conductividad", unit: "µS/cm", threshold: 400, critical: 600, active: true },
      { id: "s10", name: "Pluviómetro PR-301", variable: "Precipitación", unit: "mm", threshold: 80, critical: 150, active: true },
    ],
    battery: 72, signal: 85, lastUpdate: new Date().toISOString(), status: "online", risk: "high",
  },
  {
    id: "n3", code: "NHD-VDF-03", station: "Vigía del Fuerte", stationId: 3,
    lat: "6.58", lng: "-76.89", type: "Hidrológica",
    sensors: [
      { id: "s11", name: "Limnigraph LG-202", variable: "Nivel", unit: "m", threshold: 5.0, critical: 6.5, active: true },
      { id: "s12", name: "Turbidímetro TB-4102", variable: "Turbiedad", unit: "NTU", threshold: 100, critical: 200, active: true },
      { id: "s13", name: "Electrodo pH EP-8", variable: "pH", unit: "pH", threshold: 9.0, critical: 9.5, active: true },
      { id: "s14", name: "Pluviómetro PR-302", variable: "Precipitación", unit: "mm", threshold: 80, critical: 150, active: true },
    ],
    battery: 63, signal: 78, lastUpdate: new Date().toISOString(), status: "online", risk: "high",
  },
  {
    id: "n4", code: "NHD-TTN-04", station: "Tutunendo", stationId: 4,
    lat: "5.72", lng: "-76.65", type: "Meteorológica",
    sensors: [
      { id: "s15", name: "Termistor TS-101", variable: "Temperatura", unit: "°C", threshold: 32, critical: 35, active: true },
      { id: "s16", name: "Pluviómetro PR-303", variable: "Precipitación", unit: "mm", threshold: 80, critical: 150, active: true },
    ],
    battery: 45, signal: 62, lastUpdate: new Date().toISOString(), status: "warning", risk: "low",
  },
  {
    id: "n5", code: "NHD-LLR-05", station: "Lloró", stationId: 5,
    lat: "5.5", lng: "-76.7", type: "Calidad de Agua",
    sensors: [
      { id: "s17", name: "Conductímetro CD-301", variable: "Conductividad", unit: "µS/cm", threshold: 400, critical: 600, active: true },
      { id: "s18", name: "Oxímetro OX-201", variable: "Oxígeno disuelto", unit: "mg/L", threshold: 4.0, critical: 2.0, active: true },
    ],
    battery: 91, signal: 95, lastUpdate: new Date().toISOString(), status: "online", risk: "low",
  },
];

// ─── Variable definitions with thresholds and colors ─────────────────────

export interface VariableDef {
  id: string;
  name: string;
  code: string;
  unit: string;
  threshold: number;
  critical: number;
  color: string;
  description: string;
}

export const VARIABLES: VariableDef[] = [
  { id: "v1", name: "Nivel", code: "LVL", unit: "m", threshold: 5.0, critical: 6.5, color: "#2563eb", description: "Altura de la columna de agua" },
  { id: "v2", name: "Turbiedad", code: "TRB", unit: "NTU", threshold: 100, critical: 200, color: "#92400e", description: "Material suspendido en el agua" },
  { id: "v3", name: "pH", code: "PH", unit: "pH", threshold: 9.0, critical: 9.5, color: "#7c3aed", description: "Potencial de hidrógeno" },
  { id: "v4", name: "Oxígeno disuelto", code: "DO", unit: "mg/L", threshold: 4.0, critical: 2.0, color: "#059669", description: "Oxígeno disponible en el agua" },
  { id: "v5", name: "Temperatura", code: "TMP", unit: "°C", threshold: 32, critical: 35, color: "#dc2626", description: "Temperatura del agua" },
  { id: "v6", name: "Conductividad", code: "CND", unit: "µS/cm", threshold: 400, critical: 600, color: "#d97706", description: "Capacidad de conducción eléctrica" },
  { id: "v7", name: "Precipitación", code: "PRC", unit: "mm", threshold: 80, critical: 150, color: "#0284c7", description: "Lluvia acumulada en 24h" },
  { id: "v8", name: "Sólidos disueltos totales", code: "TDS", unit: "mg/L", threshold: 500, critical: 1000, color: "#65a30d", description: "Sólidos disueltos en el agua" },
];

// ─── Historical readings for charts and table ────────────────────────────

export interface HistoricalReading {
  id: string;
  nodeId: string;
  station: string;
  variable: string;
  value: number;
  unit: string;
  timestamp: string;
  date: string;
  time: string;
  status: "normal" | "warning" | "critical";
  risk: "low" | "medium" | "high";
}

function generateHistoricalData(): HistoricalReading[] {
  const records: HistoricalReading[] = [];
  const stations = ["Quibdó", "Bojayá", "Vigía del Fuerte", "Tutunendo", "Lloró"];
  const variables = ["Nivel", "Turbiedad", "pH", "Oxígeno disuelto", "Temperatura", "Conductividad", "Precipitación", "Sólidos disueltos totales"];
  const baseValues: Record<string, number> = {
    "Nivel": 3.8, "Turbiedad": 45, "pH": 6.8, "Oxígeno disuelto": 7.2,
    "Temperatura": 26, "Conductividad": 120, "Precipitación": 15, "Sólidos disueltos totales": 180,
  };
  const thresholds: Record<string, number> = {
    "Nivel": 5.0, "Turbiedad": 100, "pH": 9.0, "Oxígeno disuelto": 4.0,
    "Temperatura": 32, "Conductividad": 400, "Precipitación": 80, "Sólidos disueltos totales": 500,
  };
  const criticals: Record<string, number> = {
    "Nivel": 6.5, "Turbiedad": 200, "pH": 9.5, "Oxígeno disuelto": 2.0,
    "Temperatura": 35, "Conductividad": 600, "Precipitación": 150, "Sólidos disueltos totales": 1000,
  };
  const units: Record<string, string> = {
    "Nivel": "m", "Turbiedad": "NTU", "pH": "pH", "Oxígeno disuelto": "mg/L",
    "Temperatura": "°C", "Conductividad": "µS/cm", "Precipitación": "mm", "Sólidos disueltos totales": "mg/L",
  };

  let id = 1;
  const now = Date.now();

  for (let day = 30; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour += 3) {
      stations.forEach((station) => {
        variables.forEach((variable) => {
          const base = baseValues[variable];
          const noise = (Math.random() - 0.5) * base * 0.4;
          const dailyCycle = Math.sin((hour / 24) * Math.PI * 2) * base * 0.1;
          const trend = Math.sin((day / 30) * Math.PI) * base * 0.15;
          let value = base + noise + dailyCycle + trend;
          if (variable === "pH") value = Math.max(5.5, Math.min(9.5, value));

          const ts = new Date(now - (day * 86400000) - ((23 - hour) * 3600000));
          const t = thresholds[variable];
          const c = criticals[variable];
          let status: "normal" | "warning" | "critical" = "normal";
          if (variable === "Oxígeno disuelto") {
            if (value <= c) status = "critical";
            else if (value <= t) status = "warning";
          } else {
            if (value >= c) status = "critical";
            else if (value >= t) status = "warning";
          }

          records.push({
            id: `r${id++}`,
            nodeId: stations.indexOf(station) + 1 === 1 ? "n1" : stations.indexOf(station) + 1 === 2 ? "n2" : stations.indexOf(station) + 1 === 3 ? "n3" : stations.indexOf(station) + 1 === 4 ? "n4" : "n5",
            station,
            variable,
            value: parseFloat(value.toFixed(2)),
            unit: units[variable],
            timestamp: ts.toISOString(),
            date: ts.toLocaleDateString("es-CO"),
            time: ts.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
            status,
            risk: status === "critical" ? "high" : status === "warning" ? "medium" : "low",
          });
        });
      });
    }
  }
  return records;
}

export const HISTORICAL_READINGS = generateHistoricalData();
