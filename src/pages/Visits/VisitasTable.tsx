import React, { useEffect, useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Smartphone,
    Calendar,
    Hash,
    Search,
    RefreshCcw,
    AlertCircle
} from "lucide-react";
import axios from "axios";

// --- INTERFAZ ---
interface Visita {
    id: number;
    dispositivo: string;
    fecha: string;
}

const VisitasTable: React.FC = () => {
    const [visitas, setVisitas] = useState<Visita[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [visitasPerPage] = useState(10);
    const [filtro, setFiltro] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- OBTENER VISITAS DESDE LA API ---
    const fetchVisitas = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await axios.get<Visita[]>("https://api.helsy.com.co/api/visitas");

            const dataOrdenada = response.data.sort(
                (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            setVisitas(dataOrdenada);
        } catch (err) {
            console.error("Error al obtener las visitas:", err);
            setError("No fue posible conectar con el servidor. Mostrando los últimos datos disponibles.");
        } finally {
            setLoading(false);
        }
    }, []);

    // --- PRIMERA CARGA Y AUTO REFRESH ---
    useEffect(() => {
        fetchVisitas();
        const intervalo = setInterval(fetchVisitas, 30000);
        return () => clearInterval(intervalo);
    }, [fetchVisitas]);

    // --- FILTRO Y PAGINACIÓN ---
    const visitasFiltradas = visitas.filter((v) =>
        v.dispositivo.toLowerCase().includes(filtro.toLowerCase())
    );

    const indexOfLastVisita = currentPage * visitasPerPage;
    const indexOfFirstVisita = indexOfLastVisita - visitasPerPage;
    const currentVisitas = visitasFiltradas.slice(indexOfFirstVisita, indexOfLastVisita);
    const totalPages = Math.ceil(visitasFiltradas.length / visitasPerPage);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0) {
            setCurrentPage(1);
        }
    }, [filtro, visitas.length, totalPages, currentPage]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans p-4 sm:p-8">
            <div className="max-w-[85%] mx-auto transition-colors duration-300">

                {/* --- CABECERA --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400 flex items-center gap-2 tracking-tight">
                        <Smartphone className="w-6 h-6" /> Registro de Visitas
                    </h2>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
                            <Hash className="w-4 h-4" /> Total:{" "}
                            <span className="font-bold text-green-600 dark:text-green-400">
                                {visitasFiltradas.length}
                            </span>
                        </div>
                        <button
                            onClick={fetchVisitas}
                            disabled={loading}
                            className={`px-3 py-1 rounded-lg text-white transition duration-200 shadow-md flex items-center gap-1 text-sm font-semibold ${
                                loading
                                    ? "bg-green-400 cursor-wait"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            {loading ? "Cargando..." : "Actualizar"}
                        </button>
                    </div>
                </div>

                {/* --- BUSCADOR --- */}
                <div className="mb-6 relative">
                    <Search className="absolute top-3 left-3 text-gray-500 dark:text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Filtrar por dispositivo (ej: 'Mobile', 'Chrome')"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>

                {/* --- ERROR --- */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                {/* --- LOADING --- */}
                {loading && visitas.length === 0 ? (
                    <div className="flex justify-center py-16">
                        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* --- TABLA (DESKTOP) --- */}
                        <div className="overflow-x-auto rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hidden md:block">
                            <table className="min-w-full text-sm text-left bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                                <thead className="bg-green-50 dark:bg-gray-800 text-green-800 dark:text-green-300 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 border-b-2 border-green-200 dark:border-green-900 w-1/12">
                                            <div className="flex items-center gap-1">
                                                <Hash className="w-4 h-4" /> #
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 border-b-2 border-green-200 dark:border-green-900 w-6/12">
                                            <div className="flex items-center gap-1">
                                                <Smartphone className="w-4 h-4" /> Dispositivo
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 border-b-2 border-green-200 dark:border-green-900 w-4/12">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" /> Fecha y hora
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentVisitas.length > 0 ? (
                                        currentVisitas.map((visita, index) => (
                                            <tr
                                                key={visita.id}
                                                className="border-b border-gray-100 dark:border-gray-800 hover:bg-green-50/40 dark:hover:bg-gray-700 transition-colors duration-150"
                                            >
                                                <td className="px-4 py-3 font-mono text-xs text-center">
                                                    {indexOfFirstVisita + index + 1}
                                                </td>
                                                <td className="px-4 py-3 break-words font-medium">
                                                    {visita.dispositivo}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                                                    {new Date(visita.fecha).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                No se encontraron resultados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* --- TARJETAS (MÓVIL) --- */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {currentVisitas.length > 0 ? (
                                currentVisitas.map((visita, index) => (
                                    <div
                                        key={visita.id}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-dashed dark:border-gray-700">
                                            <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                                Visita #{indexOfFirstVisita + index + 1}
                                            </span>
                                            <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium break-words mb-2">
                                            {visita.dispositivo}
                                        </p>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(visita.fecha).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500 dark:text-gray-400 border rounded-xl shadow-md">
                                    No se encontraron resultados.
                                </div>
                            )}
                        </div>

                        {/* --- PAGINACIÓN --- */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || totalPages <= 1 || loading}
                                className="flex items-center justify-center px-4 py-2 bg-green-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-green-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
                            >
                                <ChevronLeft className="mr-1 w-5 h-5" /> Anterior
                            </button>

                            <span className="text-gray-600 dark:text-gray-300 text-center my-3 sm:my-0">
                                Página{" "}
                                <strong className="text-green-600 dark:text-green-400">
                                    {currentPage}
                                </strong>{" "}
                                de{" "}
                                <strong className="text-green-600 dark:text-green-400">
                                    {totalPages || 1}
                                </strong>
                            </span>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages <= 1 || loading}
                                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors shadow-sm"
                            >
                                Siguiente <ChevronRight className="ml-1 w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VisitasTable;
