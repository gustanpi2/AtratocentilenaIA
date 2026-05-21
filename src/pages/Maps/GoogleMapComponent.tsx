  "use client";

  import React, { useCallback, useEffect, useRef, useState } from "react";
  import { GoogleMap, Marker, useJsApiLoader  } from "@react-google-maps/api";
  import {
    Search, Layers, ZoomIn, ZoomOut, Compass, ChevronRight,
    Trash2, MapPin, Activity, Droplets, Wind, Waves, X, Menu,
    Radio, Thermometer,
  } from "lucide-react";
  import ApiRest from "../../service/ApiRest";
  import { useTheme } from "../../context/ThemeContext"; // ajusta esta ruta si es necesario

  // ─── Types ────────────────────────────────────────────────────────────────────
  export interface Location {
    id: number;
    nombre: string;
    descripcion: string;
    lat: string;
    lng: string;
    id_tipo_estacion: number;
    tipo_estacion: string;
  }

  // ─── Constants ────────────────────────────────────────────────────────────────
  const MAP_CENTER = { lat: 5.69188, lng: -76.65835 };
  const LIBRARIES: [] = [];

  const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#0f1923" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0f1923" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ba3b0" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c2d3a" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f1923" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1e3a4a" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1520" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#132030" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#112518" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#132030" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1e3040" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#84b4c8" }] },
  ];

  const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e9f7" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e8e8e8" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d4edda" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#444444" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  ];

  const STATION_LABELS: Record<number, string> = {
    1: "Meteorológica",
    2: "Hidrológica",
    3: "Calidad Aire",
    4: "Sísmica",
  };

  const STATION_COLORS: Record<number, string> = {
    1: "#84cc16",
    2: "#38bdf8",
    3: "#fb923c",
    4: "#c084fc",
  };

  const STATION_ICONS: Record<number, React.ReactElement> = {
    1: <Thermometer size={11} />,
    2: <Droplets size={11} />,
    3: <Wind size={11} />,
    4: <Waves size={11} />,
  };

  const safeParse = (value?: string, isLng = false): number => {
    let num = parseFloat((value ?? "0").replace(",", ".")) || 0;
    if (isLng && num > 0) {
      num = -num;
    }
    return num;
  };

  // ─── Loader ───────────────────────────────────────────────────────────────────
  const Loader: React.FC<{ message: string; isDark: boolean }> = ({ message, isDark }) => (
    <div
      style={{ position: "absolute", inset: 0, zIndex: 50 }}
      className={`flex flex-col items-center justify-center gap-5 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}
    >
      <div className="relative w-14 h-14">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-lime-500"
            style={{ opacity: 0, animation: `ac-pulse 1.8s ease-out ${i * 0.6}s infinite` }}
          />
        ))}
        <div className="absolute inset-4 rounded-full bg-lime-500 shadow-[0_0_20px_rgba(132,204,22,0.6)]" />
      </div>
      <p className={`text-sm tracking-widest font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {message}
      </p>
    </div>
  );

  // ─── Main Component ────────────────────────────────────────────────────────────
  const GoogleMapComponent: React.FC = () => {
    // ── Theme (safe fallback if provider missing) ──
    let isDark = false;
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { theme } = useTheme();
      isDark = theme === "dark";
    } catch {
      isDark = false;
    }

    // ── State ──
    const [locations, setLocations] = useState<Location[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [history, setHistory] = useState<Location[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTypes, setActiveTypes] = useState<Set<number>>(new Set([1, 2, 3, 4]));
    const [mapType, setMapType] = useState<"styled" | "satellite">("styled");
    const [isMobile, setIsMobile] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);

    // ── Google Maps ──
    const { isLoaded, loadError } = useJsApiLoader({
      googleMapsApiKey: import.meta.env.VITE_API_KEYS_MAPS,
      libraries: LIBRARIES,
    });

    // ── Responsive detection ──
    useEffect(() => {
      const update = () => setIsMobile(window.innerWidth < 768);
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }, []);

    // ── Fetch stations ──
    useEffect(() => {
      const load = async () => {
        try {
          setDataLoading(true);
          setDataError(null);
          const response = await ApiRest.get("estaciones");
          setLocations(response?.data?.data ?? []);
        } catch (err: any) {
          setDataError(err?.message ?? "Error desconocido");
        } finally {
          setDataLoading(false);
        }
      };
      load();
    }, []);

    // ── Handlers ──
    const handleMarkerClick = useCallback((loc: Location) => {
      setHistory((prev) => [loc, ...prev.slice(0, 19)]);
      setSidebarVisible(true);
    }, []);

    const toggleType = (id: number) => {
      setActiveTypes((prev) => {
        const next = new Set(prev);
        if (next.has(id)) { if (next.size > 1) next.delete(id); }
        else next.add(id);
        return next;
      });
    };

    const focusLocation = useCallback((loc: Location) => {
      mapRef.current?.panTo({ lat: safeParse(loc.lat), lng: safeParse(loc.lng, true) });
      mapRef.current?.setZoom(17);
    }, []);

    // ── Derived data ──
    const filtered = locations.filter((l) => {
      if (!activeTypes.has(l.id_tipo_estacion)) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return l.nombre?.toLowerCase().includes(q) || l.tipo_estacion?.toLowerCase().includes(q);
    });

    const typeCounts: Record<number, number> = {};
    filtered.forEach((l) => { typeCounts[l.id_tipo_estacion] = (typeCounts[l.id_tipo_estacion] ?? 0) + 1; });

    const grouped: Record<string, Location[]> = {};
    filtered.forEach((loc) => {
      const key = `${loc.lat},${loc.lng}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(loc);
    });


    // ── Style helpers ──
    const panelCls = isDark
      ? "bg-slate-900/90 border-slate-700/50 text-slate-200"
      : "bg-white/90 border-slate-200 text-slate-800 shadow-md shadow-slate-200/50";

    const loaderMessage = loadError
      ? "Error al cargar el mapa"
      : dataError
      ? `Error: ${dataError}`
      : !isLoaded
      ? "Cargando mapa..."
      : "Cargando estaciones...";

    const isReady = isLoaded && !dataLoading;

    return (
      <div className="relative w-full h-full overflow-hidden" style={{ minHeight: "400px" }}>

        {/* Global keyframes */}
        <style>{`
          @keyframes ac-pulse { 0%{opacity:.8;transform:scale(.5)} 100%{opacity:0;transform:scale(2.2)} }
          @keyframes ac-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        `}</style>

        {/* Loader overlay — shown while map or data is loading */}
        {!isReady && <Loader message={loaderMessage} isDark={isDark} />}

        {/* Map — mount as soon as Google Maps API is ready; data streams in after */}
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={MAP_CENTER}
            zoom={14.5}
            options={{
              styles: mapType === "satellite" ? [] : isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
              mapTypeId: mapType === "satellite" ? "hybrid" : "roadmap",
              disableDefaultUI: true,
              gestureHandling: "greedy",
            }}
            onLoad={(map) => { mapRef.current = map; }}
          >
            
            {Object.values(grouped).map((locGroup) =>
              locGroup.map((location, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const offset = 0.00004;
                return (
                  <Marker
                    key={`${location.id}-${i}`}
                    position={{
                      lat: safeParse(location.lat),
                      lng: safeParse(location.lng, true) + offset * Math.sin(angle),
                    }}
                    icon={{ url: "/atratocentinela_logo.png", scaledSize: new window.google.maps.Size(40, 40) }}
                    onClick={() => handleMarkerClick(location)}
                  />
                );
              })
            )}
          </GoogleMap>
        )}

        {/* ════════════════════════════ UI OVERLAY ════════════════════════════ */}
        {isLoaded && (
          <>
            {/* ── Top toolbar ── */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-2">
              {/* Brand badge */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl shrink-0 ${panelCls}`}>
                <span
                  className="w-2 h-2 rounded-full bg-lime-500 shrink-0"
                  style={{ boxShadow: "0 0 8px rgba(132,204,22,0.8)", animation: "ac-blink 2s ease-in-out infinite" }}
                />
                <span className="font-mono text-[11px] font-semibold text-lime-500 tracking-widest hidden sm:block">
                  SISTEMA ACTIVO
                </span>
                <Radio size={12} className="text-lime-500 sm:hidden" />
              </div>

              {/* Search */}
              <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl ${panelCls}`}>
                <Search size={14} className="text-lime-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar estación..."
                  className="bg-transparent border-none outline-none text-sm flex-1 min-w-0 placeholder:text-slate-400"
                />
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-lg border shrink-0 ${
                  isDark ? "bg-lime-500/15 text-lime-400 border-lime-500/25" : "bg-lime-50 text-lime-600 border-lime-200"
                }`}>
                  {filtered.length}
                </span>
              </div>

              {/* Mobile sidebar toggle */}
              {isMobile && (
                <button
                  onClick={() => setSidebarVisible((p) => !p)}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-xl border backdrop-blur-xl cursor-pointer shrink-0 ${panelCls}`}
                >
                  {sidebarVisible ? <X size={16} /> : <Menu size={16} />}
                  {history.length > 0 && !sidebarVisible && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-lime-500" />
                  )}
                </button>
              )}
            </div>

            {/* ── Filter chips ── */}
            <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-30 flex flex-wrap gap-1.5 justify-center px-3 max-w-full">
              {[1, 2, 3, 4].map((numId) => {
                const active = activeTypes.has(numId);
                const color = STATION_COLORS[numId];
                return (
                  <button
                    key={numId}
                    onClick={() => toggleType(numId)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-xl cursor-pointer transition-all duration-200 whitespace-nowrap"
                    style={{
                      borderColor: active ? `${color}60` : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                      background: active ? `${color}20` : isDark ? "rgba(15,25,35,0.85)" : "rgba(255,255,255,0.85)",
                      color: active ? color : isDark ? "#8ba3b0" : "#64748b",
                      boxShadow: active ? `0 0 10px ${color}30` : "none",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: active ? color : isDark ? "#4a6070" : "#cbd5e1", boxShadow: active ? `0 0 5px ${color}` : "none" }}
                    />
                    <span style={{ color: active ? color : undefined, display: "flex" }}>{STATION_ICONS[numId]}</span>
                    <span className="hidden sm:inline">{STATION_LABELS[numId]}</span>
                    <span className="opacity-60">{typeCounts[numId] ?? 0}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Stats panel (desktop) ── */}
            {!isMobile && (
              <div className={`absolute bottom-6 left-4 z-30 rounded-2xl border backdrop-blur-xl p-4 w-48 ${panelCls}`}>
                <p className="text-[10px] font-mono text-lime-500 tracking-widest uppercase mb-3 flex items-center gap-1.5">
                  <Activity size={10} /> Resumen de Red
                </p>
                {[1, 2, 3, 4].map((numId) => {
                  const count = typeCounts[numId] ?? 0;
                  const pct = filtered.length ? (count / filtered.length) * 100 : 0;
                  const color = STATION_COLORS[numId];
                  return (
                    <div key={numId} className="mb-2.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[11px] flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          <span style={{ color }}>{STATION_ICONS[numId]}</span>
                          {STATION_LABELS[numId]}
                        </span>
                        <span className="text-[11px] font-mono font-bold" style={{ color }}>{count}</span>
                      </div>
                      <div className={`h-1 rounded-full ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}70,${color})`, boxShadow: `0 0 5px ${color}50` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className={`mt-3 pt-3 border-t flex justify-between items-center ${isDark ? "border-white/6" : "border-slate-100"}`}>
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Total</span>
                  <span className="text-xl font-mono font-bold text-lime-500" style={{ textShadow: "0 0 12px rgba(132,204,22,0.4)" }}>
                    {filtered.length}
                  </span>
                </div>
              </div>
            )}

            {/* ── Map controls ── */}
            <div className="absolute bottom-6 right-4 z-30 flex flex-col gap-2">
              <div className={`rounded-xl border backdrop-blur-xl overflow-hidden ${panelCls}`}>
                {[
                  { icon: <ZoomIn size={16} />, action: () => mapRef.current?.setZoom((mapRef.current.getZoom() ?? 14) + 1), title: "Acercar" },
                  { icon: <ZoomOut size={16} />, action: () => mapRef.current?.setZoom((mapRef.current.getZoom() ?? 14) - 1), title: "Alejar" },
                  { icon: <Compass size={16} />, action: () => { mapRef.current?.panTo(MAP_CENTER); mapRef.current?.setZoom(14.5); }, title: "Centrar" },
                ].map(({ icon, action, title }, i, arr) => (
                  <button
                    key={title}
                    onClick={action}
                    title={title}
                    className={`flex items-center justify-center w-9 h-9 cursor-pointer transition-all duration-150 bg-transparent border-0 outline-none
                      ${isDark ? "text-slate-400 hover:text-lime-400 hover:bg-lime-500/10" : "text-slate-500 hover:text-lime-600 hover:bg-lime-50"}
                      ${i < arr.length - 1 ? isDark ? "border-b border-white/5" : "border-b border-slate-100" : ""}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setMapType((p) => p === "styled" ? "satellite" : "styled")}
                title="Tipo de mapa"
                className={`flex items-center justify-center w-9 h-9 rounded-xl border backdrop-blur-xl cursor-pointer transition-all duration-200
                  ${mapType === "satellite"
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                    : isDark ? "bg-slate-900/90 border-slate-700/40 text-slate-400 hover:text-blue-400" : "bg-white/90 border-slate-200 text-slate-500 hover:text-blue-500"
                  }`}
              >
                <Layers size={16} />
              </button>
            </div>

            {/* ── Mobile stats bar ── */}
            {isMobile && (
              <div className={`absolute bottom-0 left-0 right-0 z-30 px-4 py-2.5 border-t backdrop-blur-xl flex items-center gap-4 overflow-x-auto ${
                isDark ? "bg-slate-900/95 border-slate-700/50" : "bg-white/95 border-slate-200"
              }`}>
                {[1, 2, 3, 4].map((numId) => {
                  const color = STATION_COLORS[numId];
                  return (
                    <div key={numId} className="flex items-center gap-1 shrink-0">
                      <span style={{ color }}>{STATION_ICONS[numId]}</span>
                      <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{STATION_LABELS[numId]}</span>
                      <span className="text-[11px] font-mono font-bold" style={{ color }}>{typeCounts[numId] ?? 0}</span>
                    </div>
                  );
                })}
                <div className={`ml-auto pl-4 border-l shrink-0 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <span className="text-lg font-mono font-bold text-lime-500">{filtered.length}</span>
                </div>
              </div>
            )}

            {/* ── Sidebar toggle tab (desktop) ── */}
            {!isMobile && (
              <button
                onClick={() => setSidebarVisible((p) => !p)}
                className={`absolute top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 py-3 px-2 rounded-l-xl border border-r-0 backdrop-blur-xl cursor-pointer ${panelCls}`}
                style={{ right: sidebarVisible ? 300 : 0, transition: "right 0.35s cubic-bezier(.4,0,.2,1)" }}
              >
                <ChevronRight
                  size={14}
                  className="text-lime-500"
                  style={{ transform: sidebarVisible ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s" }}
                />
                {history.length > 0 && (
                  <span className="bg-lime-500 text-slate-900 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black font-mono">
                    {history.length > 9 ? "9+" : history.length}
                  </span>
                )}
              </button>
            )}

            {/* ── Sidebar backdrop (mobile) ── */}
            {isMobile && sidebarVisible && (
              <div
                className="absolute inset-0 bg-black/40 z-30 backdrop-blur-sm"
                onClick={() => setSidebarVisible(false)}
              />
            )}

            {/* ── Sidebar panel ── */}
            <div
              className={`absolute top-0 h-full flex flex-col border-l backdrop-blur-2xl shadow-2xl overflow-hidden ${
                isDark ? "bg-slate-950/95 border-slate-700/40" : "bg-white/95 border-slate-200"
              }`}
              style={{
                width: isMobile ? "85%" : "300px",
                maxWidth: "100%",
                right: sidebarVisible ? 0 : isMobile ? "-100%" : "-310px",
                transition: "right 0.35s cubic-bezier(.4,0,.2,1)",
                zIndex: 35,
              }}
            >
              {/* Sidebar header */}
              <div className={`px-5 pt-5 pb-4 border-b flex justify-between items-start shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <div>
                  <p className="text-[10px] font-mono text-lime-500 tracking-widest uppercase mb-1 flex items-center gap-1">
                    <MapPin size={9} /> Historial
                  </p>
                  <h2 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    Estaciones Visitadas
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={() => setHistory([])}
                      className="flex items-center gap-1 text-xs text-red-400 border border-red-400/25 bg-red-500/10 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-red-400/50 transition-all"
                    >
                      <Trash2 size={11} /> Limpiar
                    </button>
                  )}
                  {isMobile && (
                    <button
                      onClick={() => setSidebarVisible(false)}
                      className={`p-1.5 rounded-lg cursor-pointer border transition-all ${isDark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-40">
                    <MapPin size={36} className="text-lime-500" />
                    <p className={`text-xs text-center leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Haz clic en un marcador<br />para ver su información aquí
                    </p>
                  </div>
                ) : (
                  history.map((loc, i) => {
                    const color = STATION_COLORS[loc.id_tipo_estacion] ?? "#84cc16";
                    return (
                      <div
                        key={`${loc.id}-${i}`}
                        onClick={() => focusLocation(loc)}
                        className={`relative rounded-xl p-3.5 cursor-pointer border transition-all duration-200 hover:scale-[1.01] ${
                          i === 0
                            ? isDark ? "bg-lime-500/8 border-lime-500/25" : "bg-lime-50 border-lime-200"
                            : isDark ? "bg-white/3 border-white/6 hover:bg-white/5" : "bg-slate-50 border-slate-100 hover:bg-white"
                        }`}
                      >
                        {i === 0 && (
                          <span className="absolute top-2.5 right-2.5 text-[9px] font-mono text-lime-500 tracking-widest uppercase">Reciente</span>
                        )}
                        <div className="flex items-center gap-2 mb-1.5 pr-14">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                          <p className={`text-sm font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-700"}`}>{loc.nombre}</p>
                        </div>
                        <p className={`text-[11px] leading-relaxed mb-2 line-clamp-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {loc.descripcion || "Sin descripción disponible"}
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          <span
                            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-mono"
                            style={{ background: `${color}18`, color, borderColor: `${color}30` }}
                          >
                            {STATION_ICONS[loc.id_tipo_estacion]}
                            {STATION_LABELS[loc.id_tipo_estacion] ?? loc.tipo_estacion}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
                            isDark ? "bg-white/4 text-slate-500 border-white/8" : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {safeParse(loc.lat).toFixed(4)}, {safeParse(loc.lng, true).toFixed(4)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  export default GoogleMapComponent;