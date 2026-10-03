import { describe, expect, it } from "vitest";
import { describeElevenLabsError } from "@/server/elevenlabs.server";

describe("ElevenLabs auth errors", () => {
  it("explains restricted keys", () => {
    expect(describeElevenLabsError(401, null)).toMatch(/rejected the API key/);
    expect(describeElevenLabsError(403, null)).toMatch(/scopes.*IP allowlist/);
    expect(describeElevenLabsError(404, null)).toMatch(/ELEVENLABS_AGENT_ID/);
  });

  it("detects an exhausted credit quota regardless of status", () => {
    const body = {
      detail: { status: "quota_exceeded", message: "This request exceeds your quota." },
    };
    expect(describeElevenLabsError(401, body)).toMatch(/run out of credits/);
  });
});
