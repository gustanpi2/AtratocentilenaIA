import { useCallback, useEffect, useState } from "react";
import { GoogleMap, HeatmapLayer, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useAlerts } from "../alerts/AlertProvider";
import { MOCK_RISK_ZONES } from "../../data/mockData";
import { useTheme } from "../../context/ThemeContext";

const MAP_CENTER = { lat: 5.69188, lng: -76.65835 };
const LIBRARIES: ("visualization")[] = ["visualization"];

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

const safeParse = (v?: string): number => parseFloat((v ?? "0").replace(",", ".")) || 0;

export const EmergencyMap = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { activeAlerts } = useAlerts();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBpdGMOFY0hGtNuG85onypJTTKNWWU2vwY",
    libraries: LIBRARIES,
  });

  const heatmapPoints = isLoaded
    ? MOCK_RISK_ZONES.map(
        (z) => ({ location: new google.maps.LatLng(z.lat, z.lng), weight: z.weight })
      )
    : [];

  const criticalAlerts = activeAlerts.filter(a => a.type === "critical");

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  useEffect(() => {
    if (map && criticalAlerts.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      MOCK_RISK_ZONES.forEach(z => bounds.extend({ lat: z.lat, lng: z.lng }));
      map.fitBounds(bounds);
    }
  }, [map, criticalAlerts]);

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
        <HeatmapLayer
          data={heatmapPoints}
          options={{
            radius: 60,
            opacity: 0.5,
            dissipating: true,
            gradient: [
              "rgba(34,197,94,0)",
              "rgba(132,204,22,0.4)",
              "rgba(250,204,21,0.6)",
              "rgba(251,146,60,0.8)",
              "rgba(239,68,68,1)",
            ],
          }}
        />
        {MOCK_RISK_ZONES.map((z, i) => (
          <Marker
            key={i}
            position={{ lat: z.lat, lng: z.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: Math.max(6, z.weight * 12),
              fillColor: z.weight > 0.8 ? "#ef4444" : z.weight > 0.6 ? "#f59e0b" : "#22c55e",
              fillOpacity: 0.6,
              strokeColor: "#ffffff",
              strokeWeight: 1,
            }}
            title={z.label}
          />
        ))}
      </GoogleMap>

      <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-white/10">
        Zonas de Riesgo — AtratoCentinela AI
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex gap-2">
        {[
          { color: "#22c55e", label: "Bajo" },
          { color: "#f59e0b", label: "Medio" },
          { color: "#ef4444", label: "Alto" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1 text-xs font-mono bg-black/60 text-white px-2 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
};
