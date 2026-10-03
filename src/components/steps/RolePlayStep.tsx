import { lazy, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel, StepView } from "@/components/common";
import { TextRolePlay } from "@/components/roleplay/TextRolePlay";
import type { RolePlayResult } from "@/components/roleplay/types";
import { initialsOf } from "@/config/professionals";
import { useIntegrationStatus } from "@/hooks/useIntegrationStatus";
import { useJourney } from "@/journey/JourneyProvider";
import { professionalFor } from "@/journey/state";

// Browser-only: the ElevenLabs SDK touches audio/WebRTC APIs at import time.
const VoiceRolePlay = lazy(() => import("@/components/roleplay/VoiceRolePlay"));

export function RolePlayStep() {
  const { state, update, goTo } = useJourney();
  const status = useIntegrationStatus();
  const professional = professionalFor(state);
  const careerAreaId = state.careerAreaId ?? professional.careerAreaId;
  const useVoice = status.voice && !state.sampleMode;

  const complete = ({ transcript, seconds }: RolePlayResult) => {
    update({
      transcript,
      rolePlaySeconds: seconds,
      rolePlayComplete: true,
      feedback: null,
      reflectionChat: [],
    });
    goTo("reflect");
  };

  return (
    <StepView
      label="04 / Role-play"
      title={`A conversation with ${professional.name}.`}
      lead="Introduce yourself, ask your questions, and follow up on what you hear. Sariel will stay quiet until you're done."
    >
      <div className="conversation-context">
        <span className="person-monogram small">{initialsOf(professional.name)}</span>
        <span>
          <strong>{professional.name}</strong> · {professional.role}
          <small>Fictional practice scenario</small>
        </span>
      </div>

      <aside className="notes-card">
        <SectionLabel>Your notes</SectionLabel>
        <ol>
          {state.preparedQuestions.map((q, i) => (
            <li key={i}>{q.text}</li>
          ))}
        </ol>
      </aside>

      {useVoice ? (
        <Suspense fallback={<p className="quiet">Loading voice…</p>}>
          <VoiceRolePlay
            professional={professional}
            careerAreaId={careerAreaId}
            onComplete={complete}
          />
        </Suspense>
      ) : (
        <TextRolePlay
          professional={professional}
          careerAreaId={careerAreaId}
          onComplete={complete}
          live={status.llm && !state.sampleMode}
        />
      )}

      <Button variant="ghost" className="mt-6" onClick={() => goTo("prepare")}>
        <ArrowLeft size={16} /> Back to preparation
      </Button>
    </StepView>
  );
}
