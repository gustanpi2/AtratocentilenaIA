import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAlerts } from "../alerts/AlertProvider";
import type { AlertMode } from "../alerts/AlertProvider";
import { useStationContext } from "../crisis-center/StationContext";

type Channel = "whatsapp" | "sms" | "sirena" | "radio";

interface ChannelConfig {
  id: Channel;
  label: string;
  color: string;
  activeClass: string;
}

interface Zone {
  id: string;
  name: string;
  residents: number;
}

const CHANNELS: ChannelConfig[] = [
  { id: "whatsapp", label: "WA", color: "bg-green-600", activeClass: "bg-green-600 text-white border-green-600" },
  { id: "sms", label: "SMS", color: "bg-blue-600", activeClass: "bg-blue-600 text-white border-blue-600" },
  { id: "sirena", label: "SIR", color: "bg-red-600", activeClass: "bg-red-600 text-white border-red-600" },
  { id: "radio", label: "RAD", color: "bg-purple-700", activeClass: "bg-purple-700 text-white border-purple-700" },
];

const ZONES: Zone[] = [
  { id: "z1", name: "Quibdó", residents: 45000 },
  { id: "z2", name: "Bojayá", residents: 12000 },
  { id: "z3", name: "Vigía del Fuerte", residents: 8000 },
  { id: "z4", name: "Tutunendo", residents: 5000 },
  { id: "z5", name: "Lloró", residents: 3000 },
];

const AI_BROADCAST_COOLDOWN_MS = 20 * 60 * 1000;
const DEFAULT_MESSAGE =
  "ALERTA HIDROLOGICA: Condiciones de riesgo detectadas en el rio Atrato. " +
  "Mantenga distancia de la orilla. Monitoree el nivel del agua. " +
  "Siga las instrucciones de Defensa Civil.";

/* ─── Severity color for log entries ─── */
function logColor(entry: string): string {
  if (entry.includes("CRÍTICA") || entry.includes("ALERTA")) return "text-red-400";
  if (entry.includes("IA") || entry.includes("Protocolo")) return "text-amber-400";
  if (entry.includes("restaurado") || entry.includes("estable")) return "text-green-400";
  return "text-gray-400";
}

function logBadge(entry: string): string {
  if (entry.includes("CRÍTICA") || entry.includes("ALERTA")) return "🔴";
  if (entry.includes("IA") || entry.includes("Protocolo")) return "🤖";
  if (entry.includes("restaurado") || entry.includes("recuper")) return "✅";
  if (entry.includes("automático")) return "📡";
  return "•";
}

