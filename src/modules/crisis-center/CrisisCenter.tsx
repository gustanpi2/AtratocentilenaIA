import { useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { CrisisHeader } from "./CrisisHeader";
import { CriticalIndicators } from "./CriticalIndicators";
import { RiskGauge } from "./RiskGauge";
import { AlertTimeline } from "./AlertTimeline";
import { EmergencyMap } from "./EmergencyMap";
import { PredictionPanel } from "../predictions/PredictionPanel";
import { EmergencyBroadcast } from "../community/EmergencyBroadcast";
import { useAlerts } from "../alerts/AlertProvider";
import { playAlertBeep } from "../alerts/AlertSound";

export const CrisisCenter = () => {
  const { criticalAlerts, setCrisisMode } = useAlerts();

  useEffect(() => {
    setCrisisMode(criticalAlerts.length > 0);
  }, [criticalAlerts.length, setCrisisMode]);

  useEffect(() => {
    if (criticalAlerts.length > 0) {
      playAlertBeep();
    }
  }, [criticalAlerts.length]);

  return (
    <>
      <PageMeta
        title="Centro de Crisis — AtratoCentinela AI"
        description="Sistema de monitoreo, prevención y respuesta temprana — AtratoCentinela AI"
      />

      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 xl:px-6 space-y-8">
        {/* Header */}
        <CrisisHeader />

        {/* Critical indicators — full width */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-1.5 h-7 bg-lime-500 rounded-full" />
            <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Indicadores críticos
            </h2>
          </div>
          <CriticalIndicators />
        </section>

        {/* Map + Side info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-7 bg-lime-500 rounded-full" />
              <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mapa de riesgo — AtratoCentinela AI
              </h2>
            </div>
            <div className="min-h-[500px] h-[580px] lg:h-[640px]">
              <EmergencyMap />
            </div>
          </div>

          <div className="space-y-6">
            {/* Risk gauge */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Riesgo de Inundación
                </h3>
              </div>
              <div className="p-6 flex justify-center">
                <RiskGauge value={72} label="Riesgo General" size="lg" />
              </div>
            </section>

            {/* AI Prediction */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Predicción IA
                </h3>
              </div>
              <div className="p-5">
                <PredictionPanel />
              </div>
            </section>
          </div>
        </div>

        {/* Alert Timeline + Broadcast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Timeline de Alertas
              </h3>
            </div>
            <div className="p-5">
              <AlertTimeline />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Comunicaciones de Emergencia
              </h3>
            </div>
            <div className="p-5">
              <EmergencyBroadcast />
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
