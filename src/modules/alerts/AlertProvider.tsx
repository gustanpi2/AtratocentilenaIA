import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from "react";
import { MOCK_ALERTS } from "../../data/mockData";

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertMode = "manual" | "ai";
export type AlertTrend = "rising" | "falling" | "stable";

export interface HydroVariable {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: "normal" | "warning" | "critical";
  trend: AlertTrend;
}

export interface Alert {
  id: string;
  type: AlertSeverity;
  message: string;
  station: string;
  stationId: number;
  node: string;
  sensor: string;
  variable: string;
  value: string;
  unit: string;
  threshold: string;
  trend: AlertTrend;
  recommendation: string;
  timestamp: string;
  active: boolean;
  source: "manual" | "ai";
  confirmedVariables?: string[];
}

type AlertState = {
  alerts: Alert[];
  isSirenActive: boolean;
  isCrisisMode: boolean;
  alertMode: AlertMode;
  lastBroadcast: number;
};

type AlertAction =
  | { type: "ADD_ALERT"; payload: Alert }
  | { type: "DISMISS_ALERT"; payload: string }
  | { type: "TOGGLE_SIREN" }
  | { type: "SET_CRISIS_MODE"; payload: boolean }
  | { type: "LOAD_MOCK"; payload: Alert[] }
  | { type: "SET_ALERT_MODE"; payload: AlertMode }
  | { type: "UPDATE_BROADCAST_TIME" };

interface AlertContextType extends AlertState {
  addAlert: (alert: Alert) => void;
  dismissAlert: (id: string) => void;
  activeAlerts: Alert[];
  criticalAlerts: Alert[];
  toggleSiren: () => void;
  setCrisisMode: (active: boolean) => void;
  setAlertMode: (mode: AlertMode) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const alertReducer = (state: AlertState, action: AlertAction): AlertState => {
  switch (action.type) {
    case "ADD_ALERT":
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case "DISMISS_ALERT":
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.payload ? { ...a, active: false } : a
        ),
      };
    case "TOGGLE_SIREN":
      return { ...state, isSirenActive: !state.isSirenActive };
    case "SET_CRISIS_MODE":
      return { ...state, isCrisisMode: action.payload };
    case "LOAD_MOCK":
      return { ...state, alerts: action.payload };
    case "SET_ALERT_MODE":
      return { ...state, alertMode: action.payload };
    case "UPDATE_BROADCAST_TIME":
      return { ...state, lastBroadcast: Date.now() };
    default:
      return state;
  }
};

// ─── Hydrological simulation constants ───────────────────────────────────────

const STATIONS = [
  { id: 1, name: "Quibdó", node: "NHD-QBD-01", sensors: ["SENS-LVL-01", "SENS-TRB-01", "SENS-PH-01", "SENS-DO-01", "SENS-TEMP-01", "SENS-PREC-01"] },
  { id: 2, name: "Bojayá", node: "NHD-BJY-02", sensors: ["SENS-LVL-02", "SENS-TRB-02", "SENS-COND-02", "SENS-PREC-02"] },
  { id: 3, name: "Vigía del Fuerte", node: "NHD-VDF-03", sensors: ["SENS-LVL-03", "SENS-TRB-03", "SENS-PH-03", "SENS-PREC-03"] },
  { id: 4, name: "Tutunendo", node: "NHD-TTN-04", sensors: ["SENS-LVL-04", "SENS-PREC-04", "SENS-TEMP-04"] },
  { id: 5, name: "Lloró", node: "NHD-LLR-05", sensors: ["SENS-LVL-05", "SENS-TRB-05", "SENS-COND-05"] },
];

interface SimulatedReading {
  variable: string;
  sensor: string;
  value: number;
  unit: string;
  threshold: number;
  criticalThreshold: number;
  trend: AlertTrend;
}

// Persistent state for simulation continuity
const simState: Record<string, number> = {};

function getSimValue(key: string, base: number, drift: number): number {
  const prev = simState[key] ?? base;
  const delta = (Math.random() - 0.45) * drift;
  const next = Math.max(base * 0.3, Math.min(base * 2.5, prev + delta));
  simState[key] = next;
  return next;
}

