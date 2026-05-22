import { useMemo } from "react";
import { NODES } from "../../data/mockData";

interface NodeInfoCardProps {
  nodeId: string;
}

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  online: { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-300", label: "En línea" },
  warning: { dot: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-300", label: "Advertencia" },
  offline: { dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-300", label: "Fuera de línea" },
};

const RISK_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", label: "Alto" },
  medium: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", label: "Medio" },
  low: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", label: "Bajo" },
};

function fmtTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export const NodeInfoCard = ({ nodeId }: NodeInfoCardProps) => {
  const node = useMemo(() => NODES.find((n) => n.id === nodeId), [nodeId]);
  if (!node) return null;

  const status = STATUS_STYLES[node.status];
  const risk = RISK_STYLES[node.risk];
  const activeSensors = node.sensors.filter((s) => s.active);
  const onlineSensors = activeSensors.length;
  const totalSensors = node.sensors.length;

  const batteryColor = node.battery > 60 ? "bg-emerald-500" : node.battery > 30 ? "bg-amber-500" : "bg-red-500";
  const signalColor = node.signal > 70 ? "bg-emerald-500" : node.signal > 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">
          Información del nodo
        </h2>
      </div>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{node.station}</h3>
            <p className="text-base font-mono text-gray-500 dark:text-gray-400 mt-0.5">{node.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg ${status.bg} ${status.text}`}>
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Tipo" value={node.type} />
          <InfoRow label="Ubicación" value={`${node.lat}, ${node.lng}`} mono />
          <InfoRow label="Sensores activos" value={`${onlineSensors} / ${totalSensors}`} />
          <InfoRow label="Última actualización" value={fmtTime(node.lastUpdate)} mono />
          <InfoRow label="Riesgo" value={risk.label} custom={<span className={`text-sm font-bold px-3 py-1 rounded ${risk.bg} ${risk.text}`}>{risk.label}</span>} />
        </div>

        {/* Battery & Signal */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">Batería</span>
              <span className="text-sm font-bold font-mono text-gray-700 dark:text-gray-300">{node.battery}%</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${batteryColor}`} style={{ width: `${node.battery}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">Señal</span>
              <span className="text-sm font-bold font-mono text-gray-700 dark:text-gray-300">{node.signal}%</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${signalColor}`} style={{ width: `${node.signal}%` }} />
            </div>
          </div>
        </div>

        {/* Sensors list */}
        <div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 block mb-3">Sensores</span>
          <div className="space-y-1.5">
            {node.sensors.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm font-mono">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.active ? "bg-emerald-500" : "bg-red-400"}`} />
                  <span className="text-gray-600 dark:text-gray-400">{s.name}</span>
                </div>
                <span className="text-gray-400 dark:text-gray-500">{s.variable}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoRow({ label, value, mono, custom }: { label: string; value?: string; mono?: boolean; custom?: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
      {custom ?? <p className={`text-base mt-0.5 ${mono ? "font-mono" : "font-medium"} text-gray-800 dark:text-gray-200`}>{value}</p>}
    </div>
  );
}
