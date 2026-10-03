// EDITABLE: onboarding questions, lesson cards, question-feedback criteria, coach hints, and feedback placeholders.

export const appName = "Sariel";

export const stages = ["Get to know you", "Learn", "Practice conversation", "Reflect"] as const;

export const onboardingQuestions = [
  "Hi! I'm your Sariel coach. To start, what are some things you're into lately — in or out of school?",
  "Nice. What activities, clubs, jobs, or hobbies take up your time?",
  "Can you tell me about a time you did something you were proud of or really enjoyed?",
  "What kinds of things, people, or problems are you curious to learn more about? It doesn't have to be a career.",
  "Last one: how do you feel about talking with adults you don't know yet? Totally fine, a bit nervous, somewhere in between?",
];

// Labeled sample student answers for demo mode.
export const sampleOnboardingAnswers = [
  "I like soccer and biology class. I also watch a lot of sports medicine videos.",
  "I'm on the varsity soccer team and I volunteer at a senior center on weekends.",
  "When a teammate got hurt, I helped her with her stretches during recovery. It felt good to help.",
  "Maybe something in health? I'm not really sure though.",
  "Kind of nervous, honestly. I don't know what to say.",
];

// PLACEHOLDER lesson wording — replace with your curriculum. One card per part.
export type LessonCard = { title: string; body: string; tip?: string; examples?: (area: string) => string[]; questionPractice?: boolean };
export const lessonCards: LessonCard[] = [
  {
    title: "What networking means",
    body: "Networking just means having real conversations with people about what they do and what they care about. It isn't selling yourself — it's being curious about someone else's path.",
    tip: "If you've ever asked a coach or relative how they got their job, you've already networked.",
  },
  {
    title: "Why it's useful throughout your life",
    body: "Conversations help you discover careers you didn't know existed, hear about internships and jobs, and build relationships that can support you for years — in high school, college, and beyond.",
    tip: "Many jobs are found through someone you know or someone they introduce you to.",
  },
  {
    title: "Introducing yourself and starting a conversation",
    body: "Say who you are, why you're curious, and thank them for their time. Keep it short and genuine.",
    examples: (area) => [
      `"Hi, I'm Maya. I'm a junior and I'm curious about ${area.toLowerCase()}. Thanks for talking with me!"`,
    ],
  },
  {
    title: "Asking useful, open-ended questions",
    body: "Open-ended questions start with how, what, or why — they invite stories instead of yes/no answers. Good questions are clear, relevant to the person, and likely to teach you something.",
    examples: (area) => [
      `What does a typical day look like in ${area.toLowerCase()}?`,
      "How did you decide on this path?",
      "What surprised you most when you started?",
    ],
    questionPractice: true,
  },
  {
    title: "Listening, following up, and closing",
    body: "Listen closely, then ask a follow-up about something specific they said. When you're done, thank them and mention one thing you learned.",
    tip: "Follow-up formula: \"You mentioned ___ — can you tell me more about that?\"",
  },
];

// EDITABLE criteria for the demo question check (rule-based, NOT a live model).
export const questionCriteria = {
  openStarters: ["how", "what", "why", "tell me", "describe", "which", "in what way"],
  closedStarters: ["do ", "did ", "is ", "are ", "can ", "could ", "would ", "have ", "does ", "will ", "was ", "were "],
  revealingWords: ["day", "path", "decide", "surprise", "challenge", "advice", "learn", "favorite", "hardest", "start", "skill", "wish", "like"],
  minWords: 5,
  maxWords: 30,
};

// Brief hints the coach gives when the student pauses the role-play (demo).
export const coachHints = [
  "Totally normal to pause! Try picking up on one word they just used: \"You mentioned ___ — what's that like?\"",
  "If you're stuck, ask about how they got started. People usually enjoy telling that story.",
  "You can also ask what advice they'd give someone your age who's curious about their field.",
  "When you're ready to wrap up, thank them and share one thing you learned.",
];

// PLACEHOLDER feedback — sample only, not a real assessment.
export const sampleFeedback = [
  { label: "One thing you did well", text: "You opened with a clear, friendly introduction and explained why you were curious." },
  { label: "One thing to practice", text: "Try connecting your follow-up more directly to a specific word or detail they used." },
  { label: "An example from your conversation", text: "\"You said you help athletes — what's different about working with them?\" is a strong follow-up." },
  { label: "Something you learned about the career", text: "A big part of the job is motivating people, not just technical skill." },
];

export const coachDemoReply =
  "Good question! (Demo reply — the live coach isn't connected yet.) Once connected, I'll answer based on your profile and this lesson.";

export const sampleDraftQuestion = "Do you like your job?";
