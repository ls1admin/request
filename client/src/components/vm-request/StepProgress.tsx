export { type Step, StepProgress } from "@/components/ui/step-progress";

export const VM_REQUEST_STEPS = [
  { id: 1, name: "Basic Info", description: "Hostname and project details" },
  { id: 2, name: "Resources", description: "CPU and RAM configuration" },
  { id: 3, name: "Firewall", description: "Port configuration" },
  { id: 4, name: "Users", description: "Additional user accounts" },
  { id: 5, name: "SSH Key", description: "Authentication setup" },
  { id: 6, name: "Review", description: "Review and submit" },
] as const;
