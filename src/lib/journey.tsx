import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { professionals, getProfessional } from "@/config/professionals";
import { onboardingQuestions, sampleOnboardingAnswers, sampleDraftQuestion } from "@/config/content";

export type Role = "coach" | "student" | "pro";
export type Msg = { role: Role; text: string; sample?: boolean };
export type Profile = { interests: string; experiences: string; confidence: string; directions: string[] };
export type QuestionFeedback = { works: string; improve: string; revision: string; why: string };

export type JourneyState = {
  step: number; // 0 welcome, 1 onboarding, 2 learn, 3 practice, 4 reflect
  demo: boolean;
  onboarding: Msg[];
  profile: Profile | null;
  professionalId: string | null;
  lessonIndex: number;
  lessonChat: Msg[];
  questionDraft: string;
  questionFeedback: QuestionFeedback | null;
  lessonMode: "reading" | "coach" | "assignment" | "ready";
  lessonComplete: boolean;
  practicePhase: "intro" | "conversation";
  practice: Msg[];
  coachMode: boolean;
  practiceCoach: Msg[];
  reflectChat: Msg[];
  reflection: string;
};

const initial: JourneyState = {
  step: 0, demo: false, onboarding: [], profile: null, professionalId: null,
  lessonIndex: 0, lessonChat: [], questionDraft: "", questionFeedback: null,
  lessonMode: "reading", lessonComplete: false, practicePhase: "intro", practice: [], coachMode: false, practiceCoach: [], reflectChat: [], reflection: "",
};

const KEY = "sariel-session-v3";
type Ctx = { s: JourneyState; set: (p: Partial<JourneyState>) => void; reset: () => void; loadDemo: (n: 1 | 2 | 3) => void };
const C = createContext<Ctx | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<JourneyState>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as JourneyState & { profile?: Profile & { careerArea?: string } };
        setS({ ...initial, ...saved, profile: saved.profile ? {
          interests: saved.profile.interests,
          experiences: saved.profile.experiences,
          confidence: saved.profile.confidence,
          directions: Array.isArray(saved.profile.directions) ? saved.profile.directions : ["What you enjoy doing", "The people and problems you care about", "Paths you haven't considered yet"],
        } : null });
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) sessionStorage.setItem(KEY, JSON.stringify(s));
  }, [s, loaded]);
  const set = (p: Partial<JourneyState>) => {
    setS((prev) => ({ ...prev, ...p }));
    if ((p.step !== undefined || p.lessonIndex !== undefined) && typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  const loadDemo = (n: 1 | 2 | 3) => {
    const { profile, professionalId } = buildProfile(sampleOnboardingAnswers);
    const onboarding: Msg[] = [];
    sampleOnboardingAnswers.forEach((a, i) => onboarding.push({ role: "coach", text: onboardingQuestions[i]! }, { role: "student", text: a, sample: true }));
    onboarding.push({ role: "coach", text: "Thanks for sharing all that! Here's what I'm hearing." });
    const base = { ...initial, demo: true, onboarding, profile, professionalId };
    if (n === 1) setS({ ...base, step: 1 });
    if (n === 2) setS({ ...base, step: 2, lessonMode: "assignment", lessonIndex: 3, questionDraft: sampleDraftQuestion });
    if (n === 3) {
      const p = getProfessional(professionalId);
       setS({ ...base, step: 3, lessonComplete: true, practicePhase: "conversation", practice: p.sample.slice(0, 4).map((m) => ({ ...m, sample: true })) });
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  return <C.Provider value={{ s, set, reset: () => setS(initial), loadDemo }}>{children}</C.Provider>;
}

export const useJourney = () => {
  const c = useContext(C);
  if (!c) throw new Error("useJourney outside provider");
  return c;
};

/** Demo-mode profile builder: keyword matching, not AI. */
export function buildProfile(answers: string[]): { profile: Profile; professionalId: string } {
  const all = answers.join(" ").toLowerCase();
    let best = professionals[0]!;
  let bestScore = -1;
  for (const p of professionals) {
    const score = p.keywords.filter((k) => all.includes(k)).length;
    if (score > bestScore) { best = p; bestScore = score; }
  }
  const nervous = /nervous|scared|shy|anxious|not sure|awkward/.test(answers[4]?.toLowerCase() ?? "");
  const interests = answers[0] ?? "";
  const directions = [
    /help|care|volunteer|coach|teach|support/.test(all) ? "Working with and supporting people" : "The kinds of people you enjoy meeting",
    /art|draw|design|game|build|creative|make/.test(all) ? "Making and designing things" : /science|biology|math|nature|outdoor|environment/.test(all) ? "Finding out how things work" : "Activities you might want to try",
    "Unexpected paths that bring your interests together",
  ];
  return {
    professionalId: best.id,
    profile: {
      interests,
      experiences: [answers[1], answers[2]].filter(Boolean).join(" "),
      confidence: nervous ? "Still building confidence — that's normal!" : "Fairly comfortable meeting new people",
      directions,
    },
  };
}
