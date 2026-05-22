import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VARIABLES } from "../../data/mockData";
import toast from "react-hot-toast";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// ─── Types ────────────────────────────────────────────────────────────────────
interface VariableAmbiental {
  id: number;
  lectura: string;
  hora: string;
  fecha: string;
}

interface EnvironmentalChartProps {
  data: VariableAmbiental[];
  code: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  // Dark
  dark: {
    card: "rgba(10,20,28,0.92)",
    border: "rgba(132,204,22,0.15)",
    surface: "rgba(255,255,255,0.03)",
    surfaceBorder: "rgba(255,255,255,0.07)",
    text: "#e2f0f7",
    textMuted: "#8ba3b0",
    textDim: "#3d5a68",
    grid: "rgba(255,255,255,0.05)",
    scrollbar: "rgba(132,204,22,0.25)",
    itemActive: "rgba(132,204,22,0.07)",
    itemActiveBorder: "rgba(132,204,22,0.2)",
    itemHover: "rgba(255,255,255,0.04)",
  },
  // Light
  light: {
    card: "rgba(255,255,255,0.97)",
    border: "rgba(132,204,22,0.25)",
    surface: "rgba(248,252,245,0.9)",
    surfaceBorder: "rgba(132,204,22,0.12)",
    text: "#0f1f0a",
    textMuted: "#4a6b3d",
    textDim: "#8aac7a",
    grid: "rgba(0,0,0,0.05)",
    scrollbar: "rgba(132,204,22,0.4)",
    itemActive: "rgba(132,204,22,0.1)",
    itemActiveBorder: "rgba(132,204,22,0.3)",
    itemHover: "rgba(132,204,22,0.05)",
  },
  accent: "#84cc16",
  up: "#ef4444",
  down: "#22c55e",
  first: "#38bdf8",
  fontSans: "'DM Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    case "V5": return "°C";
    case "V8": return "%";
    case "V9": return "bar";
    case "V3": case "V4": return "km/h";
    case "V6": case "V7": return "mm";
    case "V2": case "V1": return "m";
    case "V10": return "W/m²";
    case "V13": case "V12": case "V15": case "V16": return "µg/m³";
    default: return "";
  }
};

const getVariableName = (codigo: string): string => {
  switch (codigo) {
    case "V5": return "Temperatura";
    case "V8": return "Humedad relativa";
    case "V9": return "Presión atmosférica";
    case "V3": return "Vel. viento prom.";
    case "V4": return "Vel. viento max.";
    case "V6": return "Precipitación";
    case "V7": return "Precipitación 24h";
    case "V2": return "Nivel del agua";
    case "V1": return "Distancia";
    case "V10": return "Radiación solar";
    case "V13": case "V12": case "V15": case "V16": return "Calidad del aire";
    default: return "Variable ambiental";
  }
};

