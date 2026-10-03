import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

export const chatMessageSchema = z.object({
  role: z.enum(["coach", "student", "pro"]),
  text: text(3000),
});

export const chatHistorySchema = z.array(chatMessageSchema).max(60);

export const transcriptSchema = z
  .array(z.object({ speaker: z.enum(["student", "pro"]), text: text(3000) }))
  .max(200);

export const studentProfileSchema = z.object({
  interests: text(600).describe("What the student is into"),
  activities: text(600).describe("Clubs, jobs, hobbies"),
  experiences: text(600).describe("A meaningful experience they shared"),
  comfortWithStrangers: text(300).describe(
    "A kind, honest phrase about their comfort talking to new adults",
  ),
});

export const questionFeedbackSchema = z.object({
  works: text(500),
  improve: text(500),
  revision: text(300),
});

export const conversationFeedbackSchema = z.object({
  strength: text(600),
  practice: text(600),
  quote: text(600),
  quoteComment: text(600),
  preparedQuestionsUsed: text(600),
  careerInsight: text(600),
});

export const idSchema = z.string().min(1).max(60);
