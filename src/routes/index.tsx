import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Menu, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JourneyProvider, useJourney } from "@/lib/journey";
import { Welcome, Onboarding, Learn, Practice, Reflect } from "@/components/Screens";
import { appName, stages } from "@/config/content";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Sariel — A place to explore your future" },
    { name: "description", content: "Get to know your interests, learn to ask better career questions, and practice a conversation with Sariel." },
    { property: "og:title", content: "Sariel — A place to explore your future" },
    { property: "og:description", content: "A calm space to explore careers through conversation, learning, and practice." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <JourneyProvider><App /></JourneyProvider>,
});

function App() {
  const { s, set, reset, loadDemo } = useJourney();
  const [menu, setMenu] = useState(false);
  const Screen = [Welcome, Onboarding, Learn, Practice, Reflect][s.step] ?? Welcome;
   const canGo = (n: number) => n === 1 || n === 2 && !!s.profile || n === 3 && s.lessonComplete || n === 4 && s.practicePhase === "conversation" && s.practice.length > 0;
  return <div className="app-layout">
    <aside className={`navigation ${menu ? "nav-open" : ""}`}>
      <div className="nav-top"><Button variant="ghost" className="brand" onClick={() => { set({ step: 0 }); setMenu(false); }} aria-label="Sariel home"><span className="brand-symbol" aria-hidden>S<span>.</span></span><span>{appName}</span></Button><Button variant="ghost" size="icon" className="nav-close" aria-label="Close menu" onClick={() => setMenu(false)}><X /></Button></div>
      <div className="nav-middle"><p className="nav-caption">YOUR PATH</p><nav aria-label="Learning stages"><ol>{stages.map((name, i) => { const n = i + 1; const active = s.step === n; const completed = n < s.step; return <li key={name}><Button variant="ghost" className={`nav-item ${active ? "nav-active" : ""}`} disabled={!canGo(n)} aria-current={active ? "step" : undefined} onClick={() => { set({ step: n }); setMenu(false); }}><span className="nav-number">{completed ? <Check size={15} /> : `0${n}`}</span><span>{name}</span>{active && <span className="nav-active-mark" />}</Button></li>; })}</ol></nav></div>
      <div className="nav-bottom"><div className="nav-divider" /><details className="demo-details"><summary>Presenter samples</summary><div>{(["Onboarding", "Question feedback", "Role-play"] as const).map((name, i) => <Button key={name} variant="ghost" onClick={() => { loadDemo((i + 1) as 1 | 2 | 3); setMenu(false); }}>Sample {i + 1} · {name}</Button>)}</div></details><Button variant="ghost" className="restart" onClick={() => { reset(); setMenu(false); }}><RotateCcw size={15} /> Start over</Button></div>
    </aside>
    {menu && <div className="mobile-backdrop" onClick={() => setMenu(false)} aria-hidden />}
    <div className="workspace"><header className="workspace-header"><div className="mobile-header"><Button size="icon" variant="ghost" aria-label="Open menu" onClick={() => setMenu(true)}><Menu /></Button><strong>{appName}</strong></div><span className="current-location">{s.step === 0 ? "Start" : stages[s.step - 1]}</span><span className="session-badge"><span /> {s.demo ? "Sample session" : "Your session"}</span></header>
      <main className="workspace-main"><Screen /></main><footer className="workspace-footer"><span>{appName}</span><span>Explore at your own pace <ArrowRight size={13} /></span></footer></div>
  </div>;
}
