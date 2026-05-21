import { useMemo, useEffect, useRef } from "react";
import { MOCK_PREDICTIONS } from "../../data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PredictionPoint {
  hoursFromNow: number;
  level: number;
  confidence: number;
}

interface PredictionDataset {
  station: string;
  timestamp: string;
  predictions: PredictionPoint[];
}

// ─── Mock historical data (last 12h before now) ──────────────────────────────

const HISTORICAL_HOURS = 12;

function generateHistorical(currentLevel: number): { hour: number; level: number }[] {
  const points = [];
  let level = currentLevel - 1.2;
  for (let h = -HISTORICAL_HOURS; h <= 0; h++) {
    level += (Math.random() - 0.42) * 0.28;
    level = Math.max(1.5, Math.min(8.5, level));
    points.push({ hour: h, level: parseFloat(level.toFixed(2)) });
  }
  return points;
}

// ─── Confidence label ─────────────────────────────────────────────────────────

function confidenceLabel(c: number) {
  if (c >= 80) return { text: "Alta", color: "text-green-600 dark:text-green-400" };
  if (c >= 60) return { text: "Media", color: "text-amber-600 dark:text-amber-400" };
  return { text: "Baja", color: "text-red-500 dark:text-red-400" };
}

// ─── Chart component ──────────────────────────────────────────────────────────

