import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { HISTORICAL_READINGS, VARIABLES, type VariableDef } from "../../data/mockData";
import type { FilterState } from "./FilterPanel";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface HistoricalChartsProps {
  filter: FilterState;
}

const getTimeRangeMs = (range: string): number => {
  switch (range) {
    case "24h": return 86400000;
    case "7d": return 604800000;
    case "30d": return 2592000000;
    case "1y": return 31536000000;
    default: return 604800000;
  }
};

export const HistoricalCharts = ({ filter }: HistoricalChartsProps) => {
  const variable: VariableDef | undefined = VARIABLES.find((v) => v.id === filter.variableId);

  const chartData = useMemo(() => {
    if (!variable) return null;
    const rangeMs = getTimeRangeMs(filter.timeRange);
    const now = Date.now();
    const cutoff = filter.timeRange === "custom"
      ? filter.customStart ? new Date(filter.customStart).getTime() : now - rangeMs
      : now - rangeMs;

    const nodeReadings = HISTORICAL_READINGS.filter(
      (r) => r.nodeId === filter.nodeId && r.variable === variable.name
    );

    const filtered = nodeReadings.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
    const sorted = filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const labels = sorted.map((r) => {
      const d = new Date(r.timestamp);
      return filter.timeRange === "24h"
        ? d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
        : d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" });
    });

    const values = sorted.map((r) => r.value);

    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;

    return { labels, values, avg, max, min, sorted };
  }, [filter.nodeId, filter.variableId, filter.timeRange, filter.customStart, filter.customEnd]);

  const options: ChartOptions<"line"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 24,
          font: { family: "'Outfit', sans-serif", size: 13, weight: "bold" },
          color: "#6b7280",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.97)",
        titleFont: { family: "'Outfit', sans-serif", size: 13, weight: "bold" },
        titleColor: "#111827",
        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
        bodyColor: "#374151",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 14,
        cornerRadius: 8,
        boxPadding: 6,
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === "Valor registrado" || ctx.dataset.label === "Valor Histórico" || ctx.dataset.label === "Tiempo Real (Actual)") {
              return ` ${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(2)} ${variable?.unit ?? ""}`;
            }
            if (ctx.dataset.label === "Umbral preventivo") {
              return ` Preventivo: ${variable?.threshold} ${variable?.unit}`;
            }
            if (ctx.dataset.label === "Umbral crítico") {
              return ` Crítico: ${variable?.critical} ${variable?.unit}`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 12,
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          color: "#9ca3af",
        },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
        ticks: {
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          color: "#9ca3af",
          padding: 8,
        },
        title: {
          display: true,
          text: variable?.unit ?? "",
          font: { family: "'Outfit', sans-serif", size: 12, weight: "bold" },
          color: "#6b7280",
        },
      },
    },
  }), [variable]);

  const config = useMemo(() => {
    if (!chartData || !variable) return null;
    const color = variable.color;

    const datasets: any[] = [];

    if (filter.comparative) {
      // Historical dataset
      datasets.push({
        label: "Valor Histórico",
        data: chartData.values,
        borderColor: "#9ca3af",
        backgroundColor: `rgba(156,163,175,0.1)`,
        fill: true,
        tension: 0.3,
        pointRadius: 1,
        pointHoverRadius: 5,
        borderWidth: 1.5,
      });

      // Simulated Real-time dataset (adding minor variations to historical for comparison)
      const simulatedRealtime = chartData.values.map(v => v * (1 + (Math.random() * 0.1 - 0.05)));
      datasets.push({
        label: "Tiempo Real (Actual)",
        data: simulatedRealtime,
        borderColor: color,
        backgroundColor: `${color}15`,
        fill: false,
        tension: 0.3,
        pointRadius: 1.5,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        borderWidth: 2.5,
      });
    } else {
      datasets.push({
        label: "Valor registrado",
        data: chartData.values,
        borderColor: color,
        backgroundColor: `${color}15`,
        fill: true,
        tension: 0.3,
        pointRadius: 1.5,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        borderWidth: 2,
      });
    }

    // Thresholds
    datasets.push(
      {
        label: "Umbral preventivo",
        data: Array(chartData.labels.length).fill(variable.threshold),
        borderColor: "#f59e0b",
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
      {
        label: "Umbral crítico",
        data: Array(chartData.labels.length).fill(variable.critical),
        borderColor: "#ef4444",
        borderDash: [4, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      }
    );

    return {
      labels: chartData.labels,
      datasets,
    };
  }, [chartData, variable, filter.comparative]);

  if (!chartData || !config) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">No hay datos disponibles para los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">
          {variable?.name} — {variable?.description}
        </h2>
        <div className="flex items-center gap-5 text-sm font-mono">
          <StatBadge label="Promedio" value={`${chartData.avg.toFixed(2)} ${variable?.unit}`} color="text-gray-600" />
          <StatBadge label="Máx" value={`${chartData.max.toFixed(2)} ${variable?.unit}`} color="text-red-500" />
          <StatBadge label="Mín" value={`${chartData.min.toFixed(2)} ${variable?.unit}`} color="text-blue-500" />
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="relative flex-1 w-full min-h-[400px]">
          <Line data={config} options={options} />
        </div>
      </div>
    </div>
  );
};

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span>
      <span className="text-gray-400 dark:text-gray-500">{label}: </span>
      <span className={`font-bold ${color} dark:brightness-125`}>{value}</span>
    </span>
  );
}
