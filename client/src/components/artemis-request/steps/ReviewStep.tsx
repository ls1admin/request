import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { RequesterInfo } from "@/components/shared/RequesterInfo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ReviewRow, ReviewSection } from "@/components/ui/review-section";
import { Separator } from "@/components/ui/separator";
import { StepHeader } from "@/components/ui/step-header";
import { useAuth } from "@/hooks/useAuth";
import {
  type ArtemisRequest,
  type GitHubVerificationResult,
  SUBTEAM_LABELS,
} from "@/types/artemis-request";

interface ReviewStepProps {
  verification: GitHubVerificationResult | null;
}

export function ReviewStep({ verification }: ReviewStepProps) {
  const form = useFormContext<ArtemisRequest>();
  const { user, isAuthenticated } = useAuth();
  const values = form.getValues();

  return (
    <div className="space-y-6">
      <StepHeader
        title="Review Your Request"
        description="Please review the information below before submitting."
      />

      {/* Requester Info */}
      {isAuthenticated && user ? (
        <RequesterInfo user={user} />
      ) : (
        <ReviewSection title="Requester">
          <ReviewRow
            label="Name"
            value={"name" in values ? (values as { name: string }).name : "-"}
          />
          <ReviewRow
            label="Email"
            value={
              "mainEmail" in values
                ? (values as { mainEmail: string }).mainEmail
                : "-"
            }
          />
        </ReviewSection>
      )}

      <Separator />

      {/* GitHub Account */}
      <ReviewSection title="GitHub Account">
        {verification?.valid && verification.user ? (
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={verification.user.avatar_url}
                alt={verification.user.login}
              />
              <AvatarFallback>
                {verification.user.login.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {verification.user.name || verification.user.login}
                </span>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                @{verification.user.login}
              </p>
              <a
                href={verification.user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View Profile
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <span>
            <span className="text-muted-foreground">Username:</span>{" "}
            {values.githubUsername || "-"}
          </span>
        )}
      </ReviewSection>

      {verification?.warnings && verification.warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Warnings</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {verification.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Contact Information */}
      <ReviewSection title="Contact Information">
        <ReviewRow label="Slack Email" value={values.slackEmail || "-"} />
        <ReviewRow label="Contact Person" value={values.contactPerson || "-"} />
        <ReviewRow label="Advisor" value={values.advisor || "-"} />
        <ReviewRow
          label="Subteams"
          value={
            <span className="flex flex-wrap gap-1">
              {values.subteams && values.subteams.length > 0
                ? values.subteams.map((team) => (
                    <Badge key={team} variant="secondary">
                      {team === "other"
                        ? values.otherSubteam || "Other"
                        : SUBTEAM_LABELS[team]}
                    </Badge>
                  ))
                : "-"}
            </span>
          }
        />
      </ReviewSection>

      {values.additionalComments && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-medium">Additional Comments</h3>
            <div className="rounded-lg border p-4 text-sm whitespace-pre-wrap">
              {values.additionalComments}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
