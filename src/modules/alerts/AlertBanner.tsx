import { useAlerts } from "./AlertProvider";
import { playAlertBeep, playSiren, stopSiren } from "./AlertSound";
import { useEffect, useRef } from "react";
import { FaExclamationTriangle, FaBell, FaInfoCircle, FaVolumeUp, FaVolumeMute, FaTimes, FaMapMarkerAlt } from "react-icons/fa";

const TYPE_STYLES = {
  critical: {
    border: "border-l-red-500",
    bg: "bg-red-600/10",
    icon: <FaBell className="text-red-400" />,
    label: "ALERTA CRÍTICA",
    labelColor: "text-red-400",
    badge: "bg-red-500/20 text-red-400",
    dot: "bg-red-500",
    glow: "shadow-red-500/20",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-600/10",
    icon: <FaExclamationTriangle className="text-amber-400" />,
    label: "ALERTA PREVENTIVA",
    labelColor: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400",
    dot: "bg-amber-500",
    glow: "shadow-amber-500/20",
  },
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-600/10",
    icon: <FaInfoCircle className="text-blue-400" />,
    label: "INFORMACIÓN",
    labelColor: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400",
    dot: "bg-blue-500",
    glow: "shadow-blue-500/20",
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
    <>
      <style>{`
        .notif-toast {
          position: fixed; top: 16px; right: 16px; z-index: 99999;
          width: 380px; max-width: calc(100vw - 32px);
          background: rgba(15,23,42,0.96);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
          border-left: 3px solid;
          border-radius: 14px;
          padding: 14px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: notif-toast-in 0.35s cubic-bezier(.22,1,.36,1);
          display: flex; gap: 12px;
        }
        @keyframes notif-toast-in {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .notif-toast-icon { flex-shrink: 0; margin-top: 2px; }
        .notif-toast-body { flex: 1; min-width: 0; }
        .notif-toast-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
        }
        .notif-toast-dismiss {
          flex-shrink: 0; width: 22px; height: 22px; border-radius: 6px;
          border: none; background: transparent; color: rgba(255,255,255,0.3);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; margin-left: auto;
        }
        .notif-toast-dismiss:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .notif-toast-actions {
          display: flex; gap: 6px; margin-top: 8px;
        }
        .notif-toast-btn {
          height: 28px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 10px; font-weight: 600; font-family: 'Outfit', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 4px;
          padding: 0 10px; transition: all 0.15s;
        }
        .notif-toast-btn:active { transform: scale(0.95); }
      `}</style>

      <div className="notif-toast" style={{ borderLeftColor: style.dot }}>
        <div className="notif-toast-icon">
          <span className="text-base animate-alert-pulse">{style.icon}</span>
        </div>
        <div className="notif-toast-body">
          <div className="notif-toast-header">
            <span className={`text-[10px] font-bold tracking-widest ${style.labelColor}`}>
              {style.label}
            </span>
            <span className={`text-[9px] ${style.badge} rounded-full px-2 py-0.5`}>
              {activeAlerts.length}
            </span>
            <button className="notif-toast-dismiss" onClick={() => dismissAlert(topAlert.id)}>
              <FaTimes size={10} />
            </button>
          </div>

          <p className="text-sm text-white/80 leading-snug font-medium">
            {topAlert.message}
          </p>

          <div className="flex flex-wrap gap-2 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
              <FaMapMarkerAlt className="text-red-400" size={9} />
              {topAlert.station}
            </span>
            <span className="text-[10px] text-white/40 font-mono">
              {topAlert.value} {topAlert.unit}
            </span>
            {topAlert.trend && (
              <span className="text-[10px] text-white/40 font-mono">
                {topAlert.trend === "rising" ? "↑" : topAlert.trend === "falling" ? "↓" : "→"}
              </span>
            )}
          </div>

          <div className="notif-toast-actions">
            <button
              onClick={() => { if (isSirenActive) { stopSiren(); toggleSiren(); } else { playSiren(); toggleSiren(); } }}
              className={`notif-toast-btn ${isSirenActive ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
            >
              {isSirenActive ? <><FaVolumeMute /> Silenciar</> : <><FaVolumeUp /> Alarma</>}
            </button>
            <button
              onClick={() => dismissAlert(topAlert.id)}
              className="notif-toast-btn bg-white/10 text-white/60 hover:bg-white/20"
            >
              <FaTimes /> Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
