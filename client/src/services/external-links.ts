import type {
  ExternalLink,
  ExternalLinkCreate,
  ExternalLinkSection,
  ExternalLinkSectionCreate,
  ExternalLinkSectionUpdate,
  ExternalLinkUpdate,
  ReorderRequest,
} from "@/types/external-links";

import { api } from "./api";

export const externalLinksService = {
  /** List all sections with enabled links only (public) */
  listSections: async (): Promise<ExternalLinkSection[]> => {
    return api.get<ExternalLinkSection[]>("/external-links/sections");
  },

  /** List all sections with all links including disabled (admin) */
  listSectionsAdmin: async (): Promise<ExternalLinkSection[]> => {
    return api.get<ExternalLinkSection[]>("/external-links/sections/admin");
  },

  /** Create a new section */
  createSection: async (
    data: ExternalLinkSectionCreate,
  ): Promise<ExternalLinkSection> => {
    return api.post<ExternalLinkSection>("/external-links/sections", data);
  },

  /** Update a section */
  updateSection: async (
    id: string,
    data: ExternalLinkSectionUpdate,
  ): Promise<ExternalLinkSection> => {
    return api.put<ExternalLinkSection>(`/external-links/sections/${id}`, data);
  },

  /** Delete a section and all its links */
  deleteSection: async (id: string): Promise<void> => {
    return api.delete(`/external-links/sections/${id}`);
  },

  /** Create a new link in a section */
  createLink: async (
    sectionId: string,
    data: ExternalLinkCreate,
  ): Promise<ExternalLink> => {
    return api.post<ExternalLink>(
      `/external-links/sections/${sectionId}/links`,
      data,
    );
  },

  /** Update a link */
  updateLink: async (
    id: string,
    data: ExternalLinkUpdate,
  ): Promise<ExternalLink> => {
    return api.put<ExternalLink>(`/external-links/links/${id}`, data);
  },

  /** Delete a link */
  deleteLink: async (id: string): Promise<void> => {
    return api.delete(`/external-links/links/${id}`);
  },

  /** Move a link to a different section */
  moveLink: async (
    id: string,
    sectionId: string,
    displayOrder: number,
  ): Promise<ExternalLink> => {
    return api.put<ExternalLink>(`/external-links/links/${id}/move`, {
      sectionId,
      displayOrder,
    });
  },

  /** Bulk reorder sections and/or links */
  reorder: async (data: ReorderRequest): Promise<void> => {
    await api.put<void>("/external-links/reorder", data);
  },
};
