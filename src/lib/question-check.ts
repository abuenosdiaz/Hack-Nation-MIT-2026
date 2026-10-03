import { questionCriteria as c } from "@/config/content";
import type { QuestionFeedback } from "@/lib/journey";

/**
 * DEMO rule-based question check — NOT a live model.
 * TODO(LLM): replace with a server function that evaluates the question.
 */
export function checkQuestion(raw: string, role: string, area: string): QuestionFeedback {
  const q = raw.trim();
  const lower = q.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean).length;
  const open = c.openStarters.some((s) => lower.startsWith(s));
  const closed = c.closedStarters.some((s) => lower.startsWith(s));
  const personal = /\b(you|your)\b/.test(lower);
  const revealing = c.revealingWords.some((w) => lower.includes(w));

  const works = open
    ? "It's open-ended, so it invites a real story instead of a one-word answer."
    : personal
      ? "It speaks directly to the professional, which keeps it personal and relevant."
      : words >= c.minWords
        ? "It's a complete thought that's easy to understand."
        : "You're asking something — that's the first step to a good conversation.";

  if (closed) return {
    works,
    improve: "It can be answered with a simple yes or no, which may stop the conversation.",
    revision: `What do you enjoy most about being a ${role.toLowerCase()}, and why?`,
    why: "Starting with \"what\" and adding \"why\" invites them to explain and share examples.",
  };
  if (words < c.minWords) return {
    works,
    improve: "It's quite short, so it might be unclear what you want to learn.",
    revision: `What does a typical day look like for you as a ${role.toLowerCase()}?`,
    why: "Adding a little context makes it easier for them to give a detailed, useful answer.",
  };
  if (words > c.maxWords) return {
    works,
    improve: "It's long and may contain more than one question. Try asking one thing at a time.",
    revision: "How did you decide this career was the right fit for you?",
    why: "One focused question is easier to answer and leaves room for follow-ups.",
  };
  if (!personal) return {
    works,
    improve: "Make it about their own experience, so you hear something you couldn't just search online.",
    revision: `How did you first get interested in ${area.toLowerCase()}?`,
    why: "Using \"you\" turns a general question into a personal story.",
  };
  if (!revealing) return {
    works,
    improve: "Aim it at something that reveals how the job really works — a challenge, a decision, or advice.",
    revision: `${q.replace(/\?*$/, "")} — and what was the hardest part?`,
    why: "Asking about challenges or decisions often gets the most honest, useful answers.",
  };
  return {
    works: works + " It's also personal and likely to reveal something useful.",
    improve: "It's strong already. To go further, plan a follow-up based on what they might say.",
    revision: `${q.replace(/\?*$/, "")}? (Follow-up: "What surprised you about that?")`,
    why: "Having a follow-up ready helps you keep the conversation going naturally.",
  };
}
