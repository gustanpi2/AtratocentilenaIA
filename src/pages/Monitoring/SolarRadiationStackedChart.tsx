import { GiStack } from "react-icons/gi";
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  Title,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

interface StackedRadiationData {
  labels: string[];
  direct: number[];
  diffuse: number[];
  global: number[];
  average: number[];
}

const SolarRadiationStackedChart: React.FC<{ data: StackedRadiationData }> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Radiación Directa',
        data: data.direct,
        backgroundColor: '#facc15', // amarillo
        stack: 'stack1',
      },
      {
        type: 'bar' as const,
        label: 'Radiación Difusa',
        data: data.diffuse,
        backgroundColor: '#60a5fa', // azul
        stack: 'stack1',
      },
      {
        type: 'bar' as const,
        label: 'Radiación Global',
        data: data.global,
        backgroundColor: '#34d399', // verde
        stack: 'stack1',
      },
      {
        type: 'line' as const,
        label: 'Promedio',
        data: data.average,
        borderColor: '#ef4444', // rojo
        backgroundColor: '#ef4444',
        tension: 0.4,
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Radiación Solar Apilada + Promedio Diario',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'W/m²',
        },
      },
    },
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-4 rounded shadow">
      <div className="flex items-center gap-2 mb-4 text-xl font-semibold text-green-700">
        <GiStack size={24} />
        Radiación Solar - Apilado
      </div>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
};

export default SolarRadiationStackedChart;
