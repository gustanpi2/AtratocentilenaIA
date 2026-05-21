import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = "critical" | "warning" | "normal";

interface Station {
  id: number;
  name: string;
  node: string;
  sensor: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  variables: {
    label: string;
    value: string;
    unit: string;
    status: RiskLevel;
    isMain: boolean;
  }[];
  lastUpdate: string;
}

// ─── Station data ─────────────────────────────────────────────────────────────

const STATIONS: Station[] = [
  {
    id: 1,
    name: "Quibdó",
    node: "NHD-QBD-01",
    sensor: "Limnigraph LG-200",
    lat: 5.6919,
    lng: -76.6583,
    riskLevel: "critical",
    variables: [
      { label: "Nivel", value: "5.82", unit: "m", status: "critical", isMain: true },
      { label: "Turbiedad", value: "124", unit: "NTU", status: "warning", isMain: false },
      { label: "pH", value: "7.1", unit: "pH", status: "normal", isMain: false },
      { label: "Temp.", value: "27.4", unit: "°C", status: "normal", isMain: false },
      { label: "Precipitación 24h", value: "98", unit: "mm", status: "warning", isMain: false },
    ],
    lastUpdate: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 2,
    name: "Bojayá",
    node: "NHD-BJY-02",
    sensor: "Limnigraph LG-100",
    lat: 6.998,
    lng: -76.9833,
    riskLevel: "warning",
    variables: [
      { label: "Nivel", value: "4.31", unit: "m", status: "warning", isMain: true },
      { label: "Conductividad", value: "215", unit: "µS/cm", status: "normal", isMain: false },
      { label: "Turbiedad", value: "78", unit: "NTU", status: "normal", isMain: false },
      { label: "Precipitación 24h", value: "62", unit: "mm", status: "warning", isMain: false },
    ],
    lastUpdate: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 3,
    name: "Vigía del Fuerte",
    node: "NHD-VDF-03",
    sensor: "Limnigraph LG-150",
    lat: 7.0883,
    lng: -76.8981,
    riskLevel: "warning",
    variables: [
      { label: "Nivel", value: "4.15", unit: "m", status: "warning", isMain: true },
      { label: "pH", value: "6.9", unit: "pH", status: "normal", isMain: false },
      { label: "Turbiedad", value: "55", unit: "NTU", status: "normal", isMain: false },
    ],
    lastUpdate: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 4,
    name: "Tutunendo",
    node: "NHD-TTN-04",
    sensor: "Pluviómetro PV-300",
    lat: 5.7678,
    lng: -76.5394,
    riskLevel: "normal",
    variables: [
      { label: "Nivel", value: "2.85", unit: "m", status: "normal", isMain: true },
      { label: "Precipitación 24h", value: "34", unit: "mm", status: "normal", isMain: false },
      { label: "Temp.", value: "25.8", unit: "°C", status: "normal", isMain: false },
    ],
    lastUpdate: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 5,
    name: "Lloró",
    node: "NHD-LLR-05",
    sensor: "Conductímetro CD-3",
    lat: 5.5097,
    lng: -76.5397,
    riskLevel: "normal",
    variables: [
      { label: "Nivel", value: "3.02", unit: "m", status: "normal", isMain: true },
      { label: "Conductividad", value: "145", unit: "µS/cm", status: "normal", isMain: false },
      { label: "O₂ disuelto", value: "6.8", unit: "mg/L", status: "normal", isMain: false },
    ],
    lastUpdate: new Date(Date.now() - 18 * 60000).toISOString(),
  },
];

// ─── Marker SVG builders ──────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskLevel, { fill: string; stroke: string; glow: string }> = {
  critical: { fill: "#dc2626", stroke: "#991b1b", glow: "rgba(220,38,38,0.25)" },
  warning:  { fill: "#d97706", stroke: "#92400e", glow: "rgba(217,119,6,0.20)" },
  normal:   { fill: "#059669", stroke: "#065f46", glow: "rgba(5,150,105,0.15)" },
};

const RISK_LABELS: Record<RiskLevel, string> = {
  critical: "CRÍTICO",
  warning: "PREVENTIVO",
  normal: "NORMAL",
};

