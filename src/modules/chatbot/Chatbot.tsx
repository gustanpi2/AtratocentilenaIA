import { useState, useRef, useEffect } from "react";
import { ChatbotMessage } from "./ChatbotMessage";
import { ChatbotInput } from "./ChatbotInput";
import { MOCK_CHATBOT_RESPONSES } from "../../data/mockData";
import { FaRobot } from "react-icons/fa";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const WELCOME: Message = {
  id: "welcome",
  text: "¡Hola! Soy el asistente inteligente del Sistema AtratoCentinela AI.\n\nPuedo ayudarte con:\n• Nivel del río y condiciones actuales\n• Riesgo de inundación\n• Alertas activas\n• Datos de estaciones\n• Recomendaciones de seguridad\n\n¿Qué deseas saber?",
  isUser: false,
  timestamp: new Date(),
};

const findResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(MOCK_CHATBOT_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return MOCK_CHATBOT_RESPONSES.default;
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        text: findResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-[99999] w-80 sm:w-96 h-[500px] max-h-[70vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-chatbot-slide">
          <div className="flex items-center justify-between px-4 py-3 bg-lime-500 text-white">
            <div className="flex items-center gap-2.5">
              <FaRobot className="text-xl" />
              <div>
                <p className="font-bold text-sm">Asistente AtratoCentinela AI</p>
                <p className="text-[10px] opacity-80 font-mono">Online · IA Predictiva</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {messages.map((msg) => (
              <ChatbotMessage key={msg.id} {...msg} />
            ))}
            {loading && (
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
            <div ref={endRef} />
          </div>

          <ChatbotInput onSend={handleSend} disabled={loading} />
        </div>
      )}

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
