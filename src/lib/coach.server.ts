import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server.ts";
import { lessonCards, questionCriteria } from "@/config/content";
import { professionals } from "@/config/professionals";

const MODEL = "openai/gpt-6-astra";
const BASE = "https://ai.gateway.lovable.dev/v1";

export async function askSariel(system: string, messages: ModelMessage[]) {
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) throw new Error("Sariel's AI connection is unavailable right now. Try the sample path instead.");
  const run = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: BASE, apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: run.fetch,
  });
  try {
    const result = streamText({
      model: provider.responses(MODEL), system, messages,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    const text = (await result.text).trim();
    if (!text) throw new Error("Sariel didn't return an answer. Please try again.");
    return text;
  } catch (error) {
    const e = error as { statusCode?: number; message?: string; responseBody?: string };
    if (e.statusCode === 402) throw new Error("Sariel's AI credits are exhausted. Please use the sample path for now.");
    if (e.statusCode === 403) throw new Error(e.message || "Sariel's AI access is currently unavailable.");
    if (e.statusCode === 429) throw new Error("Sariel is busy right now. Please try again in a moment.");
    throw new Error(e.message || "Sariel couldn't respond right now. Please try again.");
  }
}

export const coachingContext = `You are Sariel, a warm, curious career conversation coach for high-school juniors. Be supportive, conversational, specific, and never assume the student has a career figured out. Avoid sounding childish or corporate. Ask one question at a time. Never claim a fictional person is real.`;

export function profilePrompt(answers: string[]) {
  return `${coachingContext}\nBased on the student's answers below, write a SHORT profile. Do not label the student with an industry, career, or fixed type. Offer 2-3 broad, overlapping directions to explore based on their interests, activities, and values; these are invitations to be curious, not career recommendations. Include a wider or unexpected possibility so their future stays open. If they are unsure, do not invent certainty. Return ONLY a JSON object with string keys interests, experiences, confidence, and directions (an array of 2-3 short strings). Confidence should be a kind, honest phrase. No markdown.\nAnswers: ${JSON.stringify(answers)}`;
}

export function lessonPrompt(area: string, index: number) {
  return `${coachingContext}\nStudent is curious about ${area}, not committed to any career. They are reading part ${index+1} of ${lessonCards.length}: "${lessonCards[index]?.title}". Lesson text: ${lessonCards[index]?.body}. Answer their specific question in 2-4 short sentences. Do not move them ahead or read the whole lesson aloud.`;
}

export function feedbackPrompt(question: string, area: string, role: string) {
  return `${coachingContext}\nAssess a student's first networking question for a fictional ${role} in ${area}. Consider clarity, relevance, open-endedness, and how likely it is to reveal useful information. Editable rubric: ${JSON.stringify(questionCriteria)}. Respond ONLY as a JSON object with string keys works, improve, revision, why. Give one specific strength, one actionable improvement (even if strong, give a next-level improvement), one natural revised question and a brief explanation. Do not grade personality or claim a numeric score. Student question: ${JSON.stringify(question)}`;
}

export function rolePrompt(p: (typeof professionals)[number], area: string) {
  return `You are role-playing ${p.name}, a FICTIONAL ${p.role}. Stay in character, respond naturally and patiently, one short turn at a time. Do not write the student's lines. Do not interrogate; leave space to think. Career path: ${p.careerPath}. Typical work: ${p.typicalWork}. Details: ${p.details.join(' ')}. Student is exploring ${area}. If asked something outside the profile, improvise plausibly but never claim to be a real person.`;
}
