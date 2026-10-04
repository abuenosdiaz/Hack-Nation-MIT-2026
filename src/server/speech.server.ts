import { TTS_MODEL_ID } from "@/config/voices";
import { describeElevenLabsError, safeJson } from "./elevenlabs.server";
import { getServerEnv } from "./env.server";

function requireApi(): { apiKey: string; baseUrl: string } {
  const env = getServerEnv();
  if (!env.ELEVENLABS_API_KEY) throw new Error("Voice isn't configured. Set ELEVENLABS_API_KEY.");
  return { apiKey: env.ELEVENLABS_API_KEY, baseUrl: env.ELEVENLABS_API_BASE_URL };
}

async function failure(scope: string, response: Response): Promise<Error> {
  const raw = await response.text();
  console.error(`[${scope}]`, response.status, raw);
  return new Error(describeElevenLabsError(response.status, safeJson(raw)));
}

/** Single-use token (valid 15 minutes) that lets the browser stream mic audio to Scribe. */
export async function createSpeechToTextToken(): Promise<string> {
  const { apiKey, baseUrl } = requireApi();
  const response = await fetch(new URL("/v1/single-use-token/realtime_scribe", baseUrl), {
    method: "POST",
    headers: { "xi-api-key": apiKey },
  });
  if (!response.ok) throw await failure("scribe-token", response);
  const { token } = (await response.json()) as { token?: string };
  if (!token) throw new Error("ElevenLabs returned an unexpected response.");
  return token;
}

/** Strips markdown so formatting characters aren't read aloud. */
export const toSpeakableText = (text: string): string =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Streams MP3 speech for `text` from ElevenLabs text-to-speech. */
export async function streamSpeech(
  text: string,
  voiceId: string,
): Promise<ReadableStream<Uint8Array>> {
  const { apiKey, baseUrl } = requireApi();
  const url = new URL(`/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`, baseUrl);
  url.searchParams.set("output_format", "mp3_44100_128");
  const response = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: toSpeakableText(text), model_id: TTS_MODEL_ID }),
  });
  if (!response.ok || !response.body) throw await failure("tts", response);
  return response.body;
}
