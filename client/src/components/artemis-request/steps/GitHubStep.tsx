import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepHeader } from "@/components/ui/step-header";
import { verifyGitHubUsername } from "@/lib/api";
import type {
  ArtemisRequest,
  GitHubVerificationResult,
} from "@/types/artemis-request";

interface GitHubStepProps {
  onVerificationChange?: (result: GitHubVerificationResult | null) => void;
}

export function GitHubStep({ onVerificationChange }: GitHubStepProps) {
  const form = useFormContext<ArtemisRequest>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] =
    useState<GitHubVerificationResult | null>(null);

  const githubUsername = form.watch("githubUsername");

  const handleVerify = useCallback(async () => {
    const username = form.getValues("githubUsername");
    if (!username || username.trim() === "") {
      return;
    }

    setIsVerifying(true);
    setVerification(null);

    try {
      const result = await verifyGitHubUsername(username.trim());
      setVerification(result);
      onVerificationChange?.(result);

      if (!result.valid && result.error) {
        form.setError("githubUsername", {
          type: "manual",
          message: result.error,
        });
      } else {
        form.clearErrors("githubUsername");
      }
    } finally {
      setIsVerifying(false);
    }
  }, [form, onVerificationChange]);

  const clearVerification = useCallback(() => {
    if (verification) {
      setVerification(null);
      onVerificationChange?.(null);
    }
  }, [verification, onVerificationChange]);

  return (
    <div className="space-y-6">
      <StepHeader
        title="GitHub Account"
        description="Enter your GitHub username to verify your account."
      />

      <FormField
        control={form.control}
        name="githubUsername"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GitHub Username</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input
                  placeholder="your-github-username"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    clearVerification();
                  }}
                />
              </FormControl>
              <Button
                type="button"
                variant="secondary"
                onClick={handleVerify}
                disabled={isVerifying || !githubUsername?.trim()}
              >
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
            <FormDescription>
              Your GitHub username will be used to add you to the Artemis
              organization.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {verification?.valid && verification.user && (
        <div className="rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={verification.user.avatar_url}
                alt={verification.user.login}
              />
              <AvatarFallback>
                {verification.user.login.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  {verification.user.name || verification.user.login}
                </h3>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                @{verification.user.login}
              </p>
              {verification.user.bio && (
                <p className="text-sm">{verification.user.bio}</p>
              )}
              <a
                href={verification.user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View Profile
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {verification?.warnings && verification.warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {verification.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {verification && !verification.valid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Failed</AlertTitle>
          <AlertDescription>{verification.error}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Profile Requirements</AlertTitle>
        <AlertDescription>
          Please ensure you have configured your <strong>full name</strong> and
          a <strong>picture of yourself</strong> on both GitHub and Slack before
          submitting this request.
        </AlertDescription>
      </Alert>

      <FormField
        control={form.control}
        name="profileAcknowledgment"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value === true}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                I confirm that I have my complete name and a picture of myself
                configured on both GitHub and Slack.
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
