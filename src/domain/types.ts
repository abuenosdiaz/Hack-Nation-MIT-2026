export type Speaker = "coach" | "student" | "pro";

export type ChatMessage = {
  role: Speaker;
  text: string;
  /** True when the text came from scripted sample content instead of a live model. */
  sample?: boolean;
};

export type StudentProfile = {
  interests: string;
  activities: string;
  experiences: string;
  comfortWithStrangers: string;
};

export type CareerSuggestion = {
  careerAreaId: string;
  reason: string;
};

export type QuestionFeedback = {
  works: string;
  improve: string;
  revision: string;
};

export type ConversationFeedback = {
  strength: string;
  practice: string;
  quote: string;
  quoteComment: string;
  preparedQuestionsUsed: string;
  careerInsight: string;
};

/** One turn of the role-play transcript, normalized across voice and text modes. */
export type TranscriptTurn = {
  speaker: "student" | "pro";
  text: string;
};
