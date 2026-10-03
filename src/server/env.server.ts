import { z } from "zod";

const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const envSchema = z.object({
  COACH_PROVIDER: z.enum(["auto", "elevenlabs", "openai"]).default("auto"),
  LLM_API_KEY: optional,
  LLM_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  LLM_MODEL: z.string().min(1).default("gpt-4o-mini"),
  ELEVENLABS_API_KEY: optional,
  ELEVENLABS_AGENT_ID: optional,
  ELEVENLABS_COACH_AGENT_ID: optional,
  ELEVENLABS_API_BASE_URL: z.string().url().default("https://api.elevenlabs.io"),
  ELEVENLABS_CONNECTION_TYPE: z.enum(["webrtc", "websocket"]).default("webrtc"),
});

export type ServerEnv = z.infer<typeof envSchema>;

/** Read at call time so container env vars apply without rebuilding the image. */
export function getServerEnv(): ServerEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server configuration: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  }
  return parsed.data;
}

export type CoachProvider = "elevenlabs" | "openai";

/** The coach backend to use, or null for sample mode. `auto` prefers ElevenLabs. */
export function getCoachProvider(env: ServerEnv): CoachProvider | null {
  const elevenlabs = Boolean(env.ELEVENLABS_API_KEY && env.ELEVENLABS_COACH_AGENT_ID);
  const openai = Boolean(env.LLM_API_KEY);
  if (env.COACH_PROVIDER === "elevenlabs") return elevenlabs ? "elevenlabs" : null;
  if (env.COACH_PROVIDER === "openai") return openai ? "openai" : null;
  return elevenlabs ? "elevenlabs" : openai ? "openai" : null;
}

export const isVoiceConfigured = (env: ServerEnv): boolean =>
  Boolean(env.ELEVENLABS_API_KEY && env.ELEVENLABS_AGENT_ID);
