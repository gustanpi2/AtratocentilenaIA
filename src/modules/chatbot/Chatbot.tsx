import { useState, useRef, useEffect } from "react";
import { ChatbotMessage } from "./ChatbotMessage";
import { ChatbotInput } from "./ChatbotInput";
import { useAgent } from "../agent/AgentContext";
import { useAlerts } from "../alerts/AlertProvider";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, isProcessing, isConnected, agentMode, setAgentMode } = useAgent();
  const { criticalAlerts } = useAlerts();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-[99999] w-80 sm:w-96 h-[500px] max-h-[70vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-chatbot-slide">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-lime-500 text-white">
            <div className="flex items-center gap-2.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.52 3.65 1.42 5.16L2 22l4.84-1.42A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
              </svg>
              <div>
                <p className="font-bold text-sm">Agente AtratoCentinela AI</p>
                <p className="text-[10px] opacity-80 font-mono">
                  {isConnected ? "Conectado" : "Sin conexión"} · {agentMode === "ai" ? "Modo IA" : "Modo Manual"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode toggle */}
              <button
                onClick={() => setAgentMode(agentMode === "ai" ? "manual" : "ai")}
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors ${
                  agentMode === "ai"
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-transparent text-white/70 border-white/20 hover:bg-white/10"
                }`}
                title={agentMode === "ai" ? "Cambiar a modo manual" : "Cambiar a modo IA"}
              >
                {agentMode === "ai" ? "IA" : "M"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {messages.map((msg) => (
              <ChatbotMessage key={msg.id} text={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />
            ))}
            {isProcessing && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            {/* Alert indicator */}
            {agentMode === "ai" && criticalAlerts.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mt-2">
                <p className="text-[10px] font-mono font-semibold text-red-600 dark:text-red-400">
                  {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? "s" : ""} crítica{criticalAlerts.length > 1 ? "s" : ""} activa{criticalAlerts.length > 1 ? "s" : ""}
                </p>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <ChatbotInput onSend={handleSend} disabled={isProcessing} />
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed bottom-5 right-5 z-[99999] w-14 h-14 rounded-full bg-lime-500 hover:bg-lime-600 text-white shadow-xl shadow-lime-500/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        title="Abrir chat de asistencia"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.52 3.65 1.42 5.16L2 22l4.84-1.42A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
            <circle cx="8" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="16" cy="12" r="1" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
};
