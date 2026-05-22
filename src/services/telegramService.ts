const API_BASE = import.meta.env.VITE_AGENT_API_URL ?? "http://localhost:8000";

interface SendAlertParams {
  station_name: string;
  station_node: string;
  station_id: number;
  nivel_value: string;
  connection_status: string;
  risk_level: string;
  recommendation: string;
  lat?: number;
  lng?: number;
}

export async function sendTelegramAlert(params: SendAlertParams): Promise<boolean> {
  try {
    const resp = await fetch(`${API_BASE}/telegram/send-alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, force: false }),
    });
    const data = await resp.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function testTelegramConnection(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_BASE}/telegram/test`, {
      method: "POST",
    });
    const data = await resp.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function getTelegramStatus(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_BASE}/telegram/status`);
    const data = await resp.json();
    return data.enabled === true;
  } catch {
    return false;
  }
}
