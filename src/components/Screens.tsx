import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, MessageCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "./ChatPanel";
import { useJourney, buildProfile, type Msg } from "@/lib/journey";
import { onboardingQuestions, sampleOnboardingAnswers, lessonCards, sampleFeedback, coachDemoReply, coachHints } from "@/config/content";
import { professionals, getProfessional } from "@/config/professionals";
import { checkQuestion } from "@/lib/question-check";
import { coachOnboarding, makeProfile, askLessonCoach, gradeQuestion, talkToProfessional, askPracticeCoach, getIntegrationStatus } from "@/lib/integrations.functions";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

const Notice = ({ children }: { children: React.ReactNode }) => <p className="notice" role="note">{children}</p>;
const Label = ({ children }: { children: React.ReactNode }) => <span className="section-label">{children}</span>;
const ErrorNote = ({ text }: { text: string }) => text ? <p className="error-note" role="alert">{text}</p> : null;
const Next = ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => <Button size="lg" onClick={onClick} disabled={disabled}>{children}<ArrowRight size={16} /></Button>;

export function Welcome() {
  const { set } = useJourney();
  return <div className="welcome-view fade-up">
    <Label>A good place to begin</Label>
    <h1>You don't need your future figured out to start exploring.</h1>
    <p className="lead">Let's start with a conversation about you. From there, you'll learn how to ask thoughtful questions and try a career conversation for yourself.</p>
    <Next onClick={() => set({ step: 1 })}>Let's get started</Next>
    <p className="quiet mt-5">No login needed · Go at your own pace</p>
  </div>;
}

