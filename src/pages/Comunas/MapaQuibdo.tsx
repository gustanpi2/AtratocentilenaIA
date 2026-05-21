// @ts-nocheck
import React, { useState } from "react";
import { MapPin } from "lucide-react";

// Tipado base
type Comuna = {
  id: number;
  nombre: string;
  barrios: number;
  poblacion: number;
  x: number; // porcentaje (0-100)
  y: number; // porcentaje (0-100)
};

// Datos simulados (idénticos al original)
const comunas: Comuna[] = [
  { id: 1, nombre: "Comuna 1: Norte Central", barrios: 24, poblacion: 15738, x: 76.59, y: 28.18 },
  { id: 2, nombre: "Comuna 2: Centro Histórico", barrios: 19, poblacion: 12006, x: 59.21, y: 50.5 },
  { id: 3, nombre: "Comuna 3: La Pista", barrios: 15, poblacion: 37937, x: 46.13, y: 15.21 },
  { id: 4, nombre: "Comuna 4: Occidente", barrios: 6, poblacion: 12279, x: 32.51, y: 36.6 },
  { id: 5, nombre: "Comuna 5: Sur", barrios: 9, poblacion: 17502, x: 32.34, y: 62.26 },
  { id: 6, nombre: "Comuna 6: Oriente", barrios: 12, poblacion: 8723, x: 33.13, y: 15.21 },
];

export default function MapaQuibdo(): JSX.Element {
  const [seleccion, setSeleccion] = useState<Comuna | null>(null);

  // Cierra popup al hacer clic fuera de un marcador
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!(e.target as HTMLElement).closest("button[aria-label]")) {
      setSeleccion(null);
    }
  };

  // Calcula posición del popup evitando desbordes
  const getPopupStyle = (c: Comuna) => {
    let transform = "translate(-50%, -120%)";

    if (c.x > 75) transform = "translate(-100%, -50%)"; // derecha
    else if (c.x < 25) transform = "translate(0%, -50%)"; // izquierda
    else if (c.y < 20) transform = "translate(-50%, 20%)"; // arriba

    return {
      left: `${c.x}%`,
      top: `${c.y}%`,
      transform,
    } as React.CSSProperties;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all">
      {/* Título */}
      <h1 className="text-3xl font-extrabold text-center mb-6 text-indigo-700 dark:text-indigo-400">
        Comunas de Quibdó
      </h1>

      {/* Mapa */}
      <div
        className="relative w-full rounded-xl overflow-hidden cursor-pointer aspect-video"
        onClick={handleMapClick}
      >
        <img
          src="/images/comunas.png"
          alt="Mapa de las Comunas de Quibdó"
          className="w-full h-auto block select-none object-cover"
        />

        {/* Marcadores */}
        {comunas.map((c) => (
          <button
            key={c.id}
            aria-label={`Ver información de ${c.nombre}`}
            onClick={(e) => {
              e.stopPropagation();
              setSeleccion(c);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none z-40 transition-transform hover:scale-125 duration-200"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
          >
            <MapPin
              size={35}
              className="text-red-600 drop-shadow-xl transition-all"
              fill="currentColor"
              strokeWidth={1.5}
            />
          </button>
        ))}

        {/* Popup de información */}
        {seleccion && (
          <div
            role="dialog"
            aria-modal="true"
            className="absolute z-50 w-72 max-w-xs bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-xl p-4 shadow-2xl animate-fade-in"
            style={getPopupStyle(seleccion)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {seleccion.nombre}
                </h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">
                  <span className="font-semibold">Barrios:</span> {seleccion.barrios}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Población (2021):</span>{" "}
                  {seleccion.poblacion.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSeleccion(null)}
                className="ml-2 text-lg text-gray-500 hover:text-red-600 transition-colors"
                aria-label="Cerrar información"
              >
                ✕
              </button>
            </div>
            <a
              href="https://www.quibdo-choco.gov.co/MiMunicipio/Paginas/Informacion-del-Municipio.aspx"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              Ver sitio oficial de Quibdó
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