function ts(): string {
  return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export const EmergencyBroadcast = () => {
  const { criticalAlerts, alertMode, setAlertMode } = useAlerts();
  const { effectiveStations, riskBreakdown } = useStationContext();

  const [selectedChannels, setSelectedChannels] = useState<Set<Channel>>(new Set(["whatsapp", "sms"]));
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [message] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<number | null>(null);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const { broadcastLog, addBroadcastEntry } = useStationContext();

  const lastAiBroadcast = useRef<number>(0);
  const prevCriticalCount = useRef(criticalAlerts.length);
  const logEndRef = useRef<HTMLDivElement>(null);

  const criticalStations = effectiveStations.filter((s) => s.riskLevel === "critical");
  const currentRisk = riskBreakdown[0] ?? "Monitoreo normal";

  /* auto-scroll log */
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [broadcastLog]);

  /* Auto broadcast */
  useEffect(() => {
    if (alertMode !== "ai") return;
    const newCritical = criticalAlerts.length > prevCriticalCount.current;
    prevCriticalCount.current = criticalAlerts.length;
    if (!newCritical || criticalAlerts.length === 0) return;

    const now = Date.now();
    if (now - lastAiBroadcast.current < AI_BROADCAST_COOLDOWN_MS) return;

    lastAiBroadcast.current = now;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setLastBroadcastTime(now);
      setBroadcastCount((c) => c + 1);
      addBroadcastEntry(`Broadcast automático vía WhatsApp, SMS, Sirenas`);
      toast.success(`Alerta automática transmitida a ${ZONES.reduce((s, z) => s + z.residents, 0).toLocaleString()} residentes`, { duration: 6000 });
    }, 2000);
  }, [criticalAlerts.length, alertMode]);

  const toggleChannel = (ch: Channel) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  const toggleZone = (id: string) => {
    setSelectedZones((prev) => (prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]));
  };

  const selectAllZones = () => setSelectedZones(ZONES.map((z) => z.id));
  const clearZones = () => setSelectedZones([]);

  const totalResidents = selectedZones.reduce((sum, zId) => sum + (ZONES.find((z) => z.id === zId)?.residents ?? 0), 0);

  const handleManualBroadcast = () => {
    if (selectedChannels.size === 0 || selectedZones.length === 0) return;
    setSending(true);
    const now = Date.now();
    setTimeout(() => {
      setSending(false);
      setLastBroadcastTime(now);
      setBroadcastCount((c) => c + 1);
      const chLabels = Array.from(selectedChannels).map((c) => CHANNELS.find((ch) => ch.id === c)?.label).join(", ");
      toast.success(`Alerta transmitida a ${totalResidents.toLocaleString()} residentes vía ${chLabels}`, { duration: 5000 });
    }, 1800);
  };

  const canBroadcast = !sending && selectedChannels.size > 0 && selectedZones.length > 0 && message.trim().length > 10;
  const cooldownRemaining = lastBroadcastTime
    ? Math.max(0, Math.ceil((AI_BROADCAST_COOLDOWN_MS - (Date.now() - lastBroadcastTime)) / 60000))
    : 0;

  const isManualMode = alertMode === "manual";

  return (
    <div className="bg-gray-950/70 backdrop-blur-sm rounded-xl border border-gray-800/60 shadow-lg overflow-hidden"
         style={{ minHeight: 320, maxHeight: 420 }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/50 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_4px_#84cc16]" />
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
            Comunicaciones de Emergencia
          </span>
        </div>
        <ModeToggle mode={alertMode} onChange={setAlertMode} />
      </div>

      {/* ── Body: 2-column grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-gray-800/30">
        {/* Left: Broadcast log (3/5) */}
        <div className="md:col-span-3 p-2.5 flex flex-col" style={{ minHeight: 0 }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-semibold text-gray-500 uppercase tracking-wider">
              Registro de transmisiones
            </span>
            <span className="text-[9px] font-mono text-gray-600">{broadcastLog.length} eventos</span>
          </div>
          <div className="bg-gray-950/80 rounded-lg border border-gray-800/50 flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 260 }}>
            {broadcastLog.length === 0 ? (
              <p className="text-[10px] font-mono text-gray-600 text-center py-6">Sin eventos de transmisión</p>
            ) : (
              <div className="p-2 space-y-0.5 font-mono text-[10px] leading-relaxed">
                {broadcastLog.map((entry, i) => (
                  <div key={i} className={`flex items-start gap-1.5 ${logColor(entry)} animate-in fade-in duration-200`}>
                    <span className="shrink-0 w-3.5 text-center text-[9px]">{logBadge(entry)}</span>
                    <span className="shrink-0 text-gray-600">[{ts()}]</span>
                    <span className="break-words">{entry}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick actions (2/5) */}
        <div className="md:col-span-2 p-2.5 flex flex-col gap-2">
          {/* Status bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${criticalStations.length > 0 ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
              <span className="text-[10px] font-mono text-gray-400">
                {criticalStations.length > 0 ? `${criticalStations.length} crítica(s)` : "Normal"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {broadcastCount > 0 && (
                <span className="text-[9px] font-mono text-gray-600">{broadcastCount} tx</span>
              )}
              {sending && (
                <span className="flex items-center gap-1 text-[9px] font-mono text-blue-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Tx
                </span>
              )}
            </div>
          </div>

          {/* Channels */}
          <div>
            <span className="text-[8px] font-mono font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Canales
            </span>
            <div className="flex flex-wrap gap-1">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => toggleChannel(ch.id)}
                  disabled={!isManualMode}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition-all ${
                    selectedChannels.has(ch.id)
                      ? ch.activeClass
                      : "bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-500"
                  } disabled:opacity-40`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zones */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-mono font-semibold text-gray-500 uppercase tracking-wider">Zonas</span>
              <div className="flex gap-1.5">
                <button onClick={selectAllZones} disabled={!isManualMode} className="text-[8px] font-mono text-blue-500 hover:text-blue-400 disabled:opacity-30">Todas</button>
                <button onClick={clearZones} disabled={!isManualMode} className="text-[8px] font-mono text-gray-600 hover:text-gray-400 disabled:opacity-30">Limpiar</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {ZONES.map((z) => (
                <button
                  key={z.id}
                  onClick={() => toggleZone(z.id)}
                  disabled={!isManualMode}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all ${
                    selectedZones.includes(z.id)
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-500"
                  } disabled:opacity-40`}
                >
                  {z.name}
                  <span className="ml-0.5 opacity-40 text-[7px]">{(z.residents / 1000).toFixed(0)}k</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transmit + meta */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-1 border-t border-gray-800/40">
            <div className="flex items-center gap-1.5">
              {totalResidents > 0 && (
                <span className="text-[9px] font-mono text-gray-500">{totalResidents.toLocaleString()} hab</span>
              )}
              {cooldownRemaining > 0 && alertMode === "ai" && (
                <span className="text-[8px] font-mono text-amber-600/80">{cooldownRemaining}min</span>
              )}
              {criticalStations.length > 0 && alertMode === "ai" && (
                <span className="text-[7px] font-mono text-red-500 uppercase tracking-wider">⚠ Emergencia</span>
              )}
            </div>
            <button
              onClick={handleManualBroadcast}
              disabled={!canBroadcast || !isManualMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-700 hover:bg-red-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[9px] font-mono transition-all border border-red-600/50"
            >
              {sending ? (
                <><div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Tx</>
              ) : (
                "TRANSMITIR"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function ModeToggle({ mode, onChange }: { mode: AlertMode; onChange: (m: AlertMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-gray-800/60 rounded-md p-0.5 border border-gray-700/40">
      {(["manual", "ai"] as AlertMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold transition-all ${
            mode === m
              ? "bg-gray-700 text-gray-100 shadow-sm"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {m === "manual" ? "Manual" : "Auto IA"}
        </button>
      ))}
    </div>
  );
}
