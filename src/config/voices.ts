// EDITABLE: ElevenLabs voices. These are premade voices available on every account;
// browse others at https://elevenlabs.io/app/voice-library.
import { professionals } from "./professionals";

/** Speaker key for the coach; professionals use their own `id`. */
export const COACH_SPEAKER = "coach";

export const COACH_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah — warm, friendly

/** Low-latency model for conversational voice-over. */
export const TTS_MODEL_ID = "eleven_flash_v2_5";

/** Real-time speech-to-text model for the mic button. */
export const STT_MODEL_ID = "scribe_v2_realtime";

/** Resolves a speaker key to a voice, or null for unknown speakers. */
export function voiceIdForSpeaker(speaker: string): string | null {
  if (speaker === COACH_SPEAKER) return COACH_VOICE_ID;
  return professionals.find((p) => p.id === speaker)?.voiceId ?? null;
}
