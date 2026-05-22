import { useAgent } from "../../modules/agent/AgentContext";

export function AgentHistorySidebar() {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    deleteConversationById,
    newConversation,
  } = useAgent();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
      return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Historial
        </h3>
        <button
          onClick={newConversation}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-lime-500 hover:bg-lime-600 text-white text-[10px] font-bold transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Nuevo
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
              Sin conversaciones
            </p>
          </div>
        ) : (
          <div className="py-2 px-2 space-y-1">
            {conversations.map((conv) => {
              const isActive = conv.id === currentConversationId;
              return (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-lime-50 dark:bg-lime-950/20 border border-lime-200 dark:border-lime-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent"
                  }`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isActive
                          ? "text-lime-700 dark:text-lime-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {conv.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-mono text-gray-400">
                        {conv.message_count} msgs
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">
                        {formatDate(conv.updated_at)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversationById(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                    title="Eliminar conversacion"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-red-400">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
