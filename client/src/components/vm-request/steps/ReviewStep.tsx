import { useFormContext } from "react-hook-form";
import { RequesterInfo } from "@/components/shared/RequesterInfo";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ReviewRow, ReviewSection } from "@/components/ui/review-section";
import { Separator } from "@/components/ui/separator";
import { StepHeader } from "@/components/ui/step-header";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_PORTS,
  type ProjectType,
  type VMRequest,
} from "@/types/vm-request";

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  ipraktikum: "iPraktikum",
  thesis: "Thesis",
  chair_project: "Chair Project",
};

export function ReviewStep() {
  const form = useFormContext<VMRequest>();
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

      {/* Basic Info */}
      <ReviewSection title="Basic Information">
        <ReviewRow
          label="Hostname"
          value={<span className="font-mono">{data.hostname}</span>}
        />
        <ReviewRow
          label="Project Type"
          value={PROJECT_TYPE_LABELS[data.projectType]}
        />
        <div className="text-sm">
          <span className="text-muted-foreground">Description:</span>
          <p className="mt-1">{data.description}</p>
        </div>
      </ReviewSection>

      {/* Project Details */}
      {data.projectType === "ipraktikum" && data.ipraktikum && (
        <ReviewSection title="iPraktikum Details">
          <ReviewRow label="Team" value={data.ipraktikum.teamName} />
          <ReviewRow label="Coach" value={data.ipraktikum.coachName} />
          <ReviewRow
            label="Project Lead (PL)"
            value={data.ipraktikum.projectLead}
          />
        </ReviewSection>
      )}

      {data.projectType === "thesis" && data.thesis && (
        <ReviewSection title="Thesis Details">
          <ReviewRow label="Level" value={data.thesis.studyLevel} />
          <ReviewRow label="Title" value={data.thesis.title} />
          <ReviewRow label="Advisor" value={data.thesis.advisor} />
        </ReviewSection>
      )}

      {data.projectType === "chair_project" && data.chairProject && (
        <ReviewSection title="Chair Project Details">
          <ReviewRow
            label="Project Name"
            value={data.chairProject.projectName}
          />
          <div className="text-sm">
            <span className="text-muted-foreground">Description:</span>
            <p className="mt-1">{data.chairProject.projectDescription}</p>
          </div>
          {data.chairProject.responsiblePerson && (
            <ReviewRow
              label="Responsible Person"
              value={data.chairProject.responsiblePerson}
            />
          )}
        </ReviewSection>
      )}

      <Separator />

      {/* Resources */}
      <ReviewSection title="Resources">
        <ReviewRow label="CPU Cores" value={data.resources.cpuCores} />
        <ReviewRow label="RAM" value={`${data.resources.ramGB} GB`} />
        {data.resources.justification && (
          <div className="text-sm">
            <span className="text-muted-foreground">Justification:</span>
            <p className="mt-1">{data.resources.justification}</p>
          </div>
        )}
      </ReviewSection>

      <Separator />

      {/* Firewall */}
      <ReviewSection title="Firewall">
        {data.firewall.defaultPorts && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">
              Default ports:
            </span>
            {DEFAULT_PORTS.map((port) => (
              <Badge key={port} variant="secondary">
                {port}
              </Badge>
            ))}
          </div>
        )}
        {data.firewall.additionalPorts.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              Additional ports:
            </span>
            {data.firewall.additionalPorts.map((port) => (
              <div
                key={`${port.port}-${port.protocol}`}
                className="flex items-center gap-2 text-sm"
              >
                <Badge variant="outline">
                  {port.port}/{port.protocol.toUpperCase()}
                </Badge>
                {port.publicAccess && (
                  <Badge variant="highlighted">public</Badge>
                )}
                <span className="text-muted-foreground">- {port.reason}</span>
              </div>
            ))}
          </div>
        )}
      </ReviewSection>

      <Separator />

      {/* Users */}
      <ReviewSection title="Additional Users">
        {data.additionalUsers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.additionalUsers.map((user) => (
              <Badge key={user} variant="secondary">
                {user}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No additional users configured
          </p>
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

      <Separator />

      {/* Additional Comments */}
      <FormField
        control={form.control}
        name="additionalComments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Comments (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information or special requirements..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
