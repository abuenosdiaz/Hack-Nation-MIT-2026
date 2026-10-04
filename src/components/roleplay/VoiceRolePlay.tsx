import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorNote, Notice } from "@/components/common";
import { startVoiceRolePlay } from "@/api/roleplay.functions";
import { initialsOf } from "@/config/professionals";
import { ROLEPLAY_TIMING } from "@/config/roleplay";
import type { TranscriptTurn } from "@/domain/types";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { CallTimer } from "./CallTimer";
import type { RolePlayModeProps } from "./types";

const WRAP_UP_UPDATE =
  "Time is almost up. Within your next reply, start wrapping up the conversation warmly and thank the student. Stay in character.";

type Phase = "ready" | "connecting" | "live";

export default function VoiceRolePlay(props: RolePlayModeProps) {
  return (
    <ConversationProvider>
      <VoiceSession {...props} />
    </ConversationProvider>
  );
}

function VoiceSession({ professional, careerAreaId, onComplete }: RolePlayModeProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const transcriptRef = useRef<TranscriptTurn[]>([]);
  const wrapUpSent = useRef(false);
  const startSessionFn = useServerFn(startVoiceRolePlay);

  const seconds = useElapsedSeconds(phase === "live");
  const secondsRef = useRef(0);
  secondsRef.current = seconds;

  const finish = useCallback(() => {
    const turns = transcriptRef.current;
    if (turns.some((t) => t.speaker === "student")) {
      onComplete({ transcript: turns, seconds: secondsRef.current });
      return;
    }
    setPhase("ready");
    setError("The call ended before we heard from you. Check your microphone and try again.");
  }, [onComplete]);

  const conversation = useConversation({
    onConnect: () => setPhase("live"),
    onDisconnect: finish,
    onError: (message) => setError(message || "The voice connection had a problem."),
    onMessage: ({ message, role }) => {
      if (!message.trim()) return;
      const turn: TranscriptTurn = { speaker: role === "user" ? "student" : "pro", text: message };
      transcriptRef.current = [...transcriptRef.current, turn];
      setTranscript(transcriptRef.current);
    },
  });
  const { endSession, sendContextualUpdate } = conversation;

  useEffect(() => {
    if (phase !== "live") return;
    if (seconds >= ROLEPLAY_TIMING.maxSeconds) endSession();
    else if (seconds >= ROLEPLAY_TIMING.wrapUpSeconds && !wrapUpSent.current) {
      wrapUpSent.current = true;
      sendContextualUpdate(WRAP_UP_UPDATE);
    }
  }, [phase, seconds, endSession, sendContextualUpdate]);

  const start = async () => {
    setError("");
    setPhase("connecting");
    transcriptRef.current = [];
    setTranscript([]);
    wrapUpSent.current = false;
    try {
      const permission = await navigator.mediaDevices.getUserMedia({ audio: true });
      permission.getTracks().forEach((track) => track.stop());
      const { credential, persona } = await startSessionFn({
        data: { professionalId: professional.id, careerAreaId },
      });
      conversation.startSession({
        ...credential,
        overrides: {
          agent: { prompt: { prompt: persona.prompt }, firstMessage: persona.firstMessage },
          tts: { voiceId: persona.voiceId },
        },
      });
    } catch (e) {
      setPhase("ready");
      const denied = e instanceof DOMException && e.name === "NotAllowedError";
      setError(
        denied
          ? "Microphone access is blocked. Allow it in your browser and try again."
          : (e as Error).message,
      );
    }
  };

  return (
    <div className="call-panel fade-up">
      <div className={`call-orb ${conversation.isSpeaking ? "is-speaking" : ""}`} aria-hidden>
        {initialsOf(professional.name)}
      </div>
      <p className="call-status" role="status">
        {phase === "ready" && `Ready when you are. ${professional.name} will greet you first.`}
        {phase === "connecting" && "Connecting…"}
        {phase === "live" &&
          (conversation.isSpeaking
            ? `${professional.name} is speaking…`
            : "Listening — your turn.")}
      </p>

      {phase === "live" && <CallTimer seconds={seconds} />}

      <div className="call-actions">
        {phase === "live" ? (
          <Button size="lg" variant="outline" onClick={endSession}>
            <PhoneOff size={16} /> End conversation
          </Button>
        ) : (
          <Button size="lg" onClick={start} disabled={phase === "connecting"}>
            <Mic size={16} /> {phase === "connecting" ? "Connecting…" : "Start voice conversation"}
          </Button>
        )}
      </div>
      <ErrorNote message={error} />

      {transcript.length > 0 && (
        <details className="call-transcript">
          <summary>Live transcript</summary>
          <ul>
            {transcript.map((turn, i) => (
              <li key={i}>
                <strong>{turn.speaker === "student" ? "You" : professional.name}:</strong>{" "}
                {turn.text}
              </li>
            ))}
          </ul>
        </details>
      )}
      <Notice>
        Voice powered by ElevenLabs. {professional.name} is a fictional AI character. The call ends
        automatically after {ROLEPLAY_TIMING.maxSeconds / 60} minutes.
      </Notice>
    </div>
  );
}
