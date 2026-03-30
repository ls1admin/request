import { useEffect, useMemo, useState } from "react";
import type { AnnouncementConfig } from "@/config/announcements";
import { WHATS_NEW_ENABLED } from "@/config/app";

function getStorageKey(announcement: AnnouncementConfig): string {
  return `aet-request.whats-new.${announcement.dismissVersion}.dismissed`;
}

export function useAnnouncement(announcement: AnnouncementConfig | null) {
  const [isOpen, setIsOpen] = useState(false);

  const enabled = useMemo(
    () => Boolean(announcement) && WHATS_NEW_ENABLED,
    [announcement],
  );

  useEffect(() => {
    if (!enabled || !announcement) {
      setIsOpen(false);
      return;
    }

    const dismissed = window.localStorage.getItem(getStorageKey(announcement));
    setIsOpen(dismissed !== "true");
  }, [announcement, enabled]);

  const dismiss = () => {
    if (!announcement) return;
    window.localStorage.setItem(getStorageKey(announcement), "true");
    setIsOpen(false);
  };

  return {
    enabled,
    isOpen,
    dismiss,
  };
}
