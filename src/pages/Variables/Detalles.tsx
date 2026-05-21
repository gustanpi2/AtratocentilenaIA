import { useEffect, useState } from "react";
import ApiHelsy from "../../service/ApiHelsy";
import { useNavigate, useParams } from "react-router";
import EnvironmentalChart from "./EnvironmentalChart";
import EnvironmentalPolarChart from "./EnvironmentalPolarChart";
import InformeLecturas from "./InformeLecturas";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Helper from "../../service/Helper";
import EnvironmentalGaugeChart from "./EnvironmentalGaugeChart";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lectura {
  id: number;
  lectura: string;
  hora: string;
  fecha: string;
  codigo?: string;
}
interface DatosPorFecha {
  fecha: string;
  valores: number[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  dark: {
    card: "rgba(10,20,28,0.92)",
    border: "rgba(132,204,22,0.15)",
    surface: "rgba(255,255,255,0.03)",
    surfaceBorder: "rgba(255,255,255,0.07)",
    text: "#e2f0f7",
    textMuted: "#8ba3b0",
    textDim: "#3d5a68",
    modalBg: "rgba(8,16,22,0.97)",
    modalBorder: "rgba(132,204,22,0.2)",
    inputBg: "rgba(255,255,255,0.04)",
    inputBorder: "rgba(132,204,22,0.2)",
    inputFocus: "rgba(132,204,22,0.4)",
    cancelBg: "rgba(255,255,255,0.04)",
    cancelBorder: "rgba(255,255,255,0.1)",
    cancelText: "#8ba3b0",
    labelBg: "rgba(132,204,22,0.1)",
    labelBorder: "rgba(132,204,22,0.25)",
  },
  light: {
    card: "rgba(255,255,255,0.97)",
    border: "rgba(132,204,22,0.25)",
    surface: "rgba(248,252,245,0.9)",
    surfaceBorder: "rgba(132,204,22,0.12)",
    text: "#0f1f0a",
    textMuted: "#4a6b3d",
    textDim: "#8aac7a",
    modalBg: "rgba(255,255,255,0.99)",
    modalBorder: "rgba(132,204,22,0.3)",
    inputBg: "rgba(248,252,245,0.9)",
    inputBorder: "rgba(132,204,22,0.25)",
    inputFocus: "rgba(132,204,22,0.5)",
    cancelBg: "rgba(0,0,0,0.04)",
    cancelBorder: "rgba(0,0,0,0.1)",
    cancelText: "#4a6b3d",
    labelBg: "rgba(132,204,22,0.08)",
    labelBorder: "rgba(132,204,22,0.2)",
  },
  accent: "#84cc16",
  accentHover: "#65a30d",
  fontSans: "'DM Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
};

// ─── Download CSV icon ────────────────────────────────────────────────────────
const DownloadIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animation: "spin 0.8s linear infinite" }}
  >
    <path d="M21 12a9 9 0 11-6.219-8.56" />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </svg>
);

// ─── Date input wrapper (styles the DatePicker) ───────────────────────────────
const DateField: React.FC<{
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  isDark: boolean;
}> = ({ label, value, onChange, minDate, maxDate, isDark }) => {
  const theme = isDark ? T.dark : T.light;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 10,
          fontFamily: T.fontMono,
          color: T.accent,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {/* Calendar icon */}
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            zIndex: 1,
            color: theme.textDim,
            display: "flex",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
        <DatePicker
          selected={value}
          // @ts-ignore
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Selecciona fecha"
          dateFormat="yyyy-MM-dd"
          wrapperClassName="w-full"
          className="datepicker-input"
        />
      </div>
      {/* Injected styles for the datepicker input */}
      <style>{`
        .datepicker-input {
          width: 100% !important;
          padding: 10px 12px 10px 36px !important;
          background: ${theme.inputBg} !important;
          border: 1px solid ${theme.inputBorder} !important;
          border-radius: 10px !important;
          color: ${theme.text} !important;
          font-family: ${T.fontMono} !important;
          font-size: 12px !important;
          outline: none !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
          box-sizing: border-box !important;
        }
        .datepicker-input:focus {
          border-color: ${theme.inputFocus} !important;
          box-shadow: 0 0 0 3px ${isDark ? "rgba(132,204,22,0.1)" : "rgba(132,204,22,0.12)"} !important;
        }
        .datepicker-input::placeholder {
          color: ${theme.textDim} !important;
        }
        .react-datepicker {
          background: ${theme.modalBg} !important;
          border: 1px solid ${theme.modalBorder} !important;
          border-radius: 12px !important;
          font-family: ${T.fontMono} !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important;
          overflow: hidden !important;
        }
        .react-datepicker__header {
          background: ${isDark ? "rgba(132,204,22,0.08)" : "rgba(132,204,22,0.06)"} !important;
          border-bottom: 1px solid ${isDark ? "rgba(132,204,22,0.15)" : "rgba(132,204,22,0.2)"} !important;
          padding: 10px 0 8px !important;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: ${theme.text} !important;
          font-family: ${T.fontMono} !important;
          font-size: 11px !important;
        }
        .react-datepicker__current-month { font-weight: 700 !important; margin-bottom: 6px !important; }
        .react-datepicker__day {
          color: ${theme.textMuted} !important;
          font-size: 11px !important;
          border-radius: 6px !important;
          transition: all 0.1s !important;
        }
        .react-datepicker__day:hover {
          background: ${isDark ? "rgba(132,204,22,0.15)" : "rgba(132,204,22,0.12)"} !important;
          color: ${T.accent} !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: ${T.accent} !important;
          color: #080f16 !important;
          font-weight: 700 !important;
        }
        .react-datepicker__day--disabled { opacity: 0.25 !important; }
        .react-datepicker__navigation-icon::before {
          border-color: ${theme.textMuted} !important;
        }
        .react-datepicker__triangle { display: none !important; }
      `}</style>
    </div>
  );
};

