import { getServerEnv } from "./env.server";

export type VoiceCredential =
  | { connectionType: "webrtc"; conversationToken: string }
  | { connectionType: "websocket"; signedUrl: string };

type ElevenLabsErrorBody = { detail?: { status?: string; message?: string } | string };

/** Maps ElevenLabs auth failures (invalid key, scope, IP allowlist, credit quota) to actionable messages. */
export function describeElevenLabsError(status: number, body: ElevenLabsErrorBody | null): string {
  const code = typeof body?.detail === "object" ? body.detail.status : undefined;
  if (code === "quota_exceeded") return "The ElevenLabs API key has run out of credits.";
  if (status === 401) return "ElevenLabs rejected the API key. Check ELEVENLABS_API_KEY.";
  if (status === 403) {
    return "The ElevenLabs API key isn't allowed to start agent conversations. Check the key's scopes (ElevenLabs Agents access) and IP allowlist.";
  }
  if (status === 404) return "ElevenLabs couldn't find the agent. Check ELEVENLABS_AGENT_ID.";
  if (status === 429) return "ElevenLabs is rate limiting requests. Please try again in a moment.";
  return "Couldn't start the voice conversation. Please try again.";
}

/**
 * Exchanges the server-side API key for a single-use conversation credential,
 * so the key itself never reaches the browser.
 */
export async function createVoiceCredential(): Promise<VoiceCredential> {
  const env = getServerEnv();
  if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_AGENT_ID) {
    throw new Error("Voice isn't configured. Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID.");
  }

  const isWebRtc = env.ELEVENLABS_CONNECTION_TYPE === "webrtc";
  const path = isWebRtc
    ? "/v1/convai/conversation/token"
    : "/v1/convai/conversation/get-signed-url";
  const url = new URL(path, env.ELEVENLABS_API_BASE_URL);
  url.searchParams.set("agent_id", env.ELEVENLABS_AGENT_ID);

  const response = await fetch(url, { headers: { "xi-api-key": env.ELEVENLABS_API_KEY } });
  if (!response.ok) {
    const raw = await response.text();
    console.error("[elevenlabs]", response.status, raw);
    throw new Error(describeElevenLabsError(response.status, safeJson(raw)));
  }

  const body = (await response.json()) as { token?: string; signed_url?: string };
  if (isWebRtc && body.token) return { connectionType: "webrtc", conversationToken: body.token };
  if (!isWebRtc && body.signed_url)
    return { connectionType: "websocket", signedUrl: body.signed_url };
  throw new Error("ElevenLabs returned an unexpected response.");
}

export function safeJson(raw: string): ElevenLabsErrorBody | null {
  try {
    return JSON.parse(raw) as ElevenLabsErrorBody;
  } catch {
    return null;
  }
}
