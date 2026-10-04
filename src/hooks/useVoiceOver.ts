import { useCallback, useEffect, useRef, useState } from "react";
import { useIntegrationStatus } from "./useIntegrationStatus";
import { useJourney } from "@/journey/JourneyProvider";

/** Whether speech features are available, and the student's voice-over preference. */
export function useSpeechSettings() {
  const { speech } = useIntegrationStatus();
  const { state, update } = useJourney();
  return {
    available: speech,
    voiceOver: speech && state.voiceOver,
    setVoiceOver: (voiceOver: boolean) => update({ voiceOver }),
  };
}

/** Plays ElevenLabs voice-overs one at a time; `playingKey` identifies what's playing. */
export function useVoiceOver() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const request = useRef<AbortController | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    request.current?.abort();
    request.current = null;
    if (audio.current) {
      audio.current.pause();
      if (audio.current.src) URL.revokeObjectURL(audio.current.src);
      audio.current.removeAttribute("src");
    }
    setPlayingKey(null);
  }, []);

  const speak = useCallback(
    async (key: string, text: string, speaker: string) => {
      stop();
      const controller = new AbortController();
      request.current = controller;
      setPlayingKey(key);
      setError("");
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speaker }),
          signal: controller.signal,
        });
        if (!response.ok) {
          const { error: message } = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(message ?? "Voice-over isn't available right now.");
        }
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        const player = (audio.current ??= new Audio());
        player.src = URL.createObjectURL(blob);
        player.onended = () => stop();
        await player.play();
      } catch (e) {
        if (controller.signal.aborted) return;
        setPlayingKey(null);
        setError(e instanceof Error ? e.message : "Voice-over failed.");
      }
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, playingKey, error };
}