function simulateStationReadings(stationName: string): SimulatedReading[] {
  const k = stationName.replace(/\s/g, "_");
  const readings: SimulatedReading[] = [];

  const nivel = getSimValue(`${k}_nivel`, 3.8, 0.4);
  const nivelTrend: AlertTrend = nivel > (simState[`${k}_nivel_prev`] ?? nivel) + 0.05
    ? "rising" : nivel < (simState[`${k}_nivel_prev`] ?? nivel) - 0.05 ? "falling" : "stable";
  simState[`${k}_nivel_prev`] = nivel;
  readings.push({ variable: "Nivel del río", sensor: "Limnigraph", value: nivel, unit: "m", threshold: 5.0, criticalThreshold: 6.5, trend: nivelTrend });

  const turbiedad = getSimValue(`${k}_turb`, 45, 18);
  readings.push({ variable: "Turbiedad", sensor: "Turbidímetro", value: turbiedad, unit: "NTU", threshold: 100, criticalThreshold: 200, trend: turbiedad > 90 ? "rising" : "stable" });

  const ph = getSimValue(`${k}_ph`, 6.8, 0.3);
  readings.push({ variable: "pH", sensor: "Electrodo pH", value: ph, unit: "pH", threshold: 9.0, criticalThreshold: 9.5, trend: "stable" });

  const cond = getSimValue(`${k}_cond`, 120, 25);
  readings.push({ variable: "Conductividad", sensor: "Conductímetro", value: cond, unit: "µS/cm", threshold: 400, criticalThreshold: 600, trend: "stable" });

  const do2 = getSimValue(`${k}_do`, 7.2, 0.8);
  readings.push({ variable: "Oxígeno disuelto", sensor: "Oxímetro", value: do2, unit: "mg/L", threshold: 4.0, criticalThreshold: 2.0, trend: do2 < 5 ? "falling" : "stable" });

  const temp = getSimValue(`${k}_temp`, 26, 1.5);
  readings.push({ variable: "Temperatura", sensor: "Termistor", value: temp, unit: "°C", threshold: 32, criticalThreshold: 35, trend: "stable" });

  const prec = getSimValue(`${k}_prec`, 8, 12);
  readings.push({ variable: "Precipitación 24h", sensor: "Pluviómetro", value: prec, unit: "mm", threshold: 80, criticalThreshold: 150, trend: prec > 60 ? "rising" : "stable" });

  return readings;
}

const RECOMMENDATION_MAP: Record<string, string> = {
  "Nivel del río": "Activar protocolo de evacuación preventiva en zonas ribereñas de cota inferior.",
  "Turbiedad": "Suspender captación de agua potable. Verificar integridad de bermas.",
  "pH": "Revisar fuentes de contaminación aguas arriba. Alertar autoridades ambientales.",
  "Conductividad": "Investigar posible vertimiento industrial. Tomar muestra para análisis.",
  "Oxígeno disuelto": "Posible afectación de ecosistema acuático. Monitoreo diferencial cada 30 min.",
  "Temperatura": "Verificar fuentes termales o industriales aguas arriba.",
  "Precipitación 24h": "Preparar comunidades aguas abajo. Revisar drenajes y estructuras de contención.",
};

// AI alert generation with cooldowns and duplicate prevention
const alertCooldowns: Record<string, number> = {};
const COOLDOWN_MS = 12 * 60 * 1000; // 12 minutes per variable per station

function shouldEmitAlert(stationName: string, variable: string, severity: AlertSeverity): boolean {
  const key = `${stationName}_${variable}`;
  const last = alertCooldowns[key] ?? 0;
  if (Date.now() - last < COOLDOWN_MS) return false;
  alertCooldowns[key] = Date.now();
  return true;
}

