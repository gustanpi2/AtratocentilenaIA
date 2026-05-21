import React, { useEffect } from "react";
import { FaChevronRight } from "react-icons/fa";
import Card from "./Card";

interface HistoryItem {
    id: number;
    nombre: string;
    descripcion: string;
    lat: string;
    lng: string;
    id_tipo_estacion: number;
    tipo_estacion: string;
}

interface SidebarInfoProps {
    history: HistoryItem[];
    visible: boolean;
    toggleVisible: () => void;
    onClearHistory: () => void;
}

const SidebarInfo: React.FC<SidebarInfoProps> = ({
    history,
    visible,
    toggleVisible,
    onClearHistory,
}) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById("sidebar-info");
            if (
                sidebar &&
                !sidebar.contains(event.target as Node) &&
                window.innerWidth < 768
            ) {
                toggleVisible();
            }
        };

        if (visible) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [visible, toggleVisible]);

    return (
        <>
            {visible && (
                <div className="fixed inset-0 bg-black bg-opacity-40 md:hidden z-40"></div>
            )}

            <div
                id="sidebar-info"
                className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-300 dark:border-gray-700 shadow-lg z-50 transition-transform duration-300 ${visible ? "translate-x-0" : "translate-x-full"}`}
            >
                <button
                    onClick={toggleVisible}
                    className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-r-lg p-2 shadow-md z-10 text-black dark:text-white"
                >
                    <FaChevronRight />
                </button>

                <div className="flex flex-col h-full p-4 text-black dark:text-white">
                    <br />
                    <br />
                    <br />
                    <h2 className="text-xl font-semibold mb-4">Historial de estaciones</h2>
                    <div className="flex-1 overflow-y-auto pr-1">
                        {history.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">No hay estaciones seleccionadas.</p>
                        ) : (
                            <ul className="space-y-2">
                                {history.map((location) => (
                                    <Card key={location.id} estacion={location} />
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="mt-4 shrink-0">
                        <button
                            onClick={onClearHistory}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded shadow"
                        >
                            Limpiar historial
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SidebarInfo;
