import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { voiceIdForSpeaker } from "@/config/voices";
import { streamSpeech } from "@/server/speech.server";

const requestSchema = z.object({
  text: z.string().trim().min(1).max(1500),
  speaker: z.string().min(1).max(60),
});

const json = (status: number, message: string) =>
  Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

/** Same-origin only, so other sites can't spend the app's ElevenLabs credits. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || new URL(origin).host === request.headers.get("host");
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOrigin(request)) return json(403, "Cross-origin requests aren't allowed.");
        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json(400, "Invalid voice-over request.");
        const voiceId = voiceIdForSpeaker(parsed.data.speaker);
        if (!voiceId) return json(400, "Unknown speaker.");
        try {
          const audio = await streamSpeech(parsed.data.text, voiceId);
          return new Response(audio, {
            headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
          });
        } catch (error) {
          return json(502, error instanceof Error ? error.message : "Voice-over failed.");
        }
      },
    },
  },
});
