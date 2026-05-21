import { ReactNode } from "react";

interface CardProps {
  title: string;
  value: string;
  unit?: string;
  icon?: ReactNode;
  color?: string;
  miniGraph?: boolean;
}

const Card = ({ title, value, unit, icon, color = "text-gray-800", miniGraph = false }: CardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all p-4 flex flex-col justify-between h-36">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-300">{title}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value} <span className="text-base font-normal text-gray-500 dark:text-gray-400">{unit}</span>
      </div>
      {miniGraph && (
        <div className="h-2 mt-2 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-full">
          {/* Mini gráfico simulado */}
          <div className="w-1/3 h-full bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default Card;
