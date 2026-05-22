// @ts-nocheck
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  FaSun, FaVolumeUp, FaTemperatureHigh, FaWater,
  FaArrowUp, FaArrowDown, FaSmile, FaMeh, FaFrown,
  FaDownload, FaBell, FaBellSlash, FaSync,
  FaChartLine, FaTable, FaInfoCircle, FaTimes,
  FaCheck, FaExclamationTriangle,
} from "react-icons/fa";
import { GiChemicalDrop, GiDustCloud } from "react-icons/gi";
import { MdCo2, MdAir } from "react-icons/md";
import { useModal } from "../../hooks/useModal";

import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

/* ─── TIPOS ──────────────────────────────────────────────────────────────── */
interface Estacion { id: number; nombre: string; }
type Props = { estacion: Estacion };
type SensorData = Record<string, number>;
type AlertMap   = Record<string, boolean>;

/* ─── DESIGN TOKENS (misma paleta que PolarChart / GaugeChart) ───────────── */
const T = {
  dark:    "rgba(10,20,28,0.95)",
  card:    "rgba(14,26,36,0.92)",
  border:  "rgba(132,204,22,0.15)",
  surface: "rgba(255,255,255,0.04)",
  surBdr:  "rgba(255,255,255,0.08)",
  text:    "#e2f0f7",
  muted:   "#8ba3b0",
  dim:     "#3d5a68",
  accent:  "#84cc16",
  up:      "#ef4444",
  down:    "#22c55e",
  info:    "#38bdf8",
  warn:    "#facc15",
  fontM:   "'DM Mono', monospace",
  fontS:   "'DM Sans', sans-serif",
};

/* ─── ICONOS ─────────────────────────────────────────────────────────────── */
const ICONS: Record<string, React.ReactNode> = {
  radiation: <FaSun          style={{ color: "#facc15", fontSize: 26 }} />,
  noise:     <FaVolumeUp     style={{ color: "#38bdf8", fontSize: 26 }} />,
  co2:       <MdCo2          style={{ color: "#22c55e", fontSize: 26 }} />,
  hcho:      <GiChemicalDrop style={{ color: "#f472b6", fontSize: 26 }} />,
  tvoc:      <GiChemicalDrop style={{ color: "#a78bfa", fontSize: 26 }} />,
  pm25:      <GiDustCloud    style={{ color: "#fb923c", fontSize: 26 }} />,
  pm10:      <GiDustCloud    style={{ color: "#fdba74", fontSize: 26 }} />,
  temp:      <FaTemperatureHigh style={{ color: "#f87171", fontSize: 26 }} />,
  humidity:  <FaWater        style={{ color: "#22d3ee", fontSize: 26 }} />,
};

/* ─── SENSORES ───────────────────────────────────────────────────────────── */
const SENSORES = [
  { key: "radiation", title: "Radiación Solar",  code: "V4",  unit: "W/m²",  color: "#facc15" },
  { key: "noise",     title: "Ruido Ambiental",  code: "V6",  unit: "dB",    color: "#38bdf8" },
  { key: "co2",       title: "CO₂",              code: "V12", unit: "ppm",   color: "#22c55e" },
  { key: "hcho",      title: "HCHO",             code: "V11", unit: "mg/m³", color: "#f472b6" },
  { key: "tvoc",      title: "TVOC",             code: "V15", unit: "mg/m³", color: "#a78bfa" },
  { key: "pm25",      title: "PM2.5",            code: "V1",  unit: "µg/m³", color: "#fb923c" },
  { key: "pm10",      title: "PM10",             code: "V10", unit: "µg/m³", color: "#fdba74" },
  { key: "temp",      title: "Temperatura",      code: "V5",  unit: "°C",    color: "#f87171" },
  { key: "humidity",  title: "Humedad",          code: "V8",  unit: "%",     color: "#22d3ee" },
];

