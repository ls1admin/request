import { useCallback, useEffect, useState } from "react";
import { externalLinksService } from "@/services/external-links";
import type { ExternalLinkSection } from "@/types/external-links";

/**
 * Hook to fetch external link sections from the API (public endpoint).
 * Returns only enabled links within each section.
 */
export function useExternalLinks() {
  const [sections, setSections] = useState<ExternalLinkSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await externalLinksService.listSections();
      setSections(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load links");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return { sections, isLoading, error, refetch: fetchSections };
}
