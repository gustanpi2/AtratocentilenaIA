import { useMemo } from "react";
import { NODES, VARIABLES } from "../../data/mockData";

export type TimeRange = "24h" | "7d" | "30d" | "1y" | "custom";

export interface FilterState {
  nodeId: string;
  variableId: string;
  timeRange: TimeRange;
  customStart: string;
  customEnd: string;
  comparative: boolean;
}

interface FilterPanelProps {
  filter: FilterState;
  onChange: (f: FilterState) => void;
}

export const DEFAULT_FILTER: FilterState = {
  nodeId: "n1",
  variableId: "v1",
  timeRange: "7d",
  customStart: "",
  customEnd: "",
  comparative: false,
};

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "Últimas 24h" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Último mes" },
  { value: "1y", label: "Último año" },
  { value: "custom", label: "Personalizado" },
];

export const FilterPanel = ({ filter, onChange }: FilterPanelProps) => {
  const selectedNode = useMemo(() => NODES.find((n) => n.id === filter.nodeId), [filter.nodeId]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">
          Panel de filtros
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Estación / Nodo */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Estación / Nodo
            </label>
            <select
              value={filter.nodeId}
              onChange={(e) => onChange({ ...filter, nodeId: e.target.value })}
              className="w-full h-12 px-4 text-base bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-400"
            >
              {NODES.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.station} ({node.code})
                </option>
              ))}
            </select>
          </div>

          {/* Variable */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Variable ambiental
            </label>
            <select
              value={filter.variableId}
              onChange={(e) => onChange({ ...filter, variableId: e.target.value })}
              className="w-full h-12 px-4 text-base bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-400"
            >
              {VARIABLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>

          {/* Rango temporal */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Rango temporal
            </label>
            <div className="flex flex-wrap gap-2">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...filter, timeRange: opt.value })}
                  className={`text-sm font-semibold px-3 py-2 rounded-lg border transition-all ${
                    filter.timeRange === opt.value
                      ? "bg-lime-500 text-white border-lime-500 shadow-sm"
                      : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-lime-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sensores activos del nodo */}
          <div>
            <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Sensores activos
            </label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedNode?.sensors.filter((s) => s.active).map((s) => (
                <span
                  key={s.id}
                  className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded"
                >
                  {s.variable}
                </span>
              ))}
            </div>
            
            {/* Toggle comparativa */}
            <label className="flex items-center gap-3 cursor-pointer mt-2 group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={filter.comparative}
                  onChange={(e) => onChange({ ...filter, comparative: e.target.checked })}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${filter.comparative ? "bg-lime-500" : "bg-gray-300 dark:bg-gray-600"}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${filter.comparative ? "transform translate-x-4" : ""}`}></div>
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                Comparar vs Tiempo Real
              </span>
            </label>
          </div>
        </div>

        {/* Fecha personalizada */}
        {filter.timeRange === "custom" && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Fecha inicio
              </label>
              <input
                type="date"
                value={filter.customStart}
                onChange={(e) => onChange({ ...filter, customStart: e.target.value })}
                className="w-full h-12 px-4 text-base bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                value={filter.customEnd}
                onChange={(e) => onChange({ ...filter, customEnd: e.target.value })}
                className="w-full h-12 px-4 text-base bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
