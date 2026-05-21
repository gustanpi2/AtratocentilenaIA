import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { WiDaySunny } from 'react-icons/wi';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

interface RadiationData {
  timestamps: string[];
  values: number[];
}

const SolarRadiationChart: React.FC<{ data: RadiationData }> = ({ data }) => {
  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Radiación Solar (W/m²)',
        data: data.values,
        fill: true,
        backgroundColor: 'rgba(34,197,94,0.2)', // verde claro
        borderColor: 'rgba(34,197,94,1)', // verde
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Lectura de Radiación Solar',
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 rounded shadow">
      <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-yellow-600">
        <WiDaySunny size={28} />
        Radiación Solar
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SolarRadiationChart;
