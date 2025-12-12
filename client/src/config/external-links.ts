import type { ExternalLink } from "@/types/external-links";

/**
 * External links to other chair platforms
 * These can be modified by administrators
 *
 * Future: This configuration can be replaced with API calls
 * or managed via an admin UI
 */
export const externalLinks: ExternalLink[] = [
  {
    id: "prompt",
    label: "Prompt",
    url: "https://prompt.aet.cit.tum.de",
    description: "Program management for courses",
    enabled: true,
  },
  {
    id: "thesis-track",
    label: "Thesis Track",
    url: "https://thesis.aet.cit.tum.de",
    description: "Thesis application and management tool",
    enabled: true,
  },
  {
    id: "pathfinder",
    label: "Pathfinder",
    url: "https://pathfinder.aet.cit.tum.de",
    description: "Overview of all AET platforms",
    enabled: true,
  },
  {
    id: "status",
    label: "Status",
    url: "https://status.aet.cit.tum.de",
    description: "Health and status of all AET services",
    enabled: true,
  },
  {
    id: "support",
    label: "Open Jira Ticket",
    url: "https://jira.aet.cit.tum.de/secure/CreateIssue!default.jspa",
    description: "Technical support and issue reporting",
    enabled: true,
  },
];
