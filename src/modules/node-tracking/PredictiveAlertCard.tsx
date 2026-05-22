import { useMemo } from "react";
import { HISTORICAL_READINGS, VARIABLES } from "../../data/mockData";
import type { FilterState } from "./FilterPanel";
import { AlertTriangle, TrendingUp, Info } from "lucide-react";

interface PredictiveAlertCardProps {
  filter: FilterState;
}

export const PredictiveAlertCard = ({ filter }: PredictiveAlertCardProps) => {
  const variable = VARIABLES.find((v) => v.id === filter.variableId);

  const analysis = useMemo(() => {
    if (!variable) return null;

    const nodeReadings = HISTORICAL_READINGS.filter(
      (r) => r.nodeId === filter.nodeId && r.variable === variable.name
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (nodeReadings.length < 5) return null;

    // Tomamos las ultimas 5 lecturas para analizar la tendencia reciente
    const recent = nodeReadings.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const timeDiff = new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime();
    const valueDiff = last.value - first.value;

    const slope = valueDiff / (timeDiff / 3600000); // Cambio por hora
    const isRising = slope > 0;
    
    let timeToCritical = -1;
    if (isRising && last.value < variable.critical) {
      timeToCritical = (variable.critical - last.value) / slope;
    }

    return {
      slope,
      isRising,
      timeToCritical,
      lastValue: last.value,
      critical: variable.critical
    };

  }, [filter.nodeId, filter.variableId, variable]);

  if (!variable || !analysis) return null;

  // Solo mostrar para ciertas variables críticas, e.g. Nivel de agua o Precipitación
  // O podemos mostrarlo para cualquiera que tenga tendencia a superar el umbral.
  
  const isHighRisk = analysis.isRising && analysis.timeToCritical > 0 && analysis.timeToCritical < 24;

  return (
    <div className={`rounded-xl border shadow-sm p-6 ${isHighRisk ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
      <div className="flex items-center gap-3 mb-4">
        {isHighRisk ? (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Info size={20} />
          </div>
        )}
        <div>
          <h3 className={`text-base font-semibold ${isHighRisk ? "text-red-900 dark:text-red-300" : "text-gray-900 dark:text-gray-100"}`}>
            Proyección de Alertas Inteligentes
          </h3>
          <p className={`text-sm ${isHighRisk ? "text-red-700 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
            Modelo predictivo basado en tendencias recientes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg border border-black/5 dark:border-white/5">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tendencia ({variable.name})</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
              {analysis.slope > 0 ? "+" : ""}{analysis.slope.toFixed(2)} {variable.unit}/h
            </span>
            {analysis.isRising ? <TrendingUp size={16} className="text-amber-500" /> : <TrendingUp size={16} className="text-emerald-500 transform rotate-180" />}
          </div>
        </div>

        {isHighRisk ? (
          <div className="bg-red-100/50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800/50">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-1">
              Riesgo inminente detectado
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              De mantenerse la tendencia actual, el valor crítico ({analysis.critical} {variable.unit}) será alcanzado en aproximadamente <strong className="font-mono">{Math.round(analysis.timeToCritical)} horas</strong>.
              Se recomienda emitir advertencia preventiva.
            </p>
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium mb-1">
              Parámetros estables
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              La variable no presenta proyecciones de riesgo en el corto plazo. El nivel actual de {analysis.lastValue} {variable.unit} está bajo control.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
