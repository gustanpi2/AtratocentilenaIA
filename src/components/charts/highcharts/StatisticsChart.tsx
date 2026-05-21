import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ApiHelsy from "../../../service/ApiHelsy";

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

// ─── Types ────────────────────────────────────────────────────────────────────
type ApiDato = { lectura: string; hora: string; fecha: string };
type LluviaDato = { dato: string; hora: string };
type Props = { estacion: number };

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  card: "rgba(10,20,28,0.88)",
  border: "rgba(132,204,22,0.15)",
  accent: "#84cc16",
  accentDim: "rgba(132,204,22,0.18)",
  accentBar: "rgba(132,204,22,0.55)",
  accentBarHover: "rgba(132,204,22,0.85)",
  text: "#e2f0f7",
  textMuted: "#8ba3b0",
  textDim: "#3d5a68",
  gridLine: "rgba(255,255,255,0.05)",
  fontSans: "'DM Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}> = ({ label, value, unit, accent }) => (
  <div
    style={{
      background: accent ? T.accentDim : "rgba(255,255,255,0.03)",
      border: `1px solid ${accent ? "rgba(132,204,22,0.35)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 12,
      padding: "14px 18px",
      flex: 1,
      minWidth: 110,
    }}
  >
    <p
      style={{
        margin: "0 0 4px",
        fontSize: 10,
        fontFamily: T.fontMono,
        color: accent ? T.accent : T.textMuted,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </p>
    <p
      style={{
        margin: 0,
        fontSize: 22,
        fontFamily: T.fontMono,
        fontWeight: 700,
        color: accent ? T.accent : T.text,
        lineHeight: 1,
        textShadow: accent ? "0 0 14px rgba(132,204,22,0.4)" : "none",
      }}
    >
      {value}
      <span
        style={{
          fontSize: 11,
          fontWeight: 400,
          color: accent ? T.accent : T.textMuted,
          marginLeft: 4,
        }}
      >
        {unit}
      </span>
    </p>
  </div>
);

// ─── Loader ───────────────────────────────────────────────────────────────────
const Loader: React.FC = () => (
  <div
    style={{
      height: 320,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}
  >
    <div style={{ position: "relative", width: 44, height: 44 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            border: "1.5px solid #84cc16",
            borderRadius: "50%",
            opacity: 0,
            animation: `ripple 1.8s ease-out ${i * 0.6}s infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 14,
          background: "#84cc16",
          borderRadius: "50%",
          boxShadow: "0 0 16px rgba(132,204,22,0.5)",
        }}
      />
    </div>
    <p
      style={{
        color: T.textMuted,
        fontFamily: T.fontMono,
        fontSize: 12,
        letterSpacing: "0.1em",
        margin: 0,
      }}
    >
      Cargando precipitaciones...
    </p>
    <style>{`@keyframes ripple{0%{opacity:.8;transform:scale(.5)}100%{opacity:0;transform:scale(2)}}`}</style>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RainfallChart({ estacion }: Props) {
  const [datosLluvia, setDatosLluvia] = useState<LluviaDato[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const obtenerDatos = async () => {
      try {
        const res = await ApiHelsy.get<ApiDato[]>(
          `previewDetailCharts/${estacion}/V7`
        );
        const procesado = res.data.map((item) => ({
          dato: item.lectura.replace(/[^\d.]/g, ""),
          hora: item.hora,
        }));
        setDatosLluvia(procesado);
        setLastUpdate(
          new Date().toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch (err) {
        console.error("Error al obtener datos de lluvia:", err);
      } finally {
        setLoading(false);
      }
    };
    obtenerDatos();
    intervalId = setInterval(obtenerDatos, 30000);
    return () => clearInterval(intervalId);
  }, [estacion]);

  // ── Data processing ──────────────────────────────────────────────────────
  const dataValues = datosLluvia.map((d) => parseFloat(d.dato || "0") / 10);
  const categories = datosLluvia.map((d) => d.hora);

  const total = dataValues.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...dataValues, 0);
  const maxHour = maxVal > 0 ? categories[dataValues.indexOf(maxVal)] : "--";
  const avgVal = dataValues.length ? total / dataValues.length : 0;

  // Cumulative line
  const cumulative: number[] = [];
  dataValues.reduce((acc, v, i) => {
    const sum = acc + v;
    cumulative[i] = parseFloat(sum.toFixed(2));
    return sum;
  }, 0);

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = {
    labels: categories,
    datasets: [
      {
        type: "bar" as const,
        label: "Precipitación (mm)",
        data: dataValues,
        backgroundColor: T.accentBar,
        hoverBackgroundColor: T.accentBarHover,
        borderColor: "transparent",
        borderWidth: 0,
        borderRadius: 3,
        borderSkipped: false,
        yAxisID: "y",
        order: 2,
      },
      {
        type: "line" as const,
        label: "Acumulado (mm)",
        data: cumulative,
        borderColor: "rgba(56,189,248,0.9)",
        backgroundColor: "transparent",
        pointBackgroundColor: "rgba(56,189,248,0.9)",
        pointBorderColor: "rgba(56,189,248,0.3)",
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: false,
        tension: 0.35,
        yAxisID: "y2",
        order: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(8,16,22,0.97)",
        titleColor: "#84cc16",
        bodyColor: "#8ba3b0",
        borderColor: "rgba(132,204,22,0.3)",
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        titleFont: { family: "'DM Mono', monospace", size: 11 },
        bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
        callbacks: {
          title: (items: TooltipItem<"bar">[]) =>
            items[0] ? `${items[0].label}` : "",
          label: (item: TooltipItem<"bar">) =>
            item.datasetIndex === 0
              ? `  Lluvia: ${Number(item.parsed.y).toFixed(2)} mm`
              : `  Acumulado: ${Number(item.parsed.y).toFixed(2)} mm`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: T.textDim,
          font: { family: T.fontMono, size: 10 },
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 14,
        },
        grid: { color: T.gridLine, drawTicks: false },
        border: { color: "transparent" },
      },
      y: {
        position: "left",
        beginAtZero: true,
        ticks: {
          color: "#84cc16",
          font: { family: T.fontMono, size: 10 },
          callback: (v) => `${Number(v).toFixed(1)}`,
          maxTicksLimit: 6,
        },
        grid: { color: T.gridLine, drawTicks: false },
        border: { color: "transparent" },
        title: {
          display: true,
          text: "mm / intervalo",
          color: "rgba(132,204,22,0.5)",
          font: { family: T.fontMono, size: 9 },
        },
      },
      y2: {
        position: "right",
        beginAtZero: true,
        ticks: {
          color: "rgba(56,189,248,0.6)",
          font: { family: T.fontMono, size: 10 },
          callback: (v) => `${Number(v).toFixed(1)}`,
          maxTicksLimit: 6,
        },
        grid: { display: false, drawTicks: false },
        border: { color: "transparent" },
        title: {
          display: true,
          text: "mm acumulado",
          color: "rgba(56,189,248,0.4)",
          font: { family: T.fontMono, size: 9 },
        },
      },
    },
  };

  // Load fonts
  useEffect(() => {
    const existing = document.querySelector(
      'link[href*="DM+Sans"]'
    ) as HTMLLinkElement | null;
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div
      style={{
        background: T.card,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        padding: "24px 24px 18px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
        fontFamily: T.fontSans,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative rain lines */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          opacity: 0.03,
          pointerEvents: "none",
        }}
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
      >
        {[20, 50, 80, 110, 140].map((x, i) => (
          <line
            key={x}
            x1={x + i * 2}
            y1="10"
            x2={x - 10 + i * 2}
            y2="170"
            stroke="#84cc16"
            strokeWidth="2"
          />
        ))}
      </svg>

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
              margin: "0 0 5px",
              fontSize: 10,
              fontFamily: T.fontMono,
              color: T.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: T.accent,
                boxShadow: "0 0 8px rgba(132,204,22,0.8)",
                animation: "blink 2s ease-in-out infinite",
              }}
            />
            Monitoreo en tiempo real
          </p>
          <h3
            style={{
              margin: 0,
              fontSize: 19,
              fontWeight: 700,
              color: T.text,
              letterSpacing: "-0.02em",
            }}
          >
            Precipitación — últimas 24 horas
          </h3>
        </div>

        {lastUpdate && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 10,
              fontFamily: T.fontMono,
              color: T.textMuted,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke={T.textDim}
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Actualizado {lastUpdate}
          </div>
        )}
      </div>

      {/* ── Stats row ── */}
      {!loading && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <StatCard
            label="Total acumulado"
            value={total.toFixed(1)}
            unit="mm"
            accent
          />
          <StatCard
            label="Pico máximo"
            value={maxVal.toFixed(1)}
            unit={`mm @ ${maxHour}`}
          />
          <StatCard label="Promedio" value={avgVal.toFixed(2)} unit="mm" />
          <StatCard
            label="Lecturas"
            value={String(dataValues.length)}
            unit="reg."
          />
        </div>
      )}

      {/* ── Chart or loader ── */}
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 10,
              fontSize: 11,
              fontFamily: T.fontMono,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: T.textMuted,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: T.accentBar,
                  display: "inline-block",
                  border: "1px solid rgba(132,204,22,0.4)",
                }}
              />
              Precipitación por intervalo (eje izq.)
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: T.textMuted,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 2,
                  background: "rgba(56,189,248,0.9)",
                  display: "inline-block",
                  borderRadius: 99,
                }}
              />
              Acumulado total (eje der.)
            </span>
          </div>

          {/* Canvas wrapper */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 300,
              overflowX: "auto",
            }}
          >
            <div style={{ minWidth: 600, height: "100%" }}>
              {/* @ts-ignore mixed chart type */}
              <Bar data={chartData} options={options} />
            </div>
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <p
        style={{
          marginTop: 14,
          marginBottom: 0,
          fontSize: 10,
          fontFamily: T.fontMono,
          color: T.textDim,
          textAlign: "center",
          letterSpacing: "0.05em",
        }}
      >
        Datos en tiempo casi real · Actualización automática cada 30 s ·
        Estación #{estacion}
      </p>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}