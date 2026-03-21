import { ExternalLink as ExternalLinkIcon, icons } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExternalLinkSection as SectionType } from "@/types/external-links";

interface ExternalLinksSectionProps {
  sections: SectionType[];
}

function SectionIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons];
  if (!Icon) return null;
  return <Icon className="h-5 w-5" />;
}

export function ExternalLinksSection({ sections }: ExternalLinksSectionProps) {
  const nonEmptySections = sections.filter((s) => s.links.length > 0);

  if (nonEmptySections.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4 space-y-8">
        {nonEmptySections.map((section) => (
          <div key={section.id}>
            <h2 className="mb-4 text-lg font-medium text-muted-foreground flex items-center gap-2">
              {section.icon && <SectionIcon name={section.icon} />}
              {section.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {section.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="h-full transition-all hover:border-primary hover:bg-muted/50 hover:shadow-md">
                    <CardHeader className="p-4">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {link.imageUrl ? (
                          <img
                            src={link.imageUrl}
                            alt=""
                            className="h-5 w-5 shrink-0 rounded object-contain"
                          />
                        ) : null}
                        {link.label}
                        <ExternalLinkIcon className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      </CardTitle>
                      {link.description && (
                        <CardDescription className="text-sm">
                          {link.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
