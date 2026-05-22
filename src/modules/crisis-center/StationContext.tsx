import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  STATIONS, applyOverride, getDynamicStationSummary, StateOverride,
  ENABLE_CONNECTION_SIMULATION, SIMULATION_INTERVAL_MS, simulateStationState,
  CRITICAL_ALERT_COOLDOWN_MS,
} from "../../data/stations";
import { useAlerts } from "../alerts/AlertProvider";
import { playSiren } from "../alerts/AlertSound";
import { sendTelegramAlert } from "../../services/telegramService";

// ─── Types ──────────────────────────────────────────────────────

export interface CriticalMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: "critical" | "warning" | "normal";
  trend: "up" | "down" | "stable";
  change: string;
  station: string;
  node: string;
  sensor: string;
  threshold: string;
}

export interface StationContextValue {
  overrides: Record<number, StateOverride>;
  effectiveStations: ReturnType<typeof applyOverride>[];
  summary: ReturnType<typeof getDynamicStationSummary>;
  riskIndex: number;
  riskBreakdown: string[];
  criticalMetrics: CriticalMetric[];
  selectedStationId: number | null;
  highlightedStationId: number | null;
  setSelectedStationId: (id: number | null) => void;
  setHighlightedStationId: (id: number | null) => void;
  focusStation: (id: number) => void;
  setOverrides: React.Dispatch<React.SetStateAction<Record<number, StateOverride>>>;
  broadcastLog: string[];
  addBroadcastEntry: (entry: string) => void;
}

// ─── Context ────────────────────────────────────────────────────

const StationCtx = createContext<StationContextValue | null>(null);

// ─── Helpers: metric generation ─────────────────────────────────

