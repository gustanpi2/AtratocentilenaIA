import { useMemo, useEffect, useRef, useState } from "react";
import { useStationContext, VARIABLE_OPTIONS, STATION_OPTIONS } from "../crisis-center/StationContext";

const HISTORICAL_HOURS = 12;

// ─── Generate historical data ─────────────────────────────────

function generateHistorical(currentLevel: number, volatility = 0.28): { hour: number; level: number }[] {
  const points: { hour: number; level: number }[] = [];
  let level = currentLevel - 1.2;
  for (let h = -HISTORICAL_HOURS; h <= 0; h++) {
    level += (Math.random() - 0.42) * volatility;
    level = Math.max(0.5, Math.min(10, level));
    points.push({ hour: h, level: parseFloat(level.toFixed(2)) });
  }
  return points;
}

// ─── Generate predictions ─────────────────────────────────────

function generatePredictions(baseValue: number, trend: number): { hoursFromNow: number; level: number; confidence: number }[] {
  const predictions: { hoursFromNow: number; level: number; confidence: number }[] = [];
  for (let h = 1; h <= 6; h++) {
    const noise = (Math.random() - 0.5) * 0.3;
    const level = baseValue + trend * h + noise;
    const confidence = Math.max(30, Math.round(90 - h * 7 - Math.random() * 5));
    predictions.push({ hoursFromNow: h, level: parseFloat(level.toFixed(2)), confidence });
  }
  return predictions;
}

// ─── Chart colors per variable ────────────────────────────────

const VAR_COLORS: Record<string, string> = {
  Nivel:         "#2563eb",
  Caudal:        "#0891b2",
  pH:            "#7c3aed",
  Turbiedad:     "#92400e",
  Temperatura:   "#dc2626",
  Precipitacion: "#0284c7",
  Conductividad: "#d97706",
};

const VAR_UNITS: Record<string, string> = {
  Nivel:         "m",
  Caudal:        "m³/s",
  pH:            "pH",
  Turbiedad:     "NTU",
  Temperatura:   "°C",
  Precipitacion: "mm",
  Conductividad: "µS/cm",
};

// ─── Confidence label ─────────────────────────────────────────

function confidenceLabel(c: number) {
  if (c >= 80) return { text: "Alta", color: "text-green-600 dark:text-green-400" };
  if (c >= 60) return { text: "Media", color: "text-amber-600 dark:text-amber-400" };
  return { text: "Baja", color: "text-red-500 dark:text-red-400" };
}

// ─── Component ────────────────────────────────────────────────

