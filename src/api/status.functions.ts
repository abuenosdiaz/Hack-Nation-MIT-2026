import { createServerFn } from "@tanstack/react-start";
import { getCoachProvider, getServerEnv, isVoiceConfigured } from "@/server/env.server";

export type IntegrationStatus = { coach: boolean; voice: boolean };

export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationStatus> => {
    const env = getServerEnv();
    return { coach: getCoachProvider(env) !== null, voice: isVoiceConfigured(env) };
  },
);
