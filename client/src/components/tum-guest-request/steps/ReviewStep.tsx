import { format } from "date-fns";
import { useFormContext } from "react-hook-form";
import { RequesterInfo } from "@/components/shared/RequesterInfo";
import { Badge } from "@/components/ui/badge";
import { ReviewRow, ReviewSection } from "@/components/ui/review-section";
import { StepHeader } from "@/components/ui/step-header";
import { useAuth } from "@/hooks/useAuth";
import {
  GENDER_LABELS,
  GUEST_TYPE_LABELS,
  type TUMGuestRequest,
} from "@/types/tum-guest-request";

// Nationality labels for display
const NATIONALITY_LABELS: Record<string, string> = {
  german: "German",
  austrian: "Austrian",
  swiss: "Swiss",
  american: "American",
  british: "British",
  french: "French",
  italian: "Italian",
  spanish: "Spanish",
  dutch: "Dutch",
  polish: "Polish",
  chinese: "Chinese",
  indian: "Indian",
  japanese: "Japanese",
  korean: "Korean",
  brazilian: "Brazilian",
  mexican: "Mexican",
  canadian: "Canadian",
  australian: "Australian",
  russian: "Russian",
  turkish: "Turkish",
  other: "Other",
};

export function ReviewStep() {
  const form = useFormContext<TUMGuestRequest>();
  const { user, isAuthenticated } = useAuth();
  const values = form.getValues();

  return (
    <div className="space-y-6">
      <StepHeader
        title="Review Your Request"
        description="Please verify all information before submitting."
      />

      {/* Requester Info (for logged-in users) */}
      {isAuthenticated && user && <RequesterInfo user={user} />}

      {/* Guest Information */}
      <ReviewSection title="Guest Information">
        <ReviewRow
          label="Name"
          value={`${values.firstName} ${values.lastName}`}
        />
        <ReviewRow label="Email" value={values.email} />
        <ReviewRow
          label="Date of Birth"
          value={
            <span className="font-medium text-destructive">
              {values.birthDate
                ? format(new Date(values.birthDate), "PPP")
                : "-"}
            </span>
          }
        />
        <ReviewRow
          label="Gender"
          value={values.gender ? GENDER_LABELS[values.gender] : "-"}
        />
        <ReviewRow
          label="Nationality"
          value={
            <span className="font-medium text-destructive">
              {values.nationality === "other"
                ? values.nationalityOther || "-"
                : values.nationality
                  ? NATIONALITY_LABELS[values.nationality] || values.nationality
                  : "-"}
            </span>
          }
        />
        {!isAuthenticated && "contactPerson" in values && (
          <ReviewRow
            label="Contact at TUM"
            value={values.contactPerson || "-"}
          />
        )}
      </ReviewSection>

      {/* Guest Type */}
      <ReviewSection title="Guest Type">
        <ReviewRow
          label="Type"
          value={
            <Badge variant="secondary">
              {values.guestType ? GUEST_TYPE_LABELS[values.guestType] : "-"}
            </Badge>
          }
        />

        {/* iPraktikum specific */}
        {values.guestType === "ipraktikum-customer" &&
          values.ipraktikumFields && (
            <>
              <ReviewRow
                label="Team Name"
                value={values.ipraktikumFields.teamName || "-"}
              />
              <ReviewRow
                label="Coach/PL"
                value={values.ipraktikumFields.coachName || "-"}
              />
            </>
          )}

        {/* Artemis specific */}
        {values.guestType === "artemis" && values.artemisFields && (
          <ReviewRow
            label="University/Company"
            value={values.artemisFields.universityOrCompany || "-"}
          />
        )}

        {/* Other specific */}
        {values.guestType === "other" && values.otherFields && (
          <ReviewRow
            label="Reason"
            value={
              <span className="whitespace-pre-wrap">
                {values.otherFields.reason || "-"}
              </span>
            }
          />
        )}
      </ReviewSection>

      {/* Additional Comments */}
      {values.additionalComments && (
        <ReviewSection title="Additional Comments">
          <span className="whitespace-pre-wrap">
            {values.additionalComments}
          </span>
        </ReviewSection>
      )}
    </div>
  );
}
