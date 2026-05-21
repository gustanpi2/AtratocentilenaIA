import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import ApiRest from "../../service/ApiRest";
import PageMeta from "../../components/common/PageMeta";
import VariablesMrv from "./VariablesMrv";

// Tipado de estación
interface Estacion {
  id: number;
  nombre: string;
  descripcion: string;
  lat: string;
  lng: string;
  id_tipo_estacion: number;
  tipo_estacion_nombre: string;
  estacion_mrv: number | null;
}

// Estado de carga con spinner adaptado
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <svg
      className="animate-spin h-10 w-10 text-green-600 dark:text-green-400"
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
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z"
      ></path>
    </svg>
    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
      Cargando datos de la estación...
    </p>
  </div>
);

// Estado de error visual
const ErrorState = ({ message }: { message: string }) => (
  <div className="p-5 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded-xl shadow-sm">
    <p className="font-bold text-red-700 dark:text-red-300">
      Error al cargar el contenido:
    </p>
    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{message}</p>
  </div>
);

const Variables: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
        const data = response.data?.data;

        if (Array.isArray(data) && data.length > 0) {
          setEstacion(data[0]);
        } else {
          setError("No se encontró la estación.");
        }
      } catch (err) {
        console.error("Error al cargar la estación:", err);
        setError("No se pudo cargar la estación. Verifique la conexión.");
      } finally {
        setLoading(false);
      }
    };

    fetchEstacion();
  }, [id]);

  const renderContenido = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;
    if (!estacion)
      return (
        <p className="text-gray-500 dark:text-gray-400 py-6 text-center">
          No hay información disponible.
        </p>
      );

    const idEstacion =
      estacion.estacion_mrv && estacion.estacion_mrv > 0
        ? estacion.estacion_mrv
        : estacion.id;

    return <VariablesMrv idEstacion={idEstacion} />;
  };

  return (
    <>
      <PageMeta
        title="Variables de Monitoreo"
        description="Variables disponibles de la estación."
      />

      {/* Tarjeta principal */}
      <div className="p-8 rounded-3xl shadow-2xl border border-green-200 bg-green-50/60 dark:bg-gray-900/50 dark:border-green-700 transition-all duration-300">
        {/* Header con enlace de retorno */}
        <div className="mb-8 pb-4 border-b border-green-200 dark:border-green-700 flex flex-col gap-2">
          {estacion?.id && (
            <Link
              to={`/monitoreo/${estacion.id}`}
              className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              aria-label={`Volver al resumen de la estación ${estacion.nombre}`}
            >
              <FiChevronLeft className="w-5 h-5 mr-1" />
              Volver al resumen de la estación{" "}
              <span className="font-semibold ml-1">
                ({estacion.nombre || "Cargando..."})
              </span>
            </Link>
          )}

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-green-200">
            Variables disponibles
          </h1>
          <p className="text-sm text-gray-600 dark:text-green-400">
            Consulta los datos registrados por la estación seleccionada.
          </p>
        </div>

        {/* Contenido dinámico */}
        <div className="mt-4">{renderContenido()}</div>
      </div>
    </>
  );
};

export default Variables;
