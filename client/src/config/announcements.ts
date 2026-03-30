import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  ClipboardList,
  FilePenLine,
  KeyRound,
  LayoutTemplate,
  LifeBuoy,
  Link2,
  LogIn,
  Monitor,
  RotateCcw,
  TimerReset,
} from "lucide-react";

export interface AnnouncementFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface AnnouncementCallout {
  title: string;
  items: Array<{
    label: string;
    icon: LucideIcon;
  }>;
}

export interface AnnouncementConfig {
  id: string;
  dismissVersion: string;
  title: string;
  badge: string;
  headline: string;
  description: string;
  features: AnnouncementFeature[];
  comingSoon?: AnnouncementCallout;
}

export const announcements: AnnouncementConfig[] = [
  {
    id: "aet-request-rebrand",
    dismissVersion: "v1",
    title: "Welcome to AET Request",
    badge: "New in this release",
    headline: "Request Access is now AET Request",
    description:
      "AET Request introduces a cleaner experience for requesting chair resources, support, and account-based workflows.",
    features: [
      {
        title: "Login with TUM",
        description:
          "Authenticate with your TUM credentials for faster, account-aware requests.",
        icon: LogIn,
      },
      {
        title: "New form design",
        description:
          "Improved request flows with clearer steps, validation, and review states.",
        icon: LayoutTemplate,
      },
      {
        title: "Quick links",
        description: "Reach important resources directly from the start page.",
        icon: Link2,
      },
      {
        title: "Support requests",
        description: "Open support requests via a simple AET Request form.",
        icon: LifeBuoy,
      },
      {
        title: "VM access requests",
        description:
          "Request access to existing virtual machines in addition to creating new ones.",
        icon: Monitor,
      },
      {
        title: "Stored SSH keys",
        description:
          "Save SSH public keys once and reuse them across VM-related requests.",
        icon: KeyRound,
      },
    ],
    comingSoon: {
      title: "Coming soon",
      items: [
        {
          label: "View submitted requests",
          icon: ClipboardList,
        },
        {
          label: "Get status information for requests",
          icon: TimerReset,
        },
        {
          label: "Edit submitted requests",
          icon: FilePenLine,
        },
        {
          label: "Withdraw requests",
          icon: RotateCcw,
        },
      ],
    },
  },
];

export const activeAnnouncement = announcements[0] ?? null;

export const announcementIcon = BellRing;
