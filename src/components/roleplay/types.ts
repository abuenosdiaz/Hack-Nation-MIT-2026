import type { Professional } from "@/config/professionals";
import type { TranscriptTurn } from "@/domain/types";

export type RolePlayResult = { transcript: TranscriptTurn[]; seconds: number };

export type RolePlayModeProps = {
  professional: Professional;
  careerAreaId: string;
  onComplete: (result: RolePlayResult) => void;
};
