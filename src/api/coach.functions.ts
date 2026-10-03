import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { careerAreas, getCareerArea } from "@/config/careerAreas";
import { getProfessional } from "@/config/professionals";
import type { ChatMessage } from "@/domain/types";
import { generateCoachObject, generateCoachText } from "@/server/coach.server";
import {
  conversationFeedbackPrompt,
  lessonCoachPrompt,
  onboardingTurnPrompt,
  profilePrompt,
  questionFeedbackPrompt,
  reflectionCoachPrompt,
} from "@/server/prompts.server";
import {
  chatHistorySchema,
  conversationFeedbackSchema,
  idSchema,
  questionFeedbackSchema,
  studentProfileSchema,
  transcriptSchema,
} from "./schemas";

const toModelMessages = (history: Pick<ChatMessage, "role" | "text">[]) =>
  history.map((m) => ({
    role: m.role === "student" ? ("user" as const) : ("assistant" as const),
    content: m.text,
  }));

export const replyToOnboarding = createServerFn({ method: "POST" })
  .inputValidator(z.object({ history: chatHistorySchema, nextQuestion: z.string().max(500) }))
  .handler(async ({ data }) => ({
    text: await generateCoachText(
      onboardingTurnPrompt(data.nextQuestion),
      toModelMessages(data.history),
    ),
  }));

const careerAreaIds = careerAreas.map((a) => a.id) as [string, ...string[]];

const profileResultSchema = z.object({
  profile: studentProfileSchema,
  suggestion: z.object({ careerAreaId: z.enum(careerAreaIds), reason: z.string().max(400) }),
});

export const createProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({ answers: z.array(z.string().max(3000)).min(1).max(10) }))
  .handler(async ({ data }) => {
    const { system, prompt } = profilePrompt(data.answers);
    return generateCoachObject(profileResultSchema, system, prompt);
  });

export const askLessonCoach = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      history: chatHistorySchema,
      profile: studentProfileSchema,
      careerAreaId: idSchema,
      lessonIndex: z.number().int().min(0).max(20),
    }),
  )
  .handler(async ({ data }) => ({
    text: await generateCoachText(
      lessonCoachPrompt(data.profile, getCareerArea(data.careerAreaId).label, data.lessonIndex),
      toModelMessages(data.history),
    ),
  }));

export const reviewQuestion = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ question: z.string().trim().min(1).max(500), professionalId: idSchema }),
  )
  .handler(async ({ data }) => {
    const { system, prompt } = questionFeedbackPrompt(
      data.question,
      getProfessional(data.professionalId),
    );
    return generateCoachObject(questionFeedbackSchema, system, prompt);
  });

export const reviewConversation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      transcript: transcriptSchema.min(1),
      preparedQuestions: z.array(z.string().max(500)).max(5),
      professionalId: idSchema,
      profile: studentProfileSchema,
    }),
  )
  .handler(async ({ data }) => {
    const { system, prompt } = conversationFeedbackPrompt({
      ...data,
      pro: getProfessional(data.professionalId),
    });
    return generateCoachObject(conversationFeedbackSchema, system, prompt);
  });

export const askReflectionCoach = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      history: chatHistorySchema,
      transcript: transcriptSchema,
      professionalId: idSchema,
      feedbackSummary: z.string().max(4000),
    }),
  )
  .handler(async ({ data }) => ({
    text: await generateCoachText(
      reflectionCoachPrompt({ ...data, pro: getProfessional(data.professionalId) }),
      toModelMessages(data.history),
    ),
  }));
