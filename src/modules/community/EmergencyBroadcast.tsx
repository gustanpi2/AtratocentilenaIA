import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAlerts } from "../alerts/AlertProvider";
import type { AlertMode } from "../alerts/AlertProvider";
import { useStationContext } from "../crisis-center/StationContext";

type Channel = "whatsapp" | "sms" | "sirena" | "radio";

interface ChannelConfig {
  id: Channel;
  label: string;
  description: string;
  color: string;
  activeClass: string;
}

interface Zone {
  id: string;
  name: string;
  residents: number;
  municipality: string;
}

const CHANNELS: ChannelConfig[] = [
  { id: "whatsapp", label: "WhatsApp", description: "Red comunitaria", color: "bg-green-600", activeClass: "bg-green-600 text-white border-green-600" },
  { id: "sms", label: "SMS", description: "Mensajería básica", color: "bg-blue-600", activeClass: "bg-blue-600 text-white border-blue-600" },
  { id: "sirena", label: "Sirenas", description: "Alerta acústica", color: "bg-red-600", activeClass: "bg-red-600 text-white border-red-600" },
  { id: "radio", label: "Radio", description: "Frecuencia AM/FM", color: "bg-purple-700", activeClass: "bg-purple-700 text-white border-purple-700" },
];

const ZONES: Zone[] = [
  { id: "z1", name: "Quibdó", residents: 45000, municipality: "Quibdó" },
  { id: "z2", name: "Bojayá", residents: 12000, municipality: "Bojayá" },
  { id: "z3", name: "Vigía del Fuerte", residents: 8000, municipality: "Vigía del Fuerte" },
  { id: "z4", name: "Tutunendo", residents: 5000, municipality: "Quibdó" },
  { id: "z5", name: "Lloró", residents: 3000, municipality: "Lloró" },
];

const AI_BROADCAST_COOLDOWN_MS = 20 * 60 * 1000;
const DEFAULT_MESSAGE =
  "ALERTA HIDROLOGICA: Condiciones de riesgo detectadas en el rio Atrato. " +
  "Mantenga distancia de la orilla. Monitoree el nivel del agua. " +
  "Siga las instrucciones de Defensa Civil.";

export const EmergencyBroadcast = () => {
  const { criticalAlerts, activeAlerts, alertMode, setAlertMode } = useAlerts();
  const { effectiveStations, riskBreakdown } = useStationContext();

  const [selectedChannels, setSelectedChannels] = useState<Set<Channel>>(new Set(["whatsapp", "sms"]));
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<number | null>(null);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const { broadcastLog, addBroadcastEntry } = useStationContext();
  const [showManual, setShowManual] = useState(alertMode === "manual" || true);

  const lastAiBroadcast = useRef<number>(0);
  const prevCriticalCount = useRef(criticalAlerts.length);

  const criticalStations = effectiveStations.filter((s) => s.riskLevel === "critical");
  const currentRisk = riskBreakdown[0] ?? "Monitoreo normal";

  // Auto broadcast
  useEffect(() => {
    if (alertMode !== "ai") return;
    const newCritical = criticalAlerts.length > prevCriticalCount.current;
    prevCriticalCount.current = criticalAlerts.length;
    if (!newCritical || criticalAlerts.length === 0) return;

    const now = Date.now();
    if (now - lastAiBroadcast.current < AI_BROADCAST_COOLDOWN_MS) return;

    const allZoneIds = ZONES.map((z) => z.id);
    const criticalAlert = criticalAlerts[0];
    const aiMessage = `ALERTA AUTOMATICA [IA]: ${criticalAlert?.message ?? "Evento hidrológico crítico"}. Protocolo de evacuación preventiva activado para zonas ribereñas.`;

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

  return (
    <div className="space-y-3">
      {/* ── Status header ── */}
      <div className="flex items-center justify-between gap-2">
        <ModeToggle mode={alertMode} onChange={setAlertMode} />
        <div className="flex items-center gap-2">
          {sending && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Transmitiendo...
            </span>
          )}
          {broadcastCount > 0 && (
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
              {broadcastCount} tx
            </span>
          )}
        </div>
      </div>

      {/* ── Risk summary ── */}
      <div className={`rounded-lg border px-3 py-2 ${
        criticalStations.length > 0
          ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
      }`}>
        <div className="flex items-start gap-2">
          <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0 ${
            criticalStations.length > 0 ? "bg-red-500 animate-pulse" : "bg-green-500"
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
              {criticalStations.length > 0
                ? `${criticalStations.length} estación(es) crítica(s): ${criticalStations.map((s) => s.name).join(", ")}`
                : "Sistema estable — Sin estaciones críticas"}
            </p>
            <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
              {currentRisk}
            </p>
            {alertMode === "ai" && cooldownRemaining > 0 && (
              <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1">
                Siguiente tx en ~{cooldownRemaining} min
              </p>
            )}
          </div>
        </div>
        {criticalStations.length > 0 && alertMode === "ai" && (
          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-red-600 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Protocolo de emergencia activo
          </div>
        )}
      </div>

      {/* ── Broadcast log (shared) ── */}
      {broadcastLog.length > 0 && (
        <div className="bg-gray-950/10 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
          <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Registro de transmisiones</p>
          <div className="space-y-0.5 max-h-[120px] overflow-y-auto custom-scrollbar">
            {broadcastLog.slice(0, 6).map((entry, i) => (
              <p key={i} className="text-[10px] font-mono text-gray-500 dark:text-gray-400 animate-in fade-in slide-in-from-top-1 duration-300">
                {entry}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Manual controls ── */}
      <div className={alertMode === "ai" ? "opacity-50 pointer-events-none" : ""}>
        {/* Channels */}
        <div className="mb-2.5">
          <label className="text-[9px] font-mono font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
            Canales
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => toggleChannel(ch.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-all ${
                  selectedChannels.has(ch.id)
                    ? ch.activeClass
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                }`}
              >
                <span>{ch.label}</span>
                {selectedChannels.has(ch.id) && <span className="text-[9px] opacity-70">{ch.description}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Zones */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] font-mono font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Zonas</label>
            <div className="flex gap-2">
              <button onClick={selectAllZones} className="text-[9px] font-mono text-blue-600 dark:text-blue-400 hover:underline">Todas</button>
              <button onClick={clearZones} className="text-[9px] font-mono text-gray-400 dark:text-gray-500 hover:underline">Ninguna</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {ZONES.map((z) => (
              <button
                key={z.id}
                onClick={() => toggleZone(z.id)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${
                  selectedZones.includes(z.id)
                    ? "bg-slate-700 text-white border-slate-700 dark:bg-slate-300 dark:text-slate-900 dark:border-slate-300"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                }`}
              >
                {z.name}
                <span className="ml-1 opacity-50 text-[8px]">{(z.residents / 1000).toFixed(0)}k</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400">
              {totalResidents > 0
                ? `${totalResidents.toLocaleString()} hab.`
                : "Sin zonas"}
            </span>
            {selectedChannels.size === 0 && (
              <span className="text-[10px] font-mono text-red-500">Sin canal</span>
            )}
          </div>
          <button
            onClick={handleManualBroadcast}
            disabled={!canBroadcast}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[10px] rounded-lg transition-all border border-red-800 shadow-sm"
          >
            {sending ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Tx...
              </>
            ) : (
              "TRANSMITIR"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function ModeToggle({ mode, onChange }: { mode: AlertMode; onChange: (m: AlertMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {(["manual", "ai"] as AlertMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
            mode === m
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {m === "manual" ? "Manual" : "Auto IA"}
        </button>
      ))}
    </div>
  );
}
