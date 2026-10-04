import { createServerFn } from "@tanstack/react-start";
import { getCoachProvider, getServerEnv, isVoiceConfigured } from "@/server/env.server";

export type IntegrationStatus = {
  /** Live AI coach (ElevenLabs agent or OpenAI-compatible). */
  coach: boolean;
  /** ElevenLabs voice agent for the role-play. */
  voice: boolean;
  /** ElevenLabs speech-to-text (mic button) and text-to-speech (voice-over). */
  speech: boolean;
};

export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationStatus> => {
    const env = getServerEnv();
    return {
      coach: getCoachProvider(env) !== null,
      voice: isVoiceConfigured(env),
      speech: Boolean(env.ELEVENLABS_API_KEY),
    };
  },
);
