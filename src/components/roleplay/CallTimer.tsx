import { formatClock, ROLEPLAY_TIMING } from "@/config/roleplay";

export function CallTimer({ seconds }: { seconds: number }) {
  const { targetSeconds, maxSeconds } = ROLEPLAY_TIMING;
  const progress = Math.min(100, (seconds / maxSeconds) * 100);
  const status =
    seconds >= targetSeconds
      ? "Great length — wrap up whenever you're ready."
      : `Aim for ${formatClock(targetSeconds)}–${formatClock(maxSeconds)}.`;

  return (
    <div className="call-timer" aria-live="polite">
      <div className="call-timer-row">
        <strong>{formatClock(seconds)}</strong>
        <span className="quiet">{status}</span>
      </div>
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
