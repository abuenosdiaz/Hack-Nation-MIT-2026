import { describe, expect, it } from "vitest";
import { COACH_SPEAKER, COACH_VOICE_ID, voiceIdForSpeaker } from "@/config/voices";
import { professionals } from "@/config/professionals";
import { toSpeakableText } from "@/server/speech.server";

describe("voiceIdForSpeaker", () => {
  it("maps the coach and every professional to a voice", () => {
    expect(voiceIdForSpeaker(COACH_SPEAKER)).toBe(COACH_VOICE_ID);
    for (const pro of professionals) expect(voiceIdForSpeaker(pro.id)).toBe(pro.voiceId);
  });

  it("rejects unknown speakers", () => {
    expect(voiceIdForSpeaker("someone-else")).toBeNull();
  });
});

describe("toSpeakableText", () => {
  it("removes markdown so it isn't read aloud", () => {
    expect(toSpeakableText("**Great** question!\n\n- See [the guide](https://x.y) `now`")).toBe(
      "Great question! - See the guide now",
    );
  });
});
