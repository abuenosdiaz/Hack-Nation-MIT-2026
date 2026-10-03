import { useCallback, useState } from "react";

/** Tracks pending/error state for a user-triggered async action. */
export function useAsyncAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const run = useCallback(async (action: () => Promise<void>) => {
    setPending(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }, []);

  return { pending, error, run, clearError: () => setError("") };
}
