export { type Step, StepProgress } from "@/components/ui/step-progress";

export const VM_ACCESS_STEPS = [
  { id: 1, name: "Access Details", description: "VM and justification" },
  { id: 2, name: "SSH Key", description: "Authentication setup" },
  { id: 3, name: "Review", description: "Review and submit" },
] as const;
