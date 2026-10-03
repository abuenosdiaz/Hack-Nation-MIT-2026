import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
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
import type { ChatMessage } from "@/domain/types";

type ChatPanelProps = {
  title: string;
  caption: string;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  /** Display name for `pro` messages. */
  proName?: string;
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
  placeholder = "Write your response…",
  waiting = false,
  disabled = false,
  footer,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const locked = disabled || waiting;

  useEffect(() => {
    if (!locked) input.current?.focus();
  }, [locked, messages.length]);

  const submit = (value: string) => {
    const text = value.trim();
    if (!text || locked) return;
    onSend(text);
    setDraft("");
  };

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
        <span className="chat-status">{waiting ? "Thinking" : "Text conversation"}</span>
      </div>
      <Conversation className="chat-transcript">
        <ConversationContent className="gap-5 px-1 py-5 sm:px-4">
          {messages.map((m, i) => (
            <Message
              key={i}
              from={m.role === "student" ? "user" : "assistant"}
              className="max-w-[90%]"
            >
              <span className="message-label">
                {speakerLabel(m, proName)}
                {m.sample ? " · sample" : ""}
              </span>
              <MessageContent
                className={
                  m.role === "student" ? "!bg-secondary !text-foreground px-4 py-3" : "px-0 py-0"
                }
              >
                <MessageResponse>{m.text}</MessageResponse>
              </MessageContent>
            </Message>
          ))}
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
            placeholder={placeholder}
            disabled={locked}
            className="min-h-16"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              status={waiting ? "submitted" : "ready"}
              disabled={!draft.trim() || locked}
              aria-label="Send message"
            >
              <ArrowUp />
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
        {footer}
      </div>
    </section>
  );
}
