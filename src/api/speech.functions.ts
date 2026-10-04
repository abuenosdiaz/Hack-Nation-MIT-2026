import { createServerFn } from "@tanstack/react-start";
import { createSpeechToTextToken } from "@/server/speech.server";

/** Authorizes one real-time Scribe session for the mic button. */
export const getSpeechToTextToken = createServerFn({ method: "POST" }).handler(async () => ({
  token: await createSpeechToTextToken(),
}));
