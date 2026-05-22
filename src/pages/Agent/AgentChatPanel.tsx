import { useRef, useEffect, useState } from "react";
import { useAgent } from "../../modules/agent/AgentContext";
import { useAlerts } from "../../modules/alerts/AlertProvider";

export function AgentChatPanel() {
  const {
    messages, sendMessage, isProcessing, isConnected,
    agentMode, setAgentMode,
  } = useAgent();
  const { criticalAlerts, activeAlerts } = useAlerts();

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isProcessing) inputRef.current?.focus();
  }, [isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;
    sendMessage(trimmed);
    setInput("");
  };

  const suggestions = [
    "¿Como esta el rio hoy?",
    "¿Que estaciones estan en alerta?",
    "¿Cual es el nivel en Quibdo?",
    "¿Hay riesgo de inundacion?",
    "¿Que hacer ante una inundacion?",
  ];

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isConnected && agentMode === "ai"
                ? "bg-lime-100 dark:bg-lime-900/30"
                : "bg-gray-100 dark:bg-gray-700"
            }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                className={isConnected && agentMode === "ai" ? "text-lime-600" : "text-gray-500"}>
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.52 3.65 1.42 5.16L2 22l4.84-1.42A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
              </svg>
            </div>
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
              isConnected ? "bg-lime-500" : "bg-gray-400"
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Agente Centinela AI
            </h3>
            <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
              {isConnected
                ? agentMode === "ai"
                  ? "IA activa · monitoreo automatico"
                  : "Modo manual · supervision activa"
                : "Sin conexion al backend"}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          {(["manual", "ai"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAgentMode(mode)}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
                agentMode === mode
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {mode === "manual" ? "Manual" : "IA"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"} mb-3 chat-message-${msg.isUser ? "user" : "agent"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.isUser
                  ? "bg-lime-500 text-white rounded-br-md shadow-md shadow-lime-500/15"
                  : "bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-100 dark:border-gray-700"
              }`}
            >
              {!msg.isUser && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-lime-500">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.52 3.65 1.42 5.16L2 22l4.84-1.42A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
                  </svg>
                  <span className="text-[9px] font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">
                    Agente Centinela
                  </span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span
                className={`block text-[9px] font-mono mt-1 ${
                  msg.isUser ? "text-white/60" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-100 dark:border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* AI mode alert indicator */}
        {agentMode === "ai" && criticalAlerts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? "s" : ""} critica{criticalAlerts.length > 1 ? "s" : ""} activa{criticalAlerts.length > 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-[10px] font-mono text-red-500 dark:text-red-400/80 mt-1 ml-4">
              Modo IA activo — el agente evalua umbrales y genera alertas automaticamente
            </p>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800/50">
        {!input && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  sendMessage(s);
                }}
                disabled={isProcessing}
                className="flex-shrink-0 text-[10px] font-mono px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:border-lime-400 hover:text-lime-600 dark:hover:text-lime-400 transition-all disabled:opacity-40 whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre el rio Atrato..."
            disabled={isProcessing}
            className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/40 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-lime-500 hover:bg-lime-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white flex items-center justify-center transition-all disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
