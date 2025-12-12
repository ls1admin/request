import { ReviewRow, ReviewSection } from "@/components/ui/review-section";
import type { UserInfo } from "@/types/auth";

interface RequesterInfoProps {
  user: UserInfo | null;
}

export function RequesterInfo({ user }: RequesterInfoProps) {
  if (!user) return null;

  return (
    <ReviewSection title="Requester">
      <ReviewRow label="Name" value={user.fullName} />
      <ReviewRow label="Username" value={user.username} />
      <ReviewRow label="Email" value={user.email} />
    </ReviewSection>
  );
}