// ─── Trend indicator ──────────────────────────────────────────────────────────
const TrendIcon: React.FC<{ direction: "up" | "down" | "neutral" }> = ({ direction }) => {
  const color = direction === "up" ? T.up : direction === "down" ? T.down : T.first;
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      {direction === "up" && <path d="M5 1L9 7H1L5 1Z" fill={color} />}
      {direction === "down" && <path d="M5 9L1 3H9L5 9Z" fill={color} />}
      {direction === "neutral" && <circle cx="5" cy="5" r="3" fill={color} />}
    </svg>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const EnvironmentalChart: React.FC<EnvironmentalChartProps> = ({ data, code }) => {
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

  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const handleExportCSV = () => {
    setExportLoading("csv");
    try {
      if (data.length === 0) {
        toast.error("No hay datos para exportar");
        setExportLoading(null);
        return;
      }
      const headers = ["Fecha", "Hora", "Lectura (Raw)"];
      const csvContent = [
        headers.join(","),
        ...data.map(r => `${r.fecha},${r.hora},${r.lectura}`)
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_TiempoReal_${code}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exportado a CSV`);
    } catch (e) {
      toast.error("Error al exportar");
    }
    setExportLoading(null);
  };

  const handleExportPDF = () => {
    setExportLoading("pdf");
    try {
      if (data.length === 0) {
        toast.error("No hay datos para exportar");
        setExportLoading(null);
        return;
      }
      const doc = new jsPDF();
      doc.text(`Reporte de Tiempo Real - Variable: ${code}`, 14, 15);
      autoTable(doc, {
        startY: 25,
        head: [["Fecha", "Hora", "Lectura (Raw)"]],
        body: data.map(r => [r.fecha, r.hora, r.lectura]),
      });
      doc.save(`Reporte_TiempoReal_${code}.pdf`);
      toast.success(`Exportado a PDF`);
    } catch (e) {
      toast.error("Error al exportar");
    }
    setExportLoading(null);
  };

  // Load fonts
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

  const pointColors = valores.map((v, i) => {
    if (i === 0) return T.first;
    return v > valores[i - 1] ? T.up : T.down;
  });

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
  const filteredColors = pointColors.filter((_, i) => activeIndexes.includes(i));

  // Stats
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const avg = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  const last = valores[valores.length - 1];
  const prev = valores[valores.length - 2];
  const trend: "up" | "down" | "neutral" =
    last > prev ? "up" : last < prev ? "down" : "neutral";

  const variableDef = VARIABLES.find(v => v.id === code || v.name.toLowerCase().includes(varName.toLowerCase()) || (code === "V1" && v.id === "V10"));
  const threshold = variableDef?.threshold || (max * 0.8);
  const critical = variableDef?.critical || (max * 0.95);

  const chartData: ChartData<"line"> = {
    labels: filteredHoras,
    datasets: [
      {
        label: `${varName} (${unidad})`,
        data: filteredValues,
        borderColor: T.accent,
        backgroundColor: isDark ? "rgba(132,204,22,0.07)" : "rgba(132,204,22,0.08)",
        tension: 0.4,
        pointRadius: filteredValues.length > 80 ? 0 : 4,
        pointHoverRadius: 7,
        pointBackgroundColor: filteredColors,
        pointBorderColor: isDark ? "rgba(10,20,28,0.8)" : "rgba(255,255,255,0.9)",
        pointBorderWidth: 1.5,
        borderWidth: 2,
        fill: { target: "origin", above: isDark ? "rgba(132,204,22,0.06)" : "rgba(132,204,22,0.07)" },
      },
      {
        label: "Umbral preventivo",
        data: Array(filteredHoras.length).fill(threshold),
        borderColor: "#f59e0b",
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Umbral crítico",
        data: Array(filteredHoras.length).fill(critical),
        borderColor: "#ef4444",
        borderDash: [4, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
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
          label: (ctx) => {
            if (ctx.dataset.label === "Umbral preventivo" || ctx.dataset.label === "Umbral crítico") {
              return `  ${ctx.dataset.label}: ${ctx.parsed.y} ${unidad}`;
            }
            return `  ${varName}: ${ctx.parsed.y} ${unidad}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme.textDim,
          font: { family: T.fontMono, size: 10 },
          maxTicksLimit: 10,
          maxRotation: 45,
          autoSkip: true,
        },
        grid: { color: theme.grid, drawTicks: false },
        border: { color: "transparent" },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: theme.textMuted,
          font: { family: T.fontMono, size: 10 },
          callback: (v) => `${Number(v).toFixed(1)} ${unidad}`,
          maxTicksLimit: 6,
        },
        grid: { color: theme.grid, drawTicks: false },
        border: { color: "transparent" },
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
          alignItems: "flex-start",
          justifyContent: "space-between",
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
            Variable ambiental · {code}
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
        
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={handleExportCSV} disabled={exportLoading !== null} style={{
            background: theme.surface, border: `1px solid ${theme.surfaceBorder}`, borderRadius: 8, padding: "6px 12px", color: theme.text, fontSize: 12, cursor: "pointer", fontFamily: T.fontMono
          }}>
            {exportLoading === "csv" ? "..." : "CSV"}
          </button>
          <button onClick={handleExportPDF} disabled={exportLoading !== null} style={{
            background: theme.surface, border: `1px solid ${theme.surfaceBorder}`, borderRadius: 8, padding: "6px 12px", color: theme.text, fontSize: 12, cursor: "pointer", fontFamily: T.fontMono
          }}>
            {exportLoading === "pdf" ? "..." : "PDF"}
          </button>
        </div>

        {/* Current reading badge */}
        {last !== undefined && (
          <div
            style={{
              background: isDark ? T.dark.itemActive : T.light.itemActive,
              border: `1px solid ${isDark ? T.dark.itemActiveBorder : T.light.itemActiveBorder}`,
              borderRadius: 12,
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <TrendIcon direction={trend} />
            <span
              style={{
                fontFamily: T.fontMono,
                fontSize: 20,
                fontWeight: 700,
                color: T.accent,
                lineHeight: 1,
              }}
            >
              {last}
            </span>
            <span style={{ fontSize: 12, color: theme.textMuted, fontFamily: T.fontMono }}>{unidad}</span>
          </div>
        )}
      </div>

      {/* ── Stat pills ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[
          { label: "Mín", value: min.toFixed(2), color: T.first },
          { label: "Máx", value: max.toFixed(2), color: T.up },
          { label: "Prom", value: avg.toFixed(2), color: T.accent },
          { label: "N", value: String(valores.length), color: theme.textMuted },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: 8,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontFamily: T.fontMono,
                color: theme.textMuted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: 13,
                fontFamily: T.fontMono,
                fontWeight: 700,
                color,
              }}
            >
              {value}
            </span>
            {label !== "N" && (
              <span style={{ fontSize: 10, color: theme.textDim, fontFamily: T.fontMono }}>{unidad}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Main layout: chart + legend ── */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* Chart */}
        <div style={{ flex: "1 1 400px", height: 300, minWidth: 0 }}>
          <Line data={chartData} options={options} />
        </div>

        {/* Legend panel */}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontFamily: T.fontMono,
                color: T.accent,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
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

          {/* Color legend */}
          <div
            style={{
              display: "flex",
              gap: 8,
              paddingBottom: 8,
              borderBottom: `1px solid ${theme.surfaceBorder}`,
              fontSize: 10,
              fontFamily: T.fontMono,
              color: theme.textMuted,
              flexWrap: "wrap",
            }}
          >
            {[
              { color: T.first, label: "Inicial" },
              { color: T.up, label: "Sube" },
              { color: T.down, label: "Baja" },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {label}
              </span>
            ))}
          </div>

          {/* Scrollable list */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: 240,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 3,
              scrollbarWidth: "thin",
            }}
          >
            {horas.map((hora, index) => {
              const active = activeIndexes.includes(index);
              const color = pointColors[index];
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
                    transition: "all 0.15s ease",
                    background: active
                      ? isDark ? T.dark.itemActive : T.light.itemActive
                      : "transparent",
                    border: `1px solid ${active
                      ? isDark ? T.dark.itemActiveBorder : T.light.itemActiveBorder
                      : "transparent"}`,
                    opacity: active ? 1 : 0.35,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                        boxShadow: active ? `0 0 6px ${color}80` : "none",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: T.fontMono,
                        color: active ? theme.text : theme.textMuted,
                      }}
                    >
                      {hora}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: T.fontMono,
                      fontWeight: 700,
                      color: active ? color : theme.textDim,
                    }}
                  >
                    {valores[index]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 16, borderTop: `1px solid ${theme.surfaceBorder}`, paddingTop: 12 }}>
        <p style={{ margin: 0, fontSize: 11, fontFamily: T.fontMono, color: theme.textMuted }}>
          Fuente: IDEAM / CodeChocó — Datos en Tiempo Real
        </p>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.accent}40; border-radius: 99px; }
      `}</style>
    </div>
  );
};

export default EnvironmentalChart;