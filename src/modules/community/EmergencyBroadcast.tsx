import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAlerts } from "../alerts/AlertProvider";
import type { AlertMode } from "../alerts/AlertProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

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

const AI_BROADCAST_COOLDOWN_MS = 20 * 60 * 1000; // 20 min between auto-broadcasts
const DEFAULT_MESSAGE =
  "ALERTA HIDROLOGICA: Condiciones de riesgo detectadas en el rio Atrato. " +
  "Mantenga distancia de la orilla. Monitoree el nivel del agua. " +
  "Siga las instrucciones de Defensa Civil.";

// ─── Main component ───────────────────────────────────────────────────────────

export const EmergencyBroadcast = () => {
  const { criticalAlerts, activeAlerts, alertMode, setAlertMode } = useAlerts();

  const [selectedChannels, setSelectedChannels] = useState<Set<Channel>>(
    new Set(["whatsapp", "sms"])
  );
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [lastBroadcastTime, setLastBroadcastTime] = useState<number | null>(null);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const [aiBroadcastLog, setAiBroadcastLog] = useState<string[]>([]);

  const lastAiBroadcast = useRef<number>(0);
  const prevCriticalCount = useRef(criticalAlerts.length);

  // ── AI auto-broadcast logic ──────────────────────────────────────────────────
  useEffect(() => {
    if (alertMode !== "ai") return;

    const newCritical = criticalAlerts.length > prevCriticalCount.current;
    prevCriticalCount.current = criticalAlerts.length;

    if (!newCritical) return;
    if (criticalAlerts.length === 0) return;

    const now = Date.now();
    if (now - lastAiBroadcast.current < AI_BROADCAST_COOLDOWN_MS) return;

    // Select all zones automatically in AI mode
    const allZoneIds = ZONES.map((z) => z.id);
    const allChannels = new Set<Channel>(["whatsapp", "sms", "sirena"]);
    const criticalAlert = criticalAlerts[0];

    const aiMessage =
      `ALERTA AUTOMATICA [IA]: ${criticalAlert?.message ?? "Evento hidrológico crítico detectado"}. ` +
      `Protocolo de evacuación preventiva activado para zonas ribereñas.`;

    // Execute auto-broadcast
    lastAiBroadcast.current = now;
    setSending(true);

    setTimeout(() => {
      setSending(false);
      setLastBroadcastTime(now);
      setBroadcastCount((c) => c + 1);
      setAiBroadcastLog((prev) => [
        `${new Date(now).toLocaleTimeString("es-CO")} — Alerta automática enviada vía WhatsApp, SMS, Sirenas`,
        ...prev.slice(0, 4),
      ]);

      toast.success(
        `Alerta automatica transmitida a ${ZONES.reduce((s, z) => s + z.residents, 0).toLocaleString()} residentes`,
        { duration: 6000 }
      );
    }, 2000);
  }, [criticalAlerts.length, alertMode]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const toggleChannel = (ch: Channel) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  const toggleZone = (id: string) => {
    setSelectedZones((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    );
  };

  const selectAllZones = () => setSelectedZones(ZONES.map((z) => z.id));
  const clearZones = () => setSelectedZones([]);

  const totalResidents = selectedZones.reduce(
    (sum, zId) => sum + (ZONES.find((z) => z.id === zId)?.residents ?? 0),
    0
  );

  const handleManualBroadcast = () => {
    if (selectedChannels.size === 0 || selectedZones.length === 0) return;

    setSending(true);
    const now = Date.now();

    setTimeout(() => {
      setSending(false);
      setLastBroadcastTime(now);
      setBroadcastCount((c) => c + 1);
      const chLabels = Array.from(selectedChannels)
        .map((c) => CHANNELS.find((ch) => ch.id === c)?.label)
        .join(", ");

      toast.success(
        `Alerta transmitida a ${totalResidents.toLocaleString()} residentes via ${chLabels}`,
        { duration: 5000 }
      );
    }, 1800);
  };

  const canBroadcast =
    !sending && selectedChannels.size > 0 && selectedZones.length > 0 && message.trim().length > 10;

  const cooldownRemaining = lastBroadcastTime
    ? Math.max(0, Math.ceil((AI_BROADCAST_COOLDOWN_MS - (Date.now() - lastBroadcastTime)) / 60000))
    : 0;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <ModeToggle mode={alertMode} onChange={setAlertMode} />
        {broadcastCount > 0 && (
          <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
            {broadcastCount} transmisión{broadcastCount !== 1 ? "es" : ""} emitida{broadcastCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* AI mode status */}
      {alertMode === "ai" && (
        <div className={`rounded-lg border px-3 py-2.5 ${
          criticalAlerts.length > 0
            ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
        }`}>
          <div className="flex items-start gap-2">
            <div className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${criticalAlerts.length > 0 ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {criticalAlerts.length > 0
                  ? `${criticalAlerts.length} alerta${criticalAlerts.length > 1 ? "s" : ""} crítica${criticalAlerts.length > 1 ? "s" : ""} activa${criticalAlerts.length > 1 ? "s" : ""}`
                  : "Sistema monitoreando — Sin alertas críticas"}
              </p>
              <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                La IA emitirá automáticamente cuando detecte riesgo real confirmado por multiples variables.
                Espera minima entre transmisiones: {AI_BROADCAST_COOLDOWN_MS / 60000} min.
              </p>
              {cooldownRemaining > 0 && (
                <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1">
                  Siguiente transmision disponible en aprox. {cooldownRemaining} min.
                </p>
              )}
            </div>
          </div>

          {/* AI broadcast log */}
          {aiBroadcastLog.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
              <p className="text-[9px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500">Registro de transmisiones automaticas</p>
              {aiBroadcastLog.map((entry, i) => (
                <p key={i} className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{entry}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual controls (always visible; required even in AI mode for override) */}
      <div className={alertMode === "ai" ? "opacity-60 pointer-events-none" : ""}>
        {alertMode === "ai" && (
          <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mb-2 italic">
            Modo manual desactivado. Cambie a Manual para control directo.
          </p>
        )}

        {/* Channels */}
        <div className="mb-3">
          <label className="text-[10px] font-mono font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
            Canales de comunicacion
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => toggleChannel(ch.id)}
                className={`flex flex-col items-start px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  selectedChannels.has(ch.id)
                    ? ch.activeClass
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300"
                }`}
              >
                <span>{ch.label}</span>
                <span className={`text-[9px] font-normal leading-tight ${selectedChannels.has(ch.id) ? "opacity-80" : "text-gray-400 dark:text-gray-500"}`}>
                  {ch.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Zones */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-mono font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Zonas a notificar
            </label>
            <div className="flex gap-2">
              <button onClick={selectAllZones} className="text-[9px] font-mono text-blue-600 dark:text-blue-400 hover:underline">Todas</button>
              <button onClick={clearZones} className="text-[9px] font-mono text-gray-400 dark:text-gray-500 hover:underline">Ninguna</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ZONES.map((z) => (
              <button
                key={z.id}
                onClick={() => toggleZone(z.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                  selectedZones.includes(z.id)
                    ? "bg-slate-700 text-white border-slate-700 dark:bg-slate-300 dark:text-slate-900 dark:border-slate-300"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                {z.name}
                <span className="ml-1.5 opacity-50 font-normal text-[9px]">
                  {(z.residents / 1000).toFixed(0)}k
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="mb-3">
          <label className="text-[10px] font-mono font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
            Mensaje de alerta
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={320}
            className="w-full text-xs font-mono bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-gray-200"
          />
          <div className="flex justify-between mt-0.5">
            <button
              onClick={() => setMessage(DEFAULT_MESSAGE)}
              className="text-[9px] font-mono text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Restablecer mensaje predeterminado
            </button>
            <span className="text-[9px] font-mono text-gray-400">{message.length}/320</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
              {totalResidents > 0
                ? `${totalResidents.toLocaleString()} residentes alcanzados`
                : "Seleccione zonas para estimar alcance"}
            </p>
            {selectedChannels.size === 0 && (
              <p className="text-[10px] font-mono text-red-500">Seleccione al menos un canal</p>
            )}
          </div>
          <button
            onClick={handleManualBroadcast}
            disabled={!canBroadcast}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-all border border-red-800 shadow-sm"
          >
            {sending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Transmitiendo...
              </>
            ) : (
              "TRANSMITIR ALERTA"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Mode toggle sub-component ────────────────────────────────────────────────

function ModeToggle({ mode, onChange }: { mode: AlertMode; onChange: (m: AlertMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {(["manual", "ai"] as AlertMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition-all ${
            mode === m
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {m === "manual" ? "Manual" : "Automatico IA"}
        </button>
      ))}
    </div>
  );
}