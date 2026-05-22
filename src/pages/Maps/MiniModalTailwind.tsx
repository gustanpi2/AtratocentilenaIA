// src/components/MiniModalTailwind.tsx
import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

interface Props {
  location: {
    nombre: string;
  };
}

const MiniModalTailwind: React.FC<Props> = ({ location }) => {
  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded-md p-2 z-50">
      <p className="text-sm font-medium text-gray-800"><FaMapMarkerAlt className="inline mr-1 text-red-500" />{location.nombre}</p>
    </div>
  );
};

export default MiniModalTailwind;
