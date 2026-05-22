import { useEffect, useState } from "react";
import { useAlerts } from "../../modules/alerts/AlertProvider";

interface QuickStats {
  activeAlerts: number;
  criticalAlerts: number;
  stationsOnline: number;
  riskPercentage: number;
}

export function AgentQuickStats() {
  const { activeAlerts, criticalAlerts } = useAlerts();
  const [stats] = useState<QuickStats>({
    activeAlerts: activeAlerts.length,
    criticalAlerts: criticalAlerts.length,
    stationsOnline: 5,
    riskPercentage: Math.min(
      100,
      Math.round(
        (criticalAlerts.length * 25 + activeAlerts.length * 10)
      )
    ),
  });

  useEffect(() => {
    // Recalculate when alerts change
  }, [activeAlerts.length, criticalAlerts.length]);

  const items = [
    {
      label: "Alertas activas",
      value: stats.activeAlerts,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-800",
    },
    {
      label: "Alertas criticas",
      value: stats.criticalAlerts,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-800",
    },
    {
      label: "Estaciones activas",
      value: stats.stationsOnline,
      color: "text-lime-500",
      bg: "bg-lime-50 dark:bg-lime-950/20",
      border: "border-lime-200 dark:border-lime-800",
    },
    {
      label: "Riesgo actual",
      value: `${stats.riskPercentage}%`,
      color: stats.riskPercentage > 60 ? "text-red-500" : stats.riskPercentage > 30 ? "text-amber-500" : "text-lime-500",
      bg: "bg-gray-50 dark:bg-gray-800/40",
      border: "border-gray-200 dark:border-gray-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`${item.bg} ${item.border} border rounded-xl px-4 py-3 flex flex-col items-center justify-center text-center`}
        >
          <span className={`text-2xl font-bold font-mono ${item.color}`}>
            {item.value}
          </span>
          <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
