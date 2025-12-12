import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RequestErrorCardProps {
  error: string;
  onTryAgain: () => void;
  onBack: () => void;
}

export function RequestErrorCard({
  error,
  onTryAgain,
  onBack,
}: RequestErrorCardProps) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">Submission Failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={onTryAgain} variant="outline" className="mr-2">
            Try Again
          </Button>
          <Button onClick={onBack} variant="ghost">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
