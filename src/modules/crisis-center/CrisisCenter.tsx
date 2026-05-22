import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { CrisisHeader } from "./CrisisHeader";
import { CriticalIndicators } from "./CriticalIndicators";
import { RiskGauge } from "./RiskGauge";
import { AlertTimeline } from "./AlertTimeline";
import { EmergencyMap } from "./EmergencyMap";
import { PredictionPanel } from "../predictions/PredictionPanel";
import { EmergencyBroadcast } from "../community/EmergencyBroadcast";
import { useAlerts } from "../alerts/AlertProvider";
import { playAlertBeep } from "../alerts/AlertSound";
import { useStationContext } from "./StationContext";
import "./station-nodes.css";

// ─── Panel badge config ──────────────────────────────────────

type BadgeKey = "online" | "offline" | "autonomous" | "critical" | "total";

interface BadgeConfig {
  key: BadgeKey;
  label: string;
  color: string;
  cssClass: string;
  showPulse: boolean;
}

const BADGE_CONFIGS: BadgeConfig[] = [
  { key: "online",     label: "En línea",       color: "#22c55e", cssClass: "sn-panel-badge--online",     showPulse: false },
  { key: "offline",    label: "Sin conexión",   color: "#f97316", cssClass: "sn-panel-badge--offline",    showPulse: true  },
  { key: "autonomous", label: "Modo autónomo",  color: "#f59e0b", cssClass: "sn-panel-badge--autonomous", showPulse: true  },
  { key: "critical",   label: "Críticos",       color: "#ef4444", cssClass: "sn-panel-badge--critical",   showPulse: true  },
  { key: "total",      label: "Total",          color: "#84cc16", cssClass: "",                            showPulse: false },
];

const BADGE_FILTER_MAP: Record<string, string | null> = {
  online: "online",
  offline: "offline",
  autonomous: "autonomous",
  critical: "critical",
  total: null,
};

// ─── Inner component (has access to context) ─────────────────

const CrisisCenterInner = () => {
  const { criticalAlerts, setCrisisMode } = useAlerts();
  const {
    summary = { total: 0, online: 0, offline: 0, autonomous: 0, critical: 0 },
    riskIndex = 0,
    riskBreakdown = [],
    effectiveStations = [],
    focusStation = () => {},
  } = useStationContext();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    setCrisisMode(criticalAlerts.length > 0);
  }, [criticalAlerts.length, setCrisisMode]);

  useEffect(() => {
    if (criticalAlerts.length > 0) {
      playAlertBeep();
    }
  }, [criticalAlerts.length]);

  const filteredStations = useMemo(() => {
    if (!activeFilter) return [];
    return effectiveStations.filter((s) => {
      if (activeFilter === "online") return s.connectionStatus === "online" && !s.autonomousMode;
      if (activeFilter === "offline") return s.connectionStatus === "offline" && !s.autonomousMode;
      if (activeFilter === "autonomous") return s.autonomousMode;
      if (activeFilter === "critical") return s.riskLevel === "critical";
      return false;
    });
  }, [activeFilter, effectiveStations]);

  return (
    <>
      <PageMeta
        title="Centro de Crisis — AtratoCentinela AI"
        description="Sistema de monitoreo, prevención y respuesta temprana — AtratoCentinela AI"
      />

      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 xl:px-6 space-y-6">
        <CrisisHeader />

        {/* Critical indicators */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-1.5 h-7 bg-lime-500 rounded-full" />
            <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Indicadores críticos
            </h2>
          </div>
          <CriticalIndicators />
        </section>

        {/* Interactive station status panel */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-7 bg-lime-500 rounded-full" />
            <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Estado de la red
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {BADGE_CONFIGS.map((cfg) => {
              const count = summary[cfg.key as keyof typeof summary] ?? 0;
              const isActive = activeFilter === cfg.key && cfg.key !== "total";
              return (
                <button
                  key={cfg.key}
                  onClick={() => setActiveFilter(isActive ? null : BADGE_FILTER_MAP[cfg.key])}
                  className={`sn-panel-badge ${cfg.cssClass} flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-sm transition-all duration-200 cursor-pointer
                    ${isActive ? "ring-2 ring-offset-1" : ""}
                    bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
                  `}
                  style={isActive ? { boxShadow: `0 0 0 2px ${cfg.color}` } : undefined}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      background: cfg.color,
                      boxShadow: cfg.showPulse ? `0 0 6px ${cfg.color}` : "none",
                    }}
                  />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{cfg.label}</span>
                  <span className="text-lg font-bold font-mono" style={{ color: cfg.color }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Dropdown for filtered stations */}
          {activeFilter && filteredStations.length > 0 && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
                {BADGE_CONFIGS.find((c) => c.key === activeFilter)?.label} — {filteredStations.length} estación(es)
              </p>
              <div className="space-y-1.5">
                {filteredStations.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => { focusStation(st.id); setActiveFilter(null); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background:
                            st.riskLevel === "critical" ? "#ef4444" :
                            st.autonomousMode ? "#f59e0b" :
                            st.connectionStatus === "offline" ? "#f97316" :
                            "#22c55e",
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{st.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">{st.node}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-gray-500">{st.type}</span>
                      {st.riskLevel === "critical" && (
                        <span className="text-red-500 font-bold animate-pulse">CRÍTICO</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── ROW 1: Map (2/3) + RiskGauge (1/3) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-7 bg-lime-500 rounded-full" />
              <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mapa de riesgo — AtratoCentinela AI
              </h2>
            </div>
            <div className="h-[400px] lg:h-[560px]">
              <EmergencyMap />
            </div>
          </div>

          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-[400px] lg:h-[560px] flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Riesgo de Inundación
              </h3>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
              <RiskGauge value={riskIndex} label="Riesgo General" size="lg" />
              <div className="mt-3 w-full space-y-1">
                {riskBreakdown.map((factor, i) => (
                  <p key={i} className="text-[10px] font-mono text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                    {factor}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── ROW 2: Timeline (1/2) + Prediction IA (1/2) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Timeline de Alertas
              </h3>
            </div>
            <div className="p-4">
              <AlertTimeline />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Predicción IA
              </h3>
            </div>
            <div className="p-5">
              <PredictionPanel />
            </div>
          </section>
        </div>

        {/* ── ROW 3: Emergency Broadcast (full width) ── */}
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Comunicaciones de Emergencia
            </h3>
          </div>
          <div className="p-4">
            <EmergencyBroadcast />
          </div>
        </section>

      </div>
    </>
  );
};

export const CrisisCenter = CrisisCenterInner;