// ─── CSV Download Modal ───────────────────────────────────────────────────────
const DownloadModal: React.FC<{
  onClose: () => void;
  onDownload: () => void;
  fechaInicio: Date | null;
  setFechaInicio: (d: Date | null) => void;
  fechaFin: Date | null;
  setFechaFin: (d: Date | null) => void;
  loading: boolean;
  isDark: boolean;
}> = ({
  onClose,
  onDownload,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  loading,
  isDark,
}) => {
  const theme = isDark ? T.dark : T.light;
  const isValid =
    !loading &&
    fechaInicio &&
    fechaFin &&
    fechaFin >= fechaInicio;

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.15s ease",
      }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: theme.modalBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${theme.modalBorder}`,
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          fontFamily: T.fontSans,
          animation: "slideUp 0.2s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Icon */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(132,204,22,0.12)",
                border: `1px solid rgba(132,204,22,0.25)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.accent,
                flexShrink: 0,
              }}
            >
              <DownloadIcon size={18} />
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: 10,
                  fontFamily: T.fontMono,
                  color: T.accent,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Exportar datos
              </p>
              <h3
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: theme.text,
                  letterSpacing: "-0.01em",
                }}
              >
                Descargar reporte CSV
              </h3>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "transparent",
              border: `1px solid ${theme.surfaceBorder}`,
              cursor: "pointer",
              color: theme.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${T.accent}25, transparent)`,
            marginBottom: 22,
          }}
        />

        {/* Date pickers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          <DateField
            label="Fecha de inicio"
            value={fechaInicio}
            onChange={setFechaInicio}
            maxDate={fechaFin ?? undefined}
            isDark={isDark}
          />
          <DateField
            label="Fecha de fin"
            value={fechaFin}
            onChange={setFechaFin}
            minDate={fechaInicio ?? undefined}
            isDark={isDark}
          />
        </div>

        {/* Format hint */}
        <div
          style={{
            background: theme.labelBg,
            border: `1px solid ${theme.labelBorder}`,
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ margin: 0, fontSize: 11, fontFamily: T.fontMono, color: theme.textMuted }}>
            El archivo se generará en formato{" "}
            <span style={{ color: T.accent, fontWeight: 700 }}>CSV</span>
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              background: theme.cancelBg,
              border: `1px solid ${theme.cancelBorder}`,
              color: theme.cancelText,
              fontFamily: T.fontSans,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onDownload}
            disabled={!isValid}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              background: isValid ? T.accent : "rgba(132,204,22,0.3)",
              border: "none",
              color: isValid ? "#080f16" : "rgba(255,255,255,0.4)",
              fontFamily: T.fontSans,
              fontSize: 13,
              fontWeight: 700,
              cursor: isValid ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: isValid ? `0 4px 16px rgba(132,204,22,0.35)` : "none",
            }}
          >
            {loading ? (
              <>
                <Spinner />
                Descargando...
              </>
            ) : (
              <>
                <DownloadIcon size={14} color={isValid ? "#080f16" : "rgba(255,255,255,0.4)"} />
                Descargar
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Detalles: React.FC = () => {
  const { codigo, id } = useParams<{ codigo: string; id: string }>();
  const [datos, setDatos] = useState<Lectura[]>([]);
  const [datosTabla, setDatosTabla] = useState<DatosPorFecha[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Dark mode observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      const rutaCodificada = encodeURIComponent(location.pathname);
      navigate(`/signin/${rutaCodificada}`);
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // Data fetching
  useEffect(() => {
    if (!codigo || !id) return;
    const fetchData = async () => {
      try {
        const res = await ApiHelsy.get(`PreviewDetailChartsAdvanced/${id}/${codigo}`);
        const data: unknown = res.data;
        if (Array.isArray(data)) {
          const datosConCodigo: Lectura[] = data.map((item: any) => ({
            ...item,
            codigo,
          }));
          setDatos(datosConCodigo);
          datosParaInforme(datosConCodigo);
        } else {
          setDatos([]);
        }
      } catch (error) {
        console.error("Error al cargar datos", error);
        setDatos([]);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [codigo, id]);

  const datosParaInforme = (datos: Lectura[]) => {
    const valoresPorFecha: Record<string, number[]> = {};
    datos.forEach((lectura) => {
      if (!lectura.fecha || !lectura.lectura) return;
      const [fechaLimpia] = lectura.fecha.split(" ");
      const valorNumerico = parseFloat(lectura.lectura.replace(/[^\d.-]/g, ""));
      if (Number.isNaN(valorNumerico)) return;
      if (!valoresPorFecha[fechaLimpia]) valoresPorFecha[fechaLimpia] = [];
      valoresPorFecha[fechaLimpia].push(valorNumerico);
    });
    const resultadoOrdenado: DatosPorFecha[] = Object.entries(valoresPorFecha)
      .sort(([a], [b]) =>
        new Date(`${a}T00:00:00`).getTime() - new Date(`${b}T00:00:00`).getTime()
      )
      .map(([fecha, valores]) => ({ fecha, valores }));
    setDatosTabla(resultadoOrdenado);
  };

  const handleDownloadCSV = async () => {
    if (!fechaInicio || !fechaFin || !id || !codigo) return;
    const fi = fechaInicio.toISOString().split("T")[0];
    const ff = fechaFin.toISOString().split("T")[0];
    try {
      setLoadingDownload(true);
      const url = `${Helper.url}download/variable/${id}/${codigo}/${fi}/${ff}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener datos");
      const data: { id: number; lectura: string; fecha_hora: string }[] =
        await response.json();

      let csvContent = "id,fecha,dato\n";
      data.forEach((item) => {
        csvContent +=
          [item.id, item.fecha_hora, item.lectura]
            .map((v) => `"${v}"`)
            .join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `variable_${codigo}_${fi}_${ff}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("No se pudo generar el CSV");
    } finally {
      setLoadingDownload(false);
    }
  };

  const theme = isDark ? T.dark : T.light;

  return (
    <div
      style={{
        background: theme.card,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: "24px",
        boxShadow: isDark
          ? "0 8px 40px rgba(0,0,0,0.45)"
          : "0 4px 24px rgba(0,0,0,0.08)",
        fontFamily: T.fontSans,
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Title area */}
        <div>
          <p
            style={{
              margin: "0 0 3px",
              fontSize: 10,
              fontFamily: T.fontMono,
              color: T.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Variable · {codigo}
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: 19,
              fontWeight: 700,
              color: theme.text,
              letterSpacing: "-0.02em",
            }}
          >
            Análisis de lecturas
          </h2>
        </div>

        {/* CSV download button */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 10,
            background: "rgba(132,204,22,0.12)",
            border: `1px solid rgba(132,204,22,0.3)`,
            color: T.accent,
            fontFamily: T.fontSans,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(132,204,22,0.2)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(132,204,22,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(132,204,22,0.12)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          <DownloadIcon size={14} />
          Exportar CSV
        </button>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${T.accent}20, transparent)`,
          marginBottom: 24,
        }}
      />

      {/* ── Charts grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 20,
        }}
      >
        {/* Line chart */}
        <div
          style={{
            gridColumn: "span 12",
          }}
          className="xl:col-span-7-custom"
        >
          <div style={{ gridColumn: "span 12" }} className="chart-col-line">
            <EnvironmentalChart data={datos} code={codigo || ""} />
            
          </div>
        </div>

        {/* Polar chart */}
        <div style={{ gridColumn: "span 12" }} className="chart-col-polar">
          <EnvironmentalPolarChart data={datos} code={codigo || ""} />
        </div>
        
        {/* Polar chart */}
        <div style={{ gridColumn: "span 12" }} className="chart-col-polar">
          <EnvironmentalGaugeChart data={datos} code={codigo || ""} />
        </div>

        {/* Stats table */}
        <div style={{ gridColumn: "span 12" }}>
          <InformeLecturas datosTabla={datosTabla} />
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <DownloadModal
          onClose={() => setShowModal(false)}
          onDownload={handleDownloadCSV}
          fechaInicio={fechaInicio}
          setFechaInicio={setFechaInicio}
          fechaFin={fechaFin}
          setFechaFin={setFechaFin}
          loading={loadingDownload}
          isDark={isDark}
        />
      )}

      {/* Grid responsive overrides */}
      <style>{`
        @media (min-width: 1280px) {
          .chart-col-line  { grid-column: span 7 !important; }
          .chart-col-polar { grid-column: span 5 !important; }
        }
      `}</style>
    </div>
  );
};

export default Detalles;