import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { MdRadar } from 'react-icons/md';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

interface Props {
  labels: string[];
  values: number[];
}

const SolarRadiationRadarChart: React.FC<Props> = ({ labels, values }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Radiación Solar (W/m²)',
        data: values,
        backgroundColor: 'rgba(34, 197, 94, 0.2)', // verde
        borderColor: 'rgba(34, 197, 94, 1)',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Comparación de Radiación Solar',
      },
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 600, // ajusta según tus valores reales
      },
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-4 rounded shadow">
      <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-purple-600">
        <MdRadar size={24} />
        Radiación Solar - Radar
      </div>
      <Radar data={data} options={options} />
    </div>
  );
};

export default SolarRadiationRadarChart;
