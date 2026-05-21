// @ts-nocheck
import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "../../components/charts/highcharts/MonthlyTarget";
import RainfallChart from "../../components/charts/highcharts/StatisticsChart";
import EnvironmentalMetrics2 from "../../components/ecommerce/EcommerceMetrics2";

interface Estacion {
  id: number; nombre: string; descripcion: string;
  lat: string; lng: string;
  id_tipo_estacion: number; tipo_estacion_nombre: string;
  estacion_mrv: number;
}
type Props = { estacion: Estacion };

export const Meteorológico = ({ estacion }: Props) => {
  const idEstacion = estacion.estacion_mrv > 0 ? estacion.estacion_mrv : estacion.id;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .met-root { font-family: 'Outfit', sans-serif; }

        /* Page header */
        .met-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          padding: 0 0 20px;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 24px;
        }
        .dark .met-header { border-bottom-color: #0f172a; }

        .met-station-chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 99px;
          background: #f0fdf4; border: 1.5px solid rgba(34,197,94,0.25);
          color: #16a34a; font-size: 12px; font-weight: 600;
        }
        .dark .met-station-chip {
          background: rgba(132,204,22,0.08);
          border-color: rgba(132,204,22,0.2);
          color: #84cc16;
        }

        /* Layout grid */
        .met-grid {
          display: grid; gap: 16px;
          grid-template-columns: 1fr;
        }
        @media(min-width:1280px) {
          .met-grid { grid-template-columns: 7fr 5fr; }
        }

        .met-left  { display: flex; flex-direction: column; gap: 16px; }
        .met-right { display: flex; flex-direction: column; }

        .met-full { grid-column: 1 / -1; }

        /* Section label */
        .met-section-label {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #9ca3af; margin-bottom: 10px;
          font-family: 'JetBrains Mono', monospace;
        }
        .dark .met-section-label { color: #1e293b; }
      `}</style>

      <PageMeta title="Monitoreo Meteorológico" description="Panel de monitoreo en tiempo real de la estación." />

      <div className="met-root">
        {/* Page header */}
        <div className="met-header">
          <div>
            <p className="met-section-label">Panel de monitoreo</p>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}
              className="dark:text-white">
              {estacion.nombre}
            </h1>
            {estacion.descripcion && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}
                className="dark:text-slate-600">
                {estacion.descripcion}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="met-station-chip">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)", animation: "met-blink 2s ease-in-out infinite" }} />
              Estación #{idEstacion}
            </span>
            <span className="met-station-chip" style={{ background: "#eff6ff", borderColor: "rgba(59,130,246,0.2)", color: "#3b82f6" }}
              /* @ts-ignore */
              className="dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400">
              {estacion.tipo_estacion_nombre}
            </span>
          </div>
          <style>{`@keyframes met-blink{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
        </div>

        {/* Main grid */}
        <div className="met-grid">
          {/* Left column */}
          <div className="met-left">
            <div>
              <p className="met-section-label">Variables principales</p>
              <EcommerceMetrics estacion={idEstacion} />
            </div>
            <div>
              <p className="met-section-label">Calidad del aire</p>
              <EnvironmentalMetrics2 estacion={idEstacion} />
            </div>
          </div>

          {/* Right column */}
          <div className="met-right">
            <p className="met-section-label">Velocidad del viento</p>
            <MonthlyTarget estacion={idEstacion} />
          </div>

          {/* Full-width chart */}
          <div className="met-full">
            <p className="met-section-label">Precipitación</p>
            <RainfallChart estacion={idEstacion} />
          </div>
        </div>
      </div>
    </>
  );
};