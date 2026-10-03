import { describe, expect, it } from "vitest";
import { buildSampleProfile, suggestCareerArea } from "@/domain/profile";
import { checkQuestion } from "@/domain/questionCheck";
import { buildSampleFeedback, wasQuestionAsked } from "@/domain/conversationFeedback";
import { sampleOnboardingAnswers } from "@/config/content";
import { getProfessional } from "@/config/professionals";

describe("profile", () => {
  it("suggests the career area matching the most keywords", () => {
    expect(suggestCareerArea(["I love drawing and video games"]).careerAreaId).toBe("design");
    expect(suggestCareerArea(sampleOnboardingAnswers).careerAreaId).toBe("health");
  });

  it("falls back to a default area when nothing matches", () => {
    const suggestion = suggestCareerArea(["xyz"]);
    expect(suggestion.careerAreaId).toBe("health");
    expect(suggestion.reason).toMatch(/broad area/);
  });

  it("recognizes nervousness about meeting strangers", () => {
    expect(buildSampleProfile(sampleOnboardingAnswers).comfortWithStrangers).toMatch(
      /building confidence/,
    );
  });
});

describe("question check", () => {
  it("flags yes/no questions", () => {
    expect(checkQuestion("Do you like your job?", "Nurse").improve).toMatch(/yes or no/);
  });

  it("keeps strong questions unchanged", () => {
    const q = "What was the hardest part of starting your career?";
    expect(checkQuestion(q, "Nurse").revision).toBe(q);
  });
});

describe("conversation feedback", () => {
  it("detects prepared questions in the transcript", () => {
    expect(
      wasQuestionAsked("What does a normal day look like?", [
        "So what does a normal day look like for you?",
      ]),
    ).toBe(true);
    expect(wasQuestionAsked("How did you choose college?", ["What is your favorite food?"])).toBe(
      false,
    );
  });

  it("grounds feedback in the student's own words", () => {
    const transcript = getProfessional("dana-okafor").sampleTranscript;
    const feedback = buildSampleFeedback(transcript, [
      "What does a normal day look like for you?",
      "How did you choose this?",
    ]);
    expect(feedback.quote).toMatch(/You said you help athletes/);
    expect(feedback.practice).toMatch(/Do you like it\?/);
    expect(feedback.preparedQuestionsUsed).toBe("You asked 1 of your 2 prepared questions.");
  });
});
