// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaMicrochip,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import ApiRest from "../service/ApiRest";
import { Modal } from "../components/ui/modal";
import "react-toastify/dist/ReactToastify.css";
import "@sweetalert2/theme-dark/dark.css";

export default function SensoresPage() {
  const [sensores, setSensores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoSensores, setTipoSensores] = useState([]);
  const [graficos, setGraficos] = useState([]);
  const [newSensor, setNewSensor] = useState({
    nombre: "",
    minimo: "",
    maximo: "",
    codigo: "",
    grafico: 0,
    tipo_sensor: 0,
  });

  // Cargar datos
  useEffect(() => {
    fetchSensores();
    fetchTipoSensores();
    fetchGraficos();
  }, []);

  const fetchSensores = async () => {
    try {
      const res = await ApiRest.get("sensor");
      setSensores(res.data.data);
      setFiltered(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTipoSensores = async () => {
    try {
      const res = await ApiRest.get("tipo_sensor");
      setTipoSensores(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGraficos = async () => {
    try {
      const res = await ApiRest.post("charts");
      setGraficos(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Búsqueda
  useEffect(() => {
    const results = sensores.filter(
      (s) =>
        s.nombre.toLowerCase().includes(search.toLowerCase()) ||
        s.codigo.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
    setCurrentPage(1);
  }, [search, sensores]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentSensors = filtered.slice(indexOfFirst, indexOfLast);
  const paginate = (num) => setCurrentPage(num);

  // Modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewSensor({
      nombre: "",
      minimo: "",
      maximo: "",
      codigo: "",
      grafico: 0,
      tipo_sensor: 0,
    });
  };

  // Cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSensor({ ...newSensor, [name]: value });
  };

  // Crear sensor
  const handleCreateSensor = async () => {
    if (
      !newSensor.nombre ||
      !newSensor.codigo ||
      !newSensor.minimo ||
      !newSensor.maximo ||
      newSensor.tipo_sensor === 0 ||
      newSensor.grafico === 0
    ) {
      toast.error("⚠️ Todos los campos son obligatorios.");
      return;
    }

    try {
      const res = await ApiRest.post("/add/sensor", newSensor);
      if (res.data.success) {
        toast.success("✅ Sensor registrado correctamente.");
        fetchSensores();
        closeModal();
      } else toast.error("❌ " + res.data.message);
    } catch {
      toast.error("🚨 Error al registrar el sensor.");
    }
  };

  // Eliminar sensor
  const handleDeleteSensor = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar sensor?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        const res = await ApiRest.post("delete-sensor", { sensorId: id });
        if (res.data.success) {
          Swal.fire("Eliminado", "Sensor eliminado correctamente.", "success");
          fetchSensores();
        } else {
          Swal.fire("Error", res.data.message, "error");
        }
      } catch {
        Swal.fire("Error", "No se pudo eliminar el sensor.", "error");
      }
    }
  };

  // Render
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
        {/* Encabezado */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FaMicrochip className="text-green-600 text-3xl" />
            Gestión de Sensores
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={openModal}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
            >
              <FaPlus /> Añadir Sensor
            </button>
          </div>
        </header>

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Código
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Rango (min / máx)
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Tipo
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSensors.length ? (
                currentSensors.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-3">{s.nombre}</td>
                    <td className="px-6 py-3">{s.codigo}</td>
                    <td className="px-6 py-3">
                      {s.minimo} / {s.maximo}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {s.nombre_tipo_sensor}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button className="text-green-600 hover:text-green-800 mr-4">
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteSensor(s.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No se encontraron sensores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Mostrando {indexOfFirst + 1} -{" "}
            {Math.min(indexOfLast, filtered.length)} de {filtered.length}
          </p>
          <div className="flex space-x-1">
            {Array.from(
              { length: Math.ceil(filtered.length / itemsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-11/12 md:w-2/3 lg:w-[57.5%] mx-auto mt-10"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registrar nuevo sensor
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-gray-700 font-medium mb-1">Nombre *</span>
            <input
              name="nombre"
              value={newSensor.nombre}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium mb-1">Código *</span>
            <input
              name="codigo"
              value={newSensor.codigo}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium mb-1">Mínimo *</span>
            <input
              type="number"
              name="minimo"
              value={newSensor.minimo}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium mb-1">Máximo *</span>
            <input
              type="number"
              name="maximo"
              value={newSensor.maximo}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium mb-1">
              Tipo de Sensor *
            </span>
            <select
              name="tipo_sensor"
              value={newSensor.tipo_sensor}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value={0}>Seleccione</option>
              {tipoSensores.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium mb-1">Gráfico *</span>
            <select
              name="grafico"
              value={newSensor.grafico}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value={0}>Seleccione</option>
              {graficos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={closeModal}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateSensor}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Guardar
          </button>
        </div>
      </Modal>
    </div>
  );
}
