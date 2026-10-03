import { describe, expect, it } from "vitest";
import { parseJsonObject } from "@/server/coach.server";
import { getCoachProvider, type ServerEnv } from "@/server/env.server";

const env = (patch: Partial<ServerEnv>): ServerEnv => ({
  COACH_PROVIDER: "auto",
  LLM_API_KEY: undefined,
  LLM_BASE_URL: "https://api.openai.com/v1",
  LLM_MODEL: "gpt-4o-mini",
  ELEVENLABS_API_KEY: undefined,
  ELEVENLABS_AGENT_ID: undefined,
  ELEVENLABS_COACH_AGENT_ID: undefined,
  ELEVENLABS_API_BASE_URL: "https://api.elevenlabs.io",
  ELEVENLABS_CONNECTION_TYPE: "webrtc",
  ...patch,
});

describe("coach provider selection", () => {
  const elevenlabs = { ELEVENLABS_API_KEY: "k", ELEVENLABS_COACH_AGENT_ID: "a" };

  it("falls back to sample mode with no keys", () => {
    expect(getCoachProvider(env({}))).toBeNull();
  });

  it("prefers ElevenLabs when both are configured", () => {
    expect(getCoachProvider(env({ ...elevenlabs, LLM_API_KEY: "sk" }))).toBe("elevenlabs");
  });

  it("honors an explicit provider", () => {
    expect(
      getCoachProvider(env({ ...elevenlabs, LLM_API_KEY: "sk", COACH_PROVIDER: "openai" })),
    ).toBe("openai");
    expect(getCoachProvider(env({ LLM_API_KEY: "sk", COACH_PROVIDER: "elevenlabs" }))).toBeNull();
  });
});

describe("parseJsonObject", () => {
  it("extracts JSON wrapped in code fences or prose", () => {
    expect(parseJsonObject('```json\n{"a": 1}\n```')).toEqual({ a: 1 });
    expect(parseJsonObject('Sure! {"a": {"b": 2}} Hope that helps.')).toEqual({ a: { b: 2 } });
  });

  it("throws when there is no object", () => {
    expect(() => parseJsonObject("no json here")).toThrow();
  });
});
