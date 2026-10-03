import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Volume2 } from "lucide-react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import type { Msg } from "@/lib/journey";

type MicState = "idle" | "requesting" | "granted" | "denied" | "error";

export function ChatPanel({ title, messages, onSend, placeholder = "Write your response…", disabled, waiting, footer, speaker = "Sariel" }: {
  title: string; messages: Msg[]; onSend: (text: string) => void; placeholder?: string; disabled?: boolean; waiting?: boolean; footer?: React.ReactNode; speaker?: string;
}) {
  const [text, setText] = useState("");
  const [mic, setMic] = useState<MicState>("idle");
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (!disabled && !waiting) input.current?.focus(); }, [disabled, waiting, messages.length]);
  async function tryMic() {
    setMic("requesting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMic("granted");
    } catch (e) { setMic((e as Error).name === "NotAllowedError" ? "denied" : "error"); }
  }
  return <section className="chat-surface" aria-label={title}>
    <div className="chat-heading"><span className="identity-mark" aria-hidden>✳</span><div><strong>{title}</strong><span className="chat-caption">{speaker === "Sariel" ? "Your career coach" : "Fictional practice conversation"}</span></div><span className="chat-status">{waiting ? "Thinking" : "Text conversation"}</span></div>
    <Conversation className="chat-transcript"><ConversationContent className="gap-5 px-1 py-5 sm:px-4">
      {messages.map((m, i) => <Message key={i} from={m.role === "student" ? "user" : "assistant"} className="max-w-[90%]">
        <span className="message-label">{m.role === "student" ? "You" : m.role === "pro" ? speaker : "Sariel"}{m.sample ? " · sample" : ""}</span>
        <MessageContent className={m.role === "student" ? "!bg-secondary !text-foreground px-4 py-3" : "px-0 py-0"}><MessageResponse>{m.text}</MessageResponse></MessageContent>
      </Message>)}
      {waiting && <Message from="assistant"><MessageContent><Shimmer>Thinking about what you said…</Shimmer></MessageContent></Message>}
    </ConversationContent><ConversationScrollButton /></Conversation>
    <div className="chat-compose">
      <PromptInput onSubmit={({ text: value }) => { if (value.trim() && !disabled && !waiting) { onSend(value.trim()); setText(""); } }}>
        <PromptInputTextarea ref={input} aria-label="Your message" value={text} onChange={e => setText(e.target.value)} placeholder={placeholder} disabled={disabled || waiting} className="min-h-16" />
        <PromptInputFooter className="justify-between">
          <Button type="button" size="icon-sm" variant="ghost" aria-label="Test microphone" title="Test microphone" onClick={tryMic} disabled={mic === "requesting"}><Mic /></Button>
          <PromptInputSubmit status={waiting ? "submitted" : "ready"} disabled={!text.trim() || disabled || waiting} aria-label="Send message"><ArrowUp /></PromptInputSubmit>
        </PromptInputFooter>
      </PromptInput>
      <p className="mic-note" role="status">{mic === "idle" ? <><Volume2 size={13} aria-hidden /> Voice isn't connected yet. Type to continue.</> : mic === "requesting" ? "Checking microphone…" : mic === "granted" ? "Microphone available; live voice isn't connected yet. Type to continue." : mic === "denied" ? <>Microphone blocked. <Button variant="link" size="sm" onClick={tryMic}>Retry</Button> or type instead.</> : <>No microphone found. <Button variant="link" size="sm" onClick={tryMic}>Retry</Button> or type instead.</>}</p>
      {footer}
    </div>
  </section>;
}
