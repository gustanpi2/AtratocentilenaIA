// UserManager.tsx
// Componente unificado: lógica original (ApiHelsy) + diseño conceptual (CustomToast, ConfirmationModal)
// TypeScript + React

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCcw,
  X,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Ban,
} from "lucide-react";
import ApiHelsy from "../../service/ApiHelsy";
import Helper from "../../service/Helper";

/* -------------------------
   Tipos
   ------------------------- */
type User = {
  id: number;
  nombre: string;
  nombreUsuario: string;
  email: string;
  rol: 1 | 2 | 3; // 1: Admin, 2: Cliente, 3: Usuario
  estado: 1 | 2; // 1: Activo, 2: Bloqueado
};

type NotificationType = "success" | "error" | "info";
type Notification = { id: number; message: string; type: NotificationType; };

/* -------------------------
   Constantes
   ------------------------- */
const ITEMS_PER_PAGE = 10;

/* -------------------------
   CustomToast - Notificaciones
   ------------------------- */
const CustomToast: React.FC<{
  notifications: Notification[];
  removeNotification: (id: number) => void;
}> = ({ notifications, removeNotification }) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "error":
        return <X className="w-5 h-5 text-white" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-white" />;
    }
  };

  const getBg = (type: NotificationType) =>
    type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`${getBg(n.type)} text-white rounded-lg shadow-xl min-w-[260px] p-3 flex items-start gap-3 transform transition-all duration-300`}
          role="status"
        >
          <div className="pt-0.5">{getIcon(n.type)}</div>
          <div className="flex-1 text-sm font-medium">{n.message}</div>
          <button
            onClick={() => removeNotification(n.id)}
            className="ml-2 text-white opacity-80 hover:opacity-100 p-1 rounded"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

