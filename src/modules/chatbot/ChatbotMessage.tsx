interface ChatbotMessageProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatbotMessage = ({ text, isUser, timestamp }: ChatbotMessageProps) => {
  const time = timestamp.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-lime-500 text-white rounded-br-md shadow-md shadow-lime-500/20"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">🤖</span>
            <span className="text-[10px] font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider">
              Asistente AtratoCentinela AI
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
        <span
          className={`block text-[10px] mt-1 font-mono ${
            isUser ? "text-white/60" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  );
};
