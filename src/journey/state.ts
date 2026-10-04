import { onboardingQuestions, sampleOnboardingAnswers } from "@/config/content";
import { getProfessionalForArea } from "@/config/professionals";
import { buildSampleProfile, suggestCareerArea } from "@/domain/profile";
import type {
  CareerSuggestion,
  ChatMessage,
  ConversationFeedback,
  QuestionFeedback,
  StudentProfile,
  TranscriptTurn,
} from "@/domain/types";

export const STEPS = ["welcome", "onboarding", "lesson", "prepare", "roleplay", "reflect"] as const;
export type StepId = (typeof STEPS)[number];

export type PreparedQuestion = { text: string; feedback: QuestionFeedback | null };

export type JourneyState = {
  step: StepId;
  /** True when presenter sample data was loaded instead of a real session. */
  sampleMode: boolean;
  /** Read coach and professional replies aloud with ElevenLabs. */
  voiceOver: boolean;
  onboardingChat: ChatMessage[];
  profile: StudentProfile | null;
  suggestion: CareerSuggestion | null;
  /** The career area the student confirmed (or changed to). */
  careerAreaId: string | null;
  lessonIndex: number;
  lessonChat: ChatMessage[];
  lessonComplete: boolean;
  preparedQuestions: [PreparedQuestion, PreparedQuestion];
  transcript: TranscriptTurn[];
  rolePlaySeconds: number;
  rolePlayComplete: boolean;
  feedback: ConversationFeedback | null;
  reflectionChat: ChatMessage[];
};

const emptyQuestion = (): PreparedQuestion => ({ text: "", feedback: null });

export const initialJourneyState: JourneyState = {
  step: "welcome",
  sampleMode: false,
  voiceOver: true,
  onboardingChat: [],
  profile: null,
  suggestion: null,
  careerAreaId: null,
  lessonIndex: 0,
  lessonChat: [],
  lessonComplete: false,
  preparedQuestions: [emptyQuestion(), emptyQuestion()],
  transcript: [],
  rolePlaySeconds: 0,
  rolePlayComplete: false,
  feedback: null,
  reflectionChat: [],
};

export const professionalFor = (state: Pick<JourneyState, "careerAreaId">) =>
  getProfessionalForArea(state.careerAreaId);

export const hasPreparedQuestions = (state: JourneyState): boolean =>
  state.preparedQuestions.every((q) => q.text.trim().length > 0);

/** Whether a step is reachable given what the student has completed so far. */
export function canVisit(state: JourneyState, step: StepId): boolean {
  switch (step) {
    case "welcome":
    case "onboarding":
      return true;
    case "lesson":
      return state.careerAreaId !== null;
    case "prepare":
      return state.lessonComplete;
    case "roleplay":
      return state.lessonComplete && hasPreparedQuestions(state);
    case "reflect":
      return state.rolePlayComplete;
  }
}

/** Fresh role-play attempt, keeping profile, lesson, and prepared questions. */
export const resetRolePlay = (): Partial<JourneyState> => ({
  transcript: [],
  rolePlaySeconds: 0,
  rolePlayComplete: false,
  feedback: null,
  reflectionChat: [],
});

export function sampleOnboardingChat(): ChatMessage[] {
  return onboardingQuestions.flatMap((question, i): ChatMessage[] => [
    { role: "coach", text: question, sample: true },
    { role: "student", text: sampleOnboardingAnswers[i] ?? "", sample: true },
  ]);
}

/** Presenter shortcut: a completed onboarding, lesson, preparation, and role-play. */
export function buildPresenterSample(): JourneyState {
  const suggestion = suggestCareerArea(sampleOnboardingAnswers);
  const pro = getProfessionalForArea(suggestion.careerAreaId);
  return {
    ...initialJourneyState,
    step: "reflect",
    sampleMode: true,
    onboardingChat: sampleOnboardingChat(),
    profile: buildSampleProfile(sampleOnboardingAnswers),
    suggestion,
    careerAreaId: suggestion.careerAreaId,
    lessonComplete: true,
    preparedQuestions: [
      { text: "What does a normal day look like for you?", feedback: null },
      { text: "How did you decide to become a physical therapist?", feedback: null },
    ],
    transcript: pro.sampleTranscript,
    rolePlaySeconds: 200,
    rolePlayComplete: true,
  };
}
