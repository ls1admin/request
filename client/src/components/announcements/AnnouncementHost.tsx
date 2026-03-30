import { activeAnnouncement } from "@/config/announcements";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { AnnouncementDialog } from "./AnnouncementDialog";

export function AnnouncementHost() {
  const { enabled, isOpen, dismiss } = useAnnouncement(activeAnnouncement);

  if (!enabled || !activeAnnouncement) {
    return null;
  }

  return (
    <AnnouncementDialog
      announcement={activeAnnouncement}
      open={isOpen}
      onDismiss={dismiss}
    />
  );
}
