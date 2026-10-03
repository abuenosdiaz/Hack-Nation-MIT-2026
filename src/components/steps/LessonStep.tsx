import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";
import { ErrorNote, NextButton, Notice, SectionLabel, StepView } from "@/components/common";
import { askLessonCoach } from "@/api/coach.functions";
import { getCareerArea } from "@/config/careerAreas";
import { lessonCards, sampleCoachReply } from "@/config/content";
import type { ChatMessage } from "@/domain/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLiveAi } from "@/hooks/useIntegrationStatus";
import { useJourney } from "@/journey/JourneyProvider";

export function LessonStep() {
  const { state, update, goTo } = useJourney();
  const [askingCoach, setAskingCoach] = useState(false);
  const live = useLiveAi(state.sampleMode);
  const { pending, error, run } = useAsyncAction();
  const ask = useServerFn(askLessonCoach);

  const index = Math.min(state.lessonIndex, lessonCards.length - 1);
  const card = lessonCards[index]!;
  const isLast = index === lessonCards.length - 1;
  const careerArea = getCareerArea(state.careerAreaId);
  const context = {
    careerArea: careerArea.label,
    interests: state.profile?.interests || "something you enjoy",
  };
  const progress = ((index + 1) / lessonCards.length) * 100;

  const sendToCoach = (text: string) =>
    run(async () => {
      const history: ChatMessage[] = [...state.lessonChat, { role: "student", text }];
      update({ lessonChat: history });
      const reply =
        live && state.profile
          ? (
              await ask({
                data: {
                  history,
                  profile: state.profile,
                  careerAreaId: careerArea.id,
                  lessonIndex: index,
                },
              })
            ).text
          : sampleCoachReply;
      update({ lessonChat: [...history, { role: "coach", text: reply, sample: !live }] });
    });

  const next = () => {
    if (!isLast) return update({ lessonIndex: index + 1 });
    update({ lessonComplete: true });
    goTo("prepare");
  };

  const back = () => (index > 0 ? update({ lessonIndex: index - 1 }) : goTo("onboarding"));

  return (
    <StepView
      label="02 / First lesson"
      title="How to have a useful career conversation."
      lead={`Short and practical, with examples for exploring ${careerArea.label.toLowerCase()}.`}
    >
      {askingCoach ? (
        <div className="fade-up">
          <Button variant="ghost" className="mb-4" onClick={() => setAskingCoach(false)}>
            <ArrowLeft size={16} /> Back to lesson
          </Button>
          <ChatPanel
            title="Ask Sariel"
            caption="Your career coach"
            messages={
              state.lessonChat.length
                ? state.lessonChat
                : [{ role: "coach", text: `Questions about "${card.title}"? Ask away.` }]
            }
            onSend={sendToCoach}
            waiting={pending}
            placeholder="What's on your mind about this lesson?"
          />
          <ErrorNote message={error} />
          <Notice>
            {live
              ? "Sariel answers with AI, using your profile."
              : "Sample coach replies; live AI isn't active."}
          </Notice>
        </div>
      ) : (
        <article className="lesson-sheet fade-up" key={index}>
          <div className="lesson-top">
            <SectionLabel>
              Part {index + 1} of {lessonCards.length}
            </SectionLabel>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <h2>{card.title}</h2>
          <p className="lesson-copy">{card.body}</p>
          {card.examples?.(context).map((example) => (
            <blockquote className="example-quote" key={example}>
              {example}
            </blockquote>
          ))}
          {card.tip && <p className="lesson-tip">{card.tip}</p>}
          <div className="sheet-actions">
            <Button variant="ghost" onClick={back}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="outline" onClick={() => setAskingCoach(true)}>
              <MessageCircle size={16} /> Ask Sariel
            </Button>
            <NextButton onClick={next}>{isLast ? "Finish lesson" : "Next"}</NextButton>
          </div>
        </article>
      )}
    </StepView>
  );
}
