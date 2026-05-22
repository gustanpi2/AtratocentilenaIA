import { useState, useCallback } from "react";
import { useStationContext } from "../modules/crisis-center/StationContext";
import { STATIONS, StateOverride } from "../data/stations";

export const SidebarTacticalControls = () => {
  const { setOverrides, effectiveStations, addBroadcastEntry } = useStationContext();
  const [selectedId, setSelectedId] = useState(STATIONS[0].id);

  const station = effectiveStations.find((s) => s.id === selectedId);

  const isOffline = station?.connectionStatus === "offline" && !station?.autonomousMode;
  const isAuto = station?.autonomousMode ?? false;
  const isCritical = station?.riskLevel === "critical";
  const isOnline = station?.connectionStatus === "online" && !station?.autonomousMode && station?.riskLevel === "normal";

  const setSt = useCallback(
    (patch: StateOverride) => {
      setOverrides((prev: Record<number, StateOverride>) => ({ ...prev, [selectedId]: patch }));
    },
    [selectedId, setOverrides],
  );

  const handleCritical = () => {
    if (!station || isOffline || isAuto) return;
    setSt({ connectionStatus: "online", autonomousMode: false, riskLevel: "critical" });
    addBroadcastEntry(`ALERTA CRÍTICA — ${station.name} (${station.node})`);
    addBroadcastEntry(`Protocolo preventivo activado para ${station.name}`);
  };

  const handleOffline = () => {
    if (!station || isCritical) return;
    setSt({ connectionStatus: "offline", autonomousMode: true, riskLevel: "warning" });
    addBroadcastEntry(`${station.name} — Modo autónomo activado, red mesh establecida`);
  };

  const handleRestore = () => {
    if (!station) return;
    setSt({ connectionStatus: "online", autonomousMode: false, riskLevel: "normal" });
    addBroadcastEntry(`${station.name} — Nodo restaurado`);
  };

  const dotColor = isCritical ? "#ef4444" : isOffline || isAuto ? "#f59e0b" : "#22c55e";

  return (
    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      {/* Label */}
      <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_4px_#84cc16]" />
        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Ctrl Táctico
        </span>
      </div>

      {/* Station dropdown */}
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-mono rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-lime-500/40 cursor-pointer appearance-none"
      >
        {STATIONS.map((st) => (
          <option key={st.id} value={st.id}>
            {st.name}
          </option>
        ))}
      </select>

      {/* Quick action buttons */}
      <div className="flex gap-1 mt-1.5">
        <button
          onClick={handleOffline}
          disabled={isCritical}
          title={isCritical ? "Nodo crítico — no puede desconectarse" : `Poner ${station?.name} sin conexión`}
          className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md border text-[10px] font-mono font-bold transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed bg-amber-950/20 border-amber-700/40 text-amber-500 hover:bg-amber-950/40 hover:border-amber-600/60"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="tracking-wider">OFF</span>
        </button>

        <button
          onClick={handleCritical}
          disabled={isOffline || isAuto}
          title={isOffline || isAuto ? "Nodo autónomo — crítico no verificable" : `Poner ${station?.name} en crítico`}
          className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md border text-[10px] font-mono font-bold transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed bg-red-950/20 border-red-700/40 text-red-500 hover:bg-red-950/40 hover:border-red-600/60"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="tracking-wider">CRIT</span>
        </button>

        <button
          onClick={handleRestore}
          disabled={isOnline}
          title={`Restaurar ${station?.name}`}
          className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md border text-[10px] font-mono font-bold transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed bg-green-950/20 border-green-700/40 text-green-500 hover:bg-green-950/40 hover:border-green-600/60"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="tracking-wider">OK</span>
        </button>
      </div>

      {/* Status dot */}
      <div className="flex items-center gap-2 mt-1.5 px-0.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
        />
        <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 truncate">
          {station?.name ?? "—"}
        </span>
      </div>
    </div>
  );
};
