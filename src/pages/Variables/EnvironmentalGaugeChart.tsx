import React, { useState, useEffect, useRef } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VariableAmbiental {
  id: number;
  lectura: string;
  hora: string;
  fecha: string;
}

interface EnvironmentalGaugeChartProps {
  data: VariableAmbiental[];
  code: string;
}

// ─── Design tokens (idénticos a EnvironmentalPolarChart) ──────────────────────
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

// ─── Helpers (idénticos a EnvironmentalPolarChart) ────────────────────────────
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

// ─── Gauge config por código ──────────────────────────────────────────────────
interface GaugeZone {
  label: string;
  color: string;
  from: number; // 0–1
  to: number;   // 0–1
}

interface GaugeConfig {
  min: number;
  max: number;
  zones: GaugeZone[];
  ticks: number[]; // valores absolutos para mostrar
}

const getGaugeConfig = (codigo: string): GaugeConfig => {
  switch (codigo) {
    case "V5": // Temperatura °C
      return {
        min: 0, max: 50,
        zones: [
          { label: "FRÍA",   color: "#38bdf8", from: 0,    to: 0.40 },
          { label: "NORMAL", color: "#84cc16", from: 0.40, to: 0.70 },
          { label: "ALTA",   color: "#ef4444", from: 0.70, to: 1    },
        ],
        ticks: [0, 10, 20, 30, 40, 50],
      };
    case "V8": // Humedad %
      return {
        min: 0, max: 100,
        zones: [
          { label: "SECA",   color: "#facc15", from: 0,    to: 0.30 },
          { label: "NORMAL", color: "#84cc16", from: 0.30, to: 0.70 },
          { label: "ALTA",   color: "#38bdf8", from: 0.70, to: 1    },
        ],
        ticks: [0, 25, 50, 75, 100],
      };
    case "V10": // Radiación solar W/m²
      return {
        min: 0, max: 1200,
        zones: [
          { label: "BAJA",  color: "#38bdf8", from: 0,    to: 0.33 },
          { label: "MEDIA", color: "#facc15", from: 0.33, to: 0.66 },
          { label: "ALTA",  color: "#ef4444", from: 0.66, to: 1    },
        ],
        ticks: [0, 300, 600, 900, 1200],
      };
    case "V3": case "V4": // Viento km/h
      return {
        min: 0, max: 120,
        zones: [
          { label: "CALMA",  color: "#84cc16", from: 0,    to: 0.25 },
          { label: "BRISA",  color: "#facc15", from: 0.25, to: 0.60 },
          { label: "FUERTE", color: "#ef4444", from: 0.60, to: 1    },
        ],
        ticks: [0, 30, 60, 90, 120],
      };
    default:
      return {
        min: 0, max: 100,
        zones: [
          { label: "BAJO",  color: "#38bdf8", from: 0,    to: 0.33 },
          { label: "MEDIO", color: "#84cc16", from: 0.33, to: 0.66 },
          { label: "ALTO",  color: "#ef4444", from: 0.66, to: 1    },
        ],
        ticks: [0, 25, 50, 75, 100],
      };
  }
};

// ─── SVG Gauge helpers ────────────────────────────────────────────────────────
const CX = 150;
const CY = 165;
const R  = 115;

/** Convierte un ángulo en grados (0° = izquierda, 180° = derecha, recorrido horario) */
const polarToXY = (angleDeg: number) => {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: CX + R * Math.cos(rad),
    y: CY + R * Math.sin(rad),
  };
};

