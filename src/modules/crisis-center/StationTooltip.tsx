import React from "react";
import { StationData } from "../../data/stations";
import { getNodeState } from "./StationNode";

interface StationTooltipProps {
  station: StationData;
}

const SENSOR_LABELS: Record<string, string> = {
  Nivel: "Nivel río",
  Turbiedad: "Turbiedad",
  pH: "pH",
  "Oxigeno disuelto": "Oxígeno",
  Temperatura: "Temp.",
  Conductividad: "Conduct.",
  Precipitacion: "Lluvia",
};

const STATE_BADGE: Record<string, { label: string; className: string }> = {
  online:     { label: "ON",     className: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" },
  offline:    { label: "OFF",    className: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  autonomous: { label: "AUTO",   className: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  critical:   { label: "CRIT",   className: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse" },
};

const StationTooltip: React.FC<StationTooltipProps> = ({ station }) => {
  const state = getNodeState(station);
  const badge = STATE_BADGE[state];
  const now = Date.now();
  const lastSeenDelta = now - new Date(station.lastSeen).getTime();
  const lastSeenMin = Math.round(lastSeenDelta / 60000);
  const lastSeenText = lastSeenMin < 1 ? "Ahora" : `Hace ${lastSeenMin} min`;

  const sensors = station.sensors.slice(0, 5);

  return (
    <div
      className="sn-tooltip"
      style={{
        position: "absolute",
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: 12,
        minWidth: 220,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      <div
        className="backdrop-blur-xl rounded-xl border shadow-xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.95)",
          borderColor: "rgba(0,0,0,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">{station.name}</p>
            <p className="text-[10px] font-mono text-gray-500">{station.node}</p>
          </div>
          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* Body */}
        <div className="px-3.5 py-2 space-y-1.5">
          {/* Connection info */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
            <InfoRow label="Conexión" value={station.connectionStatus === "online" ? "En línea" : "Sin conexión"} />
            <InfoRow label="Último ping" value={lastSeenText} />
            {station.autonomousMode && (
              <InfoRow label="Modo" value="Autónomo" />
            )}
            {station.meshRelay && (
              <InfoRow label="Retransmisión" value={station.meshRelay} />
            )}
          </div>

          {/* Sensor readings */}
          {sensors.length > 0 && (
            <div className="border-t border-gray-100 pt-1.5 mt-1.5">
              <p className="text-[9px] font-mono font-semibold text-gray-400 uppercase tracking-wider mb-1">Variables</p>
              <div className="space-y-1">
                {sensors.map((s) => {
                  const lbl = SENSOR_LABELS[s.variable] || s.variable;
                  const val = s.threshold * (0.5 + Math.random() * 0.6);
                  const isHigh = val >= s.critical;
                  const isWarn = val >= s.threshold;
                  return (
                    <div key={s.id} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-500">{lbl}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={isHigh ? "text-red-500 font-bold" : isWarn ? "text-amber-500 font-bold" : "text-gray-700"}>
                          {val.toFixed(1)}
                          <span className="text-gray-400 font-normal ml-0.5">{s.unit}</span>
                        </span>
                        {isHigh && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risk */}
          <div className="border-t border-gray-100 pt-1.5 mt-1.5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400">Riesgo</span>
            <span
              className="text-[11px] font-bold font-mono"
              style={{
                color:
                  station.riskLevel === "critical" ? "#ef4444" :
                  station.riskLevel === "warning" ? "#f59e0b" :
                  "#22c55e",
              }}
            >
              {station.riskLevel === "critical" ? "CRÍTICO" :
               station.riskLevel === "warning" ? "ALTO" : "NORMAL"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-400">{label}:</span>
      <span className="text-gray-700 font-semibold truncate">{value}</span>
    </div>
  );
}

export default React.memo(StationTooltip);
