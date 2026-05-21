import { useState } from "react";
import toast from "react-hot-toast";

interface ExportToolsProps {
  recordCount: number;
  station: string;
  variable: string;
}

export const ExportTools = ({ recordCount, station, variable }: ExportToolsProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const simulateExport = (format: string) => {
    setLoading(format);
    setTimeout(() => {
      setLoading(null);
      toast.success(`Exportación ${format.toUpperCase()} completada — ${recordCount} registros de ${station} (${variable})`);
    }, 1200);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 dark:text-gray-500 font-mono mr-1">
        Exportar:
      </span>
      {(["csv", "excel", "pdf"] as const).map((fmt) => (
        <button
          key={fmt}
          onClick={() => simulateExport(fmt)}
          disabled={loading !== null}
          className="flex items-center gap-2 px-4 h-10 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-lime-400 hover:text-lime-600 dark:hover:text-lime-400 disabled:opacity-40 transition-all"
        >
          {loading === fmt ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileIcon format={fmt} />
          )}
          {fmt.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

function FileIcon({ format }: { format: string }) {
  const color = format === "csv" ? "#22c55e" : format === "excel" ? "#2563eb" : "#ef4444";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M14 2v6h6" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M8 13h8M8 17h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