const VARIABLE_META: Record<string, { unit: string; label: string; sensor: string; threshold: number; critical: number; stable: boolean; criticalAllowed: boolean }> = {
  Nivel:          { unit: "m",     label: "Nivel del Río",        sensor: "Limnigraph",       threshold: 5.0,  critical: 6.5, stable: false, criticalAllowed: true  },
  Turbiedad:      { unit: "NTU",   label: "Turbiedad",            sensor: "Turbidimetro",     threshold: 100,  critical: 200, stable: true,  criticalAllowed: false },
  pH:             { unit: "pH",    label: "pH",                   sensor: "Electrodo pH",     threshold: 9.0,  critical: 9.5, stable: true,  criticalAllowed: false },
  "Oxigeno disuelto": { unit: "mg/L", label: "Oxígeno Disuelto",  sensor: "Oximetro",         threshold: 4.0,  critical: 2.0, stable: true,  criticalAllowed: false },
  Temperatura:    { unit: "°C",    label: "Temperatura",          sensor: "Termistor",        threshold: 32,   critical: 35,  stable: true,  criticalAllowed: false },
  Conductividad:  { unit: "uS/cm", label: "Conductividad",        sensor: "Conductimetro",    threshold: 400,  critical: 600, stable: true,  criticalAllowed: false },
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateMetricValue(
  threshold: number, critical: number, riskLevel: string,
  seed: number, stable: boolean, criticalAllowed: boolean,
): number {
  const r = seededRandom(seed) * 0.4 + 0.3;
  if (riskLevel === "critical" && criticalAllowed) return critical + critical * 0.08 * r;
  if (riskLevel === "warning") return threshold + (critical - threshold) * r;
  if (stable) {
    return threshold * 0.35 + threshold * 0.25 * seededRandom(seed);
  }
  return threshold * 0.4 + threshold * 0.5 * r;
}

function generateTrend(seed: number): { trend: "up" | "down" | "stable"; change: string } {
  const r = seededRandom(seed + Math.floor(Date.now() / 300000));
  if (r < 0.33) return { trend: "up", change: `+${(0.05 + r * 0.2).toFixed(2)} en 1h` };
  if (r < 0.66) return { trend: "down", change: `-${(0.05 + r * 0.15).toFixed(2)} en 1h` };
  return { trend: "stable", change: "±0 en 1h" };
}

// ─── Risk index computation ─────────────────────────────────────

function computeRiskIndex(
  overrides: Record<number, StateOverride>,
  criticalAlertsCount: number,
): { riskIndex: number; breakdown: string[] } {
  const total = STATIONS.length;
  if (total === 0) return { riskIndex: 0, breakdown: ["No hay estaciones configuradas"] };

  let risk = 0;
  const breakdown: string[] = [];

  // Find which station/variable drives the risk
  let highestRiskStation = "";
  let highestRiskVar = "";
  let highestRiskVal = 0;

  STATIONS.forEach((st) => {
    const eff = applyOverride(st, overrides[st.id]);
    if (eff.riskLevel === "critical") {
      highestRiskStation = eff.name;
      highestRiskVal = Math.max(highestRiskVal, 50);
    }
    eff.sensors.forEach((s) => {
      const val = s.threshold * (0.5 + seededRandom(eff.id * 100 + s.id.charCodeAt(1)) * 0.5);
      if (val > highestRiskVal) {
        highestRiskVal = val;
        highestRiskStation = eff.name;
        highestRiskVar = s.variable;
      }
    });
  });

  const criticalCount = STATIONS.filter((s) => applyOverride(s, overrides[s.id]).riskLevel === "critical").length;
  const criticalPct = (criticalCount / total) * 100;
  risk += criticalPct * 0.35;
  if (criticalCount > 0) breakdown.push(`${criticalCount} crítica(s): +${Math.round(criticalPct * 0.35)}%`);

  const warningCount = STATIONS.filter((s) => applyOverride(s, overrides[s.id]).riskLevel === "warning").length;
  const warningPct = (warningCount / total) * 100;
  risk += warningPct * 0.15;
  if (warningCount > 0) breakdown.push(`${warningCount} alerta(s): +${Math.round(warningPct * 0.15)}%`);

  const autoCount = STATIONS.filter((s) => applyOverride(s, overrides[s.id]).autonomousMode).length;
  const autoPct = (autoCount / total) * 100;
  risk += autoPct * 0.15;
  if (autoCount > 0) breakdown.push(`${autoCount} autónoma(s): +${Math.round(autoPct * 0.15)}%`);

  const offlineCount = STATIONS.filter((s) => {
    const e = applyOverride(s, overrides[s.id]);
    return e.connectionStatus === "offline" && !e.autonomousMode;
  }).length;
  const offlinePct = (offlineCount / total) * 100;
  risk += offlinePct * 0.10;
  if (offlineCount > 0) breakdown.push(`${offlineCount} sin conexión: +${Math.round(offlinePct * 0.10)}%`);

  const alertFactor = Math.min(criticalAlertsCount * 12, 25);
  risk += alertFactor;
  if (criticalAlertsCount > 0) breakdown.push(`${criticalAlertsCount} alerta(s) crítica(s): +${alertFactor}%`);

  const rawIndex = Math.min(Math.max(risk, 0), 100);

  let description = "Todos los parámetros dentro de rangos normales";
  if (highestRiskStation && highestRiskVar) {
    description = `Riesgo por ${highestRiskVar} en ${highestRiskStation}`;
  } else if (highestRiskStation) {
    description = `Riesgo elevado en ${highestRiskStation}`;
  }
  if (criticalCount > 0) {
    description = `Riesgo crítico en ${highestRiskStation}`;
  }

  return { riskIndex: Math.round(rawIndex), breakdown: [description, ...breakdown] };
}

// ─── Provider ────────────────────────────────────────────────────

export const StationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeAlerts, toggleSiren, addAlert } = useAlerts();
  const criticalAlertsCount = activeAlerts.filter((a) => a.type === "critical").length;

  const [overrides, setOverrides] = useState<Record<number, StateOverride>>({});
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [highlightedStationId, setHighlightedStationId] = useState<number | null>(null);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([]);

  const addBroadcastEntry = useCallback((entry: string) => {
    const ts = new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
    setBroadcastLog((prev) => [`[${ts}] ${entry}`, ...prev.slice(0, 19)]);
  }, []);

  // ── Smoothed risk index ─────────────────────────────────────
  const prevRiskRef = useRef(50);
  const [displayRisk, setDisplayRisk] = useState(50);

  // ── Alarm cooldown ──────────────────────────────────────────
  const lastAlarmRef = useRef(0);
  const prevCriticalStationsRef = useRef<Set<number>>(new Set());

  // ── Simulation ──────────────────────────────────────────────
  useEffect(() => {
    if (!ENABLE_CONNECTION_SIMULATION) return;
    const interval = setInterval(() => {
      setOverrides((prev) => {
        const next: Record<number, StateOverride> = {};
        Object.keys(prev).forEach((k) => { next[Number(k)] = prev[Number(k)]; });

        // Change only ONE station per cycle for realism
        const idx = Math.floor(Math.random() * STATIONS.length);
        const eff = applyOverride(STATIONS[idx], prev[idx]);
        next[idx] = simulateStationState(eff);

        return next;
      });
    }, SIMULATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // ── Effective stations ──────────────────────────────────────
  const effectiveStations = useMemo(
    () => STATIONS.map((s) => applyOverride(s, overrides[s.id])),
    [overrides],
  );

  const summary = useMemo(() => getDynamicStationSummary(overrides), [overrides]);

  // ── Risk index with smooth interpolation ────────────────────
  const { riskIndex: rawRisk, breakdown: riskBreakdown } = useMemo(
    () => computeRiskIndex(overrides, criticalAlertsCount),
    [overrides, criticalAlertsCount],
  );

  useEffect(() => {
    const target = rawRisk;
    const step = target > prevRiskRef.current ? 1 : -1;
    if (Math.abs(target - prevRiskRef.current) <= 1) {
      prevRiskRef.current = target;
      setDisplayRisk(target);
      return;
    }
    const interval = setInterval(() => {
      prevRiskRef.current += step;
      if (Math.abs(target - prevRiskRef.current) <= 1) {
        prevRiskRef.current = target;
        setDisplayRisk(target);
        clearInterval(interval);
      } else {
        setDisplayRisk(prevRiskRef.current);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [rawRisk]);

  // ── Auto siren + alert when station goes critical ───────────
  useEffect(() => {
    const currentCritical = new Set<number>(
      effectiveStations.filter((s) => s.riskLevel === "critical").map((s) => s.id),
    );
    const prevCritical = prevCriticalStationsRef.current;
    const newCritical = [...currentCritical].filter((id) => !prevCritical.has(id));

    if (newCritical.length > 0) {
      const now = Date.now();
      if (now - lastAlarmRef.current > CRITICAL_ALERT_COOLDOWN_MS) {
        lastAlarmRef.current = now;

        // Activate siren
        playSiren();
        toggleSiren();

        newCritical.forEach((id) => {
          const station = effectiveStations.find((s) => s.id === id);
          if (!station) return;

          addAlert({
            id: `critical-${Date.now()}-${id}`,
            type: "critical",
            message: `Nivel del río supera umbral crítico en ${station.name}`,
            station: station.name,
            stationId: station.id,
            node: station.node,
            sensor: "Limnigraph",
            variable: "Nivel del río",
            value: "6.80",
            unit: "m",
            threshold: "6.5",
            trend: "rising",
            recommendation: "Activar protocolo de evacuación preventiva en zonas ribereñas.",
            timestamp: new Date().toISOString(),
            active: true,
            source: "ai",
            confirmedVariables: ["Nivel del río"],
          });

          addBroadcastEntry(`ALERTA CRÍTICA — ${station.name} (${station.node})`);
          addBroadcastEntry(`Protocolo preventivo activado para ${station.name}`);
          addBroadcastEntry(`IA recomienda evacuación preventiva en zona ribereña`);

          // Send Telegram alert (non-blocking, best-effort)
          sendTelegramAlert({
            station_name: station.name,
            station_node: station.node,
            station_id: station.id,
            nivel_value: "6.80 m",
            connection_status: station.connectionStatus === "online" ? "En línea" : "Sin conexión",
            risk_level: "critical",
            recommendation: "Activar protocolo de evacuación preventiva en zonas ribereñas.",
            lat: station.lat,
            lng: station.lng,
          });
        });
      }
    }

    prevCriticalStationsRef.current = currentCritical;
  }, [effectiveStations, toggleSiren, addAlert, addBroadcastEntry]);

  // ── Critical metrics: realistic generation ──────────────────
  const criticalMetrics = useMemo((): CriticalMetric[] => {
    const vars = Object.keys(VARIABLE_META);
    return vars.map((varName, idx) => {
      const meta = VARIABLE_META[varName];
      let maxValue = -Infinity;
      let bestStation = STATIONS[0];
      let bestSensor = meta.sensor;

      // Use a stable seed for non-Nivel variables so they change very slowly.
      // Nivel uses the current override state for responsive changes.
      const timeSlice = Math.floor(Date.now() / (meta.stable ? 300000 : 20000));
      const stableSeed = idx * 100 + timeSlice;

      STATIONS.forEach((st) => {
        const eff = applyOverride(st, overrides[st.id]);
        const sensor = eff.sensors.find((s) => s.variable === varName);
        if (sensor) {
          const seed = meta.stable ? stableSeed : idx * 100 + eff.id + Math.floor(Date.now() / 15000);
          const val = generateMetricValue(sensor.threshold, sensor.critical, eff.riskLevel, seed, meta.stable, meta.criticalAllowed);
          if (val > maxValue) {
            maxValue = val;
            bestStation = eff;
            bestSensor = sensor.name;
          }
        }
      });

      if (maxValue === -Infinity) {
        maxValue = generateMetricValue(meta.threshold, meta.critical, "normal", stableSeed, meta.stable);
        bestStation = STATIONS[0];
      }

      const value = parseFloat(maxValue.toFixed(2));
      let status: "critical" | "warning" | "normal" = "normal";
      if (meta.criticalAllowed) {
        if (varName === "Oxigeno disuelto") {
          if (value <= meta.critical) status = "critical";
          else if (value <= meta.threshold) status = "warning";
        } else {
          if (value >= meta.critical) status = "critical";
          else if (value >= meta.threshold) status = "warning";
        }
      } else {
        if (varName === "Oxigeno disuelto") {
          if (value <= meta.critical) status = "warning";
          else if (value <= meta.threshold) status = "warning";
        } else {
          if (value >= meta.critical) status = "warning";
          else if (value >= meta.threshold) status = "warning";
        }
      }

      const { trend, change } = generateTrend(idx * 100 + Math.floor(Date.now() / 60000));

      return {
        id: `m-${varName}`,
        label: meta.label,
        value,
        unit: meta.unit,
        status,
        trend,
        change,
        station: bestStation.name,
        node: bestStation.node,
        sensor: bestSensor,
        threshold: `${meta.threshold} ${meta.unit}`,
      };
    });
  }, [overrides]);

  // ── Focus station ───────────────────────────────────────────
  const focusStation = useCallback((id: number) => {
    setSelectedStationId(id);
    setTimeout(() => setSelectedStationId((prev) => (prev === id ? null : prev)), 8000);
  }, []);

  const value: StationContextValue = {
    overrides: overrides ?? {},
    effectiveStations: effectiveStations ?? [],
    summary: summary ?? { total: 0, online: 0, offline: 0, autonomous: 0, critical: 0 },
    riskIndex: displayRisk,
    riskBreakdown: riskBreakdown ?? [],
    criticalMetrics: criticalMetrics ?? [],
    selectedStationId: selectedStationId ?? null,
    highlightedStationId: highlightedStationId ?? null,
    setSelectedStationId: setSelectedStationId ?? (() => {}),
    setHighlightedStationId: setHighlightedStationId ?? (() => {}),
    focusStation: focusStation ?? (() => {}),
    setOverrides: setOverrides ?? (() => {}),
    broadcastLog: broadcastLog ?? [],
    addBroadcastEntry: addBroadcastEntry ?? (() => {}),
  };

  return <StationCtx.Provider value={value}>{children}</StationCtx.Provider>;
};

// ─── Hook ────────────────────────────────────────────────────────

export function useStationContext(): StationContextValue {
  const ctx = useContext(StationCtx);
  if (!ctx) throw new Error("useStationContext must be used within StationProvider");
  return ctx;
}

// ─── Variable metadata (exported for PredictionPanel) ───────────

export const VARIABLE_OPTIONS = Object.entries(VARIABLE_META).map(([key, val]) => ({
  id: key,
  label: val.label,
  unit: val.unit,
  threshold: val.threshold,
  critical: val.critical,
}));

export const STATION_OPTIONS = STATIONS.map((s) => ({
  id: s.id,
  name: s.name,
  node: s.node,
}));
