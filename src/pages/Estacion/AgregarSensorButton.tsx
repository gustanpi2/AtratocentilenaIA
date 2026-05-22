// src/components/AgregarSensorButton.tsx
import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import { FaPlus } from "react-icons/fa";
import ApiRest from "../../service/ApiRest";
import { toast } from "react-toastify";

interface Sensor {
    id: number;
    nombre: string;
    nombre_tipo_sensor: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface AgregarSensorButtonProps {
    estacionId: number;
}

export const AgregarSensorButton: React.FC<AgregarSensorButtonProps> = ({ estacionId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sensores, setSensores] = useState<Sensor[]>([]);
    const [selectedSensor, setSelectedSensor] = useState<number | null>(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const fetchSensores = async () => {
        try {
            const response = await ApiRest.get<ApiResponse<Sensor[]>>("sensor");
            if (response.data.success) {
                setSensores(response.data.data);
            }
        } catch (error: unknown) {
            console.error("Error al cargar sensores:", error);
            alert("Error al cargar sensores.");
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchSensores();
        }, 10000); // 10 segundos

        fetchSensores();

        return () => clearInterval(intervalId);
    }, []);

    const handleAgregarSensor = async () => {
        if (!selectedSensor) {
            toast.error("Selecciona un sensor para agregar.");
            alert("Selecciona un sensor para agregar.");
            return;
        }

        try {
            const response = await ApiRest.get<ApiResponse<null>>(
                `sensor-estacion?sensor=${selectedSensor}&add=${estacionId}`
            );
            if (response.data.success === true) {
                toast.success("Sensor agregado correctamente.");
                alert("Sensor agregado correctamente.");
                closeModal();
            } else {
                toast.error("Error al agregar el sensor.");
                alert("Error al agregar el sensor.");
            }
        } catch (error: unknown) {
            console.error("Error al agregar el sensor:", error);
            toast.error("Hubo un problema al agregar el sensor.");
            alert("Hubo un problema al agregar el sensor.");
        }
    };

    return (
        <>
            {/* 1. Botón flotante (FAB) - Verde principal */}
            <button
                onClick={() => {
                    openModal();
                    fetchSensores();
                }}
                className="fixed bottom-6 right-6 z-10 bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                aria-label="Agregar un nuevo sensor"
            >
                <FaPlus className="h-6 w-6" />
            </button>

            {/* 2. Modal ampliado (15% más grande) */}
            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                className="max-w-lg w-full p-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-colors duration-300"
            >
                {/* Encabezado */}
                <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center">
                        ➕ Agregar Sensor a la Estación
                    </h2>
                </div>

                {/* Cuerpo */}
                <div className="p-8 space-y-6">
                    <label
                        htmlFor="sensor-select"
                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                        Selecciona un Sensor
                    </label>

                    <div className="relative">
                        <select
                            id="sensor-select"
                            value={selectedSensor ?? ""}
                            onChange={(e) => setSelectedSensor(Number(e.target.value))}
                            className="appearance-none w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 cursor-pointer"
                        >
                            <option
                                value=""
                                disabled
                                className="text-gray-400 dark:text-gray-500"
                            >
                                -- Selecciona un sensor --
                            </option>
                            {sensores.map((sensor) => (
                                <option
                                    key={sensor.id}
                                    value={sensor.id}
                                    className="text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                                >
                                    {sensor.nombre} ({sensor.nombre_tipo_sensor})
                                </option>
                            ))}
                        </select>

                        {/* Flecha de select */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>

                    {/* Botón Confirmar */}
                    <button
                        onClick={handleAgregarSensor}
                        className="w-full bg-green-600 text-white text-lg font-semibold py-3 mt-6 rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                        disabled={!selectedSensor}
                    >
                        Confirmar y Agregar
                    </button>
                </div>
            </Modal>
        </>
    );
};
