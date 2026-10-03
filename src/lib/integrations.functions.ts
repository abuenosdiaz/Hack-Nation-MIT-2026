import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { professionals } from "@/config/professionals";
import { askSariel, coachingContext, profilePrompt, lessonPrompt, feedbackPrompt, rolePrompt } from "./coach.server";

const message = z.object({ role: z.enum(["student", "coach", "pro"]), text: z.string().max(3000) });
const transcript = z.array(message).max(40);
const history = (items: z.infer<typeof message>[]) => items.map(m => ({ role: m.role === "student" ? "user" as const : "assistant" as const, content: m.text }));

export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(async () => ({
  voice: Boolean(process.env['ELEVENLABS_API_KEY']),
  llm: Boolean(process.env['LOVABLE_API_KEY']),
}));

export const coachOnboarding = createServerFn({ method: "POST" })
  .validator((d) => z.object({ messages: transcript, question: z.string().max(500) }).parse(d))
  .handler(async ({ data }) => ({ text: await askSariel(`${coachingContext}\nThe student is sharing their background. Respond briefly to what they just shared, then ask this one next question naturally: ${data.question}`, history(data.messages)) }));

export const makeProfile = createServerFn({ method: "POST" })
  .validator((d) => z.object({ answers: z.array(z.string().max(3000)).min(1).max(10) }).parse(d))
  .handler(async ({ data }) => {
    const raw = await askSariel(profilePrompt(data.answers), [{ role: "user", content: "Reflect back what I shared and give me a few things to explore without choosing a career for me." }]);
    const json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    const parsed = z.object({ interests: z.string(), experiences: z.string(), confidence: z.string(), directions: z.array(z.string().min(1).max(120)).min(2).max(3) }).parse(json);
    // The sample role-play is chosen separately; it is not a label for the student.
    const answers = data.answers.join(" ").toLowerCase();
    const first = professionals[0];
    if (!first) throw new Error("No practice professionals are available.");
    const p = professionals.reduce((best, candidate) => candidate.keywords.filter(k => answers.includes(k)).length > best.keywords.filter(k => answers.includes(k)).length ? candidate : best, first);
    return { profile: parsed, professionalId: p.id };
  });

export const askLessonCoach = createServerFn({ method: "POST" })
  .validator((d) => z.object({ messages: transcript, area: z.string().max(200), index: z.number().int().min(0).max(4) }).parse(d))
  .handler(async ({ data }) => ({ text: await askSariel(lessonPrompt(data.area, data.index), history(data.messages)) }));

export const gradeQuestion = createServerFn({ method: "POST" })
  .validator((d) => z.object({ question: z.string().min(1).max(1000), area: z.string().max(200), role: z.string().max(100) }).parse(d))
  .handler(async ({ data }) => {
    const raw = await askSariel(feedbackPrompt(data.question, data.area, data.role), [{ role: "user", content: "Give me feedback on my question." }]);
    return z.object({ works: z.string(), improve: z.string(), revision: z.string(), why: z.string() }).parse(JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")));
  });

export const talkToProfessional = createServerFn({ method: "POST" })
  .validator((d) => z.object({ messages: transcript, professionalId: z.string().max(40), area: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const p = professionals.find(x => x.id === data.professionalId);
    if (!p) throw new Error("Please choose a practice professional first.");
    return { text: await askSariel(rolePrompt(p, data.area), history(data.messages)) };
  });

export const askPracticeCoach = createServerFn({ method: "POST" })
  .validator((d) => z.object({ messages: transcript, context: transcript }).parse(d))
  .handler(async ({ data }) => ({ text: await askSariel(`${coachingContext}\nThe student paused a fictional role-play to ask for help. Recent conversation: ${JSON.stringify(data.context.slice(-8))}. Give brief, actionable coaching, without speaking for the student.`, history(data.messages)) }));
