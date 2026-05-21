import { useAlerts } from "./AlertProvider";
import { playAlertBeep, playSiren, stopSiren } from "./AlertSound";
import { useEffect, useRef } from "react";

const TYPE_STYLES = {
  critical: {
    bg: "bg-red-600",
    bgDark: "dark:bg-red-700",
    text: "text-white",
    border: "border-red-400",
    glow: "shadow-red-500/40",
    icon: "🚨",
    label: "ALERTA CRÍTICA",
  },
  warning: {
    bg: "bg-amber-500",
    bgDark: "dark:bg-amber-600",
    text: "text-white",
    border: "border-amber-400",
    glow: "shadow-amber-500/30",
    icon: "⚠️",
    label: "ALERTA PREVENTIVA",
  },
  info: {
    bg: "bg-blue-500",
    bgDark: "dark:bg-blue-600",
    text: "text-white",
    border: "border-blue-400",
    glow: "shadow-blue-500/30",
    icon: "ℹ️",
    label: "INFORMACIÓN",
  },
};

export const AlertBanner = () => {
  const { activeAlerts, dismissAlert, isSirenActive, toggleSiren } = useAlerts();
  const prevCount = useRef(activeAlerts.length);

  useEffect(() => {
    if (activeAlerts.length > prevCount.current) {
      playAlertBeep();
    }
    prevCount.current = activeAlerts.length;
  }, [activeAlerts.length]);

  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];
  const style = TYPE_STYLES[topAlert.type];

  return (
    <div
      className={`${style.bg} ${style.bgDark} ${style.text} ${style.border} border-b ${style.glow} shadow-lg animate-alert-slide`}
    >
      <div className="flex items-center justify-between px-4 py-2.5 max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg flex-shrink-0 animate-alert-pulse">{style.icon}</span>
          <span className="hidden sm:inline font-bold text-xs tracking-widest whitespace-nowrap">
            {style.label}
          </span>
          <span className="text-sm font-medium truncate">{topAlert.message}</span>
          <span className="hidden md:inline text-xs opacity-80 whitespace-nowrap font-mono">
            {topAlert.station} · {topAlert.value}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs bg-white/20 rounded-full px-2.5 py-0.5 font-bold">
            {activeAlerts.length}
          </span>
          <button
            onClick={() => {
              if (isSirenActive) { stopSiren(); toggleSiren(); }
              else { playSiren(); toggleSiren(); }
            }}
            className="text-xs bg-white/20 hover:bg-white/30 rounded-lg px-2.5 py-1.5 font-semibold transition-all"
            title={isSirenActive ? "Silenciar alarma" : "Activar sirena"}
          >
            {isSirenActive ? "🔇 Silenciar" : "🔊 Alarma"}
          </button>
          <button
            onClick={() => dismissAlert(topAlert.id)}
            className="text-white/70 hover:text-white transition-colors p-1"
            title="Descartar alerta"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