/* -------------------------
   ConfirmationModal (modal 15% más grande)
   ------------------------- */
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  text: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  processing?: boolean;
}> = ({ isOpen, title, text, onConfirm, onCancel, processing }) => {
  if (!isOpen) return null;
  // Modal width = ~15% larger than a small modal: use max-w-md (was max-w-sm)
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all duration-250 p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-3 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={processing}
            className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {processing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------
   Componente Final (UserManager)
   ------------------------- */
const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const nextNotificationId = useRef(1);
  const addNotification = useCallback((message: string, type: NotificationType = "info") => {
    const id = nextNotificationId.current++;
    setNotifications((prev) => [...prev, { id, message, type }]);
    // auto-dismiss
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4200);
  }, []);
  const removeNotification = useCallback((id: number) => setNotifications((prev) => prev.filter((n) => n.id !== id)), []);

  // Confirmation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Fetch users (original logic using ApiHelsy)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiHelsy.post("users");
      // original expected response.data (array)
      const data = res?.data ?? [];
      setUsers(data);
      addNotification("Usuarios cargados correctamente", "success");
    } catch (err) {
      console.error("Error fetching users:", err);
      addNotification("Error al cargar usuarios. Intentando mostrar datos en cache.", "error");
      // fallback: keep current users (no destructive behavior)
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtering & pagination
  const filteredUsers = users.filter((user) =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Handlers: block, toggle role, delete (open modal), confirm delete (call API)
  const handleBlock = async (id: number) => {
    setProcessingId(id);

    try {
      const user = users.find(u => u.id === id);
      if (!user) return;

      const newEstado: User["estado"] = user.estado === 2 ? 1 : 2;

      const response = await fetch(
        `${Helper.url}users/block/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            estado: newEstado.toString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      // Actualiza el estado solo si el backend respondió correctamente
      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, estado: newEstado } : u
        )
      );

      addNotification(
        `Usuario ${newEstado === 1 ? "desbloqueado" : "bloqueado"} correctamente`,
        "info"
      );

    } catch (err) {
      console.error("Error blocking user:", err);
      addNotification("Error al actualizar estado del usuario", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleRole = async (id: number) => {
    setProcessingId(id);
    try {
      const user = users.find((u) => u.id === id);
      if (!user) return;
      let newRol: User["rol"] = 1;
      if (user.rol === 1) newRol = 2;
      else if (user.rol === 2) newRol = 3;
      else newRol = 1;

      const response = await fetch(
        `${Helper.url}users/rol/${id}/${newRol}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            rol: newRol.toString(),
          }),
        }
      );

      if (!response.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, rol: newRol } : u)));
        addNotification(`Rol actualizado a ${getRolName(newRol)}`, "success");
      }

      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, rol: newRol } : u
        )
      );

      addNotification(
        `Rol actualizado a ${getRolName(newRol)}`,
        "success"
      );
    } catch (err) {
      console.error("Error changing role:", err);
      addNotification("Error al cambiar rol", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = (id: number) => {
    setUserToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete === null) return;
    setProcessingId(userToDelete);
    try {

      const response = await fetch(
        `${Helper.url}users/delete/${userToDelete}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
        addNotification("Usuario eliminado correctamente", "success");
        const remaining = filteredUsers.filter(u => u.id !== userToDelete).length;
        const newTotalPages = Math.max(1, Math.ceil(remaining / ITEMS_PER_PAGE));
        if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      addNotification("Error al eliminar usuario", "error");
    } finally {
      setProcessingId(null);
      setUserToDelete(null);
      setIsModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
    setIsModalOpen(false);
  };

  // Helpers
  const getRolName = (rol: User["rol"]) => (rol === 1 ? "Administrador" : rol === 2 ? "Cliente" : "Usuario");
  const getNextRolLabel = (rol: User["rol"]) => (rol === 1 ? "➡ Cliente" : rol === 2 ? "➡ Usuario" : "➡ Admin");

  // Pagination controls
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Administra usuarios, roles y estados — estilo y comportamiento consistentes.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={fetchUsers}
              className={`p-2 rounded-full shadow-md text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
              disabled={loading}
              title="Recargar Usuarios"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <input
              type="text"
              placeholder="Buscar por nombre, usuario o email"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-green-200 dark:bg-gray-700 dark:text-white transition"
            />
          </div>
        </header>

        {/* Count & Loading */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg text-gray-700 dark:text-gray-300">Usuarios encontrados: <strong className="text-green-600">{filteredUsers.length}</strong></p>
          {(loading || processingId) && (
            <div className="flex items-center text-green-600 gap-2">
              <RefreshCcw className="w-4 h-4 animate-spin" />
              <span className="text-sm">{loading ? "Cargando..." : "Procesando..."}</span>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-xl shadow-2xl">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-white dark:bg-gray-800">
              <tr>
                <th className="text-left p-4 font-semibold">#</th>
                <th className="text-left p-4 font-semibold">Nombre</th>
                <th className="text-left p-4 font-semibold">Usuario</th>
                <th className="text-left p-4 font-semibold">Correo</th>
                <th className="text-left p-4 font-semibold">Rol</th>
                <th className="text-left p-4 font-semibold">Estado</th>
                <th className="text-center p-4 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-900">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500 dark:text-gray-400">No se encontraron usuarios.</td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-green-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-4 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                    <td className="p-4">{user.nombre}</td>
                    <td className="p-4">{user.nombreUsuario}</td>
                    <td className="p-4 font-mono text-xs">{user.email}</td>
                    <td className="p-4 font-semibold">{getRolName(user.rol)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.estado === 1 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
                        {user.estado === 1 ? "ACTIVO" : "BLOQUEADO"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => handleBlock(user.id)}
                          disabled={processingId === user.id}
                          className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition disabled:opacity-60 disabled:cursor-wait"
                          title={user.estado === 1 ? "Bloquear usuario" : "Desbloquear usuario"}
                        >
                          {processingId === user.id ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
                        </button>

                        <button
                          onClick={() => handleToggleRole(user.id)}
                          disabled={processingId === user.id}
                          className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 transition disabled:opacity-60"
                        >
                          {processingId === user.id ? <RefreshCcw className="w-3 h-3 mr-1 animate-spin inline-block" /> : null}
                          {getNextRolLabel(user.rol)}
                        </button>

                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={processingId === user.id}
                          className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition disabled:opacity-60"
                          title="Eliminar usuario"
                        >
                          {processingId === user.id ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden grid gap-4 mt-4">
          {paginatedUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 border rounded-xl shadow-lg dark:border-gray-700">
              No se encontraron usuarios.
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <div key={user.id} className="border rounded-xl p-4 shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-lg dark:text-white">{user.nombre}</p>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.estado === 1 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}>
                    {user.estado === 1 ? "ACTIVO" : "BLOQUEADO"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Usuario:</strong> {user.nombreUsuario}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono text-xs"><strong>Correo:</strong> {user.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"><strong>Rol:</strong> <span className="font-semibold">{getRolName(user.rol)}</span></p>

                <div className="flex justify-start gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleBlock(user.id)}
                    disabled={processingId === user.id}
                    className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition disabled:opacity-60"
                  >
                    {processingId === user.id ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Ban className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => handleToggleRole(user.id)}
                    disabled={processingId === user.id}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 transition disabled:opacity-60"
                  >
                    {processingId === user.id ? <RefreshCcw className="w-3 h-3 mr-1 animate-spin inline-block" /> : null}
                    {getNextRolLabel(user.rol)}
                  </button>

                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={processingId === user.id}
                    className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition disabled:opacity-60"
                  >
                    {processingId === user.id ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1 || loading || !!processingId}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-200 transition"
          >
            Anterior
          </button>

          <span className="text-gray-700 dark:text-white font-medium">
            Página <strong className="text-green-600">{currentPage}</strong> de <strong className="text-green-600">{totalPages}</strong>
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || loading || !!processingId}
            className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
          >
            Siguiente
          </button>
        </div>

      </div>

      {/* Confirmation modal + Custom toast */}
      <ConfirmationModal
        isOpen={isModalOpen}
        title="¿Estás seguro?"
        text="Esta acción eliminará permanentemente al usuario. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        processing={processingId !== null && userToDelete === processingId}
      />

      <CustomToast notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
};

export default UserManager;