function evaluateReadingsForAlert(
  station: typeof STATIONS[0],
  readings: SimulatedReading[]
): Alert | null {
  const exceedingCritical = readings.filter(r => {
    if (r.variable === "Oxígeno disuelto") return r.value < r.criticalThreshold;
    if (r.variable === "pH") return r.value > r.criticalThreshold;
    return r.value >= r.criticalThreshold;
  });

  const exceedingWarning = readings.filter(r => {
    if (r.variable === "Oxígeno disuelto") return r.value < r.threshold && r.value >= r.criticalThreshold;
    if (r.variable === "pH") return r.value > r.threshold && r.value <= r.criticalThreshold;
    return r.value >= r.threshold && r.value < r.criticalThreshold;
  });

  // Critical: at least one critical variable, or 2+ warning variables (multi-variable confirmation)
  if (exceedingCritical.length > 0) {
    const primary = exceedingCritical[0];
    if (!shouldEmitAlert(station.name, primary.variable, "critical")) return null;

    return {
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "critical",
      message: `${primary.variable} supera umbral crítico en estación ${station.name} (${primary.value.toFixed(2)} ${primary.unit})`,
      station: station.name,
      stationId: station.id,
      node: station.node,
      sensor: primary.sensor,
      variable: primary.variable,
      value: primary.value.toFixed(2),
      unit: primary.unit,
      threshold: primary.criticalThreshold.toString(),
      trend: primary.trend,
      recommendation: RECOMMENDATION_MAP[primary.variable] ?? "Verificar lecturas con equipo de campo.",
      timestamp: new Date().toISOString(),
      active: true,
      source: "ai",
      confirmedVariables: exceedingCritical.map(r => r.variable),
    };
  }

  if (exceedingWarning.length >= 2) {
    const primary = exceedingWarning[0];
    if (!shouldEmitAlert(station.name, primary.variable, "warning")) return null;

    return {
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "warning",
      message: `${exceedingWarning.length} variables en rango preventivo en ${station.name}. Monitoreo intensificado.`,
      station: station.name,
      stationId: station.id,
      node: station.node,
      sensor: primary.sensor,
      variable: primary.variable,
      value: primary.value.toFixed(2),
      unit: primary.unit,
      threshold: primary.threshold.toString(),
      trend: primary.trend,
      recommendation: "Incrementar frecuencia de muestreo. Alertar brigada de campo.",
      timestamp: new Date().toISOString(),
      active: true,
      source: "ai",
      confirmedVariables: exceedingWarning.map(r => r.variable),
    };
  }

  return null;
}

const isDemo = true;

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(alertReducer, {
    alerts: [],
    isSirenActive: false,
    isCrisisMode: false,
    alertMode: "ai",
    lastBroadcast: 0,
  });

  const addAlert = useCallback((alert: Alert) => {
    dispatch({ type: "ADD_ALERT", payload: alert });
  }, []);

  const dismissAlert = useCallback((id: string) => {
    dispatch({ type: "DISMISS_ALERT", payload: id });
  }, []);

  const toggleSiren = useCallback(() => {
    dispatch({ type: "TOGGLE_SIREN" });
  }, []);

  const setCrisisMode = useCallback((active: boolean) => {
    dispatch({ type: "SET_CRISIS_MODE", payload: active });
  }, []);

  const setAlertMode = useCallback((mode: AlertMode) => {
    dispatch({ type: "SET_ALERT_MODE", payload: mode });
  }, []);

  const activeAlerts = state.alerts.filter((a) => a.active);
  const criticalAlerts = state.alerts.filter((a) => a.active && a.type === "critical");

  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const stationCursor = useRef(0);

  useEffect(() => {
    if (isDemo) {
      dispatch({ type: "LOAD_MOCK", payload: MOCK_ALERTS });

      simInterval.current = setInterval(() => {
        if (state.alertMode !== "ai") return;

        // Evaluate one station per tick to spread load
        const station = STATIONS[stationCursor.current % STATIONS.length];
        stationCursor.current += 1;

        const readings = simulateStationReadings(station.name);
        const alert = evaluateReadingsForAlert(station, readings);
        if (alert) {
          dispatch({ type: "ADD_ALERT", payload: alert });
        }
      }, 18000); // Evaluate every 18s, rotating stations
    }
    return () => {
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, [state.alertMode]);

  return (
    <AlertContext.Provider
      value={{
        ...state,
        addAlert,
        dismissAlert,
        activeAlerts,
        criticalAlerts,
        toggleSiren,
        setCrisisMode,
        setAlertMode,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertProvider");
  return ctx;
};