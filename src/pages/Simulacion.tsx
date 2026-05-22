import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SimCanvas from "../simulation/SimScene";
import type { SimState, AlertLevel } from "../simulation/types";
import { playAlertBeep, playSiren, stopSiren } from "../modules/alerts/AlertSound";
import {
  FaCloudRain, FaWifi, FaBolt, FaSignal, FaWater, FaExclamationTriangle,
  FaBullhorn, FaRedo, FaSkull, FaVolumeUp, FaVolumeMute
} from "react-icons/fa";

/* ─── Constants ───────────────────────────────────────────────── */
const INITIAL: SimState = {
  phase: "normal", waterLevel: 15, rainIntensity: 0,
  internetOn: true, powerOn: true, cellOn: true,
  sensorOnline: true, alarmActive: false, alertLevel: 0, riverSpeed: 1,
};

type AlertZone = "safe" | "preventive" | "risk" | "emergency";
const ZONE_CONFIG: Record<AlertZone, { label: string; color: string; bg: string; text: string; border: string }> = {
  safe:       { label: "Seguro",        color: "#22c55e", bg: "#dcfce7", text: "text-green-700",  border: "border-green-300" },
  preventive: { label: "Precaución",    color: "#eab308", bg: "#fef9c3", text: "text-yellow-700", border: "border-yellow-300" },
  risk:       { label: "Riesgo",        color: "#f97316", bg: "#ffedd5", text: "text-orange-700", border: "border-orange-300" },
  emergency:  { label: "Emergencia",    color: "#ef4444", bg: "#fee2e2", text: "text-red-700",    border: "border-red-300" },
};

function getZone(wl: number): AlertZone {
  if (wl >= 80) return "emergency";
  if (wl >= 50) return "risk";
  if (wl >= 30) return "preventive";
  return "safe";
}

function getAlertLevel(wl: number): AlertLevel {
  if (wl >= 80) return 100;
  if (wl >= 50) return 60;
  if (wl >= 30) return 40;
  return 0;
}

/* ─── Circular Gauge ──────────────────────────────────────────── */
function CircularGauge({ value, color }: { value: number; color: string }) {
  const r = 54, circ = 2 * Math.PI * r, offset = circ * (1 - value / 100);
  const zone = getZone(value);

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg width="128" height="128" className="transform -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <motion.circle
          cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{value}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: ZONE_CONFIG[zone].color }}>
          {ZONE_CONFIG[zone].label}
        </span>
      </div>
    </div>
  );
}

/* ─── StatusBadge ─────────────────────────────────────────────── */
function StatusBadge({ label, on, color }: { label: string; on: boolean; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-100 shadow-sm">
      <span className={`w-2 h-2 rounded-full ${on ? "animate-pulse" : ""}`}
        style={{ background: on ? color : "#d1d5db", boxShadow: on ? `0 0 6px ${color}` : "none" }} />
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className={`ml-auto text-[10px] font-bold font-mono ${on ? "text-green-600" : "text-red-400"}`}>
        {on ? "ON" : "OFF"}
      </span>
    </div>
  );
}

