import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";
import { ErrorNote, Notice } from "@/components/common";
import { replyAsProfessional } from "@/api/roleplay.functions";
import type { ChatMessage, TranscriptTurn } from "@/domain/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { CallTimer } from "./CallTimer";
import type { RolePlayModeProps } from "./types";

/** Fallback when ElevenLabs isn't configured: the same conversation, typed instead of spoken. */
export function TextRolePlay({
  professional,
  careerAreaId,
  onComplete,
  live,
}: RolePlayModeProps & { live: boolean }) {
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([
    { speaker: "pro", text: professional.firstMessage },
  ]);
  const { pending, error, run } = useAsyncAction();
  const reply = useServerFn(replyAsProfessional);
  const seconds = useElapsedSeconds(true);
  const studentTurns = transcript.filter((t) => t.speaker === "student").length;

  const send = (text: string) =>
    run(async () => {
      const next: TranscriptTurn[] = [...transcript, { speaker: "student", text }];
      setTranscript(next);
      const answer = live
        ? (
            await reply({
              data: { transcript: next, professionalId: professional.id, careerAreaId },
            })
          ).text
        : (professional.fallbackReplies[
            Math.min(studentTurns, professional.fallbackReplies.length - 1)
          ] ?? "");
      setTranscript([...next, { speaker: "pro", text: answer }]);
    });

  const messages: ChatMessage[] = transcript.map((t) => ({
    role: t.speaker,
    text: t.text,
    sample: !live && t.speaker === "pro",
  }));

  return (
    <div className="fade-up">
      <CallTimer seconds={seconds} />
      <ChatPanel
        title={professional.name}
        caption={`${professional.role} · fictional practice conversation`}
        proName={professional.name}
        messages={messages}
        onSend={send}
        waiting={pending}
        placeholder="Introduce yourself or ask a question…"
      />
      <ErrorNote message={error} />
      <div className="panel-actions">
        <p className="quiet">Voice isn't configured, so this conversation is typed.</p>
        <Button
          variant="outline"
          onClick={() => onComplete({ transcript, seconds })}
          disabled={studentTurns === 0 || pending}
        >
          <PhoneOff size={16} /> End conversation
        </Button>
      </div>
      <Notice>
        {live ? "AI plays a fictional professional." : "Sample mode: replies are prewritten."}
      </Notice>
    </div>
  );
}
