import { JSX, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiHelsy from "../../service/ApiHelsy";
import {
  FaTemperatureHigh, FaWind, FaCloud, FaCompressAlt, FaSun,
  FaCloudRain, FaCloudShowersHeavy, FaGasPump, FaSmog,
  FaBurn, FaArrowUp, FaWater, FaTachometerAlt, FaRadiation,
  FaThermometerHalf,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

/* ─── Types ───────────────────────────────────────────────────────── */
interface Variable {
  id: number;
  nombre: string;
  codigo: string;
  estado: number; // 0 = ACTIVO | 1 = INACTIVO
}
interface Props { idEstacion: number }
interface Dato { lectura: string; hora: string; fecha: string }

/* ─── Icon map config ─────────────────────────────────────────────── */
const ICON_CONFIG: Record<string, { icon: JSX.Element; color: string; bg: string; darkBg: string }> = {
  V1:  { icon: <FaWater size={18} />,           color: "#3b82f6", bg: "#eff6ff",  darkBg: "rgba(59,130,246,0.12)" },
  V2:  { icon: <FaArrowUp size={18} />,          color: "#14b8a6", bg: "#f0fdfa",  darkBg: "rgba(20,184,166,0.12)" },
  V3:  { icon: <FaWind size={18} />,             color: "#06b6d4", bg: "#ecfeff",  darkBg: "rgba(6,182,212,0.12)" },
  V4:  { icon: <FaTachometerAlt size={18} />,    color: "#22c55e", bg: "#f0fdf4",  darkBg: "rgba(34,197,94,0.12)" },
  V5:  { icon: <FaTemperatureHigh size={18} />,  color: "#ef4444", bg: "#fef2f2",  darkBg: "rgba(239,68,68,0.12)" },
  V6:  { icon: <FaCloudRain size={18} />,        color: "#60a5fa", bg: "#eff6ff",  darkBg: "rgba(96,165,250,0.12)" },
  V7:  { icon: <FaCloudShowersHeavy size={18} />,color: "#1d4ed8", bg: "#eff6ff",  darkBg: "rgba(29,78,216,0.12)" },
  V8:  { icon: <FaThermometerHalf size={18} />,  color: "#16a34a", bg: "#f0fdf4",  darkBg: "rgba(22,163,74,0.12)" },
  V9:  { icon: <FaCompressAlt size={18} />,      color: "#a855f7", bg: "#faf5ff",  darkBg: "rgba(168,85,247,0.12)" },
  V10: { icon: <FaSun size={18} />,              color: "#f59e0b", bg: "#fffbeb",  darkBg: "rgba(245,158,11,0.12)" },
  V12: { icon: <FaGasPump size={18} />,          color: "#ea580c", bg: "#fff7ed",  darkBg: "rgba(234,88,12,0.12)" },
  V13: { icon: <FaSmog size={18} />,             color: "#6b7280", bg: "#f9fafb",  darkBg: "rgba(107,114,128,0.12)" },
  V15: { icon: <FaBurn size={18} />,             color: "#ec4899", bg: "#fdf2f8",  darkBg: "rgba(236,72,153,0.12)" },
  V16: { icon: <FaRadiation size={18} />,        color: "#dc2626", bg: "#fef2f2",  darkBg: "rgba(220,38,38,0.12)" },
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
const formatearLectura = (lectura: string, codigo: string): string => {
  const regex = new RegExp(`(\\d+(\\.\\d+)?)(?=${codigo})`);
  const match = lectura.match(regex);
  const valorStr = match ? match[1] : null;
  const num = valorStr ? parseFloat(valorStr) : NaN;
  if (isNaN(num)) return "—";
  switch (codigo) {
    case "V5":  return `${num.toFixed(1)} °C`;
    case "V8":  return `${Math.round(num)} %`;
    case "V9":  return valorStr && valorStr.length > 5
      ? `${(num / 100000).toFixed(5)} bar`
      : `0.${valorStr?.padStart(5, "0")} bar`;
    case "V3":
    case "V4":  return `${num.toFixed(1)} km/h`;
    case "V6":
    case "V7":  return `${num.toFixed(1)} mm`;
    case "V1":
    case "V2":  return `${num.toFixed(2)} m`;
    case "V10": return `${num.toFixed(1)} W/m²`;
    case "V12":
    case "V13":
    case "V15":
    case "V16": return `${num.toFixed(3)} µg/m³`;
    default:    return num.toString();
  }
};

/* ─── Skeleton loader ─────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="vmrv-card skeleton">
    <style>{`
      .vmrv-card.skeleton { animation: vmrv-pulse 1.6s ease-in-out infinite; }
      @keyframes vmrv-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      .vmrv-sk-line { border-radius: 6px; background: #e5e7eb; }
      .dark .vmrv-sk-line { background: #1e293b; }
    `}</style>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div className="vmrv-sk-line" style={{ width: 38, height: 38, borderRadius: 10 }} />
      <div className="vmrv-sk-line" style={{ width: "55%", height: 14 }} />
    </div>
    <div className="vmrv-sk-line" style={{ width: "70%", height: 32, marginBottom: 12 }} />
    <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="vmrv-sk-line" style={{ width: "80%", height: 11 }} />
      <div className="vmrv-sk-line" style={{ width: "40%", height: 11 }} />
    </div>
  </div>
);

/* ─── Loading state ───────────────────────────────────────────────── */
const LoadingState = () => (
  <div className="vmrv-grid">
    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

/* ─── Error state ─────────────────────────────────────────────────── */
const ErrorState = ({ message }: { message: string }) => (
  <div
    style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "16px 20px", borderRadius: 14,
      background: "#fef2f2", border: "1px solid #fecaca",
    }}
    className="dark:bg-red-950/30 dark:border-red-900/50"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.8" />
      <path d="M10 6v5M10 13.5v.5" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
    <div>
      <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: "#b91c1c" }}>Error al cargar</p>
      <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#dc2626" }}>{message}</p>
    </div>
  </div>
);

