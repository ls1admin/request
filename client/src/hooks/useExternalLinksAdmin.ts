import { useCallback, useEffect, useState } from "react";
import { externalLinksService } from "@/services/external-links";
import type {
  ExternalLinkCreate,
  ExternalLinkSection,
  ExternalLinkSectionCreate,
  ExternalLinkSectionUpdate,
  ExternalLinkUpdate,
  ReorderRequest,
} from "@/types/external-links";

/**
 * Hook for admin management of external link sections.
 * Fetches all sections including disabled links via the admin endpoint.
 * Provides CRUD mutation functions that persist via API and refetch.
 */
export function useExternalLinksAdmin() {
  const [sections, setSections] = useState<ExternalLinkSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await externalLinksService.listSectionsAdmin();
      setSections(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const createSection = useCallback(
    async (data: ExternalLinkSectionCreate) => {
      await externalLinksService.createSection(data);
      await fetchSections();
    },
    [fetchSections],
  );

  const updateSection = useCallback(
    async (id: string, data: ExternalLinkSectionUpdate) => {
      await externalLinksService.updateSection(id, data);
      await fetchSections();
    },
    [fetchSections],
  );

  const deleteSection = useCallback(
    async (id: string) => {
      await externalLinksService.deleteSection(id);
      await fetchSections();
    },
    [fetchSections],
  );

  const createLink = useCallback(
    async (sectionId: string, data: ExternalLinkCreate) => {
      await externalLinksService.createLink(sectionId, data);
      await fetchSections();
    },
    [fetchSections],
  );

  const updateLink = useCallback(
    async (id: string, data: ExternalLinkUpdate) => {
      await externalLinksService.updateLink(id, data);
      await fetchSections();
    },
    [fetchSections],
  );

  const deleteLink = useCallback(
    async (id: string) => {
      await externalLinksService.deleteLink(id);
      await fetchSections();
    },
    [fetchSections],
  );

  const reorder = useCallback(
    async (data: ReorderRequest) => {
      await externalLinksService.reorder(data);
      await fetchSections();
    },
    [fetchSections],
  );

  return {
    sections,
    isLoading,
    error,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    createLink,
    updateLink,
    deleteLink,
    reorder,
  };
}