function buildMarkerSvg(risk: RiskLevel, label: string): string {
  const c = RISK_COLORS[risk];
  const pulse = risk === "critical";
  const size = risk === "critical" ? 20 : risk === "warning" ? 16 : 13;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2 + 20}" height="${size * 2 + 30}" viewBox="0 0 ${size * 2 + 20} ${size * 2 + 30}">
      <defs>
        ${pulse ? `<style>@keyframes p{0%,100%{r:${size + 2};opacity:0.4}50%{r:${size + 8};opacity:0.1}}.pulse{animation:p 1.8s ease-in-out infinite}</style>` : ""}
      </defs>
      ${pulse ? `<circle class="pulse" cx="${size + 10}" cy="${size + 10}" r="${size + 2}" fill="${c.glow}"/>` : ""}
      <circle cx="${size + 10}" cy="${size + 10}" r="${size}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <circle cx="${size + 10}" cy="${size + 10}" r="${size * 0.35}" fill="white" opacity="0.9"/>
    </svg>
  `;
}

// ─── Map component ────────────────────────────────────────────────────────────

declare global {
  interface Window {
    google: any;
    initAtratoCrisisMap: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

export const GoogleMapComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const heatmapRef = useRef<any>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // ── InfoWindow HTML ──────────────────────────────────────────────────────────

  const buildInfoWindowContent = useCallback((station: Station): string => {
    const riskBadge: Record<RiskLevel, string> = {
      critical: "background:#fef2f2;color:#991b1b;border:1px solid #fecaca",
      warning: "background:#fffbeb;color:#92400e;border:1px solid #fde68a",
      normal: "background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0",
    };

    const varStatusColor: Record<RiskLevel, string> = {
      critical: "#dc2626",
      warning: "#d97706",
      normal: "#059669",
    };

    const mainVar = station.variables.find((v) => v.isMain);
    const ago = (() => {
      const diff = Date.now() - new Date(station.lastUpdate).getTime();
      const m = Math.floor(diff / 60000);
      return m < 1 ? "Ahora mismo" : `Hace ${m} min`;
    })();

    return `
      <div style="font-family:ui-monospace,monospace;min-width:220px;max-width:260px;padding:0;border-radius:0">
        <div style="padding:10px 12px 8px;border-bottom:1px solid #e5e7eb">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <span style="font-size:13px;font-weight:700;color:#111827">${station.name}</span>
            <span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.08em;${riskBadge[station.riskLevel]}">${RISK_LABELS[station.riskLevel]}</span>
          </div>
          <div style="font-size:10px;color:#6b7280;margin-top:2px">${station.node} · ${station.sensor}</div>
        </div>

        ${mainVar ? `
        <div style="padding:8px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb">
          <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">${mainVar.label}</div>
          <div style="font-size:22px;font-weight:700;color:${varStatusColor[mainVar.status]};line-height:1.1">${mainVar.value}<span style="font-size:12px;font-weight:400;color:#6b7280;margin-left:2px">${mainVar.unit}</span></div>
        </div>` : ""}

        <div style="padding:8px 12px">
          <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Variables monitoreadas</div>
          ${station.variables
            .filter((v) => !v.isMain)
            .map(
              (v) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0">
                <span style="font-size:10px;color:#6b7280">${v.label}</span>
                <span style="font-size:10px;font-weight:600;color:${varStatusColor[v.status]}">${v.value} ${v.unit}</span>
              </div>`
            )
            .join("")}
        </div>

        <div style="padding:6px 12px 8px;border-top:1px solid #e5e7eb">
          <div style="font-size:9px;color:#9ca3af">Actualizado: ${ago}</div>
        </div>
      </div>
    `;
  }, []);

  // ── Map initialization ───────────────────────────────────────────────────────

  const initMap = useCallback(() => {
    if (!containerRef.current || !window.google) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: { lat: 6.1, lng: -76.78 },
      zoom: 8,
      mapTypeId: "terrain",
      styles: [
        { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#c8e6f5" }] },
        { featureType: "landscape.natural", elementType: "geometry.fill", stylers: [{ color: "#e8f4e0" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ visibility: "simplified" }, { color: "#f0ece4" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#ddd4c0" }] },
        { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#4a5568" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", elementType: "labels.text", stylers: [{ weight: 1 }] },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      scaleControl: true,
    });

    mapRef.current = map;

    // InfoWindow (shared)
    const infoWindow = new window.google.maps.InfoWindow({
      pixelOffset: new window.google.maps.Size(0, -8),
      disableAutoPan: false,
    });
    infoWindowRef.current = infoWindow;

    // Heatmap (river risk zones)
    const heatmapData = STATIONS.flatMap((s) => {
      const weight = s.riskLevel === "critical" ? 1.0 : s.riskLevel === "warning" ? 0.5 : 0.15;
      return [
        { location: new window.google.maps.LatLng(s.lat, s.lng), weight },
        { location: new window.google.maps.LatLng(s.lat + 0.04, s.lng - 0.06), weight: weight * 0.4 },
        { location: new window.google.maps.LatLng(s.lat - 0.03, s.lng + 0.05), weight: weight * 0.3 },
      ];
    });

    heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: 35,
      opacity: 0.4,
      gradient: [
        "rgba(0,0,0,0)",
        "rgba(34,197,94,0.3)",
        "rgba(250,204,21,0.5)",
        "rgba(234,88,12,0.7)",
        "rgba(220,38,38,0.85)",
      ],
    });

    // Markers
    STATIONS.forEach((station) => {
      const svgStr = buildMarkerSvg(station.riskLevel, station.name);
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const marker = new window.google.maps.Marker({
        position: { lat: station.lat, lng: station.lng },
        map,
        title: station.name,
        icon: {
          url,
          scaledSize: new window.google.maps.Size(60, 70),
          anchor: new window.google.maps.Point(30, 35),
        },
        zIndex: station.riskLevel === "critical" ? 100 : station.riskLevel === "warning" ? 50 : 10,
      });

      // Label overlay below marker
      const labelDiv = document.createElement("div");
      labelDiv.style.cssText = `
        position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);
        white-space:nowrap;font-size:9px;font-family:ui-monospace,monospace;font-weight:700;
        color:#1e293b;background:rgba(255,255,255,0.92);
        padding:1px 5px;border-radius:2px;letter-spacing:0.04em;
        border:1px solid rgba(0,0,0,0.1);pointer-events:none;
      `;
      labelDiv.textContent = station.name.toUpperCase();

      marker.addListener("click", () => {
        setSelectedStation(station);
        infoWindow.setContent(buildInfoWindowContent(station));
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    setMapReady(true);
  }, [buildInfoWindowContent]);

  useEffect(() => {
    if (window.google?.maps) {
      initMap();
      return;
    }

    window.initAtratoCrisisMap = initMap;

    const existing = document.querySelector("#gmaps-crisis-script");
    if (!existing && GOOGLE_MAPS_API_KEY) {
      const script = document.createElement("script");
      script.id = "gmaps-crisis-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization&callback=initAtratoCrisisMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (!GOOGLE_MAPS_API_KEY) {
      renderFallback();
    }

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [initMap]);

  // Toggle heatmap
  useEffect(() => {
    if (heatmapRef.current) {
      heatmapRef.current.setMap(showHeatmap ? mapRef.current : null);
    }
  }, [showHeatmap]);

  const renderFallback = () => {
    // Render static SVG fallback if no API key
    setMapReady(true);
  };

  const hasCritical = STATIONS.some((s) => s.riskLevel === "critical");
  const hasWarning = STATIONS.some((s) => s.riskLevel === "warning");

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Map container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* No API key fallback */}
      {!GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
          <p className="text-sm font-mono">Variable VITE_GOOGLE_MAPS_API_KEY no configurada</p>
          <p className="text-xs font-mono text-gray-300 dark:text-gray-600">Agregue su API key de Google Maps para visualizar el mapa</p>
          {/* Static station list as fallback */}
          <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-xs px-4">
            {STATIONS.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-white dark:bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.name}</p>
                  <p className="text-[10px] font-mono text-gray-400">{s.node}</p>
                </div>
                <RiskBadge level={s.riskLevel} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map controls overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2 pointer-events-none">
        {/* Title */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 shadow-sm pointer-events-auto">
          <p className="text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Red Hidrológica · AtratoCentinela AI
          </p>
          <p className="text-[9px] font-mono text-gray-400 dark:text-gray-500">
            {STATIONS.length} estaciones activas
          </p>
        </div>

        {/* Heatmap toggle */}
        <button
          onClick={() => setShowHeatmap((v) => !v)}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors pointer-events-auto shadow-sm"
        >
          {showHeatmap ? "Ocultar mapa de calor" : "Mostrar mapa de calor"}
        </button>
      </div>

      {/* Risk legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
        <p className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Nivel de riesgo</p>
        <div className="space-y-1">
          {(["critical", "warning", "normal"] as RiskLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: RISK_COLORS[level].fill }}
              />
              <span className="text-[10px] font-mono text-gray-600 dark:text-gray-400">{RISK_LABELS[level]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alert status bar */}
      {(hasCritical || hasWarning) && (
        <div className={`absolute bottom-3 right-3 z-10 rounded-lg border px-3 py-2 text-[10px] font-mono shadow-sm backdrop-blur-sm ${
          hasCritical
            ? "bg-red-50/90 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
            : "bg-amber-50/90 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
        }`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasCritical ? "bg-red-500" : "bg-amber-500"}`} />
            {hasCritical
              ? `${STATIONS.filter((s) => s.riskLevel === "critical").length} est. en nivel crítico`
              : `${STATIONS.filter((s) => s.riskLevel === "warning").length} est. en nivel preventivo`}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<RiskLevel, string> = {
    critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    normal: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  };
  return (
    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${config[level]}`}>
      {RISK_LABELS[level]}
    </span>
  );
}