import { careerAreas, DEFAULT_CAREER_AREA_ID } from "@/config/careerAreas";
import type { CareerSuggestion, StudentProfile } from "./types";

const NERVOUS = /nervous|scared|shy|anxious|not sure|awkward|don't know what to say/;

/** Sample-mode profile: summarizes onboarding answers by position, no AI involved. */
export function buildSampleProfile(answers: string[]): StudentProfile {
  const [interests = "", activities = "", experiences = "", comfort = ""] = answers;
  return {
    interests,
    activities,
    experiences,
    comfortWithStrangers: NERVOUS.test(comfort.toLowerCase())
      ? "Still building confidence — that's completely normal."
      : "Fairly comfortable meeting new people.",
  };
}

/** Sample-mode suggestion: the career area whose keywords appear most in the answers. */
export function suggestCareerArea(answers: string[]): CareerSuggestion {
  const text = answers.join(" ").toLowerCase();
  let best = { id: DEFAULT_CAREER_AREA_ID, matches: [] as string[] };
  for (const area of careerAreas) {
    const matches = area.keywords.filter((k) => text.includes(k));
    if (matches.length > best.matches.length) best = { id: area.id, matches };
  }
  const reason = best.matches.length
    ? `You mentioned things like ${best.matches.slice(0, 3).join(", ")}, which connect to this area.`
    : "It's a broad area with lots of different paths — a good place to start exploring.";
  return { careerAreaId: best.id, reason };
}
