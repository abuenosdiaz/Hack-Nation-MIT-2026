import { getServerEnv } from "./env.server";

export type VoiceCredential =
  | { connectionType: "webrtc"; conversationToken: string }
  | { connectionType: "websocket"; signedUrl: string };

/**
 * Mints a short-lived credential for the configured ElevenLabs agent so the
 * API key never reaches the browser.
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
    console.error("[elevenlabs]", response.status, await response.text());
    throw new Error(
      response.status === 401
        ? "ElevenLabs rejected the API key."
        : "Couldn't start the voice conversation. Please try again.",
    );
  }

  const body = (await response.json()) as { token?: string; signed_url?: string };
  if (isWebRtc && body.token) return { connectionType: "webrtc", conversationToken: body.token };
  if (!isWebRtc && body.signed_url)
    return { connectionType: "websocket", signedUrl: body.signed_url };
  throw new Error("ElevenLabs returned an unexpected response.");
}
