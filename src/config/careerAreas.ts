// EDITABLE: career areas a student can explore. Each area maps to one fictional
// practice professional in `professionals.ts`.
export type CareerArea = {
  id: string;
  label: string;
  /** Lowercase words that hint a student might enjoy this area (sample mode only). */
  keywords: string[];
};

export const careerAreas: CareerArea[] = [
  {
    id: "health",
    label: "Healthcare & helping people",
    keywords: [
      "help",
      "health",
      "sport",
      "body",
      "doctor",
      "nurse",
      "care",
      "volunteer",
      "biology",
      "injury",
      "coach",
    ],
  },
  {
    id: "design",
    label: "Technology & design",
    keywords: [
      "art",
      "draw",
      "design",
      "game",
      "computer",
      "code",
      "app",
      "tech",
      "video",
      "build",
      "creative",
      "robot",
    ],
  },
  {
    id: "environment",
    label: "Environment & engineering",
    keywords: [
      "nature",
      "outdoor",
      "environment",
      "climate",
      "animal",
      "science",
      "math",
      "fix",
      "engineer",
      "hike",
      "garden",
      "energy",
    ],
  },
  {
    id: "business",
    label: "Business & entrepreneurship",
    keywords: [
      "business",
      "money",
      "sell",
      "lead",
      "start",
      "market",
      "shop",
      "job",
      "manage",
      "organize",
      "debate",
      "team",
    ],
  },
];

export const DEFAULT_CAREER_AREA_ID = careerAreas[0]!.id;

export const getCareerArea = (id: string | null | undefined): CareerArea =>
  careerAreas.find((area) => area.id === id) ?? careerAreas[0]!;

export const isCareerAreaId = (id: string): boolean => careerAreas.some((area) => area.id === id);