/* ─── CtrlBtn ──────────────────────────────────────────────────── */
function CtrlBtn({ icon, label, onClick, color, disabled, active }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  color?: string; disabled?: boolean; active?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-40"
      style={{
        background: active ? `${color}20` : disabled ? "#f9fafb" : "#ffffff",
        border: `1px solid ${active ? `${color}50` : disabled ? "#e5e7eb" : "#e5e7eb"}`,
        color: active ? color : disabled ? "#9ca3af" : "#374151",
        boxShadow: active ? `0 0 12px ${color}20` : "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {icon}{label}
    </button>
  );
}

/* ─── Alert Banner ────────────────────────────────────────────── */
function AlertBannerSmall({ zone, message }: { zone: AlertZone; message: string }) {
  const cfg = ZONE_CONFIG[zone];
  if (zone === "safe") return null;
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${cfg.border} ${cfg.bg} px-4 py-2.5 flex items-center gap-3`}>
      <FaExclamationTriangle className="text-base flex-shrink-0" style={{ color: cfg.color }} />
      <span className={`text-sm font-semibold ${cfg.text}`}>{message}</span>
    </motion.div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function Simulacion() {
  const [state, setState] = useState<SimState>(INITIAL);
  const [showInfo, setShowInfo] = useState(true);
  const [muted, setMuted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevZone = useRef<AlertZone>("safe");
  const prevLevel = useRef(state.alertLevel);

  const update = useCallback((partial: Partial<SimState>) => {
    setState(prev => {
      const next = { ...prev, ...partial };
      if (partial.waterLevel !== undefined || partial.rainIntensity !== undefined) {
        const wl = partial.waterLevel ?? prev.waterLevel;
        next.alertLevel = getAlertLevel(wl);
        next.alarmActive = wl >= 30;
      }
      return next;
    });
  }, []);

  /* ── Auto water rise during rain ── */
  useEffect(() => {
    if (state.rainIntensity > 0.1 && state.phase !== "colapso") {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const rise = prev.rainIntensity * 0.25;
          const wl = Math.min(100, prev.waterLevel + rise);
          return { ...prev, waterLevel: wl, alertLevel: getAlertLevel(wl), alarmActive: wl >= 30 };
        });
      }, 2000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.rainIntensity, state.phase]);

  /* ── Sound on alert zone change ── */
  useEffect(() => {
    const zone = getZone(state.waterLevel);
    if (zone !== prevZone.current && zone !== "safe") {
      if (!muted) playAlertBeep();
    }
    if (state.alarmActive && !muted && !prevLevel.current) {
      playSiren();
    }
    if (!state.alarmActive) {
      stopSiren();
    }
    prevZone.current = zone;
    prevLevel.current = state.alertLevel;
  }, [state.waterLevel, state.alertLevel, state.alarmActive, muted]);

  /* ── Phase transitions ── */
  const goPhase = useCallback((phase: SimState["phase"]) => {
    switch (phase) {
      case "normal":
        stopSiren(); setState(INITIAL); setShowInfo(true); break;
      case "tormenta":
        setState(prev => ({ ...prev, phase: "tormenta", rainIntensity: 0.8 })); break;
      case "colapso":
        stopSiren();
        setState(prev => ({ ...prev, phase: "colapso", internetOn: false, powerOn: false, cellOn: false, sensorOnline: false, rainIntensity: 1 }));
        break;
      case "alerta":
        stopSiren();
        setState(prev => ({ ...prev, phase: "alerta", internetOn: false, powerOn: false, cellOn: false, sensorOnline: true, waterLevel: 65, alertLevel: 80, alarmActive: true, rainIntensity: 0.7 }));
        break;
    }
  }, []);

  const zone = getZone(state.waterLevel);
  const cfg = ZONE_CONFIG[zone];

  const alertMessage =
    zone === "emergency" ? "🚨 EVACUACIÓN INMEDIATA — El nivel del río es crítico" :
    zone === "risk" ? "⚠️ RIESGO DE INUNDACIÓN — El nivel del río sigue aumentando" :
    zone === "preventive" ? "🟡 PRECAUCIÓN — Aumento del nivel del río detectado" : "";

  return (
    <div className="relative w-full h-[calc(100vh-120px)] overflow-hidden rounded-2xl bg-gray-50">
      {/* 3D Scene */}
      <div className="absolute inset-0"><SimCanvas state={state} /></div>

      {/* Top-left: Phase + Alert Zone */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Fase</span>
          <p className="text-sm font-bold text-gray-800 mt-0.5">
            {state.phase === "normal" && "Normalidad"}
            {state.phase === "tormenta" && "Tormenta"}
            {state.phase === "colapso" && "Colapso"}
            {state.phase === "alerta" && "Alerta Autónoma"}
          </p>
        </div>
        {zone !== "safe" && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm">
            <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: cfg.color }}>Alerta</span>
            <p className="text-sm font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
          </motion.div>
        )}
      </div>

      {/* Circular Gauge */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="px-5 py-3 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm">
          <span className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">Nivel del río</span>
          <CircularGauge value={state.waterLevel} color={cfg.color} />
        </div>
      </div>

      {/* Right panel */}
      <div className="absolute top-4 right-4 bottom-4 z-10 w-[240px] flex flex-col gap-3">
        {/* Alert Banner */}
        <AlertBannerSmall zone={zone} message={alertMessage} />

        {/* Status */}
        <div className="p-3 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm">
          <h3 className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 font-semibold">Estado del Sistema</h3>
          <div className="flex flex-col gap-1">
            <StatusBadge label="Internet" on={state.internetOn} color="#0ea5e9" />
            <StatusBadge label="Energía" on={state.powerOn} color="#eab308" />
            <StatusBadge label="Señal" on={state.cellOn} color="#a855f7" />
            <StatusBadge label="Sensor" on={state.sensorOnline} color="#22c55e" />
            <StatusBadge label="Alarma" on={state.alarmActive} color="#ef4444" />
            <StatusBadge label="Panel Solar" on={state.powerOn || state.sensorOnline} color="#f59e0b" />
            <StatusBadge label="Batería" on={state.waterLevel < 90} color="#10b981" />
          </div>
        </div>

        {/* Controls */}
        <div className="p-3 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm flex-1 overflow-y-auto">
          <h3 className="text-[9px] uppercase tracking-widest text-gray-400 mb-2 font-semibold">Controles</h3>
          <div className="flex flex-col gap-1.5">
            <CtrlBtn icon={<FaCloudRain />} label="Simular lluvia" onClick={() => goPhase("tormenta")} color="#0ea5e9" active={state.phase === "tormenta"} />
            <CtrlBtn icon={<FaWifi />} label="Cortar internet" onClick={() => update({ internetOn: false })} color="#ef4444" disabled={!state.internetOn} />
            <CtrlBtn icon={<FaBolt />} label="Cortar energía" onClick={() => update({ powerOn: false })} color="#ef4444" disabled={!state.powerOn} />
            <CtrlBtn icon={<FaSignal />} label="Dañar antena" onClick={() => update({ cellOn: false, sensorOnline: false })} color="#ef4444" disabled={!state.cellOn} />
            <CtrlBtn icon={<FaWater />} label="Subir agua +15%" onClick={() => update({ waterLevel: Math.min(100, state.waterLevel + 15) })} color="#f97316" />
            <CtrlBtn icon={<FaSkull />} label="Colapso total" onClick={() => goPhase("colapso")} color="#ef4444" active={state.phase === "colapso"} />
            <CtrlBtn icon={<FaBullhorn />} label="Emergencia" onClick={() => goPhase("alerta")} color="#ef4444" active={state.phase === "alerta"} disabled={state.phase === "alerta"} />
            <div className="border-t border-gray-100 my-1.5" />
            <div className="flex gap-1.5">
              <CtrlBtn icon={<FaRedo />} label="Reiniciar" onClick={() => goPhase("normal")} color="#22c55e" />
              <CtrlBtn icon={muted ? <FaVolumeMute /> : <FaVolumeUp />} label={muted ? "Mute" : "Sonido"} onClick={() => setMuted(!muted)} color="#8b5cf6" />
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="p-3 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-2.5">
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium">
                <span><FaCloudRain className="inline mr-1" />Lluvia</span>
                <span className="font-mono">{Math.round(state.rainIntensity * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.1" value={state.rainIntensity}
                onChange={e => update({ rainIntensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-blue-500 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium">
                <span><FaWater className="inline mr-1" />Agua</span>
                <span className="font-mono">{state.waterLevel}%</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={state.waterLevel}
                onChange={e => update({ waterLevel: parseInt(e.target.value) })}
                className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-blue-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Info overlay */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="max-w-lg mx-4 p-8 rounded-2xl bg-white border border-gray-200 shadow-xl text-center"
              onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <FaExclamationTriangle className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Simulación 3D — Alertas Tempranas</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Demostración visual del sistema autónomo de alertas. Incluso cuando colapsan internet,
                energía y señal celular, <strong className="text-gray-700">las comunidades siguen recibiendo alertas</strong> mediante alarmas autónomas inteligentes.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6 text-left text-xs">
                <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 font-medium">🟢 Fase 1: Normalidad</div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-medium">🌧️ Fase 2: Tormenta</div>
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-medium">💀 Fase 3: Colapso</div>
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">🚨 Fase 4: Alerta Autónoma</div>
              </div>
              <button onClick={() => setShowInfo(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/25">
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