/* ─── UMBRALES DE CALIDAD ────────────────────────────────────────────────── */
interface QualityBand {
  label: string; colorHex: string; bgClass: string;
  icon: React.ReactNode; score: number;
}
const getQuality = (key: string, value: number): QualityBand => {
  const th: Record<string, [number, number, number]> = {
    pm25:     [12,   35,   75],
    pm10:     [20,   50,  100],
    co2:      [800, 1200, 2000],
    noise:    [55,   70,   85],
    tvoc:     [0.1,  0.3,  0.5],
    hcho:     [0.05, 0.1,  0.25],
    radiation:[200,  600, 1000],
  };
  const t = th[key];
  if (!t) return { label: "—", colorHex: T.muted, bgClass: "", icon: null, score: -1 };
  if (value < t[0]) return { label: "Buena",     colorHex: "#22c55e", bgClass: "good",     icon: <FaSmile />, score: 0 };
  if (value < t[1]) return { label: "Moderada",  colorHex: "#facc15", bgClass: "moderate", icon: <FaMeh />,   score: 1 };
  if (value < t[2]) return { label: "Mala",      colorHex: "#fb923c", bgClass: "poor",     icon: <FaFrown />, score: 2 };
  return               { label: "Peligrosa",  colorHex: "#ef4444", bgClass: "danger",   icon: <FaFrown />, score: 3 };
};

/* ─── AQI GLOBAL ─────────────────────────────────────────────────────────── */
const getGlobalAQI = (data: SensorData) => {
  const keys  = ["pm25", "pm10", "co2", "tvoc", "hcho", "noise"];
  const scores = keys.map(k => getQuality(k, data[k] ?? 0).score).filter(s => s >= 0);
  if (!scores.length) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg < 0.5) return { label: "Buena",     hex: "#22c55e", pct: 92 };
  if (avg < 1.2) return { label: "Moderada",  hex: "#facc15", pct: 62 };
  if (avg < 2.0) return { label: "Mala",      hex: "#fb923c", pct: 35 };
  return               { label: "Peligrosa",  hex: "#ef4444", pct: 12 };
};

