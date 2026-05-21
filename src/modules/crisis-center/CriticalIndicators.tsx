import { useMemo } from "react";
import { MOCK_CRITICAL_METRICS } from "../../data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "critical" | "warning" | "normal";
type Trend = "up" | "down" | "stable";

interface CriticalMetric {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  status: Status;
  trend: Trend;
  change: string;
  icon: string;
  station?: string;
  node?: string;
  sensor?: string;
  threshold?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, {
  border: string;
  bg: string;
  statusText: string;
  statusBg: string;
  dotColor: string;
  label: string;
}> = {
  critical: {
    border: "border-l-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    statusText: "text-red-700 dark:text-red-300",
    statusBg: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
    dotColor: "bg-red-500 animate-pulse",
    label: "CRÍTICO",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    statusText: "text-amber-700 dark:text-amber-300",
    statusBg: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
    label: "ALTO",
  },
  normal: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/10",
    statusText: "text-emerald-700 dark:text-emerald-400",
    statusBg: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
    label: "NORMAL",
  },
};

const TREND_CONFIG: Record<Trend, { arrow: string; color: string }> = {
  up: { arrow: "↑", color: "text-red-500 dark:text-red-400" },
  down: { arrow: "↓", color: "text-green-500 dark:text-green-400" },
  stable: { arrow: "→", color: "text-gray-400 dark:text-gray-500" },
};

// ─── Sensor metadata augmentation ────────────────────────────────────────────
// Augments mock data with station/node/sensor metadata if not present

const SENSOR_META: Record<string, { station: string; node: string; sensor: string; threshold: string }> = {
  "nivel": { station: "Quibdó", node: "NHD-QBD-01", sensor: "Limnigraph LG-200", threshold: "5.0 m" },
  "precipitación": { station: "Quibdó", node: "NHD-QBD-01", sensor: "Pluviómetro PL-200", threshold: "30 mm/h" },
  "viento": { station: "Vigía del Fuerte", node: "NHD-VDF-03", sensor: "Anemómetro AN-50", threshold: "40 km/h" },
  "humedad": { station: "Tutunendo", node: "NHD-TTN-04", sensor: "Higrómetro HG-30", threshold: "85 %" },
  "temperatura": { station: "Quibdó", node: "NHD-QBD-01", sensor: "Termistor TS-100", threshold: "32 °C" },
  "inundación": { station: "Quibdó", node: "SIA-QBD-00", sensor: "Modelo IA PR-7", threshold: "50 %" },
  "turbiedad": { station: "Bojayá", node: "NHD-BJY-02", sensor: "Turbidímetro TB-4100", threshold: "100 NTU" },
  "ph": { station: "Vigía del Fuerte", node: "NHD-VDF-03", sensor: "Electrodo pH EP-7", threshold: "9.0 pH" },
  "conductividad": { station: "Tutunendo", node: "NHD-TTN-04", sensor: "Conductímetro CD-3", threshold: "400 µS/cm" },
  "oxígeno": { station: "Lloró", node: "NHD-LLR-05", sensor: "Oxímetro OX-5", threshold: "4.0 mg/L" },
};

function getSensorMeta(label: string) {
  const key = Object.keys(SENSOR_META).find((k) =>
    label.toLowerCase().includes(k)
  );
  return key ? SENSOR_META[key] : { station: "—", node: "—", sensor: "—", threshold: "—" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CriticalIndicators = () => {
  const sorted = useMemo(
    () =>
      [...MOCK_CRITICAL_METRICS].sort((a, b) => {
        const order: Record<Status, number> = { critical: 0, warning: 1, normal: 2 };
        return order[a.status as Status] - order[b.status as Status];
      }),
    []
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {sorted.map((m: CriticalMetric) => {
        const cfg = STATUS_CONFIG[m.status as Status];
        const trend = TREND_CONFIG[m.trend as Trend];
        const meta = getSensorMeta(m.label);

        return (
          <div
            key={m.id}
            className={`relative border-l-4 ${cfg.border} ${cfg.bg} rounded-r-lg border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
          >
            {/* Status badge */}
            <div className="px-3 pt-3 pb-1.5 flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] lg:text-xs font-bold tracking-widest px-2 py-1 rounded-sm border ${cfg.statusBg} ${cfg.statusText} uppercase`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                {cfg.label}
              </span>
              <span className={`text-base ${trend.color}`} title={m.trend}>
                {trend.arrow}
              </span>
            </div>

            {/* Main value */}
            <div className="px-3 pb-1.5">
              <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-gray-100 leading-none">
                {m.value}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                  {m.unit}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1 leading-tight">
                {m.label}
              </div>
            </div>

            {/* Change indicator */}
            <div className="px-3 pb-1.5">
              <span className={`text-xs font-mono ${trend.color}`}>{m.change}</span>
            </div>

            {/* Technical metadata */}
            <div className="border-t border-gray-200 dark:border-gray-700/60 px-3 py-2.5 space-y-1 bg-white/40 dark:bg-black/10">
              <MetaLine label="Est." value={m.station ?? meta.station} />
              <MetaLine label="Nodo" value={m.node ?? meta.node} />
              <MetaLine label="Sensor" value={m.sensor ?? meta.sensor} />
              {(m.threshold ?? meta.threshold) && (
                <MetaLine label="Umbral" value={m.threshold ?? meta.threshold} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 flex-shrink-0 w-9">{label}</span>
      <span className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate font-medium">{value}</span>
    </div>
  );
}