import { useCallback, useEffect, useState } from "react";
import { externalLinks as defaultLinks } from "@/config/external-links";
import type { ExternalLink } from "@/types/external-links";

const STORAGE_KEY = "aet-request-external-links";

/**
 * Hook to manage external links with localStorage persistence
 * Allows admins to customize links without backend changes
 */
export function useExternalLinks() {
  const [links, setLinks] = useState<ExternalLink[]>(defaultLinks);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ExternalLink[];
        setLinks(parsed);
      }
    } catch {
      // If parsing fails, use defaults
      console.warn("Failed to load external links from localStorage");
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  const saveLinks = useCallback((newLinks: ExternalLink[]) => {
    setLinks(newLinks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLinks));
    } catch {
      console.error("Failed to save external links to localStorage");
    }
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setLinks(defaultLinks);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.error("Failed to remove external links from localStorage");
    }
  }, []);

  // Get only enabled links
  const enabledLinks = links.filter((link) => link.enabled);

  return {
    links,
    enabledLinks,
    isLoaded,
    saveLinks,
    resetToDefaults,
  };
}
