import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { FilterPanel, DEFAULT_FILTER, type FilterState } from "./FilterPanel";
import { NodeInfoCard } from "./NodeInfoCard";
import { HistoricalCharts } from "./HistoricalCharts";
import { ReadingsTable } from "./ReadingsTable";
import { ExportTools } from "./ExportTools";
import { PredictiveAlertCard } from "./PredictiveAlertCard";
import { NODES, VARIABLES } from "../../data/mockData";

export const NodeTracking = () => {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const selectedNode = NODES.find((n) => n.id === filter.nodeId);
  const selectedVar = VARIABLES.find((v) => v.id === filter.variableId);

  return (
    <>
      <PageMeta
        title="Seguimiento de Nodos — AtratoCentinela AI"
        description="Análisis técnico e histórico de variables ambientales por nodo de monitoreo — AtratoCentinela AI"
      />

      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 xl:px-6 space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Seguimiento de Nodos
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
              Análisis técnico e histórico de variables ambientales
            </p>
          </div>
          {selectedNode && selectedVar && (
            <ExportTools
              filter={filter}
              station={selectedNode.station}
              variable={selectedVar.name}
            />
          )}
        </div>

        {/* Filters */}
        <FilterPanel filter={filter} onChange={setFilter} />

        {/* Main grid: chart + node info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <HistoricalCharts filter={filter} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <NodeInfoCard nodeId={filter.nodeId} />
            <PredictiveAlertCard filter={filter} />
          </div>
        </div>

        {/* Historical table */}
        <ReadingsTable filter={filter} />
      </div>
    </>
  );
};
