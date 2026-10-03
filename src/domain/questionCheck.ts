import { questionCriteria as c } from "@/config/content";
import type { QuestionFeedback } from "./types";

/** Sample-mode question feedback using editable rules in `config/content.ts`. */
export function checkQuestion(raw: string, role: string): QuestionFeedback {
  const question = raw.trim();
  const lower = question.toLowerCase();
  const words = question.split(/\s+/).filter(Boolean).length;
  const open = c.openStarters.some((s) => lower.startsWith(s));
  const closed = c.closedStarters.some((s) => lower.startsWith(s));
  const personal = /\b(you|your)\b/.test(lower);
  const revealing = c.revealingWords.some((w) => lower.includes(w));
  const roleName = role.toLowerCase();

  const works = open
    ? "It's open-ended, so it invites a real story instead of a one-word answer."
    : personal
      ? "It speaks directly to the professional, which keeps it personal."
      : "You're asking something — that's the first step to a good conversation.";

  if (closed) {
    return {
      works,
      improve: "It can be answered with a simple yes or no, which may stop the conversation.",
      revision: `What do you enjoy most about being a ${roleName}, and why?`,
    };
  }
  if (words < c.minWords) {
    return {
      works,
      improve: "It's quite short, so it might be unclear what you want to learn.",
      revision: `What does a typical week look like for you as a ${roleName}?`,
    };
  }
  if (words > c.maxWords) {
    return {
      works,
      improve: "It's long and may contain more than one question. Ask one thing at a time.",
      revision: "How did you decide this career was the right fit for you?",
    };
  }
  if (!personal) {
    return {
      works,
      improve:
        "Make it about their own experience so you hear something you couldn't search online.",
      revision: `How did you first get interested in working as a ${roleName}?`,
    };
  }
  if (!revealing) {
    return {
      works,
      improve:
        "Aim it at something that reveals how the job really works — a challenge, a decision, or advice.",
      revision: `${question.replace(/\?*$/, "")} — and what was the hardest part?`,
    };
  }
  return {
    works: `${works} It's also personal and likely to reveal something useful.`,
    improve: "It's strong already. Plan a follow-up based on what they might say.",
    revision: question,
  };
}
