// @ts-nocheck
import { useEffect, useState } from "react";
import {
  FaMapMarkerAlt, FaRadiation, FaWater, FaTrash, FaTools,
  FaEye, FaCloudSunRain, FaWind, FaInfoCircle, FaTrashAlt, FaEdit,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import ApiRest from "../../service/ApiRest";
import { AgregarSensorButton } from "./AgregarSensorButton";
import Swal from "sweetalert2";
import LoaderCirculo from "../../components/Loader/LoaderCirculo";
import { Link } from "react-router";
import { LoaderTailwind } from "../../components/Loader/LoaderTailwind";

/* ─── Types ───────────────────────────────────────────────────────── */
interface Estacion {
  id: number; nombre: string; descripcion: string;
  lat: string; lng: string;
  id_tipo_estacion: number; tipo_estacion: string;
}
interface Sensor { id: number; nombre: string; tipo_sensor: string }

/* ─── Station type config ─────────────────────────────────────────── */
const TIPO_CONFIG: Record<number, { nombre: string; color: string; bg: string; darkBg: string; icon: React.ReactNode }> = {
  1: { nombre: "Meteorológico", color: "#06b6d4", bg: "#ecfeff", darkBg: "rgba(6,182,212,0.1)",
       icon: <FaCloudSunRain size={18} /> },
  2: { nombre: "Hidrológico",   color: "#3b82f6", bg: "#eff6ff", darkBg: "rgba(59,130,246,0.1)",
       icon: <FaWater size={18} /> },
  3: { nombre: "Calidad Aire",  color: "#22c55e", bg: "#f0fdf4", darkBg: "rgba(34,197,94,0.1)",
       icon: <FaWind size={18} /> },
  4: { nombre: "Otros",         color: "#f59e0b", bg: "#fffbeb", darkBg: "rgba(245,158,11,0.1)",
       icon: <FaRadiation size={18} /> },
};

/* ─── Skeleton card ───────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="em-card" style={{ animation: "em-pulse 1.6s ease-in-out infinite" }}>
    <style>{`@keyframes em-pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div className="em-sk" style={{ width: 38, height: 38, borderRadius: 10 }} />
      <div className="em-sk" style={{ flex: 1, height: 14 }} />
    </div>
    <div className="em-sk" style={{ height: 12, marginBottom: 8, width: "85%" }} />
    <div className="em-sk" style={{ height: 11, marginBottom: 20, width: "55%" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="em-sk" style={{ width: 80, height: 22, borderRadius: 99 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <div className="em-sk" style={{ width: 30, height: 30, borderRadius: 8 }} />
        <div className="em-sk" style={{ width: 30, height: 30, borderRadius: 8 }} />
      </div>
    </div>
  </div>
);

/* ─── Icon button ─────────────────────────────────────────────────── */
const IconBtn = ({
  icon, color, hoverBg, hoverColor, onClick, title,
}: {
  icon: React.ReactNode; color: string; hoverBg: string; hoverColor: string;
  onClick: (e: React.MouseEvent) => void; title: string;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 32, height: 32, borderRadius: 8,
        border: `1.5px solid ${hovered ? hoverBg : "transparent"}`,
        background: hovered ? hoverBg : "transparent",
        color: hovered ? hoverColor : color,
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {icon}
    </button>
  );
};

/* ─── EstacionManager ─────────────────────────────────────────────── */
export const EstacionManager: React.FC = () => {
  const [sensores, setSensores]               = useState<Sensor[]>([]);
  const [loadingCards, setLoadingCards]       = useState(true);
  const [loadingSensors, setLoadingSensors]   = useState(false);
  const [loadingSave, setLoadingSave]         = useState(false);
  const [estaciones, setEstaciones]           = useState<Estacion[]>([]);
  const [selectedEstacion, setSelectedEstacion] = useState<Estacion | null>(null);
  const [estacionAEditar, setEstacionAEditar] = useState<Estacion | null>(null);
  const [isEditOpen, setIsEditOpen]           = useState(false);
  const [editError, setEditError]             = useState("");

  const { isOpen: isOpenSensors, openModal: openSensorModal, closeModal: closeSensorModal } = useModal();

  /* ── Fetch estaciones ── */
  const fetchEstaciones = async () => {
    try {
      const res = await ApiRest.get("estaciones");
      setEstaciones(res.data.data);
    } catch {
      toast.error("Error cargando estaciones");
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    fetchEstaciones();
    const id = setInterval(fetchEstaciones, 10000);
    return () => clearInterval(id);
  }, []);

  /* ── Fetch sensores ── */
  useEffect(() => {
    if (!selectedEstacion?.id) return;
    setLoadingSensors(true);
    ApiRest.get("sensor-estacion", { params: { id: selectedEstacion.id } })
      .then(res => { if (res.data.success) setSensores(res.data.data); })
      .catch(() => toast.error("No se pudieron cargar los sensores"))
      .finally(() => setLoadingSensors(false));
  }, [selectedEstacion]);

  /* ── Guardar edición ── */
  const handleGuardarCambios = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!estacionAEditar) return;
    const form = e.currentTarget;
    setLoadingSave(true); setEditError("");
    try {
      const res = await ApiRest.post("estaciones/update", {
        id: estacionAEditar.id,
        nombre: form.nombre.value,
        descripcion: form.descripcion.value,
      });
      if (res.data.success) {
        toast.success("Estación actualizada correctamente");
        setIsEditOpen(false);
        fetchEstaciones();
      } else {
        setEditError("Error al actualizar la estación");
      }
    } catch {
      setEditError("Error al actualizar la estación");
    } finally {
      setLoadingSave(false);
    }
  };

  /* ── Editar ── */
  const handleEditEstacion = (id: number) => {
    const est = estaciones.find(e => e.id === id);
    if (!est) return;
    setEstacionAEditar(est); setEditError(""); setIsEditOpen(true);
  };

  /* ── Eliminar sensor ── */
  const handleDeleteSensor = async (id: number) => {
    const ok = await Swal.fire({
      title: "¿Desvincular sensor?",
      text: "El sensor no será eliminado, solo desvinculado de esta estación.",
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Sí, desvincular", cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await ApiRest.post("sensor-estacion-delete", { id });
      if (res.data.success) {
        setSensores(prev => prev.filter(s => s.id !== id));
        toast.success("Sensor desvinculado correctamente");
      } else toast.error("No se pudo desvincular el sensor");
    } catch { toast.error("Error al desvincular el sensor"); }
  };

  /* ── Eliminar estación ── */
  const handleDeleteEstacion = async (id: number) => {
    const ok = await Swal.fire({
      title: "¿Eliminar estación?",
      text: "Esta acción es permanente y no se puede deshacer.",
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
    });
    if (!ok.isConfirmed) return;
    try {
      await ApiRest.post("delete/estaciones", { id });
      setEstaciones(prev => prev.filter(e => e.id !== id));
      toast.success("Estación eliminada correctamente");
    } catch { toast.error("Error al eliminar la estación"); }
  };

  const handleOpenSensorModal = (estacion: Estacion) => {
    setSelectedEstacion(estacion); openSensorModal();
  };

  /* ── Coord formatter ── */
  const fmtCoord = (v: string) => parseFloat(v.replace(",", ".")).toFixed(5);

  /* ─────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .em-root { font-family: 'Outfit', sans-serif; }
        .em-mono { font-family: 'JetBrains Mono', monospace; }

        /* Grid */
        .em-grid {
          display: grid; gap: 16px;
          grid-template-columns: repeat(1, 1fr);
        }
        @media(min-width:640px)  { .em-grid { grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px) { .em-grid { grid-template-columns: repeat(3,1fr); } }
        @media(min-width:1440px) { .em-grid { grid-template-columns: repeat(4,1fr); } }

        /* Estacion card */
        .em-card {
          position: relative;
          display: flex; flex-direction: column;
          padding: 20px; border-radius: 16px;
          border: 1.5px solid #f0f0f0;
          background: #ffffff;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.18s;
          cursor: pointer;
        }
        .dark .em-card { background: #0a1628; border-color: #1e293b; }
        .em-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.08);
          border-color: #86efac;
          transform: translateY(-2px);
        }
        .dark .em-card:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.3);
          border-color: rgba(132,204,22,0.25);
        }

        /* Skeleton */
        .em-sk { background: #f0f0f0; border-radius: 6px; }
        .dark .em-sk { background: #1e293b; }

        /* Station name */
        .em-name {
          font-size: 14.5px; font-weight: 700; color: #111827;
          line-height: 1.3; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dark .em-name { color: #e2e8f0; }

        .em-desc {
          font-size: 12.5px; color: #6b7280; line-height: 1.55;
          margin: 0 0 10px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .dark .em-desc { color: #334155; }

        .em-coords {
          display: flex; align-items: center; gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #9ca3af; margin-bottom: 14px;
        }
        .dark .em-coords { color: #1e293b; }

        .em-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 600;
        }

        /* Modal field */
        .em-field {
          width: 100%; padding: 10px 14px;
          border-radius: 11px; border: 1.5px solid #e5e7eb;
          background: #f9fafb; font-family: 'Outfit', sans-serif;
          font-size: 14px; color: #111827; outline: none;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .dark .em-field { background: #0f172a; border-color: #1e293b; color: #e2e8f0; }
        .em-field:focus {
          background: #fff; border-color: #84cc16;
          box-shadow: 0 0 0 3px rgba(132,204,22,0.14);
        }
        .dark .em-field:focus {
          background: #020817; border-color: #84cc16;
          box-shadow: 0 0 0 3px rgba(132,204,22,0.1);
        }

        .em-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #6b7280; margin-bottom: 6px;
        }
        .dark .em-label { color: #334155; }

        /* Table */
        .em-table { width: 100%; border-collapse: collapse; }
        .em-th {
          padding: 10px 16px; text-align: left;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #9ca3af; background: #f9fafb;
          border-bottom: 1px solid #f0f0f0;
        }
        .dark .em-th { background: #0f172a; color: #334155; border-bottom-color: #1e293b; }
        .em-td {
          padding: 12px 16px;
          font-size: 13.5px; color: #374151;
          border-bottom: 1px solid #f9fafb;
          vertical-align: middle;
        }
        .dark .em-td { color: #94a3b8; border-bottom-color: #0f172a; }
        .em-tr:hover .em-td { background: #f0fdf4; }
        .dark .em-tr:hover .em-td { background: rgba(132,204,22,0.04); }

        /* Buttons */
        .em-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 11px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 700;
          transition: opacity 0.18s, transform 0.14s, box-shadow 0.18s;
          box-shadow: 0 3px 12px rgba(34,197,94,0.25);
        }
        .em-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .em-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .em-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 11px;
          border: 1.5px solid #e5e7eb;
          background: transparent; cursor: pointer;
          color: #6b7280; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 500;
          transition: all 0.15s;
        }
        .em-btn-ghost:hover { border-color: #86efac; color: #16a34a; background: #f0fdf4; }
        .dark .em-btn-ghost { border-color: #1e293b; color: #334155; }
        .dark .em-btn-ghost:hover { border-color: rgba(132,204,22,0.3); color: #84cc16; background: rgba(132,204,22,0.06); }

        .em-btn-outline-green {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 11px;
          border: 1.5px solid rgba(34,197,94,0.35);
          background: rgba(34,197,94,0.05); cursor: pointer;
          color: #16a34a; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600;
          text-decoration: none;
          transition: all 0.15s;
        }
        .em-btn-outline-green:hover { background: #f0fdf4; border-color: #22c55e; }
        .dark .em-btn-outline-green { color: #84cc16; border-color: rgba(132,204,22,0.3); background: rgba(132,204,22,0.06); }
        .dark .em-btn-outline-green:hover { background: rgba(132,204,22,0.1); }

        .em-btn-danger {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer;
          background: rgba(239,68,68,0.08);
          border: 1.5px solid rgba(239,68,68,0.2);
          color: #ef4444; font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 600;
          transition: all 0.15s;
        }
        .em-btn-danger:hover { background: #fef2f2; border-color: rgba(239,68,68,0.4); }
        .dark .em-btn-danger { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.15); }
        .dark .em-btn-danger:hover { background: rgba(239,68,68,0.12); }

        /* Section card (info box in modal) */
        .em-info-box {
          padding: 16px 18px; border-radius: 13px;
          background: #f9fafb; border: 1.5px solid #f0f0f0;
        }
        .dark .em-info-box { background: #0f172a; border-color: #1e293b; }

        /* Empty state */
        .em-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; padding: 56px 20px; text-align: center;
          border: 1.5px dashed #e5e7eb; border-radius: 16px;
        }
        .dark .em-empty { border-color: #1e293b; }
      `}</style>

      <div className="em-root">

        {/* ── Station cards grid ── */}
        <div className="em-grid">
          {loadingCards
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : estaciones.map(estacion => {
                const cfg = TIPO_CONFIG[estacion.id_tipo_estacion];
                const color    = cfg?.color    ?? "#84cc16";
                const bgColor  = cfg?.bg       ?? "#f0fdf4";

                return (
                  <div
                    key={estacion.id}
                    className="em-card"
                    onClick={() => handleOpenSensorModal(estacion)}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: bgColor, color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {cfg?.icon ?? <FaMapMarkerAlt size={16} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: "0 0 1px", fontSize: 9.5, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>
                          #{estacion.id}
                        </p>
                        <h3 className="em-name">{estacion.nombre}</h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="em-desc">{estacion.descripcion || "Sin descripción"}</p>

                    {/* Coords */}
                    <div className="em-coords">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 1C4.686 1 2 3.686 2 7c0 4.667 6 9 6 9s6-4.333 6-9c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {fmtCoord(estacion.lat)}, {fmtCoord(estacion.lng)}
                    </div>

                    {/* Footer: badge + actions */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto" }}>
                      <span className="em-badge" style={{ background: bgColor, color }}>
                        {cfg?.icon}
                        {cfg?.nombre ?? estacion.tipo_estacion}
                      </span>

                      <div style={{ display: "flex", gap: 4 }}>
                        <IconBtn
                          icon={<FaEdit size={13} />}
                          color="#3b82f6" hoverBg="#eff6ff" hoverColor="#1d4ed8"
                          title="Editar estación"
                          onClick={e => { e.stopPropagation(); handleEditEstacion(estacion.id); }}
                        />
                        <IconBtn
                          icon={<FaTrash size={13} />}
                          color="#ef4444" hoverBg="#fef2f2" hoverColor="#b91c1c"
                          title="Eliminar estación"
                          onClick={e => { e.stopPropagation(); handleDeleteEstacion(estacion.id); }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* ── Modal: Sensores ── */}
        <Modal
          isOpen={isOpenSensors}
          onClose={closeSensorModal}
          className="max-w-4xl p-0 rounded-2xl overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-2xl"
        >
          {selectedEstacion && (() => {
            const cfg   = TIPO_CONFIG[selectedEstacion.id_tipo_estacion];
            const color = cfg?.color ?? "#22c55e";
            const bg    = cfg?.bg    ?? "#f0fdf4";
            return (
              <div className="em-root">
                {/* Modal header band */}
                <div style={{
                  padding: "22px 28px 18px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: bg, color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FaTools size={18} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>
                      Gestión de sensores
                    </p>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }} className="dark:text-white">
                      {selectedEstacion.nombre}
                    </h2>
                  </div>
                </div>

                <div style={{ padding: "22px 28px" }}>
                  {/* Info box */}
                  <div className="em-info-box" style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span className="em-badge" style={{ background: bg, color, padding: "3px 10px" }}>
                        {cfg?.icon} {cfg?.nombre ?? selectedEstacion.tipo_estacion}
                      </span>
                      <span className="em-coords">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M8 1C4.686 1 2 3.686 2 7c0 4.667 6 9 6 9s6-4.333 6-9c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        {fmtCoord(selectedEstacion.lat)}, {fmtCoord(selectedEstacion.lng)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.55 }} className="dark:text-slate-500">
                      {selectedEstacion.descripcion || "Sin descripción"}
                    </p>
                  </div>

                  {/* Action row */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20 }}>
                    <Link
                      to={`/monitoring/${selectedEstacion.id}`}
                      className="em-btn-outline-green"
                    >
                      <FaEye size={13} /> Ver monitoreo
                    </Link>
                    <AgregarSensorButton
                      estacionId={selectedEstacion.id}
                      onSensorAdded={(s: Sensor) => setSensores(prev => [...prev, s])}
                      className="em-btn-primary"
                    />
                  </div>

                  {/* Sensors table */}
                  {loadingSensors ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "48px 0" }}>
                      <LoaderCirculo />
                      <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>Cargando sensores...</p>
                    </div>
                  ) : sensores.length > 0 ? (
                    <div style={{ borderRadius: 13, border: "1.5px solid #f0f0f0", overflow: "hidden" }} className="dark:border-slate-800">
                      <table className="em-table">
                        <thead>
                          <tr>
                            {["ID", "Nombre", "Tipo de sensor", "Acciones"].map(h => (
                              <th key={h} className="em-th">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sensores.map(sensor => (
                            <tr key={sensor.id} className="em-tr">
                              <td className="em-td">
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#9ca3af" }}>
                                  #{sensor.id}
                                </span>
                              </td>
                              <td className="em-td" style={{ fontWeight: 500 }}>{sensor.nombre}</td>
                              <td className="em-td">
                                <span style={{
                                  display: "inline-flex", alignItems: "center",
                                  padding: "3px 10px", borderRadius: 99,
                                  background: "#eff6ff", color: "#3b82f6",
                                  fontSize: 11, fontWeight: 600, border: "1px solid rgba(59,130,246,0.2)",
                                }}>
                                  {sensor.tipo_sensor}
                                </span>
                              </td>
                              <td className="em-td">
                                <button
                                  onClick={() => handleDeleteSensor(sensor.id)}
                                  className="em-btn-danger"
                                >
                                  <FaTrashAlt size={11} /> Desvincular
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="em-empty">
                      <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: "#f9fafb", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }} className="dark:bg-slate-900">
                        <FaInfoCircle size={22} color="#d1d5db" />
                      </div>
                      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#374151" }} className="dark:text-slate-600">
                        Sin sensores asociados
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }} className="dark:text-slate-700">
                        Agrega el primero usando el botón de arriba
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>

        {/* ── Modal: Editar estación ── */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          className="max-w-md p-0 rounded-2xl overflow-hidden bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-2xl"
        >
          {estacionAEditar && (
            <div className="em-root">
              {/* Header */}
              <div style={{
                padding: "20px 24px 16px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex", alignItems: "center", gap: 12,
              }} className="dark:border-slate-800">
                <div style={{
                  width: 40, height: 40, borderRadius: 11, background: "#f0fdf4",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e",
                }}>
                  <FaEdit size={16} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 9.5, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>
                    Editando #{estacionAEditar.id}
                  </p>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }} className="dark:text-white">
                    {estacionAEditar.nombre}
                  </h2>
                </div>
              </div>

              <form onSubmit={handleGuardarCambios}>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {editError && (
                    <div style={{
                      padding: "10px 14px", borderRadius: 10,
                      background: "#fef2f2", border: "1px solid #fecaca",
                      fontSize: 13, color: "#b91c1c",
                    }}>
                      {editError}
                    </div>
                  )}

                  {loadingSave ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                      <LoaderTailwind />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="em-label">Nombre</label>
                        <input name="nombre" defaultValue={estacionAEditar.nombre} className="em-field" />
                      </div>
                      <div>
                        <label className="em-label">Descripción</label>
                        <textarea
                          name="descripcion"
                          defaultValue={estacionAEditar.descripcion}
                          rows={3}
                          className="em-field"
                          style={{ height: "auto", resize: "vertical" }}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Footer actions */}
                <div style={{
                  padding: "14px 24px",
                  borderTop: "1px solid #f0f0f0",
                  display: "flex", justifyContent: "flex-end", gap: 10,
                }} className="dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="em-btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingSave}
                    className="em-btn-primary"
                  >
                    {loadingSave ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "em-spin 0.8s linear infinite" }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                          <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                          <style>{`@keyframes em-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" />
                          <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2" />
                          <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};