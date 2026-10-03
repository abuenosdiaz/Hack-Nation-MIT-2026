import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, generateText, Output, type ModelMessage } from "ai";
import type { z } from "zod";
import { getServerEnv } from "./env.server";

function getModel() {
  const env = getServerEnv();
  if (!env.LLM_API_KEY)
    throw new Error("The AI coach isn't configured. Set LLM_API_KEY or use sample mode.");
  // Chat Completions keeps this compatible with any OpenAI-compatible provider.
  return createOpenAI({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL }).chat(env.LLM_MODEL);
}

function toFriendlyError(error: unknown): Error {
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 401 || error.statusCode === 403)
      return new Error("The AI coach's API key was rejected.");
    if (error.statusCode === 429)
      return new Error("The AI coach is busy right now. Please try again in a moment.");
  }
  console.error("[llm]", error);
  return new Error("The AI coach couldn't respond right now. Please try again.");
}

export async function generateCoachText(system: string, messages: ModelMessage[]): Promise<string> {
  try {
    const { text } = await generateText({ model: getModel(), system, messages });
    if (!text.trim()) throw new Error("Empty response");
    return text.trim();
  } catch (error) {
    throw toFriendlyError(error);
  }
}

export async function generateCoachObject<T>(
  schema: z.ZodType<T>,
  system: string,
  prompt: string,
): Promise<T> {
  try {
    const { output } = await generateText({
      model: getModel(),
      system,
      prompt,
      output: Output.object({ schema }),
    });
    return schema.parse(output);
  } catch (error) {
    throw toFriendlyError(error);
  }
}
