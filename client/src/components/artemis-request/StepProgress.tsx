export { type Step, StepProgress } from "@/components/ui/step-progress";

export const ARTEMIS_REQUEST_STEPS = [
  { id: 1, name: "GitHub", description: "Verify GitHub account" },
  { id: 2, name: "Contact", description: "Contact and team info" },
  { id: 3, name: "Review", description: "Review and submit" },
] as const;

export const ARTEMIS_REQUEST_STEPS_ANONYMOUS = [
  { id: 1, name: "Personal Info", description: "Your details" },
  { id: 2, name: "GitHub", description: "Verify GitHub account" },
  { id: 3, name: "Contact", description: "Contact and team info" },
  { id: 4, name: "Review", description: "Review and submit" },
] as const;
