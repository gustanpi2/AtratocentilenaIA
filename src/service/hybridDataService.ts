/**
 * Hybrid Data Service — AtratoCentinela AI
 *
 * Tries real API first (ApiHelsy), falls back to local mock data.
 * Ensures the app never breaks when the server is down.
 */

import { STATIONS, type StationData } from "../data/stations";
import ApiHelsy from "./ApiHelsy";

// ─── Helpers ──────────────────────────────────────────────────────────

function mapApiStation(raw: Record<string, unknown>): StationData | null {
  const lat = parseFloat(raw.latitud as string) || parseFloat(raw.lat as string) || 0;
  const lng = parseFloat(raw.longitud as string) || parseFloat(raw.lng as string) || 0;
  if (!lat || !lng) {
    console.warn(`[Hybrid] Station "${raw.nombre}" has no coordinates — skipping`);
    return null;
  }
  return {
    id: Number(raw.id) || Date.now(),
    name: (raw.nombre as string) || (raw.name as string) || "Desconocida",
    node: (raw.node as string) || (raw.codigo as string) || `NHD-${raw.id}`,
    lat,
    lng,
    type: (raw.tipo_estacion_nombre as string) || (raw.type as string) || "Hidrologica",
    riskLevel: "normal",
    connectionStatus: "online",
    autonomousMode: false,
    lastSeen: new Date().toISOString(),
    meshRelay: null,
    sensors: Array.isArray(raw.sensors) ? raw.sensors as any[] : [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────

let cachedRealStations: StationData[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 60000; // 1 minute

export async function fetchRealStations(): Promise<StationData[]> {
  const now = Date.now();
  if (cachedRealStations && now - lastFetch < CACHE_TTL) {
    return cachedRealStations;
  }

  try {
    const res = await ApiHelsy.get("/estaciones", { timeout: 5000 });
    const rawList: Record<string, unknown>[] = res.data?.data ?? res.data ?? [];
    const mapped: StationData[] = rawList.map(mapApiStation).filter(Boolean) as StationData[];
    if (mapped.length > 0) {
      console.log(`[Hybrid] ${mapped.length} real stations loaded from API`);
      cachedRealStations = mapped;
      lastFetch = now;
      return mapped;
    }
    console.warn("[Hybrid] API returned 0 stations — using mock");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Hybrid] API unavailable (${msg}) — using ${STATIONS.length} mock stations`);
  }
  return STATIONS;
}

export function getMockStations(): StationData[] {
  return STATIONS;
}

export async function fetchRealSensors(stationId?: number): Promise<Record<string, unknown>[]> {
  try {
    const url = stationId ? `/sensores?estacion_id=${stationId}` : "/sensores";
    const res = await ApiHelsy.get(url, { timeout: 5000 });
    return res.data?.data ?? res.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchRealUsers(): Promise<Record<string, unknown>[]> {
  try {
    const res = await ApiHelsy.get("/usuarios", { timeout: 5000 });
    return res.data?.data ?? res.data ?? [];
  } catch {
    return [];
  }
}

export function clearCache() {
  cachedRealStations = null;
  lastFetch = 0;
}