/** Genera el atributo `d` de un arco semicircular desde pct1 hasta pct2 (0–1) */
const arcPath = (pct1: number, pct2: number): string => {
  const startAngle = pct1 * 180;
  const endAngle   = pct2 * 180;
  const start = polarToXY(startAngle);
  const end   = polarToXY(endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};

// ─── Main Component ────────────────────────────────────────────────────────────
const EnvironmentalGaugeChart: React.FC<EnvironmentalGaugeChartProps> = ({ data, code }) => {
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [animated, setAnimated] = useState(false);
  const gaugeRef = useRef<SVGPathElement>(null);

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

  // Trigger needle animation on mount
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const theme = isDark ? T.dark : T.light;

  const valores = data
    .map((item) => formatearLectura(item.lectura, code))
    .filter((v): v is number => v !== null);
  const horas  = data.map((item) => item.hora);
  const unidad = getUnidad(code);
  const varName = getVariableName(code);
  const cfg     = getGaugeConfig(code);

  // Stats
  const avg     = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  const max     = valores.length ? Math.max(...valores) : 0;
  const min     = valores.length ? Math.min(...valores) : 0;
  const last    = valores.length ? valores[valores.length - 1] : 0;
  const lastHora = horas.length  ? horas[horas.length - 1]    : "--";
  const rango   = parseFloat((max - min).toFixed(3));

  // Tendencia simple (pendiente por mínimos cuadrados)
  let pendiente = 0;
  if (valores.length >= 2) {
    const n  = valores.length;
    const xs = valores.map((_, i) => i);
    const sumX  = xs.reduce((a, b) => a + b, 0);
    const sumY  = valores.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((s, x, i) => s + x * valores[i], 0);
    const sumX2 = xs.reduce((s, x) => s + x * x, 0);
    pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  // Posición del gauge (0–1, clamp)
  const pct = Math.max(0, Math.min(1, (avg - cfg.min) / (cfg.max - cfg.min)));

  // Needle angle: 0% = left (0°), 100% = right (180°)
  const needleAngle = pct * 180;

  // Semicircle total length (π * R)
  const semiLen = Math.PI * R;

  // ─ Zona activa del valor promedio
  const activeZone = cfg.zones.find((z) => pct >= z.from && pct <= z.to) ?? cfg.zones[cfg.zones.length - 1];

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
            Medidor circular · {code}
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

        {/* Valor actual badge */}
        <div
          style={{
            background: theme.itemActive,
            border: `1px solid ${theme.itemActiveBorder}`,
            borderRadius: 12,
            padding: "8px 14px",
            flexShrink: 0,
          }}
        >
          <p style={{ margin: "0 0 2px", fontSize: 9, fontFamily: T.fontMono, color: T.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Actual
          </p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: T.fontMono, color: T.accent, lineHeight: 1 }}>
            {avg.toFixed(2)}
            <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: theme.textMuted, fontFamily: T.fontMono }}>{unidad}</span>
          </p>
          <p style={{ margin: 0, fontSize: 10, fontFamily: T.fontMono, color: theme.textDim }}>Promedio</p>
        </div>
      </div>

      {/* ── Stats pills ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Mín",  value: min.toFixed(2) },
          { label: "Máx",  value: max.toFixed(2) },
          { label: "Prom", value: avg.toFixed(2) },
          { label: "N",    value: String(valores.length) },
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

      {/* ── Gauge SVG ── */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          viewBox="0 0 300 200"
          width="100%"
          style={{ maxWidth: 340, overflow: "visible" }}
        >
          <defs>
            <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={arcPath(0, 1)}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
            strokeWidth={18}
            strokeLinecap="round"
          />

          {/* Zone bands (dim) */}
          {cfg.zones.map((z) => (
            <path
              key={z.label}
              d={arcPath(z.from, z.to)}
              fill="none"
              stroke={z.color}
              strokeWidth={18}
              strokeLinecap="butt"
              opacity={0.18}
            />
          ))}

          {/* Active value arc */}
          <path
            ref={gaugeRef}
            d={arcPath(0, 1)}
            fill="none"
            stroke={activeZone.color}
            strokeWidth={18}
            strokeLinecap="round"
            strokeDasharray={semiLen}
            strokeDashoffset={animated ? semiLen * (1 - pct) : semiLen}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
            filter="url(#gaugeGlow)"
            opacity={0.88}
          />

          {/* Tick marks + labels */}
          {cfg.ticks.map((tickVal) => {
            const tPct = (tickVal - cfg.min) / (cfg.max - cfg.min);
            const tAngle = tPct * 180;
            const radOuter = ((tAngle - 180) * Math.PI) / 180;
            const radInner = radOuter;
            const rOuter = R + 12;
            const rInner = R + 22;
            const xO = CX + rOuter * Math.cos(radOuter);
            const yO = CY + rOuter * Math.sin(radOuter);
            const xI = CX + rInner * Math.cos(radInner);
            const yI = CY + rInner * Math.sin(radInner);
            return (
              <g key={tickVal}>
                <line
                  x1={xO.toFixed(2)} y1={yO.toFixed(2)}
                  x2={xI.toFixed(2)} y2={yI.toFixed(2)}
                  stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                  strokeWidth={1}
                />
                <text
                  x={(CX + (R + 32) * Math.cos(radInner)).toFixed(2)}
                  y={(CY + (R + 32) * Math.sin(radInner) + 3).toFixed(2)}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily={T.fontMono}
                  fill={theme.textDim}
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Zone labels (arc positioned, approximate) */}
          {cfg.zones.map((z) => {
            const midPct = (z.from + z.to) / 2;
            const midAngle = midPct * 180;
            const rad = ((midAngle - 180) * Math.PI) / 180;
            const rLabel = R - 18;
            const xL = CX + rLabel * Math.cos(rad);
            const yL = CY + rLabel * Math.sin(rad);
            return (
              <text
                key={z.label}
                x={xL.toFixed(2)}
                y={(yL + 3).toFixed(2)}
                textAnchor="middle"
                fontSize={8}
                fontFamily={T.fontMono}
                fill={z.color}
                opacity={0.7}
              >
                {z.label}
              </text>
            );
          })}

          {/* Needle */}
          <g
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: `rotate(${animated ? needleAngle - 180 : -180}deg)`,
              transition: "transform 1.2s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <line
              x1={CX} y1={CY}
              x2={CX} y2={CY - R + 8}
              stroke={T.accent}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.9}
            />
          </g>
          {/* Needle pivot */}
          <circle cx={CX} cy={CY} r={7}  fill={T.accent} opacity={0.9} />
          <circle cx={CX} cy={CY} r={3.5} fill={theme.card} />

          {/* Center value */}
          <text
            x={CX} y={CY - 18}
            textAnchor="middle"
            fontSize={28}
            fontWeight={700}
            fontFamily={T.fontMono}
            fill={T.accent}
          >
            {avg.toFixed(2)}
          </text>
          <text
            x={CX} y={CY - 3}
            textAnchor="middle"
            fontSize={10}
            fontFamily={T.fontMono}
            fill={theme.textMuted}
          >
            {unidad} · {varName}
          </text>
        </svg>
      </div>

      {/* ── Info cards ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16, justifyContent: "center" }}>
        {[
          {
            label: "Última lectura",
            value: `${last.toFixed(2)} ${unidad}`,
            sub: lastHora,
          },
          {
            label: "Tendencia",
            value: Math.abs(pendiente).toFixed(3),
            sub: `${unidad}/lectura`,
            color: pendiente >= 0 ? T.up : T.down,
            isTendencia: true,
          },
          {
            label: "Rango",
            value: rango.toFixed(3),
            sub: `${unidad} amplitud`,
          },
        ].map(({ label, value, sub, color, isTendencia }: { label: string; value: string; sub: string; color?: string; isTendencia?: boolean }) => (
          <div
            key={label}
            style={{
              background: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: 10,
              padding: "8px 16px",
              textAlign: "center",
              flex: "1 1 90px",
            }}
          >
            <p style={{ margin: "0 0 2px", fontSize: 9, fontFamily: T.fontMono, color: theme.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {label}
            </p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: T.fontMono, color: color ?? theme.text }}>
              {isTendencia ? <>{pendiente >= 0 ? <FaArrowUp style={{fontSize:11, marginRight:2}} /> : <FaArrowDown style={{fontSize:11, marginRight:2}} />} {value}</> : value}
            </p>
            <p style={{ margin: 0, fontSize: 10, fontFamily: T.fontMono, color: theme.textDim }}>
              {sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnvironmentalGaugeChart;