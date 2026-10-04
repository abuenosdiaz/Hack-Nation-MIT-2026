import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";
import { ErrorNote, NextButton, Notice, SectionLabel, StepView } from "@/components/common";
import { askLessonCoach } from "@/api/coach.functions";
import { getCareerArea } from "@/config/careerAreas";
import { lessonCards, sampleCoachReply, type LessonCheck } from "@/config/content";
import type { ChatMessage } from "@/domain/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLiveAi } from "@/hooks/useIntegrationStatus";
import { useJourney } from "@/journey/JourneyProvider";

export function LessonStep() {
  const { state, update, goTo } = useJourney();
  const [askingCoach, setAskingCoach] = useState(false);
  // Chosen quick-check option per lesson card.
  const [answers, setAnswers] = useState<Record<number, number>>({});
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
  const selected = answers[index];
  const checkPassed =
    state.adminMode || !card.check || card.check.options[selected ?? -1]?.correct === true;

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
      className="lesson-view"
      label="02 / First lesson"
      title="How to have a useful career conversation."
      lead={`Short and practical, with examples for exploring ${careerArea.label.toLowerCase()}.`}
    >
      <div className={`lesson-layout ${askingCoach ? "lesson-layout-open" : ""}`}>
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
          {card.check && (
            <QuickCheck
              check={card.check}
              selected={selected}
              onSelect={(option) => setAnswers((prev) => ({ ...prev, [index]: option }))}
            />
          )}
          <div className="sheet-actions">
            <Button variant="ghost" onClick={back}>
              <ArrowLeft size={16} /> Back
            </Button>
            <NextButton onClick={next} disabled={!checkPassed}>
              {isLast ? "Finish lesson" : "Next"}
            </NextButton>
          </div>
        </article>
        <Button
          size="icon"
          variant="outline"
          className="lesson-coach-toggle"
          aria-label={askingCoach ? "Close Sariel chat" : "Ask Sariel"}
          title={askingCoach ? "Close Sariel chat" : "Ask Sariel"}
          aria-expanded={askingCoach}
          onClick={() => setAskingCoach(!askingCoach)}
        >
          {askingCoach ? <X size={19} /> : <MessageCircle size={19} />}
        </Button>
        {askingCoach && (
          <aside className="lesson-coach-aside fade-up" aria-label="Ask Sariel while reading">
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
              placeholder="What would you like to clarify?"
            />
            <ErrorNote message={error} />
            <Notice>
              {live
                ? "Sariel answers with AI, using your profile."
                : "Sample coach replies; live AI isn't active."}
            </Notice>
          </aside>
        )}
      </div>
    </StepView>
  );
}

function QuickCheck({
  check,
  selected,
  onSelect,
}: {
  check: LessonCheck;
  selected: number | undefined;
  onSelect: (option: number) => void;
}) {
  const choice = selected === undefined ? undefined : check.options[selected];
  return (
    <div className="lesson-check">
      <p className="lesson-check-label">Quick check</p>
      <h3>{check.prompt}</h3>
      <div className="lesson-options" role="group" aria-label={check.prompt}>
        {check.options.map((option, i) => (
          <Button
            key={option.text}
            variant="outline"
            className={`lesson-option ${selected === i ? "lesson-option-selected" : ""}`}
            aria-pressed={selected === i}
            onClick={() => onSelect(i)}
          >
            {option.text}
          </Button>
        ))}
      </div>
      {choice && (
        <p
          className={`lesson-check-feedback ${choice.correct ? "lesson-check-correct" : ""}`}
          role="status"
        >
          {choice.feedback}
        </p>
      )}
    </div>
  );
}
