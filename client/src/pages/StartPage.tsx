import { AnnouncementHost } from "@/components/announcements/AnnouncementHost";
import { PageLayout } from "@/components/layout/PageLayout";
import { ExternalLinksSection } from "@/components/start-page/ExternalLinksSection";
import { RequestFormsSection } from "@/components/start-page/RequestFormsSection";
import { SupportSection } from "@/components/start-page/SupportSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { useExternalLinks } from "@/hooks/useExternalLinks";

export function StartPage() {
  const { isLoading, login, error } = useAuth();
  const { sections, isLoading: linksLoading } = useExternalLinks();

  if (isLoading || linksLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-3">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex min-h-[80vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">
                Authentication Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <Button onClick={login} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <AnnouncementHost />
      <RequestFormsSection />
      <SupportSection />
      <ExternalLinksSection sections={sections} />
    </PageLayout>
  );
}
