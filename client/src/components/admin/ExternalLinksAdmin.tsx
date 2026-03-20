import { ExternalLink, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
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
import type { ExternalLink as ExternalLinkType } from "@/types/external-links";

interface ExternalLinksAdminProps {
  links: ExternalLinkType[];
  onSave: (links: ExternalLinkType[]) => void;
  onReset: () => void;
  onClose: () => void;
}

export function ExternalLinksAdmin({
  links,
  onSave,
  onReset,
  onClose,
}: ExternalLinksAdminProps) {
  const [editedLinks, setEditedLinks] = useState<ExternalLinkType[]>([
    ...links,
  ]);
  const [newLink, setNewLink] = useState<Partial<ExternalLinkType>>({
    label: "",
    url: "",
    description: "",
    enabled: true,
  });

  const handleUpdateLink = (
    id: string,
    field: keyof ExternalLinkType,
    value: string | boolean,
  ) => {
    setEditedLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    );
  };

  const handleDeleteLink = (id: string) => {
    setEditedLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleAddLink = () => {
    const label = newLink.label?.trim();
    const url = newLink.url?.trim();

    if (!label || !url) {
      return;
    }

    const id = `link-${Date.now()}`;
    setEditedLinks((prev) => [
      ...prev,
      {
        id,
        label,
        url,
        description: newLink.description?.trim() || undefined,
        enabled: newLink.enabled ?? true,
      },
    ]);
    setNewLink({ label: "", url: "", description: "", enabled: true });
  };

  const handleSave = () => {
    onSave(editedLinks);
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Manage External Links
            </CardTitle>
            <CardDescription>
              Add, edit, or remove links to other platforms. Changes are saved
              locally and will persist in this browser.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Links */}
        <div className="space-y-4">
          <h3 className="font-medium">Current Links</h3>
          {editedLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No links configured. Add one below.
            </p>
          ) : (
            <div className="space-y-3">
              {editedLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`label-${link.id}`}>Label</Label>
                        <Input
                          id={`label-${link.id}`}
                          value={link.label}
                          onChange={(e) =>
                            handleUpdateLink(link.id, "label", e.target.value)
                          }
                          placeholder="Link label"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`url-${link.id}`}>URL</Label>
                        <Input
                          id={`url-${link.id}`}
                          value={link.url}
                          onChange={(e) =>
                            handleUpdateLink(link.id, "url", e.target.value)
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`desc-${link.id}`}>
                        Description (optional)
                      </Label>
                      <Input
                        id={`desc-${link.id}`}
                        value={link.description || ""}
                        onChange={(e) =>
                          handleUpdateLink(
                            link.id,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="Brief description for tooltip"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`enabled-${link.id}`}
                        checked={link.enabled}
                        onCheckedChange={(checked) =>
                          handleUpdateLink(link.id, "enabled", !!checked)
                        }
                      />
                      <Label htmlFor={`enabled-${link.id}`} className="text-sm">
                        Enabled
                      </Label>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Add New Link */}
        <div className="space-y-4">
          <h3 className="font-medium">Add New Link</h3>
          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="new-label">Label</Label>
                <Input
                  id="new-label"
                  value={newLink.label}
                  onChange={(e) =>
                    setNewLink((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder="e.g., Documentation"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-url">URL</Label>
                <Input
                  id="new-url"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-desc">Description (optional)</Label>
              <Input
                id="new-desc"
                value={newLink.description}
                onChange={(e) =>
                  setNewLink((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description for tooltip"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleAddLink}
              disabled={!newLink.label?.trim() || !newLink.url?.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-initial">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
