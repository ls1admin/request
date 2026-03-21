import {
  type CollisionDetection,
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink as ExternalLinkIcon,
  GripVertical,
  icons,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useExternalLinksAdmin } from "@/hooks/useExternalLinksAdmin";
import type {
  ExternalLink,
  ExternalLinkCreate,
  ExternalLinkSection,
} from "@/types/external-links";

interface ExternalLinksAdminProps {
  onClose: () => void;
}

const SECTION_DROP_PREFIX = "section-drop-";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Common lucide icon names for the icon selector
const ICON_OPTIONS = [
  "Globe",
  "Link",
  "ExternalLink",
  "BookOpen",
  "GraduationCap",
  "Server",
  "Monitor",
  "Code",
  "Database",
  "Shield",
  "Activity",
  "Users",
  "Mail",
  "FileText",
  "Folder",
  "Settings",
  "Wrench",
  "Zap",
  "Star",
  "Heart",
];

function IconOption({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons];
  if (!Icon) return null;
  return <Icon className="h-4 w-4" />;
}

// Custom collision detection: prefer pointerWithin for droppable zones, fall back to closestCenter for sortable items
const customCollisionDetection: CollisionDetection = (args) => {
  // First check pointer-within for droppable containers (empty sections)
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    // Prefer section-drop targets if pointer is within them
    const sectionDrop = pointerCollisions.find((c) =>
      String(c.id).startsWith(SECTION_DROP_PREFIX),
    );
    // But only use section-drop if there are no sortable item collisions
    const rectCollisions = rectIntersection(args);
    const hasSortableHit = rectCollisions.some(
      (c) => !String(c.id).startsWith(SECTION_DROP_PREFIX),
    );
    if (sectionDrop && !hasSortableHit) {
      return [sectionDrop];
    }
  }
  // Default to closestCenter for normal link-to-link sorting
  return closestCenter(args);
};

// --- Sortable Link Item ---

interface SortableLinkItemProps {
  link: ExternalLink;
  onUpdate: (id: string, data: Partial<ExternalLink>) => void;
  onDelete: (id: string) => void;
}

