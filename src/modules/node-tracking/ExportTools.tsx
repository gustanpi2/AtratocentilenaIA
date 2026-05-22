import { useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HISTORICAL_READINGS, VARIABLES } from "../../data/mockData";
import type { FilterState } from "./FilterPanel";

interface ExportToolsProps {
  filter: FilterState;
  station: string;
  variable: string;
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

export const ExportTools = ({ filter, station, variable }: ExportToolsProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const getFilteredData = () => {
    const rangeMs = getTimeRangeMs(filter.timeRange);
    const now = Date.now();
    const cutoff = filter.timeRange === "custom"
      ? filter.customStart ? new Date(filter.customStart).getTime() : now - rangeMs
      : now - rangeMs;

    const selectedVar = VARIABLES.find((v) => v.id === filter.variableId);

    let data = HISTORICAL_READINGS.filter(
      (r) => r.nodeId === filter.nodeId && (!selectedVar || r.variable === selectedVar.name)
    );

    data = data.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return data;
  };

  const handleExportCSV = () => {
    setLoading("csv");
    try {
      const data = getFilteredData();
      if (data.length === 0) {
        toast.error("No hay datos para exportar");
        setLoading(null);
        return;
      }
      
      const headers = ["Fecha", "Hora", "Variable", "Valor", "Unidad", "Estado", "Riesgo"];
      const csvContent = [
        headers.join(","),
        ...data.map(r => `${r.date},${r.time},${r.variable},${r.value},${r.unit},${r.status},${r.risk}`)
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reporte_${station.replace(/\s+/g, "_")}_${variable}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exportado a CSV (${data.length} registros)`);
    } catch (e) {
      toast.error("Error al exportar CSV");
    }
    setLoading(null);
  };

  const handleExportPDF = () => {
    setLoading("pdf");
    try {
      const data = getFilteredData();
      if (data.length === 0) {
        toast.error("No hay datos para exportar");
        setLoading(null);
        return;
      }

      const doc = new jsPDF();
      doc.text(`Reporte de Monitoreo - ${station}`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Variable: ${variable}`, 14, 22);
      doc.text(`Registros Totales: ${data.length}`, 14, 28);
      
      autoTable(doc, {
        startY: 35,
        head: [["Fecha", "Hora", "Variable", "Valor", "Unidad", "Estado", "Riesgo"]],
        body: data.map(r => [r.date, r.time, r.variable, r.value.toString(), r.unit, r.status, r.risk]),
      });
      
      doc.save(`Reporte_${station.replace(/\s+/g, "_")}_${variable}.pdf`);
      toast.success(`Exportado a PDF (${data.length} registros)`);
    } catch (e) {
      toast.error("Error al exportar PDF");
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 dark:text-gray-500 font-mono mr-1">
        Exportar:
      </span>
      <button
        onClick={handleExportCSV}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 h-10 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-lime-400 hover:text-lime-600 dark:hover:text-lime-400 disabled:opacity-40 transition-all"
      >
        {loading === "csv" ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <FileIcon format="csv" />}
        CSV
      </button>
      <button
        onClick={handleExportPDF}
        disabled={loading !== null}
        className="flex items-center gap-2 px-4 h-10 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-lime-400 hover:text-lime-600 dark:hover:text-lime-400 disabled:opacity-40 transition-all"
      >
        {loading === "pdf" ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <FileIcon format="pdf" />}
        PDF
      </button>
    </div>
  );
};

function FileIcon({ format }: { format: string }) {
  const color = format === "csv" ? "#22c55e" : "#ef4444";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M14 2v6h6" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M8 13h8M8 17h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
