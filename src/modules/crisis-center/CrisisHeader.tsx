import { useAlerts } from "../alerts/AlertProvider";
import { SirenButton } from "./SirenButton";
import { FaBell } from "react-icons/fa";

export const CrisisHeader = () => {
  const { activeAlerts, criticalAlerts, isCrisisMode } = useAlerts();

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const dateStr = now.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <FaBell className="text-2xl text-red-500" />
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Centro de Crisis
            </h1>
            <span
              className={`text-[10px] font-bold font-mono tracking-widest px-2.5 py-1 rounded-full border ${
                isCrisisMode
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 animate-alert-pulse"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
              }`}
            >
              {isCrisisMode ? <><FaBell className="inline mr-1" />MODO CRISIS</> : "MONITOREO"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs font-mono text-gray-500 dark:text-gray-400">
            <span>{dateStr}</span>
            <span className="tabular-nums font-bold text-lime-500">{timeStr}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-alert-pulse" />
            <span className="text-lime-500">EN VIVO</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-alert-pulse" />
          <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400">
            {criticalAlerts.length}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Críticas</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
            {activeAlerts.length - criticalAlerts.length}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Activas</span>
        </div>
        <SirenButton />
      </div>
    </div>
  );
};
