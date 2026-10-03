import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/ChatPanel";
import { ErrorNote, NextButton, Notice, SectionLabel, StepView } from "@/components/common";
import { createProfile, replyToOnboarding } from "@/api/coach.functions";
import { careerAreas } from "@/config/careerAreas";
import { onboardingQuestions, sampleOnboardingAnswers } from "@/config/content";
import { buildSampleProfile, suggestCareerArea } from "@/domain/profile";
import type { ChatMessage, StudentProfile } from "@/domain/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLiveAi } from "@/hooks/useIntegrationStatus";
import { useJourney } from "@/journey/JourneyProvider";
import { initialJourneyState, resetRolePlay, sampleOnboardingChat } from "@/journey/state";

const PROFILE_FIELDS: { key: keyof StudentProfile; label: string }[] = [
  { key: "interests", label: "Interests" },
  { key: "activities", label: "Activities" },
  { key: "experiences", label: "Experiences" },
  { key: "comfortWithStrangers", label: "Comfort talking to new people" },
];

const WRAP_UP_MESSAGE =
  "Thanks for sharing all that. Here's what I'm hearing — you can change any of it.";

export function OnboardingStep() {
  const { state, update } = useJourney();
  const live = useLiveAi(state.sampleMode);
  const { pending, error, run } = useAsyncAction();
  const sendTurn = useServerFn(replyToOnboarding);
  const summarize = useServerFn(createProfile);

  const messages: ChatMessage[] = state.onboardingChat.length
    ? state.onboardingChat
    : [{ role: "coach", text: onboardingQuestions[0]! }];

  const answer = (text: string) =>
    run(async () => {
      const history: ChatMessage[] = [...messages, { role: "student", text }];
      update({ onboardingChat: history });
      const answers = history.filter((m) => m.role === "student").map((m) => m.text);
      const nextQuestion = onboardingQuestions[answers.length];

      try {
        if (nextQuestion) {
          const reply = live
            ? (await sendTurn({ data: { history, nextQuestion } })).text
            : nextQuestion;
          update({ onboardingChat: [...history, { role: "coach", text: reply, sample: !live }] });
          return;
        }
        const result = live
          ? await summarize({ data: { answers } })
          : { profile: buildSampleProfile(answers), suggestion: suggestCareerArea(answers) };
        update({
          onboardingChat: [...history, { role: "coach", text: WRAP_UP_MESSAGE, sample: !live }],
          ...result,
        });
      } catch (e) {
        update({ onboardingChat: messages });
        throw e;
      }
    });

  const useSample = () =>
    update({
      ...initialJourneyState,
      step: "onboarding",
      sampleMode: true,
      onboardingChat: [
        ...sampleOnboardingChat(),
        { role: "coach", text: WRAP_UP_MESSAGE, sample: true },
      ],
      profile: buildSampleProfile(sampleOnboardingAnswers),
      suggestion: suggestCareerArea(sampleOnboardingAnswers),
    });

  return (
    <StepView
      label="01 / Get to know you"
      title="A conversation about you."
      lead="Start anywhere. What you share shapes your lesson and the professional you'll practice with."
    >
      {state.profile && state.suggestion ? (
        <ProfileReview profile={state.profile} live={live} />
      ) : (
        <>
          <ChatPanel
            title="Sariel"
            caption="Your career coach"
            messages={messages}
            onSend={answer}
            waiting={pending}
            placeholder="Tell me what comes to mind…"
            footer={
              <div className="under-chat">
                <Button variant="link" size="sm" onClick={useSample} disabled={pending}>
                  Use a sample conversation instead
                </Button>
              </div>
            }
          />
          <ErrorNote message={error} />
          <Notice>
            {live
              ? "Sariel is using AI for this conversation."
              : "Sample mode: scripted questions, no live AI."}
          </Notice>
        </>
      )}
    </StepView>
  );
}

function ProfileReview({ profile, live }: { profile: StudentProfile; live: boolean }) {
  const { state, update, goTo } = useJourney();
  const [editing, setEditing] = useState(false);
  const [areaId, setAreaId] = useState(
    state.careerAreaId ?? state.suggestion?.careerAreaId ?? careerAreas[0]!.id,
  );
  const isSuggested = areaId === state.suggestion?.careerAreaId;

  const confirm = () => {
    const changed = areaId !== state.careerAreaId;
    update({
      careerAreaId: areaId,
      ...(changed && state.careerAreaId !== null
        ? { preparedQuestions: initialJourneyState.preparedQuestions, ...resetRolePlay() }
        : {}),
    });
    goTo("lesson");
  };

  const setField = (key: keyof StudentProfile, value: string) =>
    update({ profile: { ...profile, [key]: value } });

  return (
    <div className="single-panel fade-up">
      <SectionLabel>Your starting point</SectionLabel>
      <h2>Here's what I'm hearing. Does this sound like you?</h2>
      {editing ? (
        <div className="field-stack">
          {PROFILE_FIELDS.map(({ key, label }) => (
            <label key={key} className="field-label">
              {label}
              <textarea
                className="field-input"
                rows={2}
                value={profile[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            </label>
          ))}
        </div>
      ) : (
        <dl className="profile-list">
          {PROFILE_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{profile[key]}</dd>
            </div>
          ))}
        </dl>
      )}
      <Button variant="ghost" onClick={() => setEditing(!editing)}>
        {editing ? "Done editing" : "Edit my profile"}
      </Button>

      <div className="direction-line mt-6">
        <span>A career area to explore first</span>
        <label className="sr-only" htmlFor="career-area">
          Career area
        </label>
        <select
          id="career-area"
          className="field-input"
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
        >
          {careerAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.label}
              {area.id === state.suggestion?.careerAreaId ? " (suggested)" : ""}
            </option>
          ))}
        </select>
        <p className="quiet mt-2">
          {isSuggested
            ? state.suggestion?.reason
            : "Great — exploring what you're curious about is the point."}
        </p>
      </div>

      <div className="panel-actions">
        <p className="quiet">This is one area to try, not a decision about your future.</p>
        <NextButton onClick={confirm}>
          {isSuggested ? "Sounds good — start lesson" : "Explore this instead"}
        </NextButton>
      </div>
      <Notice>
        {live
          ? "Profile and suggestion generated by AI from your answers."
          : "Sample profile built from keyword matching, not AI."}
      </Notice>
    </div>
  );
}
