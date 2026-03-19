import { useState } from "react";
import { ExternalLinksAdmin } from "@/components/admin/ExternalLinksAdmin";
import { PageLayout } from "@/components/layout/PageLayout";
import { ExternalLinksSection } from "@/components/start-page/ExternalLinksSection";
import { RequestFormsSection } from "@/components/start-page/RequestFormsSection";
import { SupportSection } from "@/components/start-page/SupportSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useExternalLinks } from "@/hooks/useExternalLinks";

export function StartPage() {
  const { isLoading, login, error } = useAuth();
  const { links, saveLinks, resetToDefaults, isLoaded } = useExternalLinks();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleAdminSettingsClick = () => {
    setShowAdminPanel(true);
  };

  const handleCloseAdminPanel = () => {
    setShowAdminPanel(false);
  };

  const handleSaveLinks = (newLinks: typeof links) => {
    saveLinks(newLinks);
    setShowAdminPanel(false);
  };

  if (isLoading || !isLoaded) {
    return (
      <PageLayout>
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
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

  if (showAdminPanel) {
    return (
      <PageLayout onAdminSettingsClick={handleAdminSettingsClick}>
        <div className="container mx-auto px-4 py-8">
          <ExternalLinksAdmin
            links={links}
            onSave={handleSaveLinks}
            onReset={() => {
              resetToDefaults();
              setShowAdminPanel(false);
            }}
            onClose={handleCloseAdminPanel}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout onAdminSettingsClick={handleAdminSettingsClick}>
      <RequestFormsSection />
      <SupportSection />
      <ExternalLinksSection links={links} />
    </PageLayout>
  );
}
