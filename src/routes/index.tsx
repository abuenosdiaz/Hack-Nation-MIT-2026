import { createFileRoute } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import { ArrowRight, Check, LockKeyhole, Menu, Play, RotateCcw, X } from "lucide-react";
import { getIntegrationStatus } from "@/api/status.functions";
import { ContentSpace, MessagesSpace } from "@/components/ExploreSpaces";
import { Button } from "@/components/ui/button";
import { LessonStep } from "@/components/steps/LessonStep";
import { OnboardingStep } from "@/components/steps/OnboardingStep";
import { PrepareStep } from "@/components/steps/PrepareStep";
import { ReflectStep } from "@/components/steps/ReflectStep";
import { RolePlayStep } from "@/components/steps/RolePlayStep";
import { WelcomeStep } from "@/components/steps/WelcomeStep";
import { appName, stages } from "@/config/content";
import { JourneyProvider, useJourney } from "@/journey/JourneyProvider";
import { canVisit, STEPS, type StepId, type View } from "@/journey/state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sariel — Practice your first career conversation" },
      {
        name: "description",
        content:
          "Share your interests, learn how networking works, and practice a voice conversation with a fictional professional.",
      },
      { property: "og:title", content: "Sariel — Practice your first career conversation" },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: () => getIntegrationStatus(),
  staleTime: Infinity,
  component: () => (
    <JourneyProvider>
      <App />
    </JourneyProvider>
  ),
});

const STEP_COMPONENTS: Record<StepId, ComponentType> = {
  welcome: WelcomeStep,
  onboarding: OnboardingStep,
  lesson: LessonStep,
  prepare: PrepareStep,
  roleplay: RolePlayStep,
  reflect: ReflectStep,
};

/** Navigable steps, paired with their sidebar labels (welcome isn't listed). */
const NAV_STEPS = STEPS.slice(1).map((id, i) => ({ id, label: stages[i] ?? id }));

/** Side spaces that sit beside the journey without changing its progress. */
const SPACES: {
  view: Exclude<View, "journey">;
  label: string;
  icon: ComponentType<{ size?: number }>;
  screen: ComponentType;
}[] = [
  { view: "content", label: "Content", icon: Play, screen: ContentSpace },
  { view: "messages", label: "Messages", icon: LockKeyhole, screen: MessagesSpace },
];

function App() {
  const { state, goTo, showView, reset, loadPresenterSample, toggleAdminMode } = useJourney();
  const [menuOpen, setMenuOpen] = useState(false);
  const space = SPACES.find((s) => s.view === state.view);
  const Screen = space?.screen ?? STEP_COMPONENTS[state.step];
  const currentIndex = STEPS.indexOf(state.step);
  const currentLabel = space?.label ?? NAV_STEPS.find((s) => s.id === state.step)?.label ?? "Start";

  const navigate = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  return (
    <div className="app-layout">
      <aside className={`navigation ${menuOpen ? "nav-open" : ""}`}>
        <div className="nav-top">
          <Button
            variant="ghost"
            className="brand"
            onClick={() => navigate(() => goTo("welcome"))}
            aria-label="Sariel home"
          >
            <span className="brand-symbol" aria-hidden>
              S<span>.</span>
            </span>
            <span>{appName}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="nav-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="nav-middle">
          <p className="nav-caption">YOUR PATH</p>
          <nav aria-label="Learning steps">
            <ol>
              {NAV_STEPS.map(({ id, label }, i) => {
                const active = !space && state.step === id;
                const completed = STEPS.indexOf(id) < currentIndex;
                return (
                  <li key={id}>
                    <Button
                      variant="ghost"
                      className={`nav-item ${active ? "nav-active" : ""}`}
                      disabled={!canVisit(state, id)}
                      aria-current={active ? "step" : undefined}
                      onClick={() => navigate(() => goTo(id))}
                    >
                      <span className="nav-number">
                        {completed ? <Check size={15} /> : `0${i + 1}`}
                      </span>
                      <span>{label}</span>
                      {active && <span className="nav-active-mark" />}
                    </Button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="nav-extras">
            <p className="nav-caption">YOUR SPACE</p>
            <nav aria-label="Content and messages">
              {SPACES.map(({ view, label, icon: Icon }) => {
                const active = state.view === view;
                return (
                  <Button
                    key={view}
                    variant="ghost"
                    className={`nav-item ${active ? "nav-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => navigate(() => showView(view))}
                  >
                    <span className="nav-number">
                      <Icon size={18} />
                    </span>
                    <span>{label}</span>
                    {active && <span className="nav-active-mark" />}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="nav-bottom">
          <div className="nav-divider" />
          <details className="demo-details">
            <summary>Presenter tools</summary>
            <div>
              <Button variant="ghost" onClick={() => navigate(toggleAdminMode)}>
                {state.adminMode
                  ? "Turn off admin mode"
                  : "Admin mode: unlock every step (live AI stays on)"}
              </Button>
              <Button variant="ghost" onClick={() => navigate(loadPresenterSample)}>
                Jump to reflection with a sample conversation
              </Button>
            </div>
          </details>
          <Button variant="ghost" className="restart" onClick={() => navigate(reset)}>
            <RotateCcw size={15} /> Start over
          </Button>
        </div>
      </aside>
      {menuOpen && (
        <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-hidden />
      )}
      <div className="workspace">
        <header className="workspace-header">
          <div className="mobile-header">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu />
            </Button>
            <strong>{appName}</strong>
          </div>
          <span className="current-location">{currentLabel}</span>
          <span className="session-badge">
            <span />{" "}
            {state.adminMode
              ? "Admin session"
              : state.sampleMode
                ? "Sample session"
                : "Your session"}
          </span>
        </header>
        <main className="workspace-main">
          <Screen />
        </main>
        <footer className="workspace-footer">
          <span>{appName}</span>
          <span>
            Explore at your own pace <ArrowRight size={13} />
          </span>
        </footer>
      </div>
    </div>
  );
}
