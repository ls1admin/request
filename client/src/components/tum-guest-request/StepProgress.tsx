export { type Step, StepProgress } from "@/components/ui/step-progress";

// Steps for logged-in users (requesting for someone else)
export const TUM_GUEST_STEPS_LOGGED_IN = [
  { id: 1, name: "Guest Info", description: "Guest personal details" },
  { id: 2, name: "Guest Type", description: "Reason for account" },
  { id: 3, name: "Review", description: "Review and submit" },
] as const;

// Steps for anonymous users (requesting for themselves)
export const TUM_GUEST_STEPS_ANONYMOUS = [
  { id: 1, name: "Request Type", description: "Who is this for" },
  { id: 2, name: "Guest Info", description: "Personal details" },
  { id: 3, name: "Guest Type", description: "Reason for account" },
  { id: 4, name: "Review", description: "Review and submit" },
] as const;
