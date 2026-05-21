import React from 'react';
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, Title } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { Chart } from 'react-chartjs-2';
import "chartjs-adapter-date-fns";
import { FaThermometerHalf } from 'react-icons/fa';


ChartJS.register(
  MatrixController,
  MatrixElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

interface HeatmapData {
  day: number;    // 0 = Domingo, 6 = Sábado
  hour: number;   // 0 = 0:00, 23 = 23:00
  value: number;  // Radiación solar en ese bloque
}

interface Props {
  data: HeatmapData[];
}

const SolarRadiationHeatmap: React.FC<Props> = ({ data }) => {
  const chartData = {
    datasets: [
      {
        label: 'Radiación Solar (W/m²)',
        data: data.map((d) => ({
          x: d.hour,
          y: d.day,
          v: d.value,
        })),
        backgroundColor: (ctx: any) => {
          const value = ctx.dataset.data[ctx.dataIndex].v;
          const alpha = Math.min(1, value / 500);
          return `rgba(255, 165, 0, ${alpha})`; // naranja según intensidad
        },
        borderWidth: 1,
        width: () => 20,
        height: () => 20,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'linear' as const,
        min: 0,
        max: 23,
        ticks: { stepSize: 1, callback: (v: any) => `${v}h` },
        title: { display: true, text: 'Hora del día' },
      },
      y: {
        type: 'linear' as const,
        min: 0,
        max: 6,
        ticks: {
          callback: (v: any) =>
            ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][v] ?? '',
        },
        title: { display: true, text: 'Día de la semana' },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Radiación: ${ctx.raw.v} W/m²`,
        },
      },
      title: {
        display: true,
        text: 'Heatmap de Radiación Solar (Semana)',
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 rounded shadow">
      <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-red-600">
        <FaThermometerHalf size={24} />
        Radiación Solar - Heatmap
      </div>
      <Chart type="matrix" data={chartData} options={options} />
    </div>
  );
};

export default SolarRadiationHeatmap;
