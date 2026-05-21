import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { AgentQuickStats } from "./AgentQuickStats";
import { AgentChatPanel } from "./AgentChatPanel";
import { AgentHistorySidebar } from "./AgentHistorySidebar";

export default function AgentPage() {
  const [showHistory, setShowHistory] = useState(true);

  return (
    <>
      <PageMeta
        title="Agente Centinela AI — AtratoCentinela AI"
        description="Consola de inteligencia artificial para monitoreo ambiental del rio Atrato"
      />

      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 xl:px-6 py-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center shadow-lg shadow-lime-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.52 3.65 1.42 5.16L2 22l4.84-1.42A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Agente Centinela AI
              </h1>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                Consola de inteligencia artificial para monitoreo ambiental
              </p>
            </div>
          </div>

          {/* Toggle history button (mobile) */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-mono hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 10h18M3 6h18M3 14h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {showHistory ? "Ocultar" : "Historial"}
          </button>
        </div>

        {/* Quick stats */}
        <AgentQuickStats />

        {/* Main grid: chat + history */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5" style={{ minHeight: "calc(100vh - 300px)" }}>
          {/* Chat panel */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            <AgentChatPanel />
          </div>

          {/* History sidebar */}
          {showHistory && (
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
              <AgentHistorySidebar />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
