// @ts-nocheck
import { FiEye } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ApiRest from "../../service/ApiRest";
import { Meteorológico } from "./Meteorológico";
import PageMeta from "../../components/common/PageMeta";
import { Solar } from "./Solar";
import Calidad from "./Calidad";

interface Estacion {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  tipo_estacion_nombre: string;
}

interface Params {
  id: string;
}

// Componente de carga
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-10">
    <svg
      className="animate-spin h-8 w-8 text-green-600 dark:text-green-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
        3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
      Cargando datos de la estación...
    </p>
  </div>
);

// Componente de error
const ErrorState = ({ message }: { message: string }) => (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-md">
    <p className="font-bold text-red-700 dark:text-red-300">
      Error al cargar la estación:
    </p>
    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{message}</p>
  </div>
);

export const Monitoreo = () => {
  const { id } = useParams<Params>();
  const [estacion, setEstacion] = useState<Estacion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de estación no proporcionado");
      setLoading(false);
      return;
    }

    const fetchEstacion = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiRest.get(`obtenerEstacion?id=${id}`);
        const data = response.data.data;
        if (Array.isArray(data) && data.length > 0) {
          setEstacion(data[0]);
        } else {
          setError("No se encontró la estación.");
        }
      } catch (err) {
        console.error("Error al obtener la estación:", err);
        setError(
          "No se pudo cargar la estación. Verifique la conexión o el ID."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEstacion();
  }, [id]);

  const renderTipoEstacion = () => {
    if (!estacion) return null;

    switch (estacion.id_tipo_estacion) {
      case 1:
        return <Meteorológico estacion={estacion} />;
      case 2:
        return (
          <div className="text-gray-700 dark:text-gray-300 p-4 border rounded-lg border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Estación Tipo 2</h2>
            <p>Datos genéricos para este tipo de estación.</p>
          </div>
        );
      case 3:
        return <Calidad estacion={estacion} />;
      case 4:
        return <Solar estacion={estacion} />;
      default:
        return (
          <ErrorState message="Tipo de estación no reconocido para visualización." />
        );
    }
  };

  return (
    <>
      <PageMeta title="Monitoreo" description="Monitoreo de la estación." />

      <div className="p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        {/* Encabezado */}
        <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 md:mb-0">
              {loading ? "Monitoreo" : estacion?.nombre || "Estación Desconocida"}
            </h1>

            {estacion && (
              <Link
                to={`/monitoring/variables/${estacion.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-500/50 dark:bg-green-500 dark:hover:bg-green-600"
                aria-label="Ver todas las variables de la estación"
              >
                <FiEye className="text-xl" />
                Ver todas las variables
              </Link>
            )}
          </div>

          {/* Metadata */}
          {estacion && (
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="col-span-2 lg:col-span-1 flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">
                  Tipo:
                </span>
                <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                  {estacion.tipo_estacion_nombre}
                </span>
              </div>
              <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">
                  Lat:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {estacion.lat}
                </span>
              </div>
              <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">
                  Lng:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {estacion.lng}
                </span>
              </div>
              <div className="col-span-2 lg:col-span-1 flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">
                  ID:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {estacion.estacion_mrv}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido dinámico */}
        <div className="min-h-[300px] mt-8">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            renderTipoEstacion()
          )}
        </div>
      </div>
    </>
  );
};
