import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCareerArea } from "@/config/careerAreas";
import { getProfessional } from "@/config/professionals";
import { createVoiceCredential } from "@/server/elevenlabs.server";
import { generateCoachText } from "@/server/llm.server";
import { professionalPersonaPrompt } from "@/server/prompts.server";
import { idSchema, transcriptSchema } from "./schemas";

/** Everything the browser needs to start an in-character ElevenLabs session. */
export const startVoiceRolePlay = createServerFn({ method: "POST" })
  .inputValidator(z.object({ professionalId: idSchema, careerAreaId: idSchema }))
  .handler(async ({ data }) => {
    const pro = getProfessional(data.professionalId);
    const credential = await createVoiceCredential();
    return {
      credential,
      persona: {
        prompt: professionalPersonaPrompt(pro, getCareerArea(data.careerAreaId).label),
        firstMessage: pro.firstMessage,
        voiceId: pro.voiceId ?? null,
      },
    };
  });

/** Text fallback when voice isn't configured: the LLM plays the professional. */
export const replyAsProfessional = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ transcript: transcriptSchema, professionalId: idSchema, careerAreaId: idSchema }),
  )
  .handler(async ({ data }) => {
    const pro = getProfessional(data.professionalId);
    const messages = data.transcript.map((t) => ({
      role: t.speaker === "student" ? ("user" as const) : ("assistant" as const),
      content: t.text,
    }));
    return {
      text: await generateCoachText(
        professionalPersonaPrompt(pro, getCareerArea(data.careerAreaId).label),
        messages,
      ),
    };
  });
