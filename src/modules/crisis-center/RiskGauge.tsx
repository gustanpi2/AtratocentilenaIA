import { useMemo } from "react";

interface RiskGaugeProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  thresholds?: { warning: number; critical: number };
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { svg: 120, stroke: 8, fontSize: "text-lg", labelSize: "text-[10px]" },
  md: { svg: 160, stroke: 10, fontSize: "text-2xl", labelSize: "text-xs" },
  lg: { svg: 200, stroke: 14, fontSize: "text-3xl", labelSize: "text-sm" },
};

export const RiskGauge = ({
  value,
  max = 100,
  label,
  unit = "%",
  thresholds = { warning: 50, critical: 75 },
  size = "md",
}: RiskGaugeProps) => {
  const s = SIZES[size];
  const normalized = Math.min(value / max, 1);
  const radius = (s.svg - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalized);

  const color = useMemo(() => {
    if (value >= thresholds.critical) return "#ef4444";
    if (value >= thresholds.warning) return "#f59e0b";
    return "#22c55e";
  }, [value, thresholds]);

  const statusText = useMemo(() => {
    if (value >= thresholds.critical) return "CRÍTICO";
    if (value >= thresholds.warning) return "ALTO";
    return "NORMAL";
  }, [value, thresholds]);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={s.svg} height={s.svg} className="transform -rotate-90 drop-shadow-lg">
        <circle
          cx={s.svg / 2}
          cy={s.svg / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.stroke}
          className="text-gray-200 dark:text-gray-800"
        />
        <circle
          cx={s.svg / 2}
          cy={s.svg / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}44)` }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{ width: s.svg, height: s.svg }}
      >
        <span className={`${s.fontSize} font-bold tabular-nums`} style={{ color }}>
          {value}
          <span className="text-sm font-normal opacity-60">{unit}</span>
        </span>
        <span
          className={`${s.labelSize} font-semibold tracking-wider uppercase mt-0.5`}
          style={{ color }}
        >
          {statusText}
        </span>
      </div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </span>
    </div>
  );
};
