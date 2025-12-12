import { ExternalLink } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExternalLink as ExternalLinkType } from "@/types/external-links";

interface ExternalLinksSectionProps {
  links: ExternalLinkType[];
}

export function ExternalLinksSection({ links }: ExternalLinksSectionProps) {
  const enabledLinks = links.filter((link) => link.enabled);

  if (enabledLinks.length === 0) {
    return null;
  }

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-lg font-medium text-muted-foreground">
          Other AET Platforms
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {enabledLinks.map((link) => (
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
                    {link.label}
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </CardTitle>
                  {link.description && (
                    <CardDescription className="text-xs">
                      {link.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