export const PredictionPanel = () => {
  const { effectiveStations } = useStationContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const [selectedStationId, setSelectedStationId] = useState(STATION_OPTIONS[0]?.id ?? 0);
  const [selectedVar, setSelectedVar] = useState(VARIABLE_OPTIONS[0]?.id ?? "Nivel");

  const selectedStation = useMemo(
    () => effectiveStations.find((s) => s.id === selectedStationId) ?? effectiveStations[0],
    [selectedStationId, effectiveStations],
  );

  const varMeta = VARIABLE_OPTIONS.find((v) => v.id === selectedVar);
  const unit = VAR_UNITS[selectedVar] ?? varMeta?.unit ?? "";
  const color = VAR_COLORS[selectedVar] ?? "#3b82f6";

  const sensor = selectedStation.sensors.find((s) => s.variable === selectedVar);
  const criticalThreshold = sensor?.critical ?? varMeta?.critical ?? 5;
  const warningThreshold = sensor?.threshold ?? varMeta?.threshold ?? 4;

  const baseValue = useMemo(
    () => (sensor?.threshold ?? 4) * (0.6 + Math.random() * 0.5),
    [selectedStationId, selectedVar],
  );

  const trend = useMemo(() => (Math.random() - 0.35) * 0.3, [selectedStationId, selectedVar]);

  const data = useMemo(
    () => ({
      station: selectedStation.name,
      timestamp: new Date().toISOString(),
      predictions: generatePredictions(baseValue, trend),
    }),
    [selectedStation.name, baseValue, trend],
  );

  const historical = useMemo(
    () => generateHistorical(data.predictions[0]?.level ?? 4),
    [data],
  );

  // Chart data
  const allLabels = useMemo(() => [
    ...historical.map((h) => h.hour),
    ...data.predictions.map((p) => p.hoursFromNow),
  ], [historical, data]);

  const allLabelsFormatted = useMemo(() =>
    allLabels.map((h) => (h < 0 ? `${h}h` : h === 0 ? "Ahora" : `+${h}h`)),
  [allLabels]);

  const historicalSeries = useMemo(() => [
    ...historical.map((h) => h.level),
    ...data.predictions.map(() => null),
  ], [historical, data]);

  const forecastSeries = useMemo(() => [
    ...historical.map((_, i) => (i === historical.length - 1 ? historical[historical.length - 1].level : null)),
    ...data.predictions.map((p) => p.level),
  ], [historical, data]);

  const confidenceUpper = useMemo(() => [
    ...historical.map(() => null),
    ...data.predictions.map((p) => {
      const margin = (1 - p.confidence / 100) * 1.8;
      return parseFloat((p.level + margin).toFixed(2));
    }),
  ], [data]);

  const confidenceLower = useMemo(() => [
    ...historical.map(() => null),
    ...data.predictions.map((p) => {
      const margin = (1 - p.confidence / 100) * 1.8;
      return parseFloat(Math.max(0, p.level - margin).toFixed(2));
    }),
  ], [data]);

  // Stats
  const peakLevel = Math.max(...data.predictions.map((p) => p.level));
  const avgConfidence = Math.round(
    data.predictions.reduce((s, p) => s + p.confidence, 0) / data.predictions.length,
  );
  const cl = confidenceLabel(avgConfidence);
  const isCritical = peakLevel >= criticalThreshold;
  const isWarning = peakLevel >= warningThreshold && peakLevel < criticalThreshold;

  // Chart rendering
  useEffect(() => {
    if (!canvasRef.current) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => {
      const Chart = (window as any).Chart;
      if (!Chart || !canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
      const textColor = isDark ? "#9ca3af" : "#6b7280";

      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: allLabelsFormatted,
          datasets: [
            {
              label: "Confianza superior",
              data: confidenceUpper,
              borderWidth: 0,
              pointRadius: 0,
              fill: "+1",
              backgroundColor: `${color}18`,
              tension: 0.4,
            },
            {
              label: "Confianza inferior",
              data: confidenceLower,
              borderWidth: 0,
              pointRadius: 0,
              fill: false,
              backgroundColor: "transparent",
              tension: 0.4,
            },
            {
              label: "Histórico",
              data: historicalSeries,
              borderColor: isDark ? "#94a3b8" : "#64748b",
              backgroundColor: "transparent",
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.4,
              spanGaps: false,
            },
            {
              label: "Predicción IA",
              data: forecastSeries,
              borderColor: color,
              backgroundColor: "transparent",
              borderWidth: 2.5,
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
          animation: { duration: 600 },
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
                  return `${label}: ${ctx.raw.toFixed(2)} ${unit}`;
                },
              },
            },
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
                callback: (v: number) => `${v.toFixed(1)}${unit}`,
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

              drawLine(criticalThreshold, "#ef4444", `Crítico ${criticalThreshold}${unit}`);
              drawLine(warningThreshold, "#f59e0b", `Preventivo ${warningThreshold}${unit}`);

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
  }, [selectedStationId, selectedVar, allLabelsFormatted, historicalSeries, forecastSeries, confidenceUpper, confidenceLower, unit, criticalThreshold, warningThreshold, peakLevel, color, historical.length]);

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1 block">Estación</label>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(Number(e.target.value))}
            className="w-full text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-lime-500/30"
          >
            {STATION_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-mono text-gray-400 uppercase tracking-wider mb-1 block">Variable</label>
          <select
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value)}
            className="w-full text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-lime-500/30"
          >
            {VARIABLE_OPTIONS.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Station metadata */}
      <div className="flex items-center justify-between text-xs font-mono text-gray-400 dark:text-gray-500">
        <span>{selectedStation.name} — {selectedStation.node}</span>
        <span>{new Date(data.timestamp).toLocaleTimeString("es-CO")}</span>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill
          label={`${varMeta?.label ?? selectedVar} pico`}
          value={`${peakLevel.toFixed(2)} ${unit}`}
          color={isCritical ? "red" : isWarning ? "amber" : "green"}
        />
        <StatPill
          label="Confianza promedio"
          value={`${avgConfidence}%`}
          colorClass={cl.color}
        />
        <StatPill
          label="Tendencia 6h"
          value={trend > 0.05 ? "Ascenso" : trend < -0.05 ? "Descenso" : "Estable"}
          color={trend > 0.05 ? "red" : "green"}
        />
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: 280 }}>
        <canvas ref={canvasRef} role="img" aria-label={`Gráfica de predicción — ${selectedStation.name}`} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
        <LegendItem color="#64748b" dashed={false} label="Histórico" />
        <LegendItem color={color} dashed label="Predicción IA" />
        <LegendItem color={`${color}40`} dashed={false} label="Banda de confianza" />
        <div className="ml-auto flex items-center gap-2">
          <span className="w-3 h-px bg-red-400 inline-block" />
          <span>Crítico: {criticalThreshold}{unit}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────

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
          display: "inline-block",
          borderTop: dashed ? `2px dashed ${color}` : undefined,
          background: dashed ? "transparent" : color,
        }}
      />
      {label}
    </span>
  );
}
