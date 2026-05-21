// src/components/charts/highcharts/MonthlyTarget.tsx
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { WiStrongWind } from "react-icons/wi";
import ApiHelsy from "../../../service/ApiHelsy";

interface Lectura { id: number; lectura: string; hora: string; fecha: string }
type Props = { estacion: number };

/* ─── Speed category ─────────────────────────────────────────────── */
const getWindCategory = (kmh: number) => {
  if (kmh < 1)   return { label: "Calma",       color: "#22c55e" };
  if (kmh < 20)  return { label: "Brisa suave",  color: "#84cc16" };
  if (kmh < 40)  return { label: "Moderado",     color: "#f59e0b" };
  if (kmh < 60)  return { label: "Fuerte",       color: "#f97316" };
  return              { label: "Muy fuerte",    color: "#ef4444" };
};

/* ─── Shimmer ────────────────────────────────────────────────────── */
const RadialSkeleton = () => (
  <div style={{
    width: 200, height: 200, borderRadius: "50%",
    margin: "0 auto",
    background: "conic-gradient(#f0f0f0 0deg, #e8e8e8 180deg, #f0f0f0 360deg)",
    animation: "wt-pulse 1.6s ease-in-out infinite",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{ width: 130, height: 130, borderRadius: "50%", background: "#fff" }}
      className="dark:bg-slate-900" />
    <style>{`@keyframes wt-pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
  </div>
);

/* ─── MonthlyTarget ──────────────────────────────────────────────── */
const MonthlyTarget = ({ estacion }: Props) => {
  const [windSpeed, setWindSpeed] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [isDark, setIsDark]       = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  /* Detect dark mode via class observer */
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ApiHelsy.get<Lectura[]>(`previewDetailCharts/${estacion}/V4`);
        const data = res.data;
        if (data.length > 0) {
          const raw = data[data.length - 1];
          setWindSpeed(parseFloat(raw.lectura.replace(/[^\d.]/g, "")));
          setLastUpdate(raw.hora);
        }
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [estacion]);

  const windKmH    = windSpeed * 3.6;
  const category   = getWindCategory(windKmH);
  const pct        = Math.min((windKmH / 100) * 100, 100);

  const options: ApexOptions = {
    chart: {
      type: "radialBar", sparkline: { enabled: true },
      background: "transparent",
      animations: { enabled: true, speed: 600 },
    },
    colors: [category.color],
    plotOptions: {
      radialBar: {
        hollow: { size: "62%" },
        track: {
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "1.7rem", fontWeight: 800, offsetY: 8,
            color: isDark ? "#f1f5f9" : "#111827",
            fontFamily: "'JetBrains Mono', monospace",
            formatter: () => `${windKmH.toFixed(1)}`,
          },
        },
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Velocidad"],
    theme: { mode: isDark ? "dark" : "light" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .wt-card {
          font-family: 'Outfit', sans-serif;
          background: #ffffff; border: 1.5px solid #f0f0f0;
          border-radius: 18px; padding: 24px;
          display: flex; flex-direction: column;
          height: 100%;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }
        .dark .wt-card {
          background: #0a1628; border-color: #1e293b;
          box-shadow: 0 2px 24px rgba(0,0,0,0.25);
        }
      `}</style>

      <div className="wt-card">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: "#eff6ff", color: "#3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(59,130,246,0.15)",
          }}>
            <WiStrongWind size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}
              className="dark:text-slate-700">
              Anemómetro · V4
            </p>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}
              className="dark:text-white">
              Velocidad del Viento
            </h3>
          </div>
        </div>

        {/* Chart area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {loading ? (
            <RadialSkeleton />
          ) : (
            <>
              <div style={{ width: "100%" }}>
                <Chart options={options} series={[pct]} type="radialBar" height={230} />
              </div>

              {/* Unit label below value */}
              <p style={{ margin: "-16px 0 0", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "#9ca3af", textAlign: "center" }}
                className="dark:text-slate-700">
                km/h
              </p>

              {/* Category badge */}
              <span style={{
                marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 14px", borderRadius: 99,
                background: `${category.color}15`,
                border: `1.5px solid ${category.color}35`,
                color: category.color,
                fontSize: 12, fontWeight: 700, fontFamily: "'Outfit',sans-serif",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: category.color,
                  boxShadow: `0 0 8px ${category.color}80`,
                  animation: "wt-blink 2s ease-in-out infinite",
                }} />
                {category.label}
                <style>{`@keyframes wt-blink{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
              </span>
            </>
          )}
        </div>

        {/* Stats row */}
        {!loading && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 8, marginTop: 18,
            paddingTop: 16, borderTop: "1px solid #f0f0f0",
          }} className="dark:border-slate-800">
            {[
              { label: "m/s",    value: windSpeed.toFixed(2) },
              { label: "km/h",   value: windKmH.toFixed(1) },
            ].map(s => (
              <div key={s.label} style={{
                padding: "8px 12px", borderRadius: 10,
                background: "#f9fafb", border: "1.5px solid #f0f0f0",
                textAlign: "center",
              }} className="dark:bg-slate-900 dark:border-slate-800">
                <span style={{ display: "block", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af" }}
                  className="dark:text-slate-700">
                  {s.label}
                </span>
                <span style={{ display: "block", fontSize: 18, fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: "#111827", marginTop: 2 }}
                  className="dark:text-white">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && lastUpdate && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "#9ca3af" }}
              className="dark:text-slate-700">
              Última lectura: {lastUpdate}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default MonthlyTarget;