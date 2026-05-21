import React, { useMemo } from "react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DatosPorFecha {
  fecha: string;
  valores: number[];
}

interface Props {
  datosTabla: DatosPorFecha[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  dark: {
    card: "rgba(10,20,28,0.92)",
    border: "rgba(132,204,22,0.15)",
    surface: "rgba(255,255,255,0.03)",
    surfaceBorder: "rgba(255,255,255,0.06)",
    headerBg: "rgba(132,204,22,0.07)",
    headerBorder: "rgba(132,204,22,0.18)",
    rowHover: "rgba(132,204,22,0.05)",
    rowEven: "rgba(255,255,255,0.015)",
    text: "#e2f0f7",
    textMuted: "#8ba3b0",
    textDim: "#3d5a68",
    cellBorder: "rgba(255,255,255,0.04)",
  },
  light: {
    card: "rgba(255,255,255,0.97)",
    border: "rgba(132,204,22,0.25)",
    surface: "rgba(248,252,245,0.9)",
    surfaceBorder: "rgba(132,204,22,0.12)",
    headerBg: "rgba(132,204,22,0.08)",
    headerBorder: "rgba(132,204,22,0.2)",
    rowHover: "rgba(132,204,22,0.04)",
    rowEven: "rgba(0,0,0,0.015)",
    text: "#0f1f0a",
    textMuted: "#4a6b3d",
    textDim: "#8aac7a",
    cellBorder: "rgba(0,0,0,0.05)",
  },
  accent: "#84cc16",
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#38bdf8",
  fontSans: "'DM Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
};

// ─── Stats functions ──────────────────────────────────────────────────────────
const promedio = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const varianza = (v: number[]) => { const p = promedio(v); return promedio(v.map(x => (x - p) ** 2)); };
const desviacion = (v: number[]) => Math.sqrt(varianza(v));
const mediana = (v: number[]) => { const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const moda = (v: number[]) => { const freq: Record<number, number> = {}; v.forEach(x => (freq[x] = (freq[x] || 0) + 1)); return Number(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]); };
const rango = (v: number[]) => Math.max(...v) - Math.min(...v);
const coefVariacion = (v: number[]) => desviacion(v) / promedio(v);
const percentil = (v: number[], p: number) => { const s = [...v].sort((a, b) => a - b); const i = (p / 100) * (s.length - 1); const lo = Math.floor(i); const hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const asimetria = (v: number[]) => { const p = promedio(v); const sd = desviacion(v); return promedio(v.map(x => ((x - p) / sd) ** 3)); };
const curtosis = (v: number[]) => { const p = promedio(v); const sd = desviacion(v); return promedio(v.map(x => ((x - p) / sd) ** 4)) - 3; };
const errorEstandar = (v: number[]) => desviacion(v) / Math.sqrt(v.length);

const regresionLineal = (v: number[]) => {
  const n = v.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const xMean = promedio(x);
  const yMean = promedio(v);
  const num = x.reduce((sum, xi, i) => sum + (xi - xMean) * (v[i] - yMean), 0);
  const den = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);
  const pendiente = num / den;
  const intercepto = yMean - pendiente * xMean;
  return { pendiente, prediccion: pendiente * (n + 1) + intercepto };
};

// ─── Column definitions ───────────────────────────────────────────────────────
const COLUMNS = [
  { key: "fecha",     label: "Fecha",  width: 96,  mono: false, accent: false },
  { key: "n",         label: "N",      width: 44,  mono: true,  accent: false },
  { key: "min",       label: "Mín",    width: 60,  mono: true,  accent: false, color: "#38bdf8" },
  { key: "max",       label: "Máx",    width: 60,  mono: true,  accent: false, color: "#ef4444" },
  { key: "rango",     label: "Rango",  width: 60,  mono: true,  accent: false },
  { key: "promedio",  label: "Prom",   width: 64,  mono: true,  accent: false, color: "#84cc16" },
  { key: "desviacion",label: "Desv",   width: 60,  mono: true,  accent: false },
  { key: "cv",        label: "CV",     width: 52,  mono: true,  accent: false },
  { key: "varianza",  label: "Var",    width: 60,  mono: true,  accent: false },
  { key: "mediana",   label: "Med",    width: 60,  mono: true,  accent: false },
  { key: "p25",       label: "P25",    width: 56,  mono: true,  accent: false },
  { key: "p75",       label: "P75",    width: 56,  mono: true,  accent: false },
  { key: "moda",      label: "Moda",   width: 60,  mono: true,  accent: false },
  { key: "asimetria", label: "Asim",   width: 56,  mono: true,  accent: false },
  { key: "curtosis",  label: "Curt",   width: 56,  mono: true,  accent: false },
  { key: "error",     label: "EE",     width: 52,  mono: true,  accent: false },
  { key: "tendencia", label: "Pend",   width: 60,  mono: true,  accent: false },
  { key: "prediccion",label: "Pred",   width: 68,  mono: true,  accent: true },
];

// Trend arrow for pendiente column
const TrendArrow: React.FC<{ value: number }> = ({ value }) => {
  //@ts-ignore
  const color = value > 0 ? T.positive : value < 0 ? T.negative : T.neutral;
  return (
    <span style={{ marginLeft: 4, fontSize: 9 }}>
      {value > 0 ? "▲" : value < 0 ? "▼" : "—"}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const TablaEstadisticaLecturas: React.FC<Props> = ({ datosTabla }) => {
  const [isDark, setIsDark] = React.useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!document.querySelector('link[href*="DM+Sans"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const theme = isDark ? T.dark : T.light;

  const filas = useMemo(() =>
    datosTabla
      .map(({ fecha, valores }) => {
        if (!valores.length) return null;
        const { pendiente, prediccion } = regresionLineal(valores);
        return {
          fecha,
          n: valores.length,
          min: Math.min(...valores),
          max: Math.max(...valores),
          rango: rango(valores),
          promedio: promedio(valores),
          desviacion: desviacion(valores),
          cv: coefVariacion(valores),
          varianza: varianza(valores),
          mediana: mediana(valores),
          p25: percentil(valores, 25),
          p75: percentil(valores, 75),
          moda: moda(valores),
          asimetria: asimetria(valores),
          curtosis: curtosis(valores),
          error: errorEstandar(valores),
          tendencia: pendiente,
          prediccion,
        };
      })
      .filter(Boolean),
    [datosTabla]
  );

  const fmt = (v: number, key: string): string => {
    if (key === "n") return String(v);
    if (key === "tendencia") return v.toFixed(3);
    if (["cv", "asimetria", "curtosis"].includes(key)) return v.toFixed(2);
    if (["p25", "p75", "moda"].includes(key)) return v.toFixed(2);
    return v.toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
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
            Análisis estadístico · Regresión lineal
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
            Tabla estadística de lecturas
          </h3>
        </div>

        {/* Row count badge */}
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: 10,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, fontFamily: T.fontMono, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Fechas</span>
          <span style={{ fontSize: 16, fontFamily: T.fontMono, fontWeight: 700, color: T.accent }}>{filas.length}</span>
        </div>
      </div>

      {/* ── Legend ── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
          fontSize: 10,
          fontFamily: T.fontMono,
        }}
      >
        {[
          { color: "#38bdf8", label: "Mínimo" },
          { color: "#ef4444", label: "Máximo" },
          { color: T.accent, label: "Promedio" },
          { color: T.positive, label: "Tendencia ▲" },
          { color: T.negative, label: "Tendencia ▼" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, color: theme.textMuted }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block", flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>

      {/* ── Table ── */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: 14,
          border: `1px solid ${theme.surfaceBorder}`,
          scrollbarWidth: "thin",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: T.fontMono,
            fontSize: 11,
            minWidth: 1100,
          }}
        >
          <thead>
            <tr
              style={{
                background: theme.headerBg,
                borderBottom: `1px solid ${theme.headerBorder}`,
              }}
            >
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "10px 8px",
                    textAlign: col.key === "fecha" ? "left" : "right",
                    whiteSpace: "nowrap",
                    fontFamily: T.fontMono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: col.accent ? T.accent : theme.textMuted,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    width: col.width,
                    minWidth: col.width,
                    borderRight: `1px solid ${theme.cellBorder}`,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filas.map((f: any, rowIdx) => {
              const isHovered = hoveredRow === f.fecha;
              const isEven = rowIdx % 2 === 0;
              return (
                <tr
                  key={f.fecha}
                  onMouseEnter={() => setHoveredRow(f.fecha)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: isHovered
                      ? theme.rowHover
                      : isEven
                      ? theme.rowEven
                      : "transparent",
                    borderBottom: `1px solid ${theme.cellBorder}`,
                    transition: "background 0.12s ease",
                  }}
                >
                  {COLUMNS.map((col) => {
                    const val = f[col.key];
                    const isNum = typeof val === "number";

                    let color: string | undefined;
                    if (col.color) color = col.color;
                    if (col.accent) color = T.accent;
                    if (col.key === "tendencia" && isNum) {
                      color = val > 0 ? T.positive : val < 0 ? T.negative : T.neutral;
                    }

                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: "8px 8px",
                          textAlign: col.key === "fecha" ? "left" : "right",
                          fontFamily: col.mono ? T.fontMono : T.fontSans,
                          fontSize: col.key === "fecha" ? 11 : 11,
                          color: color ?? theme.text,
                          fontWeight: col.accent ? 700 : 400,
                          borderRight: `1px solid ${theme.cellBorder}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.key === "fecha" ? (
                          <span style={{ color: theme.text, fontFamily: T.fontMono, letterSpacing: "0.04em" }}>
                            {val}
                          </span>
                        ) : col.key === "tendencia" ? (
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                            {fmt(val, col.key)}
                            <TrendArrow value={val} />
                          </span>
                        ) : isNum ? (
                          fmt(val, col.key)
                        ) : (
                          val
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <p
        style={{
          marginTop: 14,
          marginBottom: 0,
          fontSize: 10,
          fontFamily: T.fontMono,
          color: theme.textDim,
          letterSpacing: "0.04em",
        }}
      >
        Predicción (Pred) basada en regresión lineal simple. Interpretar con cautela ante estacionalidad o rupturas de serie.
      </p>

      <style>{`
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.accent}40; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.accent}70; }
      `}</style>
    </motion.div>
  );
};

export default TablaEstadisticaLecturas;