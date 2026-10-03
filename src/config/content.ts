// EDITABLE: copy, onboarding questions, lesson cards, and sample-mode content.

export const appName = "Sariel";

export const stages = [
  "Get to know you",
  "First lesson",
  "Prepare",
  "Role-play",
  "Reflect",
] as const;

export const onboardingQuestions = [
  "Hi! I'm Sariel, your career conversation coach. To start, what are some things you're into lately — in or out of school?",
  "Nice. What activities, clubs, jobs, or hobbies take up your time?",
  "Tell me about a time you did something you were proud of or really enjoyed.",
  "Last one: how do you feel about talking with adults you don't know yet? Totally fine, a bit nervous, somewhere in between?",
];

export const sampleOnboardingAnswers = [
  "I like soccer and biology class. I also watch a lot of sports medicine videos.",
  "I'm on the varsity soccer team and I volunteer at a senior center on weekends.",
  "When a teammate got hurt, I helped her with her stretches during recovery. It felt good to help.",
  "Kind of nervous, honestly. I don't know what to say.",
];

export type LessonContext = { careerArea: string; interests: string };

export type LessonCard = {
  title: string;
  body: string;
  tip?: string;
  examples?: (ctx: LessonContext) => string[];
};

export const lessonCards: LessonCard[] = [
  {
    title: "Why networking matters",
    body: "Networking just means having real conversations with people about what they do. Those conversations help you discover careers you didn't know existed, hear about opportunities, and build relationships that support you for years.",
    tip: "If you've ever asked a coach or relative how they got their job, you've already networked.",
  },
  {
    title: "Introducing yourself",
    body: "Say who you are, why you're curious, and thank them for their time. Connect it to something real about you — it gives them a reason to share.",
    examples: ({ careerArea, interests }) => [
      `"Hi, I'm [your name], a junior. I'm curious about ${careerArea.toLowerCase()} — thanks for making time to talk with me!"`,
      `Connect it to something you shared: "${interests}"`,
    ],
  },
  {
    title: "Asking useful, open-ended questions",
    body: "Open-ended questions start with how, what, or why — they invite stories instead of yes/no answers. Good questions are about the person's own experience and teach you something you couldn't search online.",
    examples: ({ careerArea }) => [
      `"What does a typical week look like for you in ${careerArea.toLowerCase()}?"`,
      `"How did you decide on this path?" — instead of "Do you like your job?"`,
    ],
  },
  {
    title: "Listening, following up, and closing",
    body: "Listen for a specific detail, then ask about it. When you're done, thank them and mention one thing you learned.",
    tip: 'Follow-up formula: "You mentioned ___ — can you tell me more about that?"',
  },
];

export const questionCriteria = {
  openStarters: ["how", "what", "why", "tell me", "describe", "which", "in what way"],
  closedStarters: [
    "do ",
    "did ",
    "is ",
    "are ",
    "can ",
    "could ",
    "would ",
    "have ",
    "does ",
    "will ",
    "was ",
    "were ",
  ],
  revealingWords: [
    "day",
    "path",
    "decide",
    "surprise",
    "challenge",
    "advice",
    "learn",
    "favorite",
    "hardest",
    "start",
    "skill",
    "wish",
    "week",
  ],
  minWords: 5,
  maxWords: 30,
};

export const sampleCoachReply =
  "Good question! (Sample reply — the live coach isn't connected.) Once an LLM key is configured, I'll answer based on your profile and this lesson.";
