import { questionCriteria } from "@/config/content";
import type { ConversationFeedback, TranscriptTurn } from "./types";

const STOP_WORDS = new Set([
  "what",
  "how",
  "why",
  "your",
  "you",
  "the",
  "and",
  "for",
  "that",
  "with",
  "does",
  "did",
  "like",
  "about",
]);

const keywords = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

/** True when most of a prepared question's key words appear in something the student said. */
export function wasQuestionAsked(prepared: string, studentLines: string[]): boolean {
  const target = keywords(prepared);
  if (!target.length) return false;
  return studentLines.some((line) => {
    const said = new Set(keywords(line));
    return target.filter((w) => said.has(w)).length / target.length >= 0.5;
  });
}

const isOpenQuestion = (line: string): boolean => {
  const lower = line.trim().toLowerCase();
  return line.includes("?") && questionCriteria.openStarters.some((s) => lower.includes(s));
};

const isFollowUp = (line: string): boolean =>
  /you (said|mentioned)|tell me more|what was that like/i.test(line);

/** Sample-mode feedback derived from the transcript with simple heuristics. */
export function buildSampleFeedback(
  transcript: TranscriptTurn[],
  preparedQuestions: string[],
): ConversationFeedback {
  const studentLines = transcript.filter((t) => t.speaker === "student").map((t) => t.text);
  const proLines = transcript.filter((t) => t.speaker === "pro").map((t) => t.text);
  const openQuestions = studentLines.filter(isOpenQuestion);
  const followUp = studentLines.find(isFollowUp);
  const closedQuestion = studentLines.find(
    (l) =>
      l.includes("?") &&
      questionCriteria.closedStarters.some((s) => l.trim().toLowerCase().startsWith(s)),
  );
  const asked = preparedQuestions.filter((q) => q.trim() && wasQuestionAsked(q, studentLines));
  const quote = followUp ?? openQuestions[0] ?? studentLines[0] ?? "";

  return {
    strength: followUp
      ? "You listened and followed up on something specific they said — that's what makes a conversation feel real."
      : openQuestions.length
        ? `You asked ${openQuestions.length} open-ended question${openQuestions.length > 1 ? "s" : ""}, which invited stories instead of one-word answers.`
        : "You showed up and kept the conversation going — that's the hardest part.",
    practice: closedQuestion
      ? `"${closedQuestion}" could be answered with yes or no. Try starting with "what" or "how" instead.`
      : followUp
        ? "When you wrap up, mention one specific thing you learned before saying thank you."
        : 'Try a follow-up next time: "You mentioned ___ — can you tell me more about that?"',
    quote,
    quoteComment: followUp
      ? "This follow-up shows you were actively listening."
      : "This is a solid moment to build on next time.",
    preparedQuestionsUsed: `You asked ${asked.length} of your ${preparedQuestions.length} prepared questions.`,
    careerInsight: proLines.length
      ? `They shared: "${proLines[Math.min(2, proLines.length - 1)]}"`
      : "Ask more about their daily work next time to learn what the job is really like.",
  };
}
