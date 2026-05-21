import React from "react";
import { Link } from "react-router-dom";
import {
  MdLocationOn,
  MdDescription,
  MdWbSunny,
  MdCategory,
  MdOpenInNew,
} from "react-icons/md";

interface CardProps {
  estacion: {
    id: number;
    nombre: string;
    descripcion: string;
    lat: string;
    lng: string;
    id_tipo_estacion: number;
    tipo_estacion: string;
  };
}

const Card: React.FC<CardProps> = ({ estacion }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-md mx-auto my-4 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-4">
        <MdWbSunny className="text-yellow-500 mr-2" />
        {estacion.nombre}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
        <MdDescription className="text-blue-500 mr-2" />
        {estacion.descripcion}
      </p>
      <p className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
        <MdLocationOn className="text-red-500 mr-2" />
        Lat: {estacion.lat}, Lng: {estacion.lng}
      </p>
      <p className="text-gray-700 dark:text-gray-300 flex items-center mb-6">
        <MdCategory className="text-green-500 mr-2" />
        Tipo: {estacion.tipo_estacion}
      </p>
      <Link
        to={`/monitoring/${estacion.id}`}
        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full hover:from-blue-700 hover:to-blue-900 transition-all shadow-md"
      >
        <MdOpenInNew className="mr-2 text-xl" />
        Informe
      </Link>
    </div>
  );
};

export default Card;
