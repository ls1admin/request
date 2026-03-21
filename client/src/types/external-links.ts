export interface ExternalLink {
  id: string;
  label: string;
  url: string;
  imageUrl?: string;
  description?: string;
  enabled: boolean;
  displayOrder: number;
}

export interface ExternalLinkSection {
  id: string;
  title: string;
  icon?: string;
  displayOrder: number;
  links: ExternalLink[];
}

export interface ExternalLinkCreate {
  label: string;
  url: string;
  imageUrl?: string;
  description?: string;
  enabled?: boolean;
  displayOrder?: number;
}

export interface ExternalLinkUpdate {
  label?: string;
  url?: string;
  imageUrl?: string;
  description?: string;
  enabled?: boolean;
  displayOrder?: number;
}

export interface ExternalLinkSectionCreate {
  title: string;
  icon?: string;
  displayOrder?: number;
}

export interface ExternalLinkSectionUpdate {
  title?: string;
  icon?: string;
  displayOrder?: number;
}

export interface ReorderRequest {
  sections?: { id: string; displayOrder: number }[];
  links?: { id: string; sectionId: string; displayOrder: number }[];
}
