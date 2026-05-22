import { useState } from "react";
import { useStationContext } from "./StationContext";
import { STATIONS, StateOverride } from "../../data/stations";

export const TacticalPanel = () => {
  const {
    overrides, setOverrides, effectiveStations,
    addBroadcastEntry, broadcastLog,
  } = useStationContext();

  const [selectedStationId, setSelectedStationId] = useState(STATIONS[0].id);

  const selectedStation = effectiveStations.find((s) => s.id === selectedStationId);

  const isOffline = selectedStation?.connectionStatus === "offline" && !selectedStation?.autonomousMode;
  const isAutonomous = selectedStation?.autonomousMode ?? false;
  const isCritical = selectedStation?.riskLevel === "critical";
  const isOnline = selectedStation?.connectionStatus === "online" && !selectedStation?.autonomousMode && selectedStation?.riskLevel === "normal";

  const handleActivateCritical = () => {
    if (!selectedStation || isOffline || isAutonomous) return;
    setOverrides((prev: Record<number, StateOverride>) => ({
      ...prev,
      [selectedStation.id]: {
        connectionStatus: "online",
        autonomousMode: false,
        riskLevel: "critical",
      },
    }));
    addBroadcastEntry(`ALERTA CRÍTICA — ${selectedStation.name} (${selectedStation.node})`);
    addBroadcastEntry(`Protocolo preventivo activado para ${selectedStation.name}`);
    addBroadcastEntry(`IA recomienda evacuación preventiva en zona ribereña`);
  };

  const handleSimulateConnectionLoss = () => {
    if (!selectedStation || isCritical) return;
    setOverrides((prev: Record<number, StateOverride>) => ({
      ...prev,
      [selectedStation.id]: {
        connectionStatus: "offline",
        autonomousMode: true,
        riskLevel: "warning",
      },
    }));
    addBroadcastEntry(`${selectedStation.name} — Modo autónomo activado`);
    addBroadcastEntry(`Red mesh establecida vía ${selectedStation.meshRelay ?? "nodo vecino"}`);
  };

  const handleRestoreNode = () => {
    if (!selectedStation) return;
    setOverrides((prev: Record<number, StateOverride>) => ({
      ...prev,
      [selectedStation.id]: {
        connectionStatus: "online",
        autonomousMode: false,
        riskLevel: "normal",
      },
    }));
    addBroadcastEntry(`${selectedStation.name} — Nodo restaurado`);
  };

  const getStationStateLabel = () => {
    if (!selectedStation) return "—";
    if (isCritical) return "CRÍTICO";
    if (isAutonomous) return "AUTÓNOMO";
    if (isOffline) return "SIN CONEXIÓN";
    if (isOnline) return "EN LÍNEA";
    return "WARNING";
  };

  const getStateColor = () => {
    if (isCritical) return "#ef4444";
    if (isAutonomous) return "#f59e0b";
    if (isOffline) return "#f97316";
    return "#22c55e";
  };

  const cantActivateCritical = isOffline || isAutonomous;
  const cantSimulateLoss = isCritical;

  return (
    <section className="rounded-xl border border-gray-700/50 bg-gray-900/90 backdrop-blur-sm shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-lime-500 shadow-[0_0_6px_#84cc16]" />
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            Centro de Operaciones Táctico
          </h3>
        </div>
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
          SIMULACIÓN
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Station selector + state */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5">
              Estación objetivo
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-lime-500/50 cursor-pointer appearance-none"
            >
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.node}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: getStateColor(), boxShadow: `0 0 8px ${getStateColor()}` }}
            />
            <span
              className="text-[10px] font-mono font-bold whitespace-nowrap"
              style={{ color: getStateColor() }}
            >
              {getStationStateLabel()}
            </span>
          </div>
        </div>

        {/* Tactical buttons */}
        <div className="grid grid-cols-3 gap-3">
          {/* ACTIVATE CRITICAL */}
          <button
            onClick={handleActivateCritical}
            disabled={cantActivateCritical}
            title={cantActivateCritical ? "Nodo en modo autónomo — estado crítico no verificable" : ""}
            className="flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg border transition-all duration-200 bg-red-950/20 border-red-800/40 hover:bg-red-950/40 hover:border-red-600/60 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-950/20 disabled:hover:border-red-800/40 group"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-pulse" />
              <span className="text-[11px] font-bold text-red-400">ACTIVAR</span>
            </div>
            <span className="text-[9px] font-mono text-red-500/70 leading-tight text-center">CRÍTICO</span>
            {cantActivateCritical && (
              <span className="text-[8px] font-mono text-amber-500/70 text-center mt-0.5 leading-tight">
                No disponible en modo autónomo
              </span>
            )}
          </button>

          {/* SIMULATE CONNECTION LOSS */}
          <button
            onClick={handleSimulateConnectionLoss}
            disabled={cantSimulateLoss}
            title={cantSimulateLoss ? "Nodo en estado crítico — no permitir offline inmediato" : ""}
            className="flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg border transition-all duration-200 bg-amber-950/20 border-amber-800/40 hover:bg-amber-950/40 hover:border-amber-600/60 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-amber-950/20 disabled:hover:border-amber-800/40 group"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:animate-pulse" />
              <span className="text-[11px] font-bold text-amber-400">SIMULAR</span>
            </div>
            <span className="text-[9px] font-mono text-amber-500/70 leading-tight text-center">PÉRDIDA DE CONEXIÓN</span>
            {cantSimulateLoss && (
              <span className="text-[8px] font-mono text-red-400/70 text-center mt-0.5 leading-tight">
                No disponible en estado crítico
              </span>
            )}
          </button>

          {/* RESTORE NODE */}
          <button
            onClick={handleRestoreNode}
            disabled={isOnline}
            className="flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg border transition-all duration-200 bg-green-950/20 border-green-800/40 hover:bg-green-950/40 hover:border-green-600/60 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-green-950/20 disabled:hover:border-green-800/40 group"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 group-hover:animate-pulse" />
              <span className="text-[11px] font-bold text-green-400">RESTAURAR</span>
            </div>
            <span className="text-[9px] font-mono text-green-500/70 leading-tight text-center">NODO</span>
          </button>
        </div>

        {/* Broadcast log */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
              Registro táctico
            </label>
            {broadcastLog.length > 0 && (
              <button
                onClick={() => setBroadcastLog([])}
                className="text-[8px] font-mono text-gray-600 hover:text-gray-400 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="bg-gray-950/60 rounded-lg border border-gray-800/50 px-3 py-2 max-h-[140px] overflow-y-auto space-y-0.5 custom-scrollbar">
            {broadcastLog.length === 0 ? (
              <p className="text-[10px] font-mono text-gray-600 text-center py-4">
                Sin eventos — use los botones tácticos
              </p>
            ) : (
              broadcastLog.map((entry, i) => (
                <p
                  key={i}
                  className="text-[10px] font-mono text-gray-400 animate-in fade-in slide-in-from-top-1 duration-300"
                >
                  {entry}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
