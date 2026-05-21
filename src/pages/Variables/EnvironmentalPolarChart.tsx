import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

// ─── Types ────────────────────────────────────────────────────────────────────
interface VariableAmbiental {
  id: number;
  lectura: string;
  hora: string;
  fecha: string;
}

interface EnvironmentalPolarChartProps {
  data: VariableAmbiental[];
  code: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  dark: {
    card: "rgba(10,20,28,0.92)",
    border: "rgba(132,204,22,0.15)",
    surface: "rgba(255,255,255,0.03)",
    surfaceBorder: "rgba(255,255,255,0.07)",
    text: "#e2f0f7",
    textMuted: "#8ba3b0",
    textDim: "#3d5a68",
    grid: "rgba(255,255,255,0.08)",
    itemActive: "rgba(132,204,22,0.07)",
    itemActiveBorder: "rgba(132,204,22,0.2)",
  },
  light: {
    card: "rgba(255,255,255,0.97)",
    border: "rgba(132,204,22,0.25)",
    surface: "rgba(248,252,245,0.9)",
    surfaceBorder: "rgba(132,204,22,0.12)",
    text: "#0f1f0a",
    textMuted: "#4a6b3d",
    textDim: "#8aac7a",
    grid: "rgba(0,0,0,0.07)",
    itemActive: "rgba(132,204,22,0.1)",
    itemActiveBorder: "rgba(132,204,22,0.3)",
  },
  accent: "#84cc16",
  up: "#ef4444",
  down: "#22c55e",
  first: "#38bdf8",
  fontSans: "'DM Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
};

// ─── Helpers (identical to EnvironmentalChart) ────────────────────────────────
const formatearLectura = (lectura: string, codigo: string): number | null => {
  const regex = new RegExp(`(\\d+(\\.\\d+)?)(?=${codigo})`);
  const match = lectura.match(regex);
  const valorStr = match ? match[1] : null;
  if (!valorStr) return null;
  const num = parseFloat(valorStr);
  if (isNaN(num)) return null;
  switch (codigo) {
    case "V5": return parseFloat(num.toFixed(1));
    case "V8": return Math.round(num);
    case "V9": return valorStr.length > 5 ? num / 100000 : parseFloat(`0.${valorStr.padStart(5, "0")}`);
    case "V3": case "V4": case "V6": case "V7": return parseFloat(num.toFixed(1));
    case "V2": case "V1": return parseFloat(num.toFixed(2));
    case "V10": return parseFloat(num.toFixed(1));
    case "V13": case "V12": case "V15": case "V16": return parseFloat(num.toFixed(3));
    default: return num;
  }
};

const getUnidad = (codigo: string): string => {
  switch (codigo) {
    case "V5": return "°C"; case "V8": return "%"; case "V9": return "bar";
    case "V3": case "V4": return "km/h"; case "V6": case "V7": return "mm";
    case "V2": case "V1": return "m"; case "V10": return "W/m²";
    case "V13": case "V12": case "V15": case "V16": return "µg/m³";
    default: return "";
  }
};

const getVariableName = (codigo: string): string => {
  switch (codigo) {
    case "V5": return "Temperatura"; case "V8": return "Humedad relativa";
    case "V9": return "Presión atmosférica"; case "V3": return "Vel. viento prom.";
    case "V4": return "Vel. viento max."; case "V6": return "Precipitación";
    case "V7": return "Precipitación 24h"; case "V2": return "Nivel del agua";
    case "V1": return "Distancia"; case "V10": return "Radiación solar";
    case "V13": case "V12": case "V15": case "V16": return "Calidad del aire";
    default: return "Variable ambiental";
  }
};

// Polar color palette — 7 distinct accented hues matching the dark system
const POLAR_PALETTE = [
  "rgba(132,204,22,0.72)",
  "rgba(56,189,248,0.72)",
  "rgba(251,113,133,0.72)",
  "rgba(251,191,36,0.72)",
  "rgba(167,139,250,0.72)",
  "rgba(52,211,153,0.72)",
  "rgba(251,146,60,0.72)",
];
const POLAR_PALETTE_BORDER = [
  "rgba(132,204,22,1)",
  "rgba(56,189,248,1)",
  "rgba(251,113,133,1)",
  "rgba(251,191,36,1)",
  "rgba(167,139,250,1)",
  "rgba(52,211,153,1)",
  "rgba(251,146,60,1)",
];

