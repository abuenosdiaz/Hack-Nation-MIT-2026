import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowUp, Square, Volume2, VolumeX } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { COACH_SPEAKER } from "@/config/voices";
import type { ChatMessage } from "@/domain/types";
import { useSpeechSettings, useVoiceOver } from "@/hooks/useVoiceOver";

const MicButton = lazy(() => import("@/components/voice/MicButton"));

type ChatPanelProps = {
  title: string;
  caption: string;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  /** Display name for `pro` messages. */
  proName?: string;
  /** Voice-over speaker for `pro` messages (a professional id). */
  proSpeaker?: string;
  placeholder?: string;
  waiting?: boolean;
  disabled?: boolean;
  footer?: ReactNode;
};

const speakerLabel = (message: ChatMessage, proName: string) =>
  message.role === "student" ? "You" : message.role === "pro" ? proName : "Sariel";

export function ChatPanel({
  title,
  caption,
  messages,
  onSend,
  proName = "Professional",
  proSpeaker,
  placeholder = "Write your response…",
  waiting = false,
  disabled = false,
  footer,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const locked = disabled || waiting;
  const speech = useSpeechSettings();
  const voice = useVoiceOver();
  const spokenCount = useRef(messages.length);

  const speakerFor = (message: ChatMessage) =>
    message.role === "pro" ? proSpeaker : message.role === "coach" ? COACH_SPEAKER : undefined;

  useEffect(() => {
    if (!locked && !listening) input.current?.focus();
  }, [locked, listening, messages.length]);

  useEffect(() => {
    const fresh = messages.length > spokenCount.current;
    spokenCount.current = messages.length;
    const last = messages.at(-1);
    const speaker = last && speakerFor(last);
    if (fresh && speech.voiceOver && last && speaker && !last.sample) {
      void voice.speak(String(messages.length - 1), last.text, speaker);
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (value: string) => {
    const text = value.trim();
    if (!text || locked) return;
    onSend(text);
    setDraft("");
  };

  const toggleVoiceOver = () => {
    if (speech.voiceOver) voice.stop();
    speech.setVoiceOver(!speech.voiceOver);
  };

  const status = waiting
    ? "Thinking"
    : listening
      ? "Listening"
      : voice.playingKey
        ? "Speaking"
        : speech.available
          ? "Voice or text"
          : "Text conversation";

  return (
    <section className="chat-surface" aria-label={title}>
      <div className="chat-heading">
        <span className="identity-mark" aria-hidden>
          ✳
        </span>
        <div>
          <strong>{title}</strong>
          <span className="chat-caption">{caption}</span>
        </div>
        <span className="chat-status">{status}</span>
        {speech.available && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-pressed={speech.voiceOver}
            aria-label={speech.voiceOver ? "Turn voice-over off" : "Turn voice-over on"}
            title={speech.voiceOver ? "Voice-over on" : "Voice-over off"}
            onClick={toggleVoiceOver}
          >
            {speech.voiceOver ? <Volume2 /> : <VolumeX />}
          </Button>
        )}
      </div>
      <Conversation className="chat-transcript">
        <ConversationContent className="gap-5 px-1 py-5 sm:px-4">
          {messages.map((m, i) => {
            const speaker = speakerFor(m);
            const key = String(i);
            const playing = voice.playingKey === key;
            return (
              <Message
                key={i}
                from={m.role === "student" ? "user" : "assistant"}
                className="max-w-[90%]"
              >
                <span className="message-label">
                  {speakerLabel(m, proName)}
                  {m.sample ? " · sample" : ""}
                  {speech.available && speaker && (
                    <button
                      type="button"
                      className="message-play"
                      aria-label={playing ? "Stop voice-over" : "Play voice-over"}
                      onClick={() => (playing ? voice.stop() : voice.speak(key, m.text, speaker))}
                    >
                      {playing ? <Square /> : <Volume2 />}
                    </button>
                  )}
                </span>
                <MessageContent
                  className={
                    m.role === "student" ? "!bg-secondary !text-foreground px-4 py-3" : "px-0 py-0"
                  }
                >
                  <MessageResponse>{m.text}</MessageResponse>
                </MessageContent>
              </Message>
            );
          })}
          {waiting && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking about what you said…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="chat-compose">
        <PromptInput onSubmit={({ text }) => submit(text)}>
          <PromptInputTextarea
            ref={input}
            aria-label="Your message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={listening ? "Listening… press stop when you're done." : placeholder}
            disabled={locked}
            readOnly={listening}
            className="min-h-16"
          />
          <PromptInputFooter className="justify-end gap-1">
            {speech.available && (
              <ClientOnly>
                <Suspense fallback={null}>
                  <MicButton
                    disabled={locked}
                    onDraft={setDraft}
                    onFinal={submit}
                    onListeningChange={(on) => {
                      setListening(on);
                      if (on) {
                        voice.stop();
                        setMicError("");
                      }
                    }}
                    onError={setMicError}
                  />
                </Suspense>
              </ClientOnly>
            )}
            <PromptInputSubmit
              status={waiting ? "submitted" : "ready"}
              disabled={!draft.trim() || locked || listening}
              aria-label="Send message"
            >
              <ArrowUp />
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
        {(micError || voice.error) && (
          <p className="voice-error" role="status">
            {micError || voice.error}
          </p>
        )}
        {footer}
      </div>
    </section>
  );
}
