export const GUIDED_TOUR_PROGRESS_TOTAL = 8;

export type GuidedTourStepId =
  | "welcome"
  | "search"
  | "categories"
  | "vendors"
  | "new-request"
  | "request-form"
  | "credits"
  | "profile-bookmarks"
  | "complete";

export const GUIDED_TOUR_STEPS: GuidedTourStepId[] = [
  "welcome",
  "search",
  "categories",
  "vendors",
  "new-request",
  "request-form",
  "credits",
  "profile-bookmarks",
  "complete",
];

export function guidedTourStepId(index: number): GuidedTourStepId {
  return GUIDED_TOUR_STEPS[index] ?? "welcome";
}

export function guidedTourProgressLabel(index: number): string | null {
  const id = guidedTourStepId(index);
  if (id === "complete") return null;
  const n = Math.min(index + 1, GUIDED_TOUR_PROGRESS_TOTAL);
  return `${n}/${GUIDED_TOUR_PROGRESS_TOTAL}`;
}