// ─── Main Component ────────────────────────────────────────────────────────────
const EnvironmentalPolarChart: React.FC<EnvironmentalPolarChartProps> = ({ data, code }) => {
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!document.querySelector('link[href*="DM+Sans"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const theme = isDark ? T.dark : T.light;

  const valores = data.map((item) => formatearLectura(item.lectura, code)).filter(v => v !== null) as number[];
  const horas = data.map((item) => item.hora);
  const unidad = getUnidad(code);
  const varName = getVariableName(code);

  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
  useEffect(() => {
    if (valores.length > 0) {
      setActiveIndexes(Array.from({ length: valores.length }, (_, i) => i));
    }
  }, [valores.length]);

  const toggleIndex = (index: number) => {
    setActiveIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  const filteredValues = valores.filter((_, i) => activeIndexes.includes(i));
  const filteredHoras = horas.filter((_, i) => activeIndexes.includes(i));
  const filteredBg = filteredHoras.map((_, i) => POLAR_PALETTE[i % POLAR_PALETTE.length]);
  const filteredBorder = filteredHoras.map((_, i) => POLAR_PALETTE_BORDER[i % POLAR_PALETTE_BORDER.length]);

  // Stats
  const avg = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const maxHour = max > -Infinity ? horas[valores.indexOf(max)] : "--";

  const chartData: ChartData<"polarArea"> = {
    labels: filteredHoras,
    datasets: [
      {
        label: `${varName} (${unidad})`,
        data: filteredValues,
        backgroundColor: filteredBg,
        borderColor: filteredBorder,
        borderWidth: 1.5,
      },
    ],
  };

  const options: ChartOptions<"polarArea"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "rgba(8,16,22,0.97)" : "rgba(255,255,255,0.97)",
        titleColor: T.accent,
        bodyColor: theme.textMuted,
        borderColor: isDark ? "rgba(132,204,22,0.3)" : "rgba(132,204,22,0.4)",
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        titleFont: { family: T.fontMono, size: 11 },
        bodyFont: { family: T.fontSans, size: 12 },
        callbacks: {
          label: (ctx) => `  ${ctx.label}: ${ctx.raw} ${unidad}`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          color: theme.textDim,
          font: { family: T.fontMono, size: 9 },
          backdropColor: "transparent",
          callback: (v) => `${v}`,
        },
        grid: {
          color: theme.grid,
        },
        angleLines: {
          color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
        },
        pointLabels: {
          display: false,
        },
      },
    },
  };

  return (
    <div
      style={{
        background: theme.card,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: "24px",
        boxShadow: isDark
          ? "0 8px 40px rgba(0,0,0,0.45)"
          : "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        fontFamily: T.fontSans,
        width: "100%",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 10,
              fontFamily: T.fontMono,
              color: T.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Distribución radial · {code}
          </p>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: theme.text,
              letterSpacing: "-0.02em",
            }}
          >
            {varName}
          </h3>
        </div>

        {/* Pico badge */}
        <div
          style={{
            background: theme.itemActive,
            border: `1px solid ${theme.itemActiveBorder}`,
            borderRadius: 12,
            padding: "8px 14px",
            flexShrink: 0,
          }}
        >
          <p style={{ margin: "0 0 2px", fontSize: 9, fontFamily: T.fontMono, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pico</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: T.fontMono, color: T.accent, lineHeight: 1 }}>
            {max.toFixed(2)}
            <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: theme.textMuted, fontFamily: T.fontMono }}>{unidad}</span>
          </p>
          <p style={{ margin: 0, fontSize: 10, fontFamily: T.fontMono, color: theme.textDim }}>{maxHour}</p>
        </div>
      </div>

      {/* ── Stats pills ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[
          { label: "Mín", value: min.toFixed(2) },
          { label: "Máx", value: max.toFixed(2) },
          { label: "Prom", value: avg.toFixed(2) },
          { label: "N", value: String(valores.length) },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: 8,
              padding: "5px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 10, fontFamily: T.fontMono, color: theme.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
            <span style={{ fontSize: 13, fontFamily: T.fontMono, fontWeight: 700, color: T.accent }}>{value}</span>
            {label !== "N" && <span style={{ fontSize: 10, color: theme.textDim, fontFamily: T.fontMono }}>{unidad}</span>}
          </div>
        ))}
      </div>

      {/* ── Main layout: polar + legend ── */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Chart */}
        <div style={{ flex: "1 1 300px", height: 320 }}>
          <PolarArea data={chartData} options={options} />
        </div>

        {/* Legend */}
        <div
          style={{
            flex: "0 0 220px",
            background: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: 14,
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 10, fontFamily: T.fontMono, color: T.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Lecturas
            </p>
            <span
              style={{
                fontSize: 10,
                fontFamily: T.fontMono,
                color: theme.textMuted,
                background: theme.surface,
                border: `1px solid ${theme.surfaceBorder}`,
                borderRadius: 6,
                padding: "1px 7px",
              }}
            >
              {activeIndexes.length}/{valores.length}
            </span>
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: 280,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              scrollbarWidth: "thin",
            }}
          >
            {horas.map((hora, index) => {
              const active = activeIndexes.includes(index);
              const color = POLAR_PALETTE_BORDER[index % POLAR_PALETTE_BORDER.length];
              return (
                <li
                  key={index}
                  onClick={() => toggleIndex(index)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: 8,
                    padding: "6px 8px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: active ? theme.itemActive : "transparent",
                    border: `1px solid ${active ? theme.itemActiveBorder : "transparent"}`,
                    opacity: active ? 1 : 0.35,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: color,
                        flexShrink: 0,
                        boxShadow: active ? `0 0 6px ${color}80` : "none",
                      }}
                    />
                    <span style={{ fontSize: 11, fontFamily: T.fontMono, color: active ? theme.text : theme.textMuted }}>
                      {hora}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: T.fontMono, fontWeight: 700, color: active ? color : theme.textDim }}>
                    {valores[index]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.accent}40; border-radius: 99px; }
      `}</style>
    </div>
  );
};

export default EnvironmentalPolarChart;