import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, OverlayView, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { useTheme } from "../../context/ThemeContext";
import {
  STATIONS, MESH_NETWORK, applyOverride, getStationCoords,
  StateOverride, getDynamicStationSummary,
} from "../../data/stations";
import { useStationContext } from "./StationContext";
import StationNode from "./StationNode";
import "./station-nodes.css";

const MAP_CENTER = { lat: 5.69188, lng: -76.65835 };

const DARK_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0a121e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a121e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b8a9e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#051018" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#142433" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0f1a26" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#152838" }] },
];

const LIGHT_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e9f7" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f0f4f8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8f0e8" }] },
];

function interpolatePoint(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  t: number,
) {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * t,
    lng: p1.lng + (p2.lng - p1.lng) * t,
  };
}

interface EmergencyMapProps {
  overrides?: Record<number, StateOverride>;
}

export const EmergencyMap = ({ overrides: propOverrides }: EmergencyMapProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const {
    overrides: ctxOverrides,
    highlightedStationId,
    selectedStationId,
    setHighlightedStationId,
    focusStation,
  } = useStationContext();

  const overrides = propOverrides ?? ctxOverrides;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_API_KEYS_MAPS,
  });

  const onLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
    mapRef.current = m;
  }, []);

  // Pan to focused station
  useEffect(() => {
    if (selectedStationId !== null && mapRef.current) {
      const st = STATIONS.find((s) => s.id === selectedStationId);
      if (st) {
        const eff = applyOverride(st, overrides[st.id]);
        mapRef.current.panTo({ lat: eff.lat, lng: eff.lng });
        mapRef.current.setZoom(14);
      }
    }
  }, [selectedStationId, overrides]);

  const meshPaths = useMemo(
    () =>
      MESH_NETWORK.map((link) => {
        const from = getStationCoords(link.from);
        const to = getStationCoords(link.to);
        if (!from || !to) return null;
        return {
          from, to,
          key: `${link.from}-${link.to}`,
          midpoint: interpolatePoint(from, to, 0.5),
          p25: interpolatePoint(from, to, 0.25),
          p75: interpolatePoint(from, to, 0.75),
        };
      }).filter(Boolean) as {
        from: { lat: number; lng: number };
        to: { lat: number; lng: number };
        key: string;
        midpoint: { lat: number; lng: number };
        p25: { lat: number; lng: number };
        p75: { lat: number; lng: number };
      }[],
    [],
  );

  const summary = useMemo(() => getDynamicStationSummary(overrides), [overrides]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-base text-gray-500 dark:text-gray-400 font-mono">Cargando mapa de crisis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={MAP_CENTER}
        zoom={10}
        options={{
          styles: isDark ? DARK_STYLES : LIGHT_STYLES,
          disableDefaultUI: true,
          gestureHandling: "greedy",
        }}
        onLoad={onLoad}
      >
        {meshPaths.map((mp) => (
          <Polyline
            key={mp.key}
            path={[mp.from, mp.to]}
            options={{
              strokeColor: "#a855f7",
              strokeOpacity: 0.25,
              strokeWeight: 2,
              strokeDasharray: "6 4",
              geodesic: true,
              clickable: false,
            }}
          />
        ))}

        {meshPaths.map((mp) => (
          <OverlayView
            key={`dot-mid-${mp.key}`}
            position={mp.midpoint}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                position: "relative",
                transform: "translate(-50%, -50%)",
                display: "flex",
                gap: 8,
              }}
            >
              <div className="sn-mesh-particle" />
              <div className="sn-mesh-particle" />
              <div className="sn-mesh-particle" />
            </div>
          </OverlayView>
        ))}

        {STATIONS.map((st) => {
          const effective = applyOverride(st, overrides[st.id]);
          const isHighlighted = highlightedStationId === st.id || selectedStationId === st.id;
          return (
            <OverlayView
              key={`station-${st.id}`}
              position={{ lat: effective.lat, lng: effective.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div style={{ transform: "translate(-50%, -50%)" }}>
                <StationNode
                  station={effective}
                  isDark={isDark}
                  isHighlighted={isHighlighted}
                  onHover={setHighlightedStationId}
                  onClick={focusStation}
                />
              </div>
            </OverlayView>
          );
        })}
      </GoogleMap>

      <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-white/10">
        Red de Estaciones — AtratoCentinela AI
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[320px]">
        {[
          { color: "#22c55e", label: "En línea", count: summary.online },
          { color: "#f97316", label: "Sin conexión", count: summary.offline },
          { color: "#f59e0b", label: "Autónomo", count: summary.autonomous },
          { color: "#ef4444", label: "Crítico", count: summary.critical },
        ].map((l) => (
          <span
            key={l.label}
            className="flex items-center gap-1.5 text-xs font-mono bg-black/60 text-white px-2.5 py-1 rounded-lg"
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
            {l.label}
            <span className="opacity-70 ml-0.5">{l.count}</span>
          </span>
        ))}
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        Red Mesh Activa
      </div>
    </div>
  );
};

