import { useCallback, useEffect, useMemo, useState } from "react";
import { GoogleMap, Circle, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { useAlerts } from "../alerts/AlertProvider";
import { useTheme } from "../../context/ThemeContext";
import {
  STATIONS, MESH_NETWORK, ENABLE_CONNECTION_SIMULATION, SIMULATION_INTERVAL_MS,
  StationData, StationConnection, StationRisk,
} from "../../data/stations";

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

// ─── Station state overrides (for simulation) ──────────────────────

type StateOverride = {
  connectionStatus?: StationConnection;
  autonomousMode?: boolean;
  riskLevel?: StationRisk;
};

function cycleState(s: StationData): StateOverride {
  if (s.autonomousMode) return { connectionStatus: "online", autonomousMode: false, riskLevel: "normal" };
  if (s.connectionStatus === "offline") return { autonomousMode: true, connectionStatus: "offline", riskLevel: "warning" };
  return { connectionStatus: "offline", autonomousMode: false, riskLevel: s.riskLevel };
}

function getEffectiveStation(base: StationData, override: StateOverride | undefined): StationData {
  return override ? { ...base, ...override } : base;
}

function getStationCoords(node: string) {
  const s = STATIONS.find((st) => st.node === node);
  return s ? { lat: s.lat, lng: s.lng } : null;
}

// ─── Marker icon per state ────────────────────────────────────────

function getStateConfig(station: StationData) {
  if (station.riskLevel === "critical") {
    return { path: window.google.maps.SymbolPath.CIRCLE, scale: 11, fillColor: "#ef4444", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2.5 };
  }
  if (station.autonomousMode) {
    return { path: "M 0,-12 L 12,0 L 0,12 L -12,0 Z", scale: 1, fillColor: "#a855f7", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 };
  }
  if (station.connectionStatus === "offline") {
    return { path: window.google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#6b7280", fillOpacity: 0.6, strokeColor: "#4b5563", strokeWeight: 2 };
  }
  return { path: window.google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: "#22c55e", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 };
}

function getZoneConfig(riskLevel: StationRisk): { radius: number; fill: string; stroke: string; opacity: number } {
  switch (riskLevel) {
    case "critical": return { radius: 6000, fill: "#ef4444", stroke: "#991b1b", opacity: 0.15 };
    case "warning":  return { radius: 4000, fill: "#f59e0b", stroke: "#92400e", opacity: 0.12 };
    default:         return { radius: 2000, fill: "#22c55e", stroke: "#166534", opacity: 0.08 };
  }
}

// ─── Component ────────────────────────────────────────────────────

export const EmergencyMap = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { activeAlerts } = useAlerts();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_API_KEYS_MAPS,
  });

  const [overrides, setOverrides] = useState<Record<number, StateOverride>>({});

  // Connection simulation
  useEffect(() => {
    if (!ENABLE_CONNECTION_SIMULATION) return;
    const interval = setInterval(() => {
      setOverrides((prev) => {
        const idx = Math.floor(Math.random() * STATIONS.length);
        const st = STATIONS[idx];
        const currentOverride = prev[idx];
        const effective = getEffectiveStation(st, currentOverride);
        const next = { ...prev, [idx]: cycleState(effective) };

        // Also toggle a second station with shorter cycle
        const idx2 = (idx + 3) % STATIONS.length;
        const st2 = STATIONS[idx2];
        const currentOverride2 = prev[idx2];
        const effective2 = getEffectiveStation(st2, currentOverride2);
        next[idx2] = cycleState(effective2);

        return next;
      });
    }, SIMULATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = activeAlerts.filter((a) => a.type === "critical");

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  useEffect(() => {
    if (map && criticalAlerts.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      STATIONS.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
      map.fitBounds(bounds);
    }
  }, [map, criticalAlerts]);

  // Mesh line paths
  const meshPaths = useMemo(
    () =>
      MESH_NETWORK.map((link) => {
        const from = getStationCoords(link.from);
        const to = getStationCoords(link.to);
        return from && to ? { from, to, key: `${link.from}-${link.to}` } : null;
      }).filter(Boolean) as { from: { lat: number; lng: number }; to: { lat: number; lng: number }; key: string }[],
    [],
  );

  // Station stats for legend
  const onlineCount = STATIONS.filter((s) => {
    const e = getEffectiveStation(s, overrides[s.id]);
    return e.connectionStatus === "online" && !e.autonomousMode;
  }).length;
  const offlineCount = STATIONS.filter((s) => {
    const e = getEffectiveStation(s, overrides[s.id]);
    return e.connectionStatus === "offline" && !e.autonomousMode;
  }).length;
  const autonomousCount = STATIONS.filter((s) => {
    const e = getEffectiveStation(s, overrides[s.id]);
    return e.autonomousMode;
  }).length;
  const criticalCount = STATIONS.filter((s) => {
    const e = getEffectiveStation(s, overrides[s.id]);
    return e.riskLevel === "critical";
  }).length;

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
        {/* Risk zone circles per station */}
        {STATIONS.map((st) => {
          const eff = getEffectiveStation(st, overrides[st.id]);
          const zone = getZoneConfig(eff.riskLevel);
          return (
            <Circle
              key={`zone-${st.id}`}
              center={{ lat: st.lat, lng: st.lng }}
              radius={zone.radius}
              options={{
                fillColor: zone.fill,
                fillOpacity: zone.opacity,
                strokeColor: zone.stroke,
                strokeOpacity: 0.4,
                strokeWeight: 1,
                clickable: false,
              }}
            />
          );
        })}

        {/* Mesh network polylines */}
        {meshPaths.map((mp) => (
          <Polyline
            key={mp.key}
            path={[mp.from, mp.to]}
            options={{
              strokeColor: "#a855f7",
              strokeOpacity: 0.25,
              strokeWeight: 1.5,
              strokeDasharray: "6 4",
              geodesic: true,
              clickable: false,
            }}
          />
        ))}

        {/* Station markers */}
        {STATIONS.map((st) => {
          const eff = getEffectiveStation(st, overrides[st.id]);
          return (
            <Marker
              key={`marker-${st.id}`}
              position={{ lat: eff.lat, lng: eff.lng }}
              icon={getStateConfig(eff)}
              title={`${eff.name} [${eff.node}] — ${eff.autonomousMode ? "Autónomo" : eff.connectionStatus === "offline" ? "Sin conexión" : eff.riskLevel === "critical" ? "Crítico" : "En línea"}`}
            />
          );
        })}
      </GoogleMap>

      {/* Top-left badge */}
      <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-white/10">
        Red de Estaciones — AtratoCentinela AI
      </div>

      {/* Station status legend */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[260px]">
        {[
          { color: "#22c55e", label: "En línea", count: onlineCount },
          { color: "#6b7280", label: "Sin conexión", count: offlineCount },
          { color: "#a855f7", label: "Autónomo", count: autonomousCount },
          { color: "#ef4444", label: "Crítico", count: criticalCount },
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
    </div>
  );
};
