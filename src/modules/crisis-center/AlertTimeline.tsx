import { useAlerts } from "../alerts/AlertProvider";
import type { Alert } from "../alerts/AlertProvider";

const SEVERITY_CONFIG = {
  critical: {
    borderColor: "border-l-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    badgeBg: "bg-red-100 dark:bg-red-900/40",
    badgeText: "text-red-800 dark:text-red-300",
    badgeBorder: "border-red-200 dark:border-red-700",
    dotColor: "bg-red-500",
    label: "CRÍTICA",
    pulse: true,
  },
  warning: {
    borderColor: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    badgeBg: "bg-amber-100 dark:bg-amber-900/40",
    badgeText: "text-amber-800 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-700",
    dotColor: "bg-amber-500",
    label: "PREVENTIVA",
    pulse: false,
  },
  info: {
    borderColor: "border-l-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    badgeBg: "bg-blue-100 dark:bg-blue-900/40",
    badgeText: "text-blue-800 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-700",
    dotColor: "bg-blue-400",
    label: "INFORMATIVA",
    pulse: false,
  },
};

const TREND_LABEL: Record<string, { text: string; color: string }> = {
  rising:  { text: "En ascenso", color: "text-red-600 dark:text-red-400" },
  falling: { text: "En descenso", color: "text-green-600 dark:text-green-400" },
  stable:  { text: "Estable", color: "text-gray-500 dark:text-gray-400" },
};

const TREND_ARROW: Record<string, string> = {
  rising: "↑",
  falling: "↓",
  stable: "→",
};

const SOURCE_LABEL: Record<string, string> = {
  ai: "IA",
  manual: "Manual",
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `Hace ${hrs}h ${mins % 60}m`;
}

function AlertCard({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const cfg = SEVERITY_CONFIG[alert.type];
  const trend = TREND_LABEL[alert.trend] ?? TREND_LABEL.stable;

  return (
    <div
      className={`border-l-4 ${cfg.borderColor} rounded-r-lg border border-gray-200 dark:border-gray-700/60 transition-all duration-300 ${
        alert.active
          ? `${cfg.bg} shadow-sm`
          : "bg-gray-50 dark:bg-gray-900/20 opacity-50"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-widest px-2.5 py-1 rounded-sm border ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} uppercase`}
        >
          {cfg.pulse && alert.active && (
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} animate-pulse`} />
          )}
          {cfg.label}
        </span>

        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
          {SOURCE_LABEL[alert.source ?? "ai"]}
        </span>

        <span className="text-xs font-mono text-gray-400 dark:text-gray-500 ml-auto">
          {formatTimestamp(alert.timestamp)}
        </span>

        {alert.active && (
          <button
            onClick={onDismiss}
            className="ml-1 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors rounded p-0.5"
            title="Descartar alerta"
            aria-label="Descartar alerta"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Message */}
      <p className={`px-4 pb-2 text-base font-semibold leading-snug ${alert.active ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}`}>
        {alert.message}
      </p>

      {/* Technical metadata grid */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-x-6 gap-y-1">
        <MetaRow label="Estación" value={alert.station} />
        <MetaRow label="Nodo" value={alert.node} />
        <MetaRow label="Sensor" value={alert.sensor} />
        <MetaRow label="Variable" value={alert.variable} />
        <MetaRow
          label="Valor registrado"
          value={`${alert.value} ${alert.unit}`}
          highlight
        />
        <MetaRow label="Umbral" value={`${alert.threshold} ${alert.unit}`} />
        <div className="col-span-1">
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">Tendencia</span>
          <span className={`block text-sm font-mono font-semibold ${trend.color}`}>
            {TREND_ARROW[alert.trend]} {trend.text}
          </span>
        </div>
        <div className="col-span-1">
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">Emitida</span>
          <span className="block text-sm font-mono text-gray-600 dark:text-gray-400">{timeAgo(alert.timestamp)}</span>
        </div>

        {/* Confirmed variables */}
        {alert.confirmedVariables && alert.confirmedVariables.length > 1 && (
          <div className="col-span-2 mt-1.5">
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">Variables confirmadas</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {alert.confirmedVariables.map((v) => (
                <span key={v} className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {alert.recommendation && (
          <div className="col-span-2 mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recomendación</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-snug">{alert.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{label}</span>
      <span className={`block text-sm font-mono truncate ${highlight ? "font-bold text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>
        {value}
      </span>
    </div>
  );
}

export const AlertTimeline = () => {
  const { alerts, dismissAlert } = useAlerts();

  const active = alerts.filter((a) => a.active);
  const dismissed = alerts.filter((a) => !a.active);

  return (
    <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
      {alerts.length === 0 && (
        <div className="text-center py-10 text-gray-400 dark:text-gray-600">
          <p className="text-sm font-mono">Sin eventos registrados</p>
          <p className="text-xs mt-1 text-gray-300 dark:text-gray-700">El sistema monitoreará automáticamente las estaciones</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
          ))}
        </div>
      )}

      {dismissed.length > 0 && (
        <>
          {active.length > 0 && (
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">Historial descartado</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
          )}
          <div className="space-y-2">
            {dismissed.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDismiss={() => {}} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};