import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildPresenterSample, initialJourneyState, type JourneyState, type StepId } from "./state";

const STORAGE_KEY = "sariel-journey-v4";

type JourneyContextValue = {
  state: JourneyState;
  update: (patch: Partial<JourneyState>) => void;
  goTo: (step: StepId) => void;
  reset: () => void;
  loadPresenterSample: () => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

function readSaved(): JourneyState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialJourneyState, ...(JSON.parse(raw) as Partial<JourneyState>) } : null;
  } catch {
    return null;
  }
}

const scrollToTop = () => {
  if (typeof window !== "undefined") window.scrollTo({ top: 0 });
};

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JourneyState>(initialJourneyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<JourneyState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const goTo = useCallback((step: StepId) => {
    setState((prev) => ({ ...prev, step }));
    scrollToTop();
  }, []);

  const reset = useCallback(() => {
    setState(initialJourneyState);
    scrollToTop();
  }, []);

  const loadPresenterSample = useCallback(() => {
    setState(buildPresenterSample());
    scrollToTop();
  }, []);

  const value = useMemo(
    () => ({ state, update, goTo, reset, loadPresenterSample }),
    [state, update, goTo, reset, loadPresenterSample],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used inside <JourneyProvider>");
  return ctx;
}
