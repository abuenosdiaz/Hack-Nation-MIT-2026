import { createServerFn } from "@tanstack/react-start";
import { getServerEnv, isLlmConfigured, isVoiceConfigured } from "@/server/env.server";

export type IntegrationStatus = { llm: boolean; voice: boolean };

export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationStatus> => {
    const env = getServerEnv();
    return { llm: isLlmConfigured(env), voice: isVoiceConfigured(env) };
  },
);
