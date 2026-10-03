import { useEffect, useRef, useState } from "react";

/** Counts whole seconds while `running` is true; pauses (without resetting) otherwise. */
export function useElapsedSeconds(running: boolean): number {
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const carried = useRef(0);

  useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now();
    const tick = () =>
      setElapsed(
        carried.current + Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000),
      );
    const timer = setInterval(tick, 250);
    return () => {
      clearInterval(timer);
      carried.current += Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000);
    };
  }, [running]);

  return elapsed;
}
