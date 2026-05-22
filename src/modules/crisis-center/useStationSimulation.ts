import { useEffect, useState } from "react";
import {
  STATIONS,
  ENABLE_CONNECTION_SIMULATION,
  SIMULATION_INTERVAL_MS,
  StateOverride,
  cycleState,
  applyOverride,
} from "../../data/stations";

export function useStationOverrides() {
  const [overrides, setOverrides] = useState<Record<number, StateOverride>>({});

  useEffect(() => {
    if (!ENABLE_CONNECTION_SIMULATION) return;
    const interval = setInterval(() => {
      setOverrides((prev) => {
        const next: Record<number, StateOverride> = {};
        // Copy all previous overrides
        Object.keys(prev).forEach((k) => { next[Number(k)] = prev[Number(k)]; });

        // Toggle station 1
        const idx1 = Math.floor(Math.random() * STATIONS.length);
        const st1 = STATIONS[idx1];
        const eff1 = applyOverride(st1, prev[idx1]);
        next[idx1] = cycleState(eff1);

        // Toggle station 2 (offset by 3)
        const idx2 = (idx1 + 3) % STATIONS.length;
        const st2 = STATIONS[idx2];
        const eff2 = applyOverride(st2, prev[idx2]);
        next[idx2] = cycleState(eff2);

        return next;
      });
    }, SIMULATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { overrides };
}
