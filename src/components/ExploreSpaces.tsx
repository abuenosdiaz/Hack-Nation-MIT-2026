import { useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, Play, Sparkles } from "lucide-react";
import helloImage from "@/assets/reel-hello.jpg";
import listenImage from "@/assets/reel-listen.jpg";
import questionsImage from "@/assets/reel-questions.jpg";
import { Button } from "@/components/ui/button";
import { contentPreviews } from "@/config/content";
import { SectionLabel } from "./common";

const images = [helloImage, questionsImage, listenImage];

/** Browsable sample content. A side space: opening it never changes journey progress. */
export function ContentSpace() {
  const [selected, setSelected] = useState<number | null>(null);
  const item = selected === null ? null : contentPreviews[selected];
  const count = contentPreviews.length;

  if (item && selected !== null) {
    return (
      <section className="content-space fade-up">
        <SectionLabel>Explore / Content</SectionLabel>
        <Button variant="ghost" className="content-back" onClick={() => setSelected(null)}>
          <ArrowLeft size={18} /> All content
        </Button>
        <div className="content-detail">
          <div className="content-detail-image">
            <img
              src={images[selected]}
              alt="Illustration of students having a conversation"
              width={768}
              height={1152}
            />
            <span className="content-image-tag">
              {item.kind} / 0{selected + 1}
            </span>
          </div>
          <div className="content-detail-copy">
            <SectionLabel>{item.label}</SectionLabel>
            <h1>{item.title}.</h1>
            <p className="lead">{item.line}</p>
            <div className="content-prompt">
              <Sparkles size={20} aria-hidden="true" />
              <span>{item.prompt}</span>
            </div>
            <p className="notice">Sample preview for now — video content will be added later.</p>
            <div className="content-detail-actions">
              <Button variant="outline" onClick={() => setSelected((selected - 1 + count) % count)}>
                <ArrowLeft size={16} /> Previous
              </Button>
              <Button size="lg" onClick={() => setSelected((selected + 1) % count)}>
                Next <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-space fade-up">
      <SectionLabel>Explore / Content</SectionLabel>
      <h1>Little ideas. Big conversations.</h1>
      <p className="lead">
        Browse quick ideas connected to what you're learning, whenever curiosity strikes.
      </p>
      <div className="content-grid">
        {contentPreviews.map((preview, i) => (
          <Button
            key={preview.title}
            variant="ghost"
            className="content-tile"
            onClick={() => setSelected(i)}
            aria-label={`Open ${preview.title}`}
          >
            <span className="content-tile-image">
              <img src={images[i]} alt="" loading="lazy" width={768} height={1152} />
              <span className="content-image-tag">
                {preview.kind} / 0{i + 1}
              </span>
              <span className="content-play" aria-hidden="true">
                <Play size={18} fill="currentColor" />
              </span>
            </span>
            <span className="content-tile-meta">
              <small>{preview.label}</small>
              <strong>{preview.title}</strong>
              <span>{preview.line}</span>
            </span>
          </Button>
        ))}
      </div>
      <p className="notice">
        These are sample previews, not videos yet. Your lessons and progress stay right where you
        left them.
      </p>
    </section>
  );
}

/** Placeholder for future messaging. Nothing can be sent or stored. */
export function MessagesSpace() {
  return (
    <section className="messages-space fade-up">
      <SectionLabel>Your space / Messages</SectionLabel>
      <h1>A place for real conversations.</h1>
      <p className="lead">
        When it's time to connect outside practice, your messages will have a home here.
      </p>
      <div className="messages-preview">
        <div className="messages-preview-heading">
          <span className="messages-lock">
            <LockKeyhole size={27} strokeWidth={1.7} />
          </span>
          <span>Messaging is not available yet</span>
        </div>
        <p>
          There is no inbox or sending in this demo. Please don't share personal details here.
          Encrypted messaging will need to be built and verified before students can send or receive
          anything.
        </p>
        <div className="messages-empty-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <small>Future space · No messages stored or sent</small>
      </div>
    </section>
  );
}
