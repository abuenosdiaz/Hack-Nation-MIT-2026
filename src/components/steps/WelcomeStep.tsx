import { NextButton, SectionLabel } from "@/components/common";
import { useJourney } from "@/journey/JourneyProvider";

export function WelcomeStep() {
  const { goTo } = useJourney();
  return (
    <div className="welcome-view fade-up">
      <SectionLabel>A good place to begin</SectionLabel>
      <h1>You don't need your future figured out to start exploring.</h1>
      <p className="lead">
        Tell Sariel about yourself, learn how to have a useful career conversation, then practice
        one out loud with a fictional professional.
      </p>
      <NextButton onClick={() => goTo("onboarding")}>Let's get started</NextButton>
      <p className="quiet mt-5">No login needed · About 15 minutes</p>
    </div>
  );
}