/* ─── Toggle button ───────────────────────────────────────────────── */
const ToggleButton = ({
  estado, loading, onClick,
}: { estado: number; loading: boolean; onClick: (e: React.MouseEvent) => void }) => (
  <button
    onClick={onClick}
    disabled={loading}
    title={estado === 0 ? "Activo — clic para desactivar" : "Inactivo — clic para activar"}
    style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      border: `1px solid ${estado === 0 ? "rgba(34,197,94,0.3)" : "rgba(107,114,128,0.25)"}`,
      background: estado === 0 ? "rgba(34,197,94,0.08)" : "rgba(107,114,128,0.07)",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "all 0.2s", flexShrink: 0,
      opacity: loading ? 0.6 : 1,
    }}
  >
    {/* Track */}
    <span
      style={{
        position: "relative", display: "inline-flex",
        width: 28, height: 16, borderRadius: 99,
        background: estado === 0 ? "#22c55e" : "#d1d5db",
        transition: "background 0.25s",
        boxShadow: estado === 0 ? "0 0 8px rgba(34,197,94,0.4)" : "none",
      }}
      className={estado === 0 ? "dark:bg-lime-500" : "dark:bg-slate-600"}
    >
      <span
        style={{
          position: "absolute",
          top: 2, left: estado === 0 ? 14 : 2,
          width: 12, height: 12, borderRadius: "50%",
          background: "#fff",
          transition: "left 0.22s cubic-bezier(.4,0,.2,1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        }}
      />
    </span>
    <span
      style={{
        fontSize: 10.5, fontWeight: 600,
        letterSpacing: "0.04em", textTransform: "uppercase",
        color: estado === 0 ? "#16a34a" : "#9ca3af",
        transition: "color 0.2s",
        fontFamily: "'JetBrains Mono', monospace",
      }}
      className={estado === 0 ? "dark:text-lime-400" : "dark:text-slate-500"}
    >
      {estado === 0 ? "ON" : "OFF"}
    </span>
  </button>
);

/* ─── CardVariable ────────────────────────────────────────────────── */
const CardVariable = ({
  codigo, idEstacion, idVariable, nombre, estado: estadoInicial,
}: {
  codigo: string; idEstacion: number; idVariable: number;
  nombre: string; estado: number;
}) => {
  const [valor, setValor] = useState<Dato | null>(null);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState(estadoInicial);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [pulse, setPulse] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const esAdmin = isAuthenticated && user?.idrol === 1;
  const inactive = estado === 1;

  const cfg = ICON_CONFIG[codigo];
  const iconColor  = cfg?.color  ?? "#84cc16";
  const iconBg     = cfg?.bg     ?? "#f0fdf4";
  //@ts-ignore
  const iconBgDark = cfg?.darkBg ?? "rgba(132,204,22,0.1)";

  const toggleEstado = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (loadingToggle) return;
    const nuevoEstado = estado === 0 ? 1 : 0;
    setLoadingToggle(true);
    try {
      await ApiHelsy.post(`toggle/variable/update/${idVariable}/${nuevoEstado}`);
      setEstado(nuevoEstado);
    } finally {
      setLoadingToggle(false);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      ApiHelsy.get(`previewDetailCharts/${idEstacion}/${codigo}`)
        .then(res => {
          const data = res.data;
          if (Array.isArray(data) && data.length > 0) {
            const u = data[data.length - 1];
            setValor({ lectura: u.lectura, hora: u.hora, fecha: u.fecha });
            setPulse(true);
            setTimeout(() => setPulse(false), 600);
          }
        })
        .finally(() => setLoading(false));
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [codigo, idEstacion]);

  return (
    <div className={`vmrv-card ${inactive ? "vmrv-card--inactive" : "vmrv-card--active"} ${pulse ? "vmrv-card--pulse" : ""}`}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        {/* Icon + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div
            className="vmrv-icon-wrap"
            style={{ background: inactive ? "#f3f4f6" : iconBg, color: inactive ? "#9ca3af" : iconColor }}
          >
            {cfg?.icon ?? <FaCloud size={18} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="vmrv-sensor-code">{codigo}</p>
            <h3 className="vmrv-sensor-name">{nombre}</h3>
          </div>
        </div>

        {/* Admin toggle */}
        {esAdmin && (
          <ToggleButton estado={estado} loading={loadingToggle} onClick={toggleEstado} />
        )}
      </div>

      {/* Value area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {loading ? (
          <div className="vmrv-loading-dots">
            <span /><span /><span />
          </div>
        ) : valor ? (
          <>
            <p
              className="vmrv-value"
              style={{ color: inactive ? "#9ca3af" : iconColor }}
            >
              {formatearLectura(valor.lectura, codigo)}
            </p>
            <div className="vmrv-footer">
              <div className="vmrv-footer-row">
                <span className="vmrv-footer-label">Última lectura</span>
                <span className="vmrv-footer-value">{valor.hora}</span>
              </div>
              <div className="vmrv-footer-row">
                <span className="vmrv-footer-date">{valor.fecha}</span>
                {/* Live indicator */}
                {!inactive && (
                  <span className="vmrv-live">
                    <span className="vmrv-live-dot" />
                    En vivo
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="vmrv-no-data">Sin datos disponibles</p>
        )}
      </div>

      {/* Inactive overlay stripe */}
      {inactive && <div className="vmrv-inactive-badge">Inactivo</div>}
    </div>
  );
};

/* ─── VariablesMrv ────────────────────────────────────────────────── */
const VariablesMrv = ({ idEstacion }: Props) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const esAdmin = isAuthenticated && user?.idrol === 1;

  useEffect(() => {
    ApiHelsy.get(`estaciones/veriables/${idEstacion}`)
      .then(res => setVariables(res.data))
      .catch(() => setError("No se pudieron cargar las variables de esta estación."))
      .finally(() => setLoading(false));
  }, [idEstacion]);

  const visibles = variables
    .filter(v => v.estado === 0 || esAdmin)
    .sort((a, b) => a.estado - b.estado);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        /* ── Grid ─────────────────────────────────────────────── */
        .vmrv-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px;
          font-family: 'Outfit', sans-serif;
        }
        @media (min-width: 480px)  { .vmrv-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 768px)  { .vmrv-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1280px) { .vmrv-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1600px) { .vmrv-grid { grid-template-columns: repeat(5, 1fr); } }

        /* ── Card ─────────────────────────────────────────────── */
        .vmrv-card {
          position: relative;
          display: flex; flex-direction: column;
          padding: 18px;
          border-radius: 16px;
          border: 1.5px solid #e5e7eb;
          background: #ffffff;
          transition: box-shadow 0.22s, border-color 0.22s, transform 0.18s;
          text-decoration: none;
          overflow: hidden;
          min-height: 168px;
        }
        .dark .vmrv-card {
          background: #0a1628;
          border-color: #1e293b;
        }
        .vmrv-card--active:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
          border-color: #86efac;
          transform: translateY(-2px);
        }
        .dark .vmrv-card--active:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(132,204,22,0.15);
          border-color: rgba(132,204,22,0.3);
        }
        .vmrv-card--inactive {
          background: #f9fafb;
          border-color: #f0f0f0;
          opacity: 0.72;
        }
        .dark .vmrv-card--inactive {
          background: #060d1a;
          border-color: #0f172a;
        }

        /* Update pulse */
        .vmrv-card--pulse {
          animation: vmrv-flash 0.5s ease;
        }
        @keyframes vmrv-flash {
          0%  { box-shadow: 0 0 0 0 rgba(34,197,94,0.25); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100%{ box-shadow: none; }
        }

        /* ── Icon wrap ────────────────────────────────────────── */
        .vmrv-icon-wrap {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          transition: background 0.2s, color 0.2s;
        }

        /* ── Labels ───────────────────────────────────────────── */
        .vmrv-sensor-code {
          margin: 0 0 1px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #9ca3af;
        }
        .dark .vmrv-sensor-code { color: #334155; }

        .vmrv-sensor-name {
          margin: 0;
          font-size: 13px; font-weight: 600;
          color: #111827; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dark .vmrv-sensor-name { color: #e2e8f0; }

        /* ── Value ────────────────────────────────────────────── */
        .vmrv-value {
          margin: 0 0 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 26px; font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
          transition: color 0.3s;
        }

        /* ── Footer ───────────────────────────────────────────── */
        .vmrv-footer {
          border-top: 1px solid #f3f4f6;
          padding-top: 10px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .dark .vmrv-footer { border-top-color: #0f172a; }

        .vmrv-footer-row {
          display: flex; justify-content: space-between; align-items: center;
        }
        .vmrv-footer-label {
          font-size: 11px; color: #9ca3af; font-weight: 400;
        }
        .dark .vmrv-footer-label { color: #334155; }

        .vmrv-footer-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px; color: #374151; font-weight: 500;
        }
        .dark .vmrv-footer-value { color: #64748b; }

        .vmrv-footer-date {
          font-size: 10.5px; color: #d1d5db;
        }
        .dark .vmrv-footer-date { color: #1e293b; }

        /* Live indicator */
        .vmrv-live {
          display: flex; align-items: center; gap: 4px;
          font-size: 9.5px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #22c55e;
          font-family: 'JetBrains Mono', monospace;
        }
        .dark .vmrv-live { color: #84cc16; }
        .vmrv-live-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34,197,94,0.6);
          animation: vmrv-blink 2s ease-in-out infinite;
        }
        .dark .vmrv-live-dot { background: #84cc16; box-shadow: 0 0 6px rgba(132,204,22,0.5); }
        @keyframes vmrv-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

        /* No data */
        .vmrv-no-data {
          margin: 0;
          font-size: 12px; color: #d1d5db; font-style: italic;
        }
        .dark .vmrv-no-data { color: #1e293b; }

        /* Inactive badge */
        .vmrv-inactive-badge {
          position: absolute; top: 14px; right: 14px;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 2px 8px; border-radius: 99px;
          background: #f3f4f6; color: #9ca3af;
          border: 1px solid #e5e7eb;
          font-family: 'JetBrains Mono', monospace;
          pointer-events: none;
        }
        .dark .vmrv-inactive-badge {
          background: #0f172a; color: #334155; border-color: #1e293b;
        }

        /* Loading dots */
        .vmrv-loading-dots {
          display: flex; align-items: center; gap: 5px;
          padding: 8px 0;
        }
        .vmrv-loading-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #e5e7eb;
          animation: vmrv-dots 1.2s ease-in-out infinite;
        }
        .dark .vmrv-loading-dots span { background: #1e293b; }
        .vmrv-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .vmrv-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes vmrv-dots { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }

        /* ── Empty state ──────────────────────────────────────── */
        .vmrv-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; padding: 60px 20px;
          text-align: center;
        }
        .vmrv-empty-icon {
          width: 52px; height: 52px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          background: #f3f4f6;
        }
        .dark .vmrv-empty-icon { background: #0f172a; }
        .vmrv-empty-title {
          margin: 0; font-size: 15px; font-weight: 600; color: #374151;
        }
        .dark .vmrv-empty-title { color: #475569; }
        .vmrv-empty-sub {
          margin: 0; font-size: 13px; color: #9ca3af;
        }
        .dark .vmrv-empty-sub { color: #1e293b; }
      `}</style>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="vmrv-grid">
          {visibles.length === 0 ? (
            <div className="vmrv-empty">
              <div className="vmrv-empty-icon">
                <FaCloud size={22} color="#9ca3af" />
              </div>
              <p className="vmrv-empty-title">Sin variables disponibles</p>
              <p className="vmrv-empty-sub">
                No hay variables activas para esta estación.
              </p>
            </div>
          ) : (
            visibles.map(v => (
              <Link
                key={v.id}
                to={`/monitoring/variables/detalles/${v.codigo}/${idEstacion}`}
                style={{ textDecoration: "none", display: "contents" }}
              >
                <CardVariable
                  {...v}
                  idVariable={v.id}
                  idEstacion={idEstacion}
                />
              </Link>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default VariablesMrv;