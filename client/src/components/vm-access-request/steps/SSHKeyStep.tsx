import { SSHKeySection } from "@/components/shared/SSHKeySection";
import { StepHeader } from "@/components/ui/step-header";

export function SSHKeyStep() {
  return (
    <div className="space-y-6">
      <StepHeader
        title="SSH Key"
        description="Select an existing SSH key or add a new one for authentication."
      />

      <SSHKeySection fieldPrefix="sshKey" />
    </div>
  );
}
