import { useEffect, useRef, useState } from "react";
import { CommitStrategy, useScribe } from "@elevenlabs/react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSpeechToTextToken } from "@/api/speech.functions";
import { STT_MODEL_ID } from "@/config/voices";

const FINAL_TRANSCRIPT_TIMEOUT_MS = 3000;

export type MicButtonProps = {
  disabled?: boolean;
  /** Live transcript while the student is speaking. */
  onDraft: (text: string) => void;
  /** Final transcript once the student stops. */
  onFinal: (text: string) => void;
  onListeningChange: (listening: boolean) => void;
  onError: (message: string) => void;
};

type Phase = "idle" | "connecting" | "listening" | "finishing";

/** Push-to-talk speech input using ElevenLabs Scribe real-time transcription. */
export default function MicButton({
  disabled,
  onDraft,
  onFinal,
  onListeningChange,
  onError,
}: MicButtonProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;
  const getToken = useServerFn(getSpeechToTextToken);
  const latestPartial = useRef("");
  const resolveFinal = useRef<((text: string) => void) | null>(null);

  const scribe = useScribe({
    modelId: STT_MODEL_ID,
    commitStrategy: CommitStrategy.MANUAL,
    onPartialTranscript: ({ text }) => {
      latestPartial.current = text;
      onDraft(text);
    },
    onCommittedTranscript: ({ text }) => resolveFinal.current?.(text),
    onAuthError: () =>
      onError("ElevenLabs rejected the speech-to-text request. Check the API key."),
    onQuotaExceededError: () => onError("The ElevenLabs API key has run out of credits."),
    onError: () => {
      if (phaseRef.current !== "idle")
        onError("The microphone connection had a problem. Try again or type instead.");
    },
  });

  useEffect(() => onListeningChange(phase === "listening" || phase === "connecting"), [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setPhase("connecting");
    latestPartial.current = "";
    onDraft("");
    try {
      const { token } = await getToken();
      await scribe.connect({
        token,
        microphone: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      setPhase("listening");
    } catch (e) {
      setPhase("idle");
      const denied = e instanceof DOMException && e.name === "NotAllowedError";
      onError(
        denied
          ? "Microphone access is blocked. Allow it in your browser, or type instead."
          : (e as Error).message,
      );
    }
  };

  const stop = async () => {
    setPhase("finishing");
    const finalText = await new Promise<string>((resolve) => {
      const timer = setTimeout(() => resolve(latestPartial.current), FINAL_TRANSCRIPT_TIMEOUT_MS);
      resolveFinal.current = (text) => {
        clearTimeout(timer);
        resolve(text || latestPartial.current);
      };
      scribe.commit();
    });
    resolveFinal.current = null;
    scribe.disconnect();
    scribe.clearTranscripts();
    setPhase("idle");
    onFinal(finalText.trim());
  };

  const listening = phase === "listening";
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={listening ? "default" : "ghost"}
      className={listening ? "mic-live" : undefined}
      aria-label={listening ? "Stop and send" : "Speak your answer"}
      title={listening ? "Stop and send" : "Speak your answer"}
      aria-pressed={listening}
      disabled={disabled || phase === "connecting" || phase === "finishing"}
      onClick={listening ? stop : start}
    >
      {listening ? <Square /> : <Mic />}
    </Button>
  );
}
