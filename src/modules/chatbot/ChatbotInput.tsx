import { useState, useRef, useEffect } from "react";

interface ChatbotInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatbotInput = ({ onSend, disabled }: ChatbotInputProps) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  const suggestions = [
    "¿Cómo está el río hoy?",
    "¿Qué estaciones están en alerta?",
    "¿Cuál es el nivel en Quibdó?",
    "¿Hay riesgo de inundación?",
  ];

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-800/50">
      {!input && (
        <div className="flex gap-1.5 mb-2 overflow-x-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { onSend(s); }}
              disabled={disabled}
              className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:border-lime-400 hover:text-lime-600 dark:hover:text-lime-400 transition-all disabled:opacity-40"
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
          placeholder="Pregunta sobre AtratoCentinela AI..."
          disabled={disabled}
          className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/40 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-lime-500 hover:bg-lime-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white flex items-center justify-center transition-all disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
};