export const PredictionPanel = () => {
  const data = useMemo(() => MOCK_PREDICTIONS[0] as PredictionDataset, []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const historical = useMemo(
    () => generateHistorical(data.predictions[0]?.level ?? 4.2),
    [data]
  );

  const criticalThreshold = 5.0;
  const warningThreshold = 4.0;

  // Final predicted level & trend
  const lastPrediction = data.predictions[data.predictions.length - 1];
  const firstPrediction = data.predictions[0];
  const peakLevel = Math.max(...data.predictions.map((p) => p.level));
  const avgConfidence = Math.round(
    data.predictions.reduce((s, p) => s + p.confidence, 0) / data.predictions.length
  );
  const cl = confidenceLabel(avgConfidence);

  const isCritical = peakLevel >= criticalThreshold;
  const isWarning = peakLevel >= warningThreshold && peakLevel < criticalThreshold;

  // Build chart labels: historical hours + forecast hours
  const allHours = [
    ...historical.map((h) => h.hour),
    ...data.predictions.map((p) => p.hoursFromNow),
  ];
  const allLabels = allHours.map((h) =>
    h < 0 ? `${h}h` : h === 0 ? "Ahora" : `+${h}h`
  );

  // Historical data series (null for forecast positions)
  const historicalSeries = [
    ...historical.map((h) => h.level),
    ...data.predictions.map(() => null),
  ];

  // Forecast series (null for historical positions)
  const forecastSeries = [
    ...historical.map((_, i) => (i === historical.length - 1 ? historical[historical.length - 1].level : null)),
    ...data.predictions.map((p) => p.level),
  ];

  // Confidence band (upper/lower)
  const confidenceUpper = [
    ...historical.map(() => null),
    ...data.predictions.map((p) => {
      const margin = (1 - p.confidence / 100) * 1.8;
      return parseFloat((p.level + margin).toFixed(2));
    }),
  ];
  const confidenceLower = [
    ...historical.map(() => null),
    ...data.predictions.map((p) => {
      const margin = (1 - p.confidence / 100) * 1.8;
      return parseFloat(Math.max(0, p.level - margin).toFixed(2));
    }),
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamically load Chart.js
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => {
      const Chart = (window as any).Chart;
      if (!Chart || !canvasRef.current) return;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      const textColor = isDark ? "#9ca3af" : "#6b7280";

      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: allLabels,
          datasets: [
            // Confidence band upper (fill to lower)
            {
              label: "Confianza superior",
              data: confidenceUpper,
              borderWidth: 0,
              pointRadius: 0,
              fill: "+1",
              backgroundColor: "rgba(59,130,246,0.10)",
              tension: 0.4,
            },
            // Confidence band lower
            {
              label: "Confianza inferior",
              data: confidenceLower,
              borderWidth: 0,
              pointRadius: 0,
              fill: false,
              backgroundColor: "transparent",
              tension: 0.4,
            },
            // Historical
            {
              label: "Histórico",
              data: historicalSeries,
              borderColor: isDark ? "#60a5fa" : "#3b82f6",
              backgroundColor: "transparent",
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.4,
              spanGaps: false,
            },
            // Forecast
            {
              label: "Predicción IA",
              data: forecastSeries,
              borderColor: isDark ? "#f59e0b" : "#d97706",
              backgroundColor: "transparent",
              borderWidth: 2,
              borderDash: [5, 3],
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.4,
              spanGaps: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: isDark ? "#374151" : "#e5e7eb",
              borderWidth: 1,
              titleColor: isDark ? "#f9fafb" : "#111827",
              bodyColor: isDark ? "#d1d5db" : "#374151",
              padding: 10,
              callbacks: {
                label(ctx: any) {
                  if (ctx.raw === null) return null;
                  const label = ctx.dataset.label;
                  if (label?.includes("Confianza")) return null;
                  return `${label}: ${ctx.raw.toFixed(2)} m`;
                },
              },
            },
            annotation: undefined,
          },
          scales: {
            x: {
              grid: { color: gridColor, drawBorder: false },
              ticks: {
                color: textColor,
                font: { size: 11, family: "ui-monospace, monospace" },
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              min: 0,
              max: Math.max(peakLevel + 1.5, criticalThreshold + 1),
              grid: { color: gridColor, drawBorder: false },
              ticks: {
                color: textColor,
                font: { size: 11, family: "ui-monospace, monospace" },
                callback: (v: number) => `${v.toFixed(1)}m`,
              },
            },
          },
        },
        plugins: [
          {
            id: "thresholdLines",
            afterDraw(chart: any) {
              const { ctx, chartArea, scales } = chart;
              const { left, right } = chartArea;

              const drawLine = (yVal: number, color: string, label: string) => {
                const yPx = scales.y.getPixelForValue(yVal);
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash([4, 3]);
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.moveTo(left, yPx);
                ctx.lineTo(right, yPx);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = color;
                ctx.font = "9px ui-monospace, monospace";
                ctx.textAlign = "right";
                ctx.fillText(label, right - 4, yPx - 4);
                ctx.restore();
              };

              drawLine(criticalThreshold, "#ef4444", `Crítico ${criticalThreshold}m`);
              drawLine(warningThreshold, "#f59e0b", `Preventivo ${warningThreshold}m`);

              // "Now" vertical line
              const nowIdx = historical.length;
              const xPx = scales.x.getPixelForValue(nowIdx);
              const { top, bottom } = chartArea;
              ctx.save();
              ctx.beginPath();
              ctx.setLineDash([3, 3]);
              ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
              ctx.lineWidth = 1;
              ctx.moveTo(xPx, top);
              ctx.lineTo(xPx, bottom);
              ctx.stroke();
              ctx.fillStyle = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
              ctx.font = "9px ui-monospace, monospace";
              ctx.textAlign = "center";
              ctx.fillText("Ahora", xPx, top + 8);
              ctx.restore();
            },
          },
        ],
      });
    };

    document.head.appendChild(script);
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Station metadata */}
      <div className="flex items-center justify-between text-xs font-mono text-gray-400 dark:text-gray-500">
        <span>Estación: {data.station}</span>
        <span>Actualizado: {new Date(data.timestamp).toLocaleTimeString("es-CO")}</span>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill
          label="Nivel pico previsto"
          value={`${peakLevel.toFixed(2)} m`}
          color={isCritical ? "red" : isWarning ? "amber" : "green"}
        />
        <StatPill
          label="Confianza promedio"
          value={`${avgConfidence}%`}
          colorClass={cl.color}
        />
        <StatPill
          label="Tendencia 24h"
          value={lastPrediction.level > firstPrediction.level ? "Ascenso" : "Descenso"}
          color={lastPrediction.level > firstPrediction.level ? "red" : "green"}
        />
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: 280 }}>
        <canvas ref={canvasRef} role="img" aria-label="Gráfica de predicción de nivel — AtratoCentinela AI" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
        <LegendItem color="#3b82f6" dashed={false} label="Histórico" />
        <LegendItem color="#d97706" dashed label="Predicción IA" />
        <LegendItem color="rgba(59,130,246,0.3)" dashed={false} label="Banda de confianza" />
        <div className="ml-auto flex items-center gap-1">
          <span className="w-3 h-px bg-red-400 inline-block" />
          <span>Umbral crítico: {criticalThreshold}m</span>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  color,
  colorClass,
}: {
  label: string;
  value: string;
  color?: "red" | "amber" | "green";
  colorClass?: string;
}) {
  const colorMap = {
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-green-600 dark:text-green-400",
  };
  const textClass = colorClass ?? (color ? colorMap[color] : "text-gray-700 dark:text-gray-300");

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
      <p className="text-[10px] lg:text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-tight">{label}</p>
      <p className={`text-base lg:text-lg font-mono font-bold mt-1 ${textClass}`}>{value}</p>
    </div>
  );
}

function LegendItem({ color, dashed, label }: { color: string; dashed: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        style={{
          width: 20,
          height: 2,
          background: color,
          display: "inline-block",
          borderTop: dashed ? `2px dashed ${color}` : undefined,
          background: dashed ? "transparent" : color,
        }}
      />
      {label}
    </span>
  );
}