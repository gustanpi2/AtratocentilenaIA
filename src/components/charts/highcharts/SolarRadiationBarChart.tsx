import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { FaChartBar } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

interface RadiationData {
  timestamps: string[];
  values: number[];
}

const SolarRadiationBarChart: React.FC<{ data: RadiationData }> = ({ data }) => {
  console.log(data)
  if (!data || data.timestamps.length === 0 || data.values.length === 0) {
    return <p className="text-center text-red-600">No hay datos de radiación para mostrar.</p>;
  }

  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Radiación Solar (W/m²)',
        data: data.values,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // azul
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
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
        text: 'Radiación Solar por Intervalo',
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 rounded shadow">
      <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-blue-600">
        <FaChartBar size={24} />
        Radiación Solar - Barras
      </div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SolarRadiationBarChart;