/* ─── EXPORT CSV ─────────────────────────────────────────────────────────── */
const exportCSV = (history: any[], title: string, unit: string) => {
  const rows = [["Fecha", `Valor (${unit})`], ...history.map(h => [h.fecha, h.valor])];
  const csv  = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${title.replace(/\s/g, "_")}.csv`; a.click();
  URL.revokeObjectURL(url);
};

/* ─── TOOLTIP CUSTOM ─────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: "10px 14px",
      fontFamily: T.fontM, fontSize: 12,
    }}>
      <p style={{ color: T.muted, marginBottom: 4 }}>{label}</p>
      <p style={{ color: T.accent, fontWeight: 700, margin: 0 }}>
        {Number(payload[0].value).toFixed(3)}{" "}
        <span style={{ color: T.muted, fontWeight: 400 }}>{unit}</span>
      </p>
    </div>
  );
};

/* ══════════════════════ COMPONENTE PRINCIPAL ═══════════════════════════════ */
const Calidad = ({ estacion }: Props) => {
  const { isOpen, openModal, closeModal } = useModal();

  const [data,        setData]        = useState<SensorData>({});
  const [prevData,    setPrevData]    = useState<SensorData>({});
  const [history,     setHistory]     = useState<any[]>([]);
  const [stats,       setStats]       = useState<any>(null);
  const [selected,    setSelected]    = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdate,  setLastUpdate]  = useState<Date | null>(null);
  const [alerts,      setAlerts]      = useState<AlertMap>({});
  const [modalTab,    setModalTab]    = useState<"chart" | "table" | "info">("chart");
  const [histLoading, setHistLoading] = useState(false);
  const [filterKey,   setFilterKey]   = useState("all");
  const [chartType,   setChartType]   = useState<"area" | "line">("area");

  /* Google Fonts */
  useEffect(() => {
    if (!document.querySelector('link[href*="DM+Sans"]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600;700&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  /* Fetch actual */
  const fetchData = useCallback(async () => {
    try {
      const reqs = SENSORES.map(s =>
        axios.get(`https://api.helsy.com.co/api/previewDetailCharts/${estacion.id}/${s.code}`)
      );
      const res = await Promise.all(reqs);
      const values: SensorData = {};
      res.forEach((r, i) => {
        const m = r.data?.[0]?.lectura?.match(/([\d.]+)/);
        values[SENSORES[i].key] = m ? parseFloat(m[0]) : 0;
      });
      setPrevData(data);
      setData(values);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [data, estacion.id]);

  /* Fetch histórico */
  const fetchHistory = async (sensorCode: string) => {
    setHistLoading(true);
    setHistory([]);
    setStats(null);
    try {
      const res = await axios.get(
        `https://api.helsy.com.co/api/previewDetailCharts/${estacion.id}/${sensorCode}`
      );
      const formatted = res.data.map((i: any) => {
        const m = i.lectura?.match(/([\d.]+)/);
        return {
          fecha: (i.fecha || i.created_at || "").slice(11, 16),
          valor: m ? parseFloat(m[0]) : 0,
        };
      });
      setHistory(formatted);
      const vals = formatted.map((d: any) => d.valor);
      if (vals.length) {
        const min = Math.min(...vals), max = Math.max(...vals);
        const avg = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
        const std = Math.sqrt(vals.reduce((s: number, v: number) => s + (v - avg) ** 2, 0) / vals.length);
        setStats({ min, max, avg, std, n: vals.length });
      }
    } catch {
      setHistory([]); setStats(null);
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, [fetchData]);

  const toggleAlert = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const aqi = useMemo(() => getGlobalAQI(data), [data]);

  const filtered = filterKey === "all"
    ? SENSORES
    : SENSORES.filter(s => {
        const q = getQuality(s.key, data[s.key] ?? 0);
        if (filterKey === "alerts") return alerts[s.key] && q.score >= 2;
        return q.bgClass === filterKey;
      });

  const timeSince = lastUpdate
    ? `${Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s`
    : "—";

  /* ─── CSS INYECTADO ─────────────────────────────────────────────────────── */
  const css = `
    .cal-wrap *{box-sizing:border-box;margin:0;padding:0}
    .cal-wrap{font-family:'DM Sans',sans-serif;background:${T.dark};min-height:100vh;padding:28px;color:${T.text}}
    .cal-card{background:${T.card};border:1px solid ${T.surBdr};border-radius:18px;padding:18px 20px;cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s;position:relative;overflow:hidden}
    .cal-card:hover{transform:translateY(-3px);border-color:${T.border};box-shadow:0 14px 36px rgba(0,0,0,.45)}
    .pill{display:inline-flex;align-items:center;gap:5px;border-radius:8px;padding:4px 10px;font-size:11px;font-family:'DM Mono',monospace;font-weight:700}
    .tab-btn{background:transparent;border:1px solid ${T.surBdr};color:${T.muted};border-radius:8px;padding:6px 13px;font-size:12px;font-family:'DM Mono',monospace;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:5px}
    .tab-btn.active{background:rgba(132,204,22,.12);border-color:rgba(132,204,22,.35);color:${T.accent}}
    .tab-btn:hover:not(.active){background:${T.surface};color:${T.text}}
    .flt-btn{background:transparent;border:1px solid ${T.surBdr};color:${T.muted};border-radius:20px;padding:5px 14px;font-size:11px;font-family:'DM Mono',monospace;cursor:pointer;transition:all .15s}
    .flt-btn.active{border-color:${T.accent};color:${T.accent};background:rgba(132,204,22,.08)}
    .stat-cell{background:${T.surface};border:1px solid ${T.surBdr};border-radius:10px;padding:10px 14px}
    .ico-btn{background:transparent;border:1px solid ${T.surBdr};border-radius:8px;padding:6px 9px;cursor:pointer;color:${T.muted};transition:all .15s;display:inline-flex;align-items:center}
    .ico-btn:hover{background:${T.surface};color:${T.text};border-color:rgba(255,255,255,.15)}
    .modal-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px}
    .modal-bx{background:${T.card};border:1px solid ${T.border};border-radius:22px;width:100%;max-width:800px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.6)}
    .blink{animation:blk 2s steps(1) infinite}
    @keyframes blk{0%,100%{opacity:1}50%{opacity:.25}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{animation:spin 1.4s linear infinite}
    .cal-scroll::-webkit-scrollbar{width:4px}
    .cal-scroll::-webkit-scrollbar-thumb{background:rgba(132,204,22,.3);border-radius:99px}
    .aqi-track{background:rgba(255,255,255,.06);border-radius:99px;height:6px;overflow:hidden}
    .aqi-fill{height:100%;border-radius:99px;transition:width .8s cubic-bezier(.4,0,.2,1)}
  `;

  /* ══ RENDER ══════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{css}</style>
      <div className="cal-wrap cal-scroll">

        {/* ── HEADER ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16, marginBottom:28 }}>
          <div>
            <p style={{ fontSize:10, fontFamily:T.fontM, color:T.accent, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:4 }}>
              Monitoreo ambiental
            </p>
            <h1 style={{ fontSize:26, fontWeight:700, color:T.text, letterSpacing:"-0.02em", marginBottom:6 }}>
              {estacion.nombre}
            </h1>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:T.accent, display:"inline-block" }} className="blink" />
              <span style={{ fontSize:11, fontFamily:T.fontM, color:T.muted }}>
                En vivo · actualizado hace {timeSince}
              </span>
            </div>
          </div>

          {/* AQI Global badge */}
          {aqi && !loading && (
            <div style={{ background:T.surface, border:`1px solid ${T.surBdr}`, borderRadius:16, padding:"14px 20px", minWidth:190 }}>
              <p style={{ fontSize:10, fontFamily:T.fontM, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>
                Índice de calidad global
              </p>
              <p style={{ fontSize:22, fontWeight:700, fontFamily:T.fontM, color:aqi.hex, marginBottom:8 }}>{aqi.label}</p>
              <div className="aqi-track">
                <div className="aqi-fill" style={{ width:`${aqi.pct}%`, background:aqi.hex }} />
              </div>
            </div>
          )}
        </div>

        {/* ── BARRA DE FILTROS ── */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
          {[
            { k:"all",      label:"Todos" },
            { k:"good",     label:"Buena",   icon: <FaCheck style={{fontSize:11}} /> },
            { k:"moderate", label:"Moderada" },
            { k:"poor",     label:"Mala",    icon: <FaArrowUp style={{fontSize:11}} /> },
            { k:"danger",   label:"Peligrosa", icon: <FaExclamationTriangle style={{fontSize:11}} /> },
            { k:"alerts",   label:"Alertas", icon: <FaBell style={{fontSize:11}} /> },
          ].map(f => (
            <button key={f.k} className={`flt-btn ${filterKey===f.k?"active":""}`} onClick={() => setFilterKey(f.k)}>
              {f.icon}{f.icon ? "\u00A0" : ""}{f.label}
            </button>
          ))}
          <button className="ico-btn" onClick={fetchData} title="Actualizar ahora" style={{ marginLeft:"auto" }}>
            <FaSync style={{ fontSize:13 }} />
          </button>
        </div>

        {/* ── LOADING ── */}
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:260, gap:12 }}>
            <MdAir style={{ fontSize:44, color:T.accent }} className="spin" />
            <span style={{ fontFamily:T.fontM, color:T.muted, fontSize:13 }}>Obteniendo lecturas del sensor…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:60, color:T.dim, fontFamily:T.fontM, fontSize:13 }}>
            No hay sensores con el filtro "{filterKey}"
          </div>
        ) : (

          /* ── GRID DE CARDS ── */
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 }}>
            {filtered.map(sensor => {
              const current   = data[sensor.key] ?? 0;
              const prev      = prevData[sensor.key] ?? 0;
              const diff      = current - prev;
              const q         = getQuality(sensor.key, current);
              const hasAlert  = alerts[sensor.key];
              const alertFired = hasAlert && q.score >= 2;

              return (
                <div
                  key={sensor.key}
                  className="cal-card"
                  style={{ borderLeft: `3px solid ${q.score >= 0 ? q.colorHex : T.surBdr}` }}
                  onClick={() => {
                    setSelected({ sensor, current, diff, quality: q });
                    setModalTab("chart");
                    fetchHistory(sensor.code);
                    openModal();
                  }}
                >
                  {/* Toggle alerta */}
                  <button
                    className="ico-btn"
                    style={{ position:"absolute", top:12, right:12, padding:"4px 6px", color: hasAlert ? T.warn : T.dim, borderColor:"transparent" }}
                    onClick={e => toggleAlert(sensor.key, e)}
                    title={hasAlert ? "Desactivar alerta" : "Activar alerta"}
                  >
                    {hasAlert ? <FaBell style={{ fontSize:12 }} /> : <FaBellSlash style={{ fontSize:12 }} />}
                  </button>

                  {/* Icono + nombre */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    {ICONS[sensor.key]}
                    <div>
                      <p style={{ fontSize:10, fontFamily:T.fontM, color:T.dim, letterSpacing:"0.08em", textTransform:"uppercase" }}>{sensor.code}</p>
                      <h3 style={{ fontSize:13, fontWeight:700, color:T.text }}>{sensor.title}</h3>
                    </div>
                  </div>

                  {/* Valor */}
                  <div style={{ fontFamily:T.fontM, fontSize:26, fontWeight:700, color:sensor.color, lineHeight:1, marginBottom:6 }}>
                    {current.toFixed(current < 10 ? 3 : 2)}
                    <span style={{ fontSize:12, fontWeight:400, color:T.muted, marginLeft:5 }}>{sensor.unit}</span>
                  </div>

                  {/* Delta */}
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
                    <span style={{ color: diff > 0 ? T.up : T.down, fontSize:12, fontFamily:T.fontM, display:"flex", alignItems:"center", gap:3 }}>
                      {diff > 0 ? <FaArrowUp style={{ fontSize:10 }} /> : <FaArrowDown style={{ fontSize:10 }} />}
                      {Math.abs(diff).toFixed(3)}
                    </span>
                    <span style={{ fontSize:11, color:T.dim, fontFamily:T.fontM }}>vs anterior</span>
                  </div>

                  {/* Calidad pill */}
                  {q.score >= 0 && (
                    <span className="pill" style={{ background:`${q.colorHex}18`, color:q.colorHex, border:`1px solid ${q.colorHex}40` }}>
                      {q.icon && <span style={{ fontSize:10 }}>{q.icon}</span>}
                      {q.label}
                    </span>
                  )}

                  {/* Alerta disparada */}
                  {alertFired && (
                    <div style={{ marginTop:8, fontSize:10, fontFamily:LOCAL.fontM, color:LOCAL.warn, background:"rgba(250,204,21,0.08)", border:"1px solid rgba(250,204,21,0.2)", borderRadius:6, padding:"3px 8px" }}>
                      <FaExclamationTriangle style={{fontSize:10, marginRight:4}} />Umbral superado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ MODAL ══════════════════════════════════════════════════════════ */}
        {isOpen && selected && (
          <div className="modal-ov" onClick={closeModal}>
            <div className="modal-bx cal-scroll" onClick={e => e.stopPropagation()}>

              {/* Header modal */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 24px", borderBottom:`1px solid ${T.surBdr}`, flexWrap:"wrap", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  {ICONS[selected.sensor.key]}
                  <div>
                    <p style={{ fontSize:10, fontFamily:T.fontM, color:T.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:2 }}>
                      {selected.sensor.code} · {selected.sensor.unit}
                    </p>
                    <h3 style={{ fontSize:20, fontWeight:700, color:T.text }}>{selected.sensor.title}</h3>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="ico-btn" onClick={() => exportCSV(history, selected.sensor.title, selected.sensor.unit)} title="Exportar CSV">
                    <FaDownload style={{ fontSize:13 }} />
                  </button>
                  <button className="ico-btn" onClick={() => setChartType(p => p==="area"?"line":"area")} title="Cambiar tipo de gráfico">
                    <FaChartLine style={{ fontSize:13 }} />
                  </button>
                  <button className="ico-btn" onClick={closeModal}>
                    <FaTimes style={{ fontSize:13 }} />
                  </button>
                </div>
              </div>

              <div style={{ padding:"20px 24px" }}>

                {/* Valor grande + calidad */}
                <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap", marginBottom:18 }}>
                  <div style={{ fontFamily:T.fontM, fontSize:44, fontWeight:700, color:selected.sensor.color, lineHeight:1 }}>
                    {selected.current.toFixed(selected.current < 10 ? 3 : 2)}
                    <span style={{ fontSize:16, fontWeight:400, color:T.muted, marginLeft:6 }}>{selected.sensor.unit}</span>
                  </div>
                  {selected.quality.score >= 0 && (
                    <span className="pill" style={{ fontSize:13, padding:"6px 14px", background:`${selected.quality.colorHex}18`, color:selected.quality.colorHex, border:`1px solid ${selected.quality.colorHex}40` }}>
                      {selected.quality.icon && <span>{selected.quality.icon}</span>}
                      {selected.quality.label}
                    </span>
                  )}
                </div>

                {/* Stats rápidos */}
                {stats && (
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:18 }}>
                    {[
                      { label:"Mín",    value: stats.min.toFixed(3), color:"#22c55e" },
                      { label:"Máx",    value: stats.max.toFixed(3), color:"#ef4444" },
                      { label:"Prom",   value: stats.avg.toFixed(3), color:T.accent  },
                      { label:"Desv.",  value: stats.std.toFixed(3), color:T.info    },
                      { label:"N",      value: String(stats.n),       color:T.muted   },
                    ].map(s => (
                      <div key={s.label} className="stat-cell" style={{ textAlign:"center", flex:"1 1 80px" }}>
                        <p style={{ fontSize:9, fontFamily:T.fontM, color:T.dim, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:2 }}>{s.label}</p>
                        <p style={{ fontSize:15, fontWeight:700, fontFamily:T.fontM, color:s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabs */}
                <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                  {(["chart","table","info"] as const).map(tab => (
                    <button key={tab} className={`tab-btn ${modalTab===tab?"active":""}`} onClick={() => setModalTab(tab)}>
                      {tab==="chart" && <><FaChartLine />Gráfico</>}
                      {tab==="table" && <><FaTable />Tabla</>}
                      {tab==="info"  && <><FaInfoCircle />Info</>}
                    </button>
                  ))}
                </div>

                {/* ─ Tab GRÁFICO ─ */}
                {modalTab === "chart" && (
                  histLoading ? (
                    <div style={{ height:280, display:"flex", alignItems:"center", justifyContent:"center", color:T.muted, fontFamily:T.fontM, fontSize:13, gap:10 }}>
                      <MdAir style={{ fontSize:24, color:T.accent }} className="spin" /> Cargando historial…
                    </div>
                  ) : (
                    <div style={{ height:280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === "area" ? (
                          <AreaChart data={history}>
                            <defs>
                              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={selected.sensor.color} stopOpacity={0.28} />
                                <stop offset="95%" stopColor={selected.sensor.color} stopOpacity={0}    />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={T.surBdr} />
                            <XAxis dataKey="fecha" tick={{ fontSize:10, fill:T.dim, fontFamily:T.fontM }} />
                            <YAxis tick={{ fontSize:10, fill:T.dim, fontFamily:T.fontM }} />
                            <Tooltip content={<CustomTooltip unit={selected.sensor.unit} />} />
                            {stats && (
                              <ReferenceLine y={stats.avg} stroke={T.accent} strokeDasharray="4 4"
                                label={{ value:"Prom", fill:T.accent, fontSize:10, fontFamily:T.fontM }} />
                            )}
                            <Area type="monotone" dataKey="valor" stroke={selected.sensor.color} strokeWidth={2} fill="url(#grad)" dot={false} />
                          </AreaChart>
                        ) : (
                          <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke={T.surBdr} />
                            <XAxis dataKey="fecha" tick={{ fontSize:10, fill:T.dim, fontFamily:T.fontM }} />
                            <YAxis tick={{ fontSize:10, fill:T.dim, fontFamily:T.fontM }} />
                            <Tooltip content={<CustomTooltip unit={selected.sensor.unit} />} />
                            {stats && <ReferenceLine y={stats.avg} stroke={T.accent} strokeDasharray="4 4" />}
                            <Line type="monotone" dataKey="valor" stroke={selected.sensor.color} strokeWidth={2} dot={false} />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )
                )}

                {/* ─ Tab TABLA ─ */}
                {modalTab === "table" && (
                  <div style={{ maxHeight:300, overflowY:"auto" }} className="cal-scroll">
                    <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ background:T.surface }}>
                          {["#","Hora","Valor","Estado"].map(h => (
                            <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontFamily:T.fontM, color:T.muted, fontSize:10, letterSpacing:"0.08em", borderBottom:`1px solid ${T.surBdr}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((row, i) => {
                          const q = getQuality(selected.sensor.key, row.valor);
                          return (
                            <tr key={i} style={{ borderBottom:`1px solid ${T.surBdr}` }}>
                              <td style={{ padding:"7px 12px", fontFamily:T.fontM, color:T.dim, fontSize:11 }}>{i+1}</td>
                              <td style={{ padding:"7px 12px", fontFamily:T.fontM, color:T.muted }}>{row.fecha}</td>
                              <td style={{ padding:"7px 12px", fontFamily:T.fontM, fontWeight:700, color:selected.sensor.color }}>
                                {row.valor.toFixed(3)}{" "}
                                <span style={{ color:T.dim, fontWeight:400 }}>{selected.sensor.unit}</span>
                              </td>
                              <td style={{ padding:"7px 12px" }}>
                                {q.score >= 0 && (
                                  <span className="pill" style={{ fontSize:10, padding:"2px 8px", background:`${q.colorHex}18`, color:q.colorHex, border:`1px solid ${q.colorHex}30` }}>
                                    {q.label}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ─ Tab INFO ─ */}
                {modalTab === "info" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {[
                      { label:"Variable",         value: selected.sensor.title },
                      { label:"Código sensor",     value: selected.sensor.code },
                      { label:"Unidad",            value: selected.sensor.unit },
                      { label:"Estación",          value: estacion.nombre },
                      { label:"ID estación",       value: String(estacion.id) },
                      { label:"Última lectura",    value: lastUpdate?.toLocaleTimeString("es-CO") ?? "—" },
                      {
                        label:"Umbrales de calidad",
                        value: ({
                          pm25:     "Buena <12 · Moderada 12-35 · Mala 35-75 · Peligrosa >75 µg/m³",
                          pm10:     "Buena <20 · Moderada 20-50 · Mala 50-100 · Peligrosa >100 µg/m³",
                          co2:      "Buena <800 · Moderada 800-1200 · Mala 1200-2000 · Peligrosa >2000 ppm",
                          noise:    "Buena <55 · Moderada 55-70 · Mala 70-85 · Peligrosa >85 dB",
                          tvoc:     "Buena <0.1 · Moderada 0.1-0.3 · Mala 0.3-0.5 · Peligrosa >0.5 mg/m³",
                          hcho:     "Buena <0.05 · Moderada 0.05-0.1 · Mala 0.1-0.25 · Peligrosa >0.25 mg/m³",
                          radiation:"Baja <200 · Media 200-600 · Alta 600-1000 · Muy alta >1000 W/m²",
                        } as Record<string,string>)[selected.sensor.key] ?? "Sin umbrales definidos",
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="stat-cell" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                        <span style={{ fontSize:11, fontFamily:T.fontM, color:T.dim, textTransform:"uppercase", letterSpacing:"0.08em", flexShrink:0 }}>{label}</span>
                        <span style={{ fontSize:12, fontFamily:T.fontM, color:T.text, textAlign:"right" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Calidad;