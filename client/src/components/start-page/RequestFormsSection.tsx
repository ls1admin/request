import { Code, KeyRound, Server, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RequestCard } from "./RequestCard";

const requestForms = [
  {
    id: "vm",
    title: "Request a New VM",
    description:
      "Request a new virtual machine for your project, thesis, or chair activities.",
    icon: Server,
    to: "/request/vm",
    requiresAuth: true,
  },
  {
    id: "vm-access",
    title: "Request VM Access",
    description:
      "Request access to an existing virtual machine managed by the chair.",
    icon: KeyRound,
    to: "/request/vm-access",
    requiresAuth: true,
  },
  {
    id: "artemis",
    title: "Artemis Developer Access",
    description:
      "Request developer access to the Artemis learning platform for contributions.",
    icon: Code,
    to: "/request/artemis",
    requiresAuth: false,
  },
  {
    id: "tum-guest",
    title: "TUM Guest Account",
    description:
      "Request a TUM guest account for external collaborators and partners.",
    icon: UserPlus,
    to: "/request/tum-guest",
    requiresAuth: false,
  },
];

export function RequestFormsSection() {
  const { isAuthenticated, login } = useAuth();

  return (
    <section className="py-2 2xl:py-6">
      <div className="container mx-auto px-4">
        <h2 className="mb-2 2xl:mb-4 text-base 2xl:text-lg font-medium text-muted-foreground">
          Request Forms
        </h2>
        <div className="grid gap-3 2xl:gap-4 grid-cols-2">
          {requestForms.map((form) => (
            <RequestCard
              key={form.id}
              title={form.title}
              description={form.description}
              icon={form.icon}
              to={form.to}
              requiresAuth={form.requiresAuth}
              isAuthenticated={isAuthenticated}
              onLogin={login}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
