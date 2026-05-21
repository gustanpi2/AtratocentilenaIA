import { useMemo, useState } from "react";
import { HISTORICAL_READINGS, VARIABLES } from "../../data/mockData";
import type { FilterState } from "./FilterPanel";

interface ReadingsTableProps {
  filter: FilterState;
}

const ITEMS_PER_PAGE = 15;

const STATUS_STYLES: Record<string, string> = {
  normal: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  critical: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
};

const RISK_STYLES: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-600 dark:text-red-400",
};

const getTimeRangeMs = (range: string): number => {
  switch (range) {
    case "24h": return 86400000;
    case "7d": return 604800000;
    case "30d": return 2592000000;
    case "1y": return 31536000000;
    default: return 604800000;
  }
};

export const ReadingsTable = ({ filter }: ReadingsTableProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const rangeMs = getTimeRangeMs(filter.timeRange);
    const now = Date.now();
    const cutoff = filter.timeRange === "custom"
      ? filter.customStart ? new Date(filter.customStart).getTime() : now - rangeMs
      : now - rangeMs;

    const variable = VARIABLES.find((v) => v.id === filter.variableId);

    let data = HISTORICAL_READINGS.filter(
      (r) => r.nodeId === filter.nodeId && (!variable || r.variable === variable.name)
    );

    data = data.filter((r) => new Date(r.timestamp).getTime() >= cutoff);

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.station.toLowerCase().includes(q) ||
          r.variable.toLowerCase().includes(q) ||
          r.value.toString().includes(q) ||
          r.status.includes(q)
      );
    }

    data.sort((a, b) => {
      const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortDir === "desc" ? -diff : diff;
    });

    return data;
  }, [filter, search, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">
          Registros históricos
          <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
            ({filtered.length} registros)
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar en registros..."
            className="w-56 h-10 px-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-500/40 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <Th sortable onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}>
                Fecha {sortDir === "desc" ? "↓" : "↑"}
              </Th>
              <Th>Hora</Th>
              <Th>Variable</Th>
              <Th>Valor</Th>
              <Th>Unidad</Th>
              <Th>Estado</Th>
              <Th>Riesgo</Th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{r.date}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{r.time}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{r.variable}</td>
                <td className="px-5 py-3 text-sm font-mono font-bold text-gray-900 dark:text-gray-100">{r.value}</td>
                <td className="px-5 py-3 text-sm font-mono text-gray-400 dark:text-gray-500">{r.unit}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${STATUS_STYLES[r.status]}`}>
                    {r.status === "critical" ? "Crítico" : r.status === "warning" ? "Preventivo" : "Normal"}
                  </span>
                </td>
                <td className={`px-5 py-3 text-sm font-bold font-mono ${RISK_STYLES[r.risk]}`}>
                  {r.risk === "high" ? "Alto" : r.risk === "medium" ? "Medio" : "Bajo"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-400 dark:text-gray-500 font-mono">
          Página {safePage} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <PageBtn disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </PageBtn>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
            const pageNum = start + i;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 text-sm font-mono rounded-lg border transition-all ${
                  pageNum === safePage
                    ? "bg-lime-500 text-white border-lime-500"
                    : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-lime-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <PageBtn disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Siguiente
          </PageBtn>
        </div>
      </div>
    </div>
  );
};

function Th({ children, sortable, onClick }: { children: React.ReactNode; sortable?: boolean; onClick?: () => void }) {
  return (
    <th
      onClick={onClick}
      className={`px-5 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left ${sortable ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" : ""}`}
    >
      {children}
    </th>
  );
}

function PageBtn({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-10 px-4 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:border-lime-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      {children}
    </button>
  );
}