export function Onboarding() {
  const { s, set } = useJourney();
  const ask = useServerFn(coachOnboarding);
  const createProfile = useServerFn(makeProfile);
  const { data } = useQuery({ queryKey: ["integration-status"], queryFn: useServerFn(getIntegrationStatus) });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const answers = s.onboarding.filter(m => m.role === "student").map(m => m.text);
  const done = answers.length >= onboardingQuestions.length;
  useEffect(() => { if (s.onboarding.length === 0) set({ onboarding: [{ role: "coach", text: onboardingQuestions[0] ?? "Tell me about yourself." }] }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function answer(text: string) {
    const next: Msg[] = [...s.onboarding, { role: "student", text }];
    const count = next.filter(m => m.role === "student").length;
    set({ onboarding: next }); setPending(true); setError("");
    try {
      if (count < onboardingQuestions.length) {
        const response = data?.llm ? (await ask({ data: { messages: next, question: onboardingQuestions[count] ?? "What else would you like to share?" } })).text : onboardingQuestions[count] ?? "";
        set({ onboarding: [...next, { role: "coach", text: response, sample: !data?.llm }] });
      } else {
        const result = data?.llm ? await createProfile({ data: { answers: next.filter(m => m.role === "student").map(m => m.text) } }) : buildProfile(next.filter(m => m.role === "student").map(m => m.text));
        set({ onboarding: [...next, { role: "coach", text: "Thank you for sharing. Here's what I'm hearing — you can change any of it.", sample: !data?.llm }], ...result });
      }
    } catch (e) { setError((e as Error).message); set({ onboarding: s.onboarding }); }
    finally { setPending(false); }
  }
  function sample() {
    const next: Msg[] = [];
    sampleOnboardingAnswers.forEach((a, i) => next.push({ role: "coach", text: onboardingQuestions[i] ?? "", sample: true }, { role: "student", text: a, sample: true }));
    next.push({ role: "coach", text: "Thanks for sharing. Here's what I'm hearing.", sample: true });
    set({ onboarding: next, ...buildProfile(sampleOnboardingAnswers), demo: true }); setError("");
  }
  return <div className="focused-view fade-up"><Label>01 / Get to know you</Label><h1>A conversation about you.</h1><p className="lead">Start anywhere. What you share helps Sariel make the next steps feel more like yours.</p>
    {!done ? <div className="focus-body"><ChatPanel title="Sariel" messages={s.onboarding} onSend={answer} waiting={pending} placeholder="Tell me what comes to mind…" footer={<div className="under-chat"><Button variant="link" size="sm" onClick={sample} disabled={pending}>Use a sample conversation instead</Button></div>} /><ErrorNote text={error} /><Notice>{data?.llm && !s.demo ? "Sariel is using AI for this conversation. Voice isn't connected yet." : "Sample mode: scripted questions, no live AI or voice. Use the sample path to see the full journey."}</Notice></div> : s.profile ? <div className="focus-body"><div className="single-panel fade-up">
      <Label>Your starting point</Label><h2>Here's what I'm hearing. Does this sound like you?</h2>
      {editing ? <div className="field-stack">{(["interests", "experiences", "confidence"] as const).map(k => <label key={k} className="field-label">{k}<textarea className="field-input" rows={2} value={s.profile?.[k] ?? ""} onChange={e => { if (s.profile) set({ profile: { ...s.profile, [k]: e.target.value } }); }} /></label>)}</div> : <dl className="profile-list"><div><dt>Interests</dt><dd>{s.profile.interests}</dd></div><div><dt>Experience</dt><dd>{s.profile.experiences}</dd></div><div><dt>Conversation confidence</dt><dd>{s.profile.confidence}</dd></div></dl>}
      <div className="direction-line"><span>A few things you could explore — none is a label or decision</span><ul>{s.profile.directions?.map((direction, i) => <li key={i}>{direction}</li>)}</ul></div>
      <div className="panel-actions"><Button variant="ghost" onClick={() => setEditing(!editing)}>{editing ? "Done editing" : "Edit my profile"}</Button><p className="quiet">When you're ready, choose Learn in the navigation.</p></div>
    </div><Notice>{s.demo || !data?.llm ? "Sample reflection, not an assessment or a career match." : "These ideas reflect your conversation, not a career match."}</Notice></div> : null}
  </div>;
}

export function Learn() {
  const { s, set } = useJourney();
  const ask = useServerFn(askLessonCoach);
  const { data } = useQuery({ queryKey: ["integration-status"], queryFn: useServerFn(getIntegrationStatus) });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const i = Math.min(s.lessonIndex, lessonCards.length - 1);
  const card = lessonCards[i];
   const area = s.profile?.directions?.[0] ?? "what interests you";
  if (!card) return null;
  async function sendCoach(text: string) {
    const next: Msg[] = [...s.lessonChat, { role: "student", text }]; set({ lessonChat: next }); setPending(true); setError("");
    try { const reply = data?.llm && !s.demo ? (await ask({ data: { messages: next, area, index: i } })).text : coachDemoReply; set({ lessonChat: [...next, { role: "coach", text: reply, sample: !data?.llm || s.demo }] }); }
    catch (e) { setError((e as Error).message); } finally { setPending(false); }
  }
  return <div className="focused-view fade-up"><Label>02 / Learn</Label><h1>Your first career conversation.</h1><p className="lead">Read at your pace. Nothing here needs to be spoken aloud.</p><div className="focus-body">
    {s.lessonMode === "reading" && <article className="lesson-sheet fade-up" key={i}>
      <div className="lesson-top"><Label>Lesson {i + 1} of {lessonCards.length}</Label><span>{Math.round((i + 1) / lessonCards.length * 100)}%</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${(i + 1) / lessonCards.length * 100}%` }} /></div>
      <h2>{card.title}</h2><p className="lesson-copy">{card.body}</p>
      {card.examples?.(area).map(e => <blockquote className="example-quote" key={e}>{e}</blockquote>)}
      {card.tip && <p className="lesson-tip">{card.tip}</p>}
       <div className="sheet-actions"><Button variant="ghost" onClick={() => { if (i > 0) set({ lessonIndex: i - 1 }); else set({ step: 1 }); }}><ArrowLeft size={16} /> Back</Button><Button variant="outline" onClick={() => set({ lessonMode: "coach" })}><MessageCircle size={16} /> Ask Sariel</Button><Next onClick={() => card.questionPractice && !s.questionFeedback ? set({ lessonMode: "assignment" }) : i === lessonCards.length - 1 ? set({ lessonMode: "ready", lessonComplete: true }) : set({ lessonIndex: i + 1 })}>{card.questionPractice && !s.questionFeedback ? "Try a question" : i === lessonCards.length - 1 ? "Finish lesson" : "Next"}</Next></div>
    </article>}
    {s.lessonMode === "coach" && <div className="fade-up"><Button variant="ghost" className="mb-4" onClick={() => set({ lessonMode: "reading" })}><ArrowLeft size={16} /> Back to lesson</Button><ChatPanel title="Ask Sariel" messages={s.lessonChat} onSend={sendCoach} waiting={pending} placeholder="What's on your mind about this lesson?" /><ErrorNote text={error} /><Notice>{data?.llm && !s.demo ? "Sariel answers with AI. Text mode only." : "Sample coach reply; live AI is not active in this sample."}</Notice></div>}
    {s.lessonMode === "assignment" && <QuestionAssignment onContinue={() => set({ lessonMode: "reading", lessonIndex: Math.min(4, i + 1) })} />}
    {s.lessonMode === "ready" && <div className="single-panel fade-up"><Label>Lesson complete</Label><h2>Ready to try a conversation?</h2><p className="lesson-copy">You have a starting point and a question to ask. Your next step is a temporary, fictional practice scenario. Take your time — you can always ask Sariel for help.</p><div className="panel-actions"><Button variant="ghost" onClick={() => set({ lessonMode: "reading", lessonIndex: 4 })}><ArrowLeft size={16} /> Review lesson</Button><Next onClick={() => set({ step: 3, practicePhase: "intro" })}>Meet your practice professional</Next></div></div>}
  </div></div>;
}

function QuestionAssignment({ onContinue }: { onContinue: () => void }) {
  const { s, set } = useJourney();
  const grade = useServerFn(gradeQuestion);
  const { data } = useQuery({ queryKey: ["integration-status"], queryFn: useServerFn(getIntegrationStatus) });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function feedback() {
    setPending(true); setError("");
    try { const result = data?.llm && !s.demo ? await grade({ data: { question: s.questionDraft.trim(), area: "exploring someone's work and path", role: "professional" } }) : checkQuestion(s.questionDraft, "professional", "their work"); set({ questionFeedback: result }); }
    catch (e) { setError((e as Error).message); } finally { setPending(false); }
  }
   return <div className="single-panel fade-up"><Label>First assignment</Label><h2>Ask a question worth answering.</h2><p className="lesson-copy">Imagine you're meeting someone whose work you're curious about. What open-ended question would help you understand their work or path?</p>
    <label className="field-label" htmlFor="question-draft">Your question</label><textarea id="question-draft" className="field-input question-input" rows={3} placeholder="What would you want to know?" value={s.questionDraft} onChange={e => set({ questionDraft: e.target.value, questionFeedback: null })} />
    <div className="panel-actions"><Button variant="ghost" onClick={() => set({ lessonMode: "reading" })}><ArrowLeft size={16} /> Back to lesson</Button><Button onClick={feedback} disabled={!s.questionDraft.trim() || pending}>{pending ? "Considering your question…" : "Get feedback"}</Button></div><ErrorNote text={error} />
    {s.questionFeedback && <div className="feedback-space" role="status"><div className="feedback-item"><span>What works</span><p>{s.questionFeedback.works}</p></div><div className="feedback-item"><span>One improvement</span><p>{s.questionFeedback.improve}</p></div><div className="feedback-item"><span>A possible revision</span><p>“{s.questionFeedback.revision}”</p><small>{s.questionFeedback.why}</small></div><div className="panel-actions"><Button variant="outline" onClick={() => set({ questionDraft: s.questionFeedback?.revision ?? s.questionDraft, questionFeedback: null })}><RotateCcw size={16} /> Revise and try again</Button><Next onClick={onContinue}>Continue lesson</Next></div></div>}
    <Notice>{data?.llm && !s.demo ? "Feedback is generated by AI from your question and the lesson criteria." : "Sample feedback uses editable rules; live AI isn't active in this sample."} Voice isn't connected yet.</Notice>
  </div>;
}

export function Practice() {
  const { s, set } = useJourney(); const p = getProfessional(s.professionalId);
  const talk = useServerFn(talkToProfessional); const ask = useServerFn(askPracticeCoach);
  const { data } = useQuery({ queryKey: ["integration-status"], queryFn: useServerFn(getIntegrationStatus) });
  const [pending, setPending] = useState(false); const [error, setError] = useState("");
  const live = !!data?.llm && !s.demo;
  async function send(text: string) {
    const next: Msg[] = [...s.practice, { role: "student", text }]; set({ practice: next }); setPending(true); setError("");
     try { const count = next.filter(m => m.role === "student").length - 1; const reply = live ? (await talk({ data: { messages: next, professionalId: p.id, area: s.profile?.directions?.join(", ") ?? "exploring possibilities" } })).text : p.replies[Math.min(count, p.replies.length - 1)] ?? p.replies[0] ?? ""; set({ practice: [...next, { role: "pro", text: reply, sample: !live }] }); }
    catch (e) { setError((e as Error).message); } finally { setPending(false); }
  }
  async function sendCoach(text: string) {
    const next: Msg[] = [...s.practiceCoach, { role: "student", text }]; set({ practiceCoach: next }); setPending(true); setError("");
    try { const reply = live ? (await ask({ data: { messages: next, context: s.practice } })).text : coachHints[(next.filter(m=>m.role === "student").length - 1) % coachHints.length] ?? coachDemoReply; set({ practiceCoach: [...next, { role: "coach", text: reply, sample: !live }] }); }
    catch (e) { setError((e as Error).message); } finally { setPending(false); }
  }
  return <div className="focused-view fade-up"><Label>03 / Practice conversation</Label><h1>{s.practicePhase === "intro" ? "Meet your practice professional." : s.coachMode ? "Take a moment with Sariel." : `A conversation with ${p.name}.`}</h1><p className="lead">{s.practicePhase === "intro" ? "This is a temporary, fictional scenario. There's no pressure to get it perfect." : s.coachMode ? "Your conversation is paused. Ask what you need, then pick up where you left off." : "Begin when you're ready. One turn at a time."}</p><div className="focus-body">
     {s.practicePhase === "intro" ? <div className="single-panel fade-up"><Label>Fictional professional</Label><div className="person-heading"><span className="person-monogram">{p.name.split(" ").map(x=>x[0]).join("")}</span><div><h2>{p.name}</h2><p>{p.role}</p></div></div><dl className="profile-list"><div><dt>How they got here</dt><dd>{p.careerPath}</dd></div><div><dt>What they do</dt><dd>{p.typicalWork}</dd></div></dl><p className="quiet mt-5">{p.details[0]}</p><label className="field-label" htmlFor="practice-person">Choose who you'd like to practice with</label><select id="practice-person" className="field-input" value={p.id} onChange={e => set({ professionalId: e.target.value, practice: [], practiceCoach: [] })}>{professionals.map(person => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select><p className="quiet mt-5">This is one conversation to try, not a recommendation for your future.</p><div className="panel-actions"><Button variant="ghost" onClick={() => set({ step: 2, lessonMode: "ready" })}><ArrowLeft size={16} /> Back</Button><Next onClick={() => set({ practicePhase: "conversation" })}>Start conversation</Next></div></div> : s.coachMode ? <div className="fade-up"><ChatPanel title="Sariel" messages={s.practiceCoach.length ? s.practiceCoach : [{ role: "coach", text: "The conversation is paused. What's on your mind?" }]} onSend={sendCoach} waiting={pending} placeholder="What are you unsure about?" /><ErrorNote text={error} /><div className="panel-actions"><Button variant="outline" onClick={() => set({ coachMode: false })}>Resume conversation <ArrowRight size={16} /></Button></div></div> : <div className="fade-up"><div className="conversation-context"><span className="person-monogram small">{p.name.split(" ").map(x=>x[0]).join("")}</span><span><strong>{p.name}</strong> · {p.role} <small>Fictional practice scenario</small></span></div><ChatPanel title={p.name} speaker={p.name} messages={s.practice} onSend={send} waiting={pending} placeholder="Introduce yourself or ask a question…" /><ErrorNote text={error} /><div className="panel-actions"><Button variant="outline" onClick={() => set({ coachMode: true, practiceCoach: s.practiceCoach.length ? s.practiceCoach : [{ role: "coach", text: "The conversation is paused. What's on your mind?" }] })}><MessageCircle size={16} /> I'm unsure — ask Sariel</Button><Button variant="ghost" onClick={() => set({ step: 4 })}>End conversation <ArrowRight size={16} /></Button></div><Notice>{live ? "AI plays a fictional professional. Voice isn't connected yet." : "Sample replies are prewritten. Voice isn't connected yet."}</Notice></div>}
  </div></div>;
}

export function Reflect() {
   const { s, set } = useJourney(); const [open, setOpen] = useState(false);
   return <div className="focused-view fade-up"><Label>04 / Reflect</Label><h1>Every conversation is practice.</h1><p className="lead">Take one thing you learned and one thing you might try differently next time.</p><div className="focus-body"><div className="single-panel fade-up"><Label>Reflection</Label><h2>What will you take with you?</h2><label className="field-label" htmlFor="reflection">Your thoughts</label><textarea id="reflection" rows={4} className="field-input question-input" placeholder="Something I learned…" value={s.reflection} onChange={e => set({ reflection: e.target.value })} />
    <Button variant="outline" className="mt-5" onClick={() => setOpen(!open)}>See sample coaching notes <ChevronDown size={16} /></Button>{open && <div className="feedback-space">{sampleFeedback.map(f => <div className="feedback-item" key={f.label}><span>{f.label}</span><p>{f.text}</p></div>)}<Notice>These are sample notes, not an assessment of your conversation.</Notice></div>}
     <div className="panel-actions"><Button variant="outline" onClick={() => set({ step: 3, practicePhase: "conversation", practice: [], practiceCoach: [], coachMode: false })}><RotateCcw size={16} /> Practice again</Button><Button onClick={() => set({ step: 1, onboarding: [], profile: null, practice: [], practiceCoach: [], questionDraft: "", questionFeedback: null, lessonIndex: 0, lessonMode: "reading", lessonComplete: false, reflection: "" })}><Check size={16} /> Explore another direction</Button></div>
  </div></div></div>;
}
