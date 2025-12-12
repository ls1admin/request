import { ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RequestSuccessCardProps {
  requestId: string;
  jiraTicketUrl?: string | null;
  description: string;
  onBack: () => void;
  children?: ReactNode;
}

export function RequestSuccessCard({
  requestId,
  jiraTicketUrl,
  description,
  onBack,
  children,
}: RequestSuccessCardProps) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle className="mt-4">Request Submitted!</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Request ID:{" "}
            <code className="rounded bg-muted px-2 py-1">{requestId}</code>
          </p>

          {children}

          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            {jiraTicketUrl && (
              <Button asChild>
                <a
                  href={jiraTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Jira Ticket
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