function SortableLinkItem({ link, onUpdate, onDelete }: SortableLinkItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    label: link.label,
    url: link.url,
    imageUrl: link.imageUrl || "",
    description: link.description || "",
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id, data: { type: "link" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const urlError =
    editData.url.trim() && !isValidUrl(editData.url.trim())
      ? "Please enter a valid URL (e.g. https://example.com)"
      : null;
  const imageUrlError =
    editData.imageUrl.trim() && !isValidUrl(editData.imageUrl.trim())
      ? "Please enter a valid URL"
      : null;
  const canSave =
    !!editData.label.trim() &&
    !!editData.url.trim() &&
    !urlError &&
    !imageUrlError;

  const handleSave = () => {
    if (!canSave) return;
    onUpdate(link.id, {
      label: editData.label.trim(),
      url: editData.url.trim(),
      imageUrl: editData.imageUrl.trim() || undefined,
      description: editData.description.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      label: link.label,
      url: link.url,
      imageUrl: link.imageUrl || "",
      description: link.description || "",
    });
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-lg border bg-background p-3"
    >
      <button
        type="button"
        className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={editData.label}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, label: e.target.value }))
                  }
                  placeholder="Link label"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={editData.url}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, url: e.target.value }))
                  }
                  placeholder="URL"
                  className={urlError ? "border-destructive" : ""}
                />
                {urlError && (
                  <p className="text-xs text-destructive">{urlError}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Image URL (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={editData.imageUrl}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="https://example.com/logo.png"
                  className={imageUrlError ? "border-destructive" : ""}
                />
                {editData.imageUrl && !imageUrlError && (
                  <img
                    src={editData.imageUrl}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded border object-contain"
                  />
                )}
              </div>
              {imageUrlError && (
                <p className="text-xs text-destructive">{imageUrlError}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description (optional)</Label>
              <Textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} disabled={!canSave}>
                <Check className="mr-1 h-3 w-3" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {link.imageUrl && (
              <img
                src={link.imageUrl}
                alt=""
                className="h-5 w-5 shrink-0 rounded object-contain"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {link.label}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {link.url}
                </span>
              </div>
              {link.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {link.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Checkbox
          checked={link.enabled}
          onCheckedChange={(checked) =>
            onUpdate(link.id, { enabled: !!checked })
          }
          aria-label="Enabled"
        />
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(link.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// --- Drag Overlay Item ---

function DragOverlayItem({ link }: { link: ExternalLink }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background p-3 shadow-lg">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      {link.imageUrl && (
        <img
          src={link.imageUrl}
          alt=""
          className="h-5 w-5 shrink-0 rounded object-contain"
        />
      )}
      <span className="font-medium text-sm">{link.label}</span>
    </div>
  );
}

function SectionDragOverlay({ section }: { section: ExternalLinkSection }) {
  return (
    <Card className="shadow-lg opacity-90">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          {section.icon && <IconOption name={section.icon} />}
          <CardTitle className="text-base">{section.title}</CardTitle>
          <span className="text-xs text-muted-foreground">
            ({section.links.length} link
            {section.links.length !== 1 ? "s" : ""})
          </span>
        </div>
      </CardHeader>
    </Card>
  );
}

// --- Section Component ---

interface SectionBlockProps {
  section: ExternalLinkSection;
  onUpdateSection: (
    id: string,
    data: { title?: string; icon?: string },
  ) => void;
  onDeleteSection: (id: string) => void;
  onUpdateLink: (id: string, data: Partial<ExternalLink>) => void;
  onDeleteLink: (id: string) => void;
  onAddLink: (sectionId: string, data: ExternalLinkCreate) => void;
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  };
}

function SectionBlock({
  section,
  onUpdateSection,
  onDeleteSection,
  onUpdateLink,
  onDeleteLink,
  onAddLink,
  dragHandleProps,
}: SectionBlockProps) {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerData, setHeaderData] = useState({
    title: section.title,
    icon: section.icon || "",
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({
    label: "",
    url: "",
    imageUrl: "",
    description: "",
  });

  // Make the section content a droppable zone for cross-section drops to empty sections
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `${SECTION_DROP_PREFIX}${section.id}`,
  });

  const handleSaveHeader = () => {
    onUpdateSection(section.id, {
      title: headerData.title.trim(),
      icon: headerData.icon || undefined,
    });
    setIsEditingHeader(false);
  };

  const newUrlError =
    newLink.url.trim() && !isValidUrl(newLink.url.trim())
      ? "Please enter a valid URL (e.g. https://example.com)"
      : null;
  const newImageUrlError =
    newLink.imageUrl.trim() && !isValidUrl(newLink.imageUrl.trim())
      ? "Please enter a valid URL"
      : null;
  const canAdd =
    !!newLink.label.trim() &&
    !!newLink.url.trim() &&
    !newUrlError &&
    !newImageUrlError;

  const handleAddLink = () => {
    if (!canAdd) return;
    onAddLink(section.id, {
      label: newLink.label.trim(),
      url: newLink.url.trim(),
      imageUrl: newLink.imageUrl.trim() || undefined,
      description: newLink.description.trim() || undefined,
    });
    setNewLink({ label: "", url: "", imageUrl: "", description: "" });
    setShowAddForm(false);
  };

  return (
    <Card className={isOver ? "ring-2 ring-primary" : ""}>
      <CardHeader className="pb-3">
        {isEditingHeader ? (
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Section Title</Label>
                <Input
                  value={headerData.title}
                  onChange={(e) =>
                    setHeaderData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="Section title"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Icon (optional)</Label>
                <div className="flex items-center gap-2">
                  <select
                    value={headerData.icon}
                    onChange={(e) =>
                      setHeaderData((p) => ({ ...p, icon: e.target.value }))
                    }
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    <option value="">No icon</option>
                    {ICON_OPTIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {headerData.icon && <IconOption name={headerData.icon} />}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveHeader}
                disabled={!headerData.title.trim()}
              >
                <Check className="mr-1 h-3 w-3" />
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setHeaderData({
                    title: section.title,
                    icon: section.icon || "",
                  });
                  setIsEditingHeader(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dragHandleProps && (
                <button
                  type="button"
                  className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
                  {...dragHandleProps.attributes}
                  {...dragHandleProps.listeners}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                className="flex items-center gap-2 hover:text-primary transition-colors"
                onClick={() => setIsCollapsed((p) => !p)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {section.icon && <IconOption name={section.icon} />}
                <CardTitle className="text-base">{section.title}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  ({section.links.length} link
                  {section.links.length !== 1 ? "s" : ""})
                </span>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsEditingHeader(true)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDeleteSection(section.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-2 pt-0">
          <div ref={setDroppableRef} className="min-h-[2rem]">
            <SortableContext
              items={section.links.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.links.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 text-center border border-dashed rounded-lg">
                  Drop links here or add one below.
                </p>
              ) : (
                <div className="space-y-2">
                  {section.links.map((link) => (
                    <SortableLinkItem
                      key={link.id}
                      link={link}
                      onUpdate={onUpdateLink}
                      onDelete={onDeleteLink}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </div>

          {showAddForm ? (
            <div className="space-y-2 rounded-lg border border-dashed p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={newLink.label}
                  onChange={(e) =>
                    setNewLink((p) => ({ ...p, label: e.target.value }))
                  }
                  placeholder="Label"
                />
                <div className="space-y-1">
                  <Input
                    value={newLink.url}
                    onChange={(e) =>
                      setNewLink((p) => ({ ...p, url: e.target.value }))
                    }
                    placeholder="URL"
                    className={newUrlError ? "border-destructive" : ""}
                  />
                  {newUrlError && (
                    <p className="text-xs text-destructive">{newUrlError}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Input
                  value={newLink.imageUrl}
                  onChange={(e) =>
                    setNewLink((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="Image URL (optional)"
                  className={newImageUrlError ? "border-destructive" : ""}
                />
                {newImageUrlError && (
                  <p className="text-xs text-destructive">{newImageUrlError}</p>
                )}
              </div>
              <Textarea
                value={newLink.description}
                onChange={(e) =>
                  setNewLink((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddLink} disabled={!canAdd}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewLink({
                      label: "",
                      url: "",
                      imageUrl: "",
                      description: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full border border-dashed"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Link
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// --- Sortable Section Wrapper ---

function SortableSectionBlock(
  props: Omit<SectionBlockProps, "dragHandleProps">,
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.section.id,
    data: { type: "section" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionBlock {...props} dragHandleProps={{ attributes, listeners }} />
    </div>
  );
}

// --- Main Admin Component ---

export function ExternalLinksAdmin({ onClose }: ExternalLinksAdminProps) {
  const {
    sections,
    isLoading,
    error,
    createSection,
    updateSection,
    deleteSection,
    createLink,
    updateLink,
    deleteLink,
    reorder,
  } = useExternalLinksAdmin();

  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [activeDragItem, setActiveDragItem] = useState<{
    type: "link" | "section";
    link?: ExternalLink;
    section?: ExternalLinkSection;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  // Find which section a link belongs to
  const findSectionForLink = useCallback(
    (linkId: string) => {
      return sections.find((s) => s.links.some((l) => l.id === linkId));
    },
    [sections],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type as
      | "link"
      | "section"
      | undefined;
    if (type === "section") {
      const section = sections.find((s) => s.id === event.active.id);
      if (section) setActiveDragItem({ type: "section", section });
    } else {
      const linkId = event.active.id as string;
      for (const section of sections) {
        const link = section.links.find((l) => l.id === linkId);
        if (link) {
          setActiveDragItem({ type: "link", link });
          break;
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type as
      | "link"
      | "section"
      | undefined;

    // --- Section reordering ---
    if (activeType === "section") {
      const sectionIds = sections.map((s) => s.id);
      const oldIndex = sectionIds.indexOf(active.id as string);
      const newIndex = sectionIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...sectionIds];
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, active.id as string);

      reorder({
        sections: reordered.map((id, i) => ({ id, displayOrder: i })),
      });
      return;
    }

    // --- Link reordering / moving ---
    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on an empty section's droppable zone
    if (overId.startsWith(SECTION_DROP_PREFIX)) {
      const targetSectionId = overId.replace(SECTION_DROP_PREFIX, "");
      const sourceSection = findSectionForLink(activeId);
      if (!sourceSection || sourceSection.id === targetSectionId) return;

      const linkUpdates: {
        id: string;
        sectionId: string;
        displayOrder: number;
      }[] = [];

      // Remove from source
      const sourceIds = sourceSection.links
        .map((l) => l.id)
        .filter((id) => id !== activeId);
      for (let i = 0; i < sourceIds.length; i++) {
        linkUpdates.push({
          id: sourceIds[i],
          sectionId: sourceSection.id,
          displayOrder: i,
        });
      }

      // Add to target section at position 0
      const targetSection = sections.find((s) => s.id === targetSectionId);
      if (!targetSection) return;
      const targetIds = [activeId, ...targetSection.links.map((l) => l.id)];
      for (let i = 0; i < targetIds.length; i++) {
        linkUpdates.push({
          id: targetIds[i],
          sectionId: targetSectionId,
          displayOrder: i,
        });
      }

      reorder({ links: linkUpdates });
      return;
    }

    const sourceSection = findSectionForLink(activeId);
    const targetSection = findSectionForLink(overId);

    if (!sourceSection || !targetSection) return;

    const linkUpdates: {
      id: string;
      sectionId: string;
      displayOrder: number;
    }[] = [];

    if (sourceSection.id === targetSection.id) {
      // Reorder within the same section
      const linkIds = sourceSection.links.map((l) => l.id);
      const oldIndex = linkIds.indexOf(activeId);
      const newIndex = linkIds.indexOf(overId);
      const reordered = [...linkIds];
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, activeId);
      for (let i = 0; i < reordered.length; i++) {
        linkUpdates.push({
          id: reordered[i],
          sectionId: sourceSection.id,
          displayOrder: i,
        });
      }
    } else {
      // Move across sections
      const sourceIds = sourceSection.links
        .map((l) => l.id)
        .filter((id) => id !== activeId);
      for (let i = 0; i < sourceIds.length; i++) {
        linkUpdates.push({
          id: sourceIds[i],
          sectionId: sourceSection.id,
          displayOrder: i,
        });
      }
      const targetIds = targetSection.links.map((l) => l.id);
      const insertIndex = targetIds.indexOf(overId);
      targetIds.splice(insertIndex, 0, activeId);
      for (let i = 0; i < targetIds.length; i++) {
        linkUpdates.push({
          id: targetIds[i],
          sectionId: targetSection.id,
          displayOrder: i,
        });
      }
    }

    reorder({ links: linkUpdates });
  };

  const handleUpdateLink = (id: string, data: Partial<ExternalLink>) => {
    updateLink(id, data);
  };

  const handleDeleteLink = (id: string) => {
    deleteLink(id);
  };

  const handleAddLink = (sectionId: string, data: ExternalLinkCreate) => {
    createLink(sectionId, data);
  };

  const handleUpdateSection = (
    id: string,
    data: { title?: string; icon?: string },
  ) => {
    updateSection(id, data);
  };

  const handleDeleteSection = (id: string) => {
    deleteSection(id);
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    createSection({ title: newSectionTitle.trim() });
    setNewSectionTitle("");
    setShowAddSection(false);
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ExternalLinkIcon className="h-5 w-5" />
              Manage External Links
            </CardTitle>
            <CardDescription>
              Organize links into sections. Drag to reorder sections or move
              links between them.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sections.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No sections configured. Create one to get started.
                  </p>
                ) : (
                  sections.map((section) => (
                    <SortableSectionBlock
                      key={section.id}
                      section={section}
                      onUpdateSection={handleUpdateSection}
                      onDeleteSection={handleDeleteSection}
                      onUpdateLink={handleUpdateLink}
                      onDeleteLink={handleDeleteLink}
                      onAddLink={handleAddLink}
                    />
                  ))
                )}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeDragItem?.type === "link" && activeDragItem.link ? (
                <DragOverlayItem link={activeDragItem.link} />
              ) : activeDragItem?.type === "section" &&
                activeDragItem.section ? (
                <SectionDragOverlay section={activeDragItem.section} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <Separator />

        {showAddSection ? (
          <div className="space-y-2 rounded-lg border border-dashed p-4">
            <Label className="text-xs">New Section Title</Label>
            <div className="flex gap-2">
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="e.g., Development Tools"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSection();
                }}
              />
              <Button
                onClick={handleAddSection}
                disabled={!newSectionTitle.trim()}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionTitle("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAddSection(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
