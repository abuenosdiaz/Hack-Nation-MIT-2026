import { zodSchema, type ModelMessage } from "ai";
import type { z } from "zod";
import { askElevenLabsAgent } from "./elevenlabsAgentText.server";
import { getCoachProvider, getServerEnv, type CoachProvider } from "./env.server";
import { openaiObject, openaiText } from "./openaiCoach.server";

function requireProvider(): CoachProvider {
  const provider = getCoachProvider(getServerEnv());
  if (!provider) throw new Error("The AI coach isn't configured. Use sample mode instead.");
  return provider;
}

const contentOf = (message: ModelMessage): string =>
  typeof message.content === "string" ? message.content : "";

/** Splits a chat into earlier turns (folded into the prompt) and the latest student message. */
function splitHistory(messages: ModelMessage[]): { earlier: ModelMessage[]; latest: string } {
  const last = messages.at(-1);
  if (last?.role === "user") return { earlier: messages.slice(0, -1), latest: contentOf(last) };
  return { earlier: messages, latest: "Please continue." };
}

const formatEarlierTurns = (messages: ModelMessage[]): string =>
  messages.length
    ? `\n\nConversation so far:\n${messages
        .map((m) => `${m.role === "user" ? "Student" : "You"}: ${contentOf(m)}`)
        .join("\n")}\n\nReply to the student's next message.`
    : "";

/** Extracts the first JSON object from a model reply (tolerates code fences or extra prose). */
export function parseJsonObject(reply: string): unknown {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in reply");
  return JSON.parse(reply.slice(start, end + 1));
}

export async function generateCoachText(system: string, messages: ModelMessage[]): Promise<string> {
  if (requireProvider() === "openai") return openaiText(system, messages);
  const { earlier, latest } = splitHistory(messages);
  return askElevenLabsAgent(`${system}${formatEarlierTurns(earlier)}`, latest);
}

export async function generateCoachObject<T>(
  schema: z.ZodType<T>,
  system: string,
  prompt: string,
): Promise<T> {
  if (requireProvider() === "openai") return openaiObject(schema, system, prompt);

  const shape = JSON.stringify(await zodSchema(schema).jsonSchema);
  const jsonSystem = `${system}\n\nRespond with ONLY a single JSON object matching this JSON Schema, with no markdown or extra text:\n${shape}`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return schema.parse(parseJsonObject(await askElevenLabsAgent(jsonSystem, prompt)));
    } catch (error) {
      lastError = error;
    }
  }
  console.error("[coach] invalid structured reply", lastError);
  throw new Error("The AI coach's answer didn't come through properly. Please try again.");
}
