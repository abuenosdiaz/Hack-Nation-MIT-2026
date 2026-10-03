import { describe, expect, it } from "vitest";
import {
  buildPresenterSample,
  canVisit,
  initialJourneyState,
  type JourneyState,
} from "@/journey/state";

const withState = (patch: Partial<JourneyState>): JourneyState => ({
  ...initialJourneyState,
  ...patch,
});

describe("step gating", () => {
  it("only allows onboarding at the start", () => {
    expect(canVisit(initialJourneyState, "onboarding")).toBe(true);
    expect(canVisit(initialJourneyState, "lesson")).toBe(false);
    expect(canVisit(initialJourneyState, "reflect")).toBe(false);
  });

  it("unlocks the lesson once a career area is confirmed", () => {
    expect(canVisit(withState({ careerAreaId: "design" }), "lesson")).toBe(true);
  });

  it("requires both prepared questions before the role-play", () => {
    const oneQuestion = withState({
      lessonComplete: true,
      preparedQuestions: [
        { text: "What is your day like?", feedback: null },
        { text: "  ", feedback: null },
      ],
    });
    expect(canVisit(oneQuestion, "prepare")).toBe(true);
    expect(canVisit(oneQuestion, "roleplay")).toBe(false);
  });

  it("builds a presenter sample that lands on a reachable reflection", () => {
    const sample = buildPresenterSample();
    expect(sample.step).toBe("reflect");
    expect(canVisit(sample, "reflect")).toBe(true);
    expect(sample.transcript.some((t) => t.speaker === "student")).toBe(true);
  });
});
