import React from 'react';
import { Line } from 'react-chartjs-2';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // importante para el área
);

interface RadiationData {
  timestamps: string[];
  values: number[];
}

const SolarRadiationAreaChart: React.FC<{ data: RadiationData }> = ({ data }) => {
  if (!data || data.timestamps.length === 0 || data.values.length === 0) {
    return <p className="text-center text-red-600">No hay datos para mostrar.</p>;
  }

  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Radiación Solar (W/m²)',
        data: data.values,
        fill: true,
        backgroundColor: 'rgba(255, 206, 86, 0.3)', // amarillo translúcido
        borderColor: 'rgba(255, 206, 86, 1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Gráfico de Área - Radiación Solar',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'W/m²',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Tiempo',
        },
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 rounded shadow">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SolarRadiationAreaChart;
