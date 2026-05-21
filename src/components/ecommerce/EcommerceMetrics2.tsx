import { FaWind } from "react-icons/fa";
import { WiBarometer } from "react-icons/wi";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { useEffect, useState } from "react";
import ApiHelsy from "../../service/ApiHelsy";

type Props = { estacion: number };

/* ─── Trend badge ─────────────────────────────────────────────────── */
const TrendBadge = ({ diff, unit }: { diff: number | null; unit: string }) => {
  if (diff === null) return null;
  const up = diff >= 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 99,
      background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
      border: `1px solid ${up ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
      color: up ? "#16a34a" : "#ef4444",
      fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
    }}>
      {up ? <AiOutlineArrowUp size={10} /> : <AiOutlineArrowDown size={10} />}
      {up ? "+" : ""}{diff}{unit}
    </span>
  );
};

/* ─── Metric card ─────────────────────────────────────────────────── */
const MetricCard = ({
  icon, iconBg, iconColor, label, sublabel, value, diff, diffUnit, loading,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  label: string; sublabel?: string; value: string | null;
  diff?: number | null; diffUnit?: string; loading: boolean;
}) => (
  <div className="em2-metric-card">
    <div style={{
      width: 42, height: 42, borderRadius: 12, marginBottom: 16,
      background: iconBg, color: iconColor,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 4px 12px ${iconColor}22`,
    }}>
      {icon}
    </div>

    <p style={{
      margin: "0 0 2px",
      fontSize: 11, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace",
    }} className="dark:text-slate-600">
      {label}
    </p>
    {sublabel && (
      <p style={{ margin: "0 0 6px", fontSize: 10, color: "#d1d5db", fontFamily: "'JetBrains Mono', monospace" }}
        className="dark:text-slate-800">
        {sublabel}
      </p>
    )}

    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
      <p style={{
        margin: 0, fontSize: 28, fontWeight: 800,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "-0.02em", color: "#111827", lineHeight: 1,
      }} className="dark:text-white">
        {loading
          ? <span className="em2-shimmer" style={{ width: 90, height: 28, display: "inline-block", borderRadius: 8 }} />
          : value ?? <span style={{ fontSize: 14, color: "#d1d5db" }}>—</span>
        }
      </p>
      {!loading && diff !== undefined && <TrendBadge diff={diff ?? null} unit={diffUnit ?? ""} />}
    </div>

    {!loading && value !== null && (
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 14, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}
        className="dark:border-slate-800">
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)",
          animation: "em2-blink 2s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#9ca3af" }}
          className="dark:text-slate-700">
          Actualización en tiempo real
        </span>
      </div>
    )}
  </div>
);

/* ─── EnvironmentalMetrics2 ───────────────────────────────────────── */
export default function EnvironmentalMetrics2({ estacion }: Props) {
  const [monoxidoData, setMonoxidoData] = useState<string | null>(null);
  const [presionData,  setPresionData]  = useState<string | null>(null);
  const [presionDiff,  setPresionDiff]  = useState<number | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const parseVal = (s: string) => { const m = s.match(/[\d:.]+/); return m ? m[0] : null; };

    const fetchVar = async (variable: string) => {
      const res  = await ApiHelsy.get(`previewDetailCharts/${estacion}/${variable}`);
      const data = res.data;
      if (!Array.isArray(data) || data.length < 2) return;
      const last = parseVal(data[data.length - 1].lectura);
      const prev = parseVal(data[data.length - 2].lectura);
      if (!last || !prev) return;

      if (variable === "V12") {
        setMonoxidoData(last);
      } else if (variable === "V9") {
        const parseP = (v: string) =>
          v.startsWith("9") ? parseFloat(`0.${v}`) : parseFloat(v) / 10000;
        const pLast = parseP(last), pPrev = parseP(prev);
        setPresionData(pLast.toFixed(4));
        setPresionDiff(parseFloat((pLast - pPrev).toFixed(4)));
      }
    };

    const load = async () => {
      setLoading(true);
      await Promise.allSettled([fetchVar("V12"), fetchVar("V9")]);
      setLoading(false);
    };

    load();
    const id = setInterval(() => Promise.allSettled([fetchVar("V12"), fetchVar("V9")]), 30000);
    return () => clearInterval(id);
  }, [estacion]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .em2-metric-card {
          padding: 22px; border-radius: 16px;
          background: #ffffff; border: 1.5px solid #f0f0f0;
          font-family: 'Outfit', sans-serif;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.18s;
        }
        .dark .em2-metric-card { background: #0a1628; border-color: #1e293b; }
        .em2-metric-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.07);
          border-color: #d1fae5; transform: translateY(-2px);
        }
        .dark .em2-metric-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.25);
          border-color: rgba(132,204,22,0.2);
        }
        .em2-shimmer {
          background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
          background-size: 200% 100%; animation: em2-shimmer 1.4s infinite;
        }
        .dark .em2-shimmer { background: linear-gradient(90deg,#1e293b 25%,#0f172a 50%,#1e293b 75%); background-size:200% 100%; }
        @keyframes em2-shimmer { 0%{background-position:200%} 100%{background-position:-200%} }
        @keyframes em2-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .em2-grid {
          display: grid; gap: 16px;
          grid-template-columns: repeat(1,1fr);
        }
        @media(min-width:480px) { .em2-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div className="em2-grid">
        <MetricCard
          icon={<FaWind size={20} />}
          iconBg="#f0fdf4" iconColor="#22c55e"
          label="Monóxido de carbono"
          sublabel="µg/m³"
          value={monoxidoData}
          loading={loading}
        />
        <MetricCard
          icon={<WiBarometer size={26} />}
          iconBg="#faf5ff" iconColor="#a855f7"
          label="Presión barométrica"
          sublabel="bar"
          value={presionData}
          diff={presionDiff}
          diffUnit=" bar"
          loading={loading}
        />
      </div>
    </>
  );
}