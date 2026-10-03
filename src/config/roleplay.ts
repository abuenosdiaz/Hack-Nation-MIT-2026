// EDITABLE: timing for the voice role-play (seconds).
export const ROLEPLAY_TIMING = {
  /** The conversation is "complete" once it reaches this length. */
  targetSeconds: 180,
  /** The professional is nudged to start wrapping up. */
  wrapUpSeconds: 210,
  /** The call ends automatically. */
  maxSeconds: 240,
} as const;

export const formatClock = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
