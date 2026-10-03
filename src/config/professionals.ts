// EDITABLE: fictional practice professionals. One is picked by matching
// the student's onboarding answers against `keywords`.
export type Professional = {
  id: string;
  careerArea: string;
  keywords: string[];
  name: string;
  role: string;
  careerPath: string;
  typicalWork: string;
  details: [string, string];
  greeting: string;
  /** Demo-mode replies, used in order as the student sends messages. */
  replies: string[];
  /** Labeled sample conversation for demo playback. */
  sample: { role: "student" | "pro"; text: string }[];
};

export const professionals: Professional[] = [
  {
    id: "health",
    careerArea: "Healthcare & helping people",
    keywords: ["help", "health", "sport", "body", "doctor", "nurse", "care", "volunteer", "biology", "injury", "coach"],
    name: "Dana Okafor",
    role: "Physical Therapist",
    careerPath: "Played soccer in high school, studied kinesiology, then earned a Doctor of Physical Therapy degree.",
    typicalWork: "Helps patients recover from injuries with exercise plans, hands-on treatment, and lots of encouragement.",
    details: [
      "Tore her own ACL at 17 — that's how she discovered the field.",
      "Spends one day a week working with a local youth sports league.",
    ],
    greeting: "Hi there! I'm Dana. I hear you're curious about healthcare — happy to chat.",
    replies: [
      "Nice to meet you! Most of my day is spent with patients — figuring out what's limiting them and building a plan to get them moving again.",
      "Honestly, I got into it after my own knee injury. My physical therapist made such a difference that I wanted to do that for someone else.",
      "Great follow-up. The hardest part is when progress is slow — part of my job is keeping people motivated on tough days.",
      "Thanks so much for asking such thoughtful questions. Good luck exploring!",
    ],
    sample: [
      { role: "student", text: "Hi Dana, I'm Maya. I'm a junior and I'm interested in sports and helping people. Thanks for talking with me!" },
      { role: "pro", text: "Hi Maya! Happy to help. What would you like to know?" },
      { role: "student", text: "What does a normal day look like for you?" },
      { role: "pro", text: "I see about eight patients — some recovering from surgery, some athletes. Each session is about 45 minutes of exercises and check-ins." },
      { role: "student", text: "How did you decide to become a physical therapist?" },
      { role: "pro", text: "I tore my ACL at 17. My PT helped me get back on the field, and I realized I wanted to do that for others." },
      { role: "student", text: "You said you help athletes — what's different about working with them?" },
      { role: "pro", text: "They're usually very motivated, but impatient! Part of my job is helping them not rush back too soon." },
      { role: "student", text: "That's really helpful. Thank you so much for your time!" },
      { role: "pro", text: "Anytime, Maya. Good luck!" },
    ],
  },
  {
    id: "design",
    careerArea: "Technology & design",
    keywords: ["art", "draw", "design", "game", "computer", "code", "app", "tech", "video", "build", "creative", "robot"],
    name: "Leo Tran",
    role: "UX Designer",
    careerPath: "Started making game mods as a teen, studied graphic design, and moved into designing apps.",
    typicalWork: "Talks with users, sketches ideas, and designs screens that make apps easier and more enjoyable to use.",
    details: [
      "Has designed screens used by over a million people.",
      "Still keeps a sketchbook for every project before touching a computer.",
    ],
    greeting: "Hey! I'm Leo. I design apps for a living — ask me anything.",
    replies: [
      "Good to meet you! A typical day is split between talking to people who use our app and sketching better ways for it to work.",
      "I kind of stumbled in — I loved art and games, and found out there's a job that combines both.",
      "Good follow-up! The surprising part is how much listening there is. Design is mostly understanding people.",
      "Thanks for chatting — you asked great questions!",
    ],
    sample: [
      { role: "student", text: "Hi Leo, I'm Sam. I like drawing and video games. Thanks for meeting with me." },
      { role: "pro", text: "Hey Sam! Those are great interests for design. What's on your mind?" },
      { role: "student", text: "What kinds of projects do you work on?" },
      { role: "pro", text: "Right now I'm redesigning how people sign up for a fitness app so fewer people give up halfway." },
      { role: "student", text: "What did you study to get into UX?" },
      { role: "pro", text: "Graphic design, but plenty of UX designers come from psychology or computer science too." },
      { role: "student", text: "You mentioned people giving up — how do you figure out why?" },
      { role: "pro", text: "We watch real people try it and ask them to think out loud. It's humbling!" },
      { role: "student", text: "That's so interesting. Thank you for your time!" },
      { role: "pro", text: "My pleasure, Sam." },
    ],
  },
  {
    id: "environment",
    careerArea: "Environment & engineering",
    keywords: ["nature", "outdoor", "environment", "climate", "animal", "science", "math", "fix", "engineer", "hike", "garden", "energy"],
    name: "Priya Shah",
    role: "Environmental Engineer",
    careerPath: "Loved science fairs, studied civil engineering, and now works on clean water projects.",
    typicalWork: "Designs systems that keep rivers and drinking water clean, splitting time between the office and field sites.",
    details: [
      "Has waded into more rivers for work than she can count.",
      "Her team's project now supplies clean water to 40,000 people.",
    ],
    greeting: "Hello! I'm Priya. I work on clean water projects — glad to talk.",
    replies: [
      "Nice to meet you! Some days I'm at my desk running models, other days I'm in boots at a river testing water.",
      "I loved science fairs growing up and wanted my math skills to help the planet. Engineering was the bridge.",
      "Great follow-up! Fieldwork is unpredictable — weather, equipment — so you learn to problem-solve fast.",
      "Thank you — that was a really thoughtful conversation.",
    ],
    sample: [
      { role: "student", text: "Hi Priya, I'm Jordan. I like science and being outdoors. Thanks for your time." },
      { role: "pro", text: "Hi Jordan! Great combo. What would you like to know?" },
      { role: "student", text: "What does an environmental engineer actually do?" },
      { role: "pro", text: "We design solutions to environmental problems — for me, that's mostly keeping water clean." },
      { role: "student", text: "What classes helped you most?" },
      { role: "pro", text: "Chemistry and math, honestly. But writing mattered too — we write lots of reports." },
      { role: "student", text: "You said you go to field sites — what's that like?" },
      { role: "pro", text: "Muddy! We collect samples and check equipment. It's my favorite part." },
      { role: "student", text: "Thank you so much, this was really helpful." },
      { role: "pro", text: "You're welcome, Jordan!" },
    ],
  },
];

export const getProfessional = (id: string | null) =>
  professionals.find((p) => p.id === id) ?? professionals[0]!;
