// src/components/PreviewTailwind.tsx
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location: {
    nombre: string;
    descripcion: string;
  } | null;
}

const PreviewTailwind: React.FC<Props> = ({ isOpen, onClose, location }) => {
  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2">{location.nombre}</h2>
        <p className="text-gray-700">{location.descripcion}</p>
      </div>
    </div>
  );
};

export default PreviewTailwind;
