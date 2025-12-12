import { useFormContext } from "react-hook-form";
import { RequesterInfo } from "@/components/shared/RequesterInfo";
import { ReviewRow, ReviewSection } from "@/components/ui/review-section";
import { Separator } from "@/components/ui/separator";
import { StepHeader } from "@/components/ui/step-header";
import { useAuth } from "@/hooks/useAuth";
import type { VMAccessRequest } from "@/types/vm-access-request";

export function ReviewStep() {
  const form = useFormContext<VMAccessRequest>();
  const { user } = useAuth();
  const data = form.getValues();

  return (
    <div className="space-y-6">
      <StepHeader
        title="Review Your Request"
        description="Please review all information before submitting."
      />

      {/* Requester Info */}
      <RequesterInfo user={user} />

      <Separator />

      {/* Access Details */}
      <ReviewSection title="Access Details">
        <ReviewRow
          label="VM Hostname"
          value={<span className="font-mono">{data.hostname}</span>}
        />
        <div className="text-sm">
          <span className="text-muted-foreground">Justification:</span>
          <p className="mt-1">{data.justification}</p>
        </div>
        {data.contactPerson && (
          <ReviewRow label="Contact Person" value={data.contactPerson} />
        )}
      </ReviewSection>

      <Separator />

      {/* SSH Key */}
      <ReviewSection title="SSH Key">
        {data.sshKey.type === "existing" ? (
          <p>Using existing key: {data.sshKey.keyId}</p>
        ) : (
          <p className="font-mono text-xs break-all">
            {data.sshKey.publicKey.substring(0, 80)}...
          </p>
        )}
      </ReviewSection>
    </div>
  );
}
