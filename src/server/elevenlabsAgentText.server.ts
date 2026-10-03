import { describeElevenLabsError } from "./elevenlabs.server";
import { getServerEnv } from "./env.server";

const RESPONSE_TIMEOUT_MS = 30_000;

type AgentEvent =
  | { type: "conversation_initiation_metadata" }
  | { type: "ping"; ping_event: { event_id: number } }
  | { type: "agent_response"; agent_response_event: { agent_response: string } }
  | { type: string };

async function getSignedUrl(apiKey: string, agentId: string, apiBaseUrl: string): Promise<string> {
  const url = new URL("/v1/convai/conversation/get-signed-url", apiBaseUrl);
  url.searchParams.set("agent_id", agentId);
  const response = await fetch(url, { headers: { "xi-api-key": apiKey } });
  if (!response.ok) {
    const raw = await response.text();
    console.error("[elevenlabs-coach]", response.status, raw);
    throw new Error(describeElevenLabsError(response.status, null));
  }
  const { signed_url: signedUrl } = (await response.json()) as { signed_url?: string };
  if (!signedUrl) throw new Error("ElevenLabs returned an unexpected response.");
  return signedUrl;
}

/**
 * Runs one text-only turn with the ElevenLabs coach agent: starts a conversation
 * with `prompt` as the system prompt override, sends `userMessage`, and resolves
 * with the agent's reply.
 */
export async function askElevenLabsAgent(prompt: string, userMessage: string): Promise<string> {
  const env = getServerEnv();
  if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_COACH_AGENT_ID) {
    throw new Error("The ElevenLabs coach isn't configured. Set ELEVENLABS_COACH_AGENT_ID.");
  }
  const signedUrl = await getSignedUrl(
    env.ELEVENLABS_API_KEY,
    env.ELEVENLABS_COACH_AGENT_ID,
    env.ELEVENLABS_API_BASE_URL,
  );

  return new Promise<string>((resolve, reject) => {
    const socket = new WebSocket(signedUrl, ["convai"]);
    let settled = false;
    const settle = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.close();
      action();
    };
    const fail = (message: string) => settle(() => reject(new Error(message)));
    const timer = setTimeout(
      () => fail("The ElevenLabs coach took too long to respond."),
      RESPONSE_TIMEOUT_MS,
    );
    const send = (event: object) => socket.send(JSON.stringify(event));

    socket.addEventListener("open", () =>
      send({
        type: "conversation_initiation_client_data",
        conversation_config_override: { agent: { prompt: { prompt }, first_message: "" } },
      }),
    );
    socket.addEventListener("message", (message) => {
      const event = JSON.parse(String(message.data)) as AgentEvent;
      if (event.type === "conversation_initiation_metadata")
        send({ type: "user_message", text: userMessage });
      else if ("ping_event" in event) send({ type: "pong", event_id: event.ping_event.event_id });
      else if ("agent_response_event" in event) {
        const reply = event.agent_response_event.agent_response.trim();
        settle(() =>
          reply
            ? resolve(reply)
            : reject(new Error("The ElevenLabs coach returned an empty reply.")),
        );
      }
    });
    socket.addEventListener("error", () => fail("Couldn't reach the ElevenLabs coach."));
    socket.addEventListener("close", (event) => {
      if (!settled) console.error("[elevenlabs-coach] closed early", event.code, event.reason);
      fail("The ElevenLabs coach ended the conversation unexpectedly.");
    });
  });
}
