const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || "http://localhost:8000";

interface QueryResponse {
  answer: string;
  conversation_id: number | null;
  message_id: number | null;
  source: string;
}

interface AgentStatus {
  status: string;
  provider: string;
  configured: boolean;
}

interface AgentContext {
  stations: Record<string, unknown>[];
  alerts: Record<string, unknown>[];
  latest_measurements: Record<string, unknown>[];
}

interface ConversationSummary {
  id: number;
  title: string;
  session_id: string;
  status: string;
  message_count: number;
  created_at: string | null;
  updated_at: string | null;
}

interface ConversationDetail extends ConversationSummary {
  messages: {
    id: number;
    conversation_id: number;
    role: string;
    content: string;
    source: string;
    created_at: string | null;
  }[];
}

// ─── Agent core ───────────────────────────────────────────────────────────────

export async function getAgentStatus(): Promise<AgentStatus> {
  try {
    const res = await fetch(`${AGENT_API_URL}/agent/status`);
    if (!res.ok) throw new Error("Error al obtener estado del agente");
    return await res.json();
  } catch (err) {
    return { status: "mocked", provider: "mock", configured: true };
  }
}

export async function queryAgent(
  question: string,
  conversationId?: number,
  sessionId?: string
): Promise<QueryResponse> {
  const res = await fetch(`${AGENT_API_URL}/agent/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      conversation_id: conversationId ?? null,
      session_id: sessionId ?? null,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Error al consultar el agente");
  }
  return res.json();
}

export async function getAgentContext(): Promise<AgentContext> {
  const res = await fetch(`${AGENT_API_URL}/agent/context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ include_alerts: true, include_measurements: true }),
  });
  if (!res.ok) throw new Error("Error al obtener contexto del agente");
  return res.json();
}

export async function evaluateAlert(
  stationId: number,
  mode: "manual" | "ai"
): Promise<Record<string, unknown>> {
  const res = await fetch(`${AGENT_API_URL}/agent/evaluate-alert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ station_id: stationId, mode }),
  });
  if (!res.ok) throw new Error("Error al evaluar alerta");
  return res.json();
}

export async function getStations(): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${AGENT_API_URL}/agent/stations`);
  if (!res.ok) throw new Error("Error al obtener estaciones");
  return res.json();
}

export async function checkAgentHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${AGENT_API_URL}/agent/status`);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function createConversation(
  sessionId: string,
  title = "Nueva conversación"
): Promise<ConversationSummary> {
  const res = await fetch(`${AGENT_API_URL}/agent/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, title }),
  });
  if (!res.ok) throw new Error("Error al crear conversación");
  return res.json();
}

export async function listConversations(
  sessionId: string,
  limit = 50
): Promise<{ conversations: ConversationSummary[]; total: number }> {
  try {
    const res = await fetch(
      `${AGENT_API_URL}/agent/conversations?session_id=${encodeURIComponent(sessionId)}&limit=${limit}`
    );
    if (!res.ok) throw new Error("Error al listar conversaciones");
    return await res.json();
  } catch (err) {
    return { conversations: [], total: 0 };
  }
}

export async function getConversation(
  id: number
): Promise<ConversationDetail> {
  const res = await fetch(`${AGENT_API_URL}/agent/conversations/${id}`);
  if (!res.ok) throw new Error("Error al obtener conversación");
  return res.json();
}

export async function updateConversationTitle(
  id: number,
  title: string
): Promise<ConversationSummary> {
  const res = await fetch(
    `${AGENT_API_URL}/agent/conversations/${id}/title?title=${encodeURIComponent(title)}`,
    { method: "PATCH" }
  );
  if (!res.ok) throw new Error("Error al actualizar título");
  return res.json();
}

export async function deleteConversation(
  id: number
): Promise<void> {
  const res = await fetch(`${AGENT_API_URL}/agent/conversations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar conversación");
}

export async function getMessages(
  conversationId: number,
  limit = 200
): Promise<
  { id: number; conversation_id: number; role: string; content: string; source: string; created_at: string | null }[]
> {
  const res = await fetch(
    `${AGENT_API_URL}/agent/conversations/${conversationId}/messages?limit=${limit}`
  );
  if (!res.ok) throw new Error("Error al obtener mensajes");
  return res.json();
}
