import React, { useState } from "react";
import { StationData } from "../../data/stations";
import StationTooltip from "./StationTooltip";
import "./station-nodes.css";

// ─── State configuration ──────────────────────────────────────

export type NodeState = "online" | "offline" | "autonomous" | "critical";

interface StateColors {
  color: string;
  glow: string;
}

const STATE_COLORS: Record<NodeState, StateColors> = {
  online:      { color: "#22c55e", glow: "rgba(34,197,94,0.45)" },
  offline:     { color: "#f97316", glow: "rgba(249,115,22,0.35)" },
  autonomous:  { color: "#f59e0b", glow: "rgba(245,158,11,0.50)" },
  critical:    { color: "#ef4444", glow: "rgba(239,68,68,0.55)" },
};

const STATE_LABELS: Record<NodeState, string> = {
  online:      "EN LÍNEA",
  offline:     "SIN CONEXIÓN",
  autonomous:  "MODO AUTÓNOMO",
  critical:    "CRÍTICO",
};

export function getNodeState(station: StationData): NodeState {
  if (station.riskLevel === "critical") return "critical";
  if (station.autonomousMode) return "autonomous";
  if (station.connectionStatus === "offline") return "offline";
  return "online";
}

// ─── Component ────────────────────────────────────────────────

interface StationNodeProps {
  station: StationData;
  isDark?: boolean;
  isHighlighted?: boolean;
  onHover?: (id: number | null) => void;
  onClick?: (id: number) => void;
}

const StationNode: React.FC<StationNodeProps> = ({
  station,
  isDark,
  isHighlighted,
  onHover,
  onClick,
}) => {
  const state = getNodeState(station);
  const colors = STATE_COLORS[state];
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
      onHover?.(station.id);
    }, 400);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
    setShowTooltip(false);
    onHover?.(null);
  };

  const handleClick = () => {
    onClick?.(station.id);
  };

  return (
    <div
      className={`sn-node sn--${state}${isDark ? " sn--dark" : ""}${isHighlighted ? " sn--highlighted" : ""}`}
      style={{
        ["--sn-color" as string]: colors.color,
        ["--sn-glow" as string]: colors.glow,
        cursor: "pointer",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Radar waves */}
      <div className="sn-waves">
        <div className="sn-wave sn-wave-1" />
        <div className="sn-wave sn-wave-2" />
        <div className="sn-wave sn-wave-3" />
      </div>

      {/* Glow */}
      <div className="sn-glow" />

      {/* Autonomous ring system */}
      {state === "autonomous" && (
        <>
          <div className="sn-autonomous-ring" />
          <div className="sn-autonomous-ring-inner" />
        </>
      )}

      {/* Critical halo */}
      {state === "critical" && <div className="sn-critical-halo" />}

      {/* Core */}
      <div className="sn-core">
        {state === "offline" && <div className="sn-offline-x" />}
        {state === "autonomous" && <span className="sn-core-icon">M</span>}
        {state === "critical" && <span className="sn-core-icon">!</span>}
      </div>

      {/* Label */}
      <div className="sn-label">{station.name}</div>

      {/* Status badge */}
      <div className="sn-status-badge">{STATE_LABELS[state]}</div>

      {/* Tooltip */}
      {showTooltip && <StationTooltip station={station} />}
    </div>
  );
};

export default React.memo(StationNode);
