import {
  createContext, useContext, useState, useCallback,
  useEffect, useRef, type ReactNode,
} from "react";
import { useAlerts, type AlertMode } from "../alerts/AlertProvider";
import {
  queryAgent, checkAgentHealth, evaluateAlert,
  createConversation, listConversations, getConversation,
  deleteConversation,
} from "../../service/agentService";

export interface AgentMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  source?: "llm" | "user" | "system";
}

export interface ConversationSummary {
  id: number;
  title: string;
  session_id: string;
  status: string;
  message_count: number;
  created_at: string | null;
  updated_at: string | null;
}

interface AgentContextType {
  messages: AgentMessage[];
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  isProcessing: boolean;
  isConnected: boolean;
  agentMode: AlertMode;
  setAgentMode: (mode: AlertMode) => void;
  evaluateAutoAlert: (stationId: number) => Promise<void>;
  // Session & conversations
  sessionId: string;
  currentConversationId: number | null;
  conversations: ConversationSummary[];
  loadConversations: () => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  deleteConversationById: (id: number) => Promise<void>;
  newConversation: () => void;
}

const WELCOME_TEXT =
  "Soy AtratoCentinela AI, tu agente especializado en monitoreo ambiental del río Atrato.\n\nPuedo ayudarte con:\n• Nivel del río y condiciones actuales\n• Riesgo de inundación\n• Alertas activas\n• Datos de estaciones y sensores\n• Recomendaciones de seguridad\n\n¿Qué deseas saber?";

const WELCOME_MESSAGE: AgentMessage = {
  id: "agent-welcome",
  text: WELCOME_TEXT,
  isUser: false,
  timestamp: new Date(),
  source: "system",
};

function generateSessionId(): string {
  const stored = localStorage.getItem("agent_session_id");
  if (stored) return stored;
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem("agent_session_id", id);
  return id;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AgentMessage[]>([WELCOME_MESSAGE]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const sessionId = useRef(generateSessionId());

  const { alertMode, setAlertMode } = useAlerts();
  const healthCheckRef = useRef(false);

  useEffect(() => {
    if (healthCheckRef.current) return;
    healthCheckRef.current = true;
    checkAgentHealth().then(setIsConnected);
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const data = await listConversations(sessionId.current);
      setConversations(data.conversations);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: AgentMessage = {
      id: `u-${Date.now()}`,
      text,
      isUser: true,
      timestamp: new Date(),
      source: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await queryAgent(
        text,
        currentConversationId ?? undefined,
        sessionId.current
      );

      // Update conversation ID
      if (response.conversation_id && !currentConversationId) {
        setCurrentConversationId(response.conversation_id);
      }

      const botMsg: AgentMessage = {
        id: `b-${Date.now()}`,
        text: response.answer,
        isUser: false,
        timestamp: new Date(),
        source: "llm",
      };
      setMessages((prev) => [...prev, botMsg]);

      // Refresh conversation list
      loadConversations();
    } catch {
      const fallbackMsg: AgentMessage = {
        id: `b-${Date.now()}`,
        text:
          "No pude conectar con el servidor del agente. " +
          "Verifica que el backend esté corriendo en el puerto 8000 y que tenga OPENROUTER_API_KEY configurada.",
        isUser: false,
        timestamp: new Date(),
        source: "system",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, [currentConversationId, loadConversations]);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setCurrentConversationId(null);
  }, []);

  const selectConversation = useCallback(async (id: number) => {
    try {
      const conv = await getConversation(id);
      setCurrentConversationId(conv.id);
      const loaded: AgentMessage[] = conv.messages.map((m) => ({
        id: `msg-${m.id}`,
        text: m.content,
        isUser: m.role === "user",
        timestamp: new Date(m.created_at ?? Date.now()),
        source: (m.role === "user" ? "user" : "llm") as "user" | "llm",
      }));
      setMessages(loaded);
    } catch {
      // ignore
    }
  }, []);

  const deleteConversationById = useCallback(async (id: number) => {
    try {
      await deleteConversation(id);
      if (currentConversationId === id) {
        clearMessages();
      }
      loadConversations();
    } catch {
      // ignore
    }
  }, [currentConversationId, clearMessages, loadConversations]);

  const newConversation = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const evaluateAutoAlert = useCallback(
    async (stationId: number) => {
      if (alertMode !== "ai") return;
      try {
        await evaluateAlert(stationId, "ai");
      } catch {
        // silently fail
      }
    },
    [alertMode]
  );

  const setAgentModeCallback = useCallback(
    (mode: AlertMode) => setAlertMode(mode),
    [setAlertMode]
  );

  return (
    <AgentContext.Provider
      value={{
        messages,
        sendMessage,
        clearMessages,
        isProcessing,
        isConnected,
        agentMode: alertMode,
        setAgentMode: setAgentModeCallback,
        evaluateAutoAlert,
        sessionId: sessionId.current,
        currentConversationId,
        conversations,
        loadConversations,
        selectConversation,
        deleteConversationById,
        newConversation,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
