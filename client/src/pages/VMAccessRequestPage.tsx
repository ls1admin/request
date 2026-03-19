import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RequestErrorCard } from "@/components/shared/RequestErrorCard";
import { RequestSuccessCard } from "@/components/shared/RequestSuccessCard";
import { Button } from "@/components/ui/button";
import { VMAccessRequestForm } from "@/components/vm-access-request/VMAccessRequestForm";
import { useAuth } from "@/hooks/useAuth";
import { submitVMAccessRequest } from "@/lib/api";
import type { VMAccessRequest } from "@/types/vm-access-request";

export function VMAccessRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    requestId?: string;
    ticketUrl?: string | null;
    error?: string;
  } | null>(null);

  const handleSubmit = async (data: VMAccessRequest) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await submitVMAccessRequest({
        ...data,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
        },
      });

      if (response.success && response.data) {
        setSubmitResult({
          success: true,
          requestId: response.data.requestId,
          ticketUrl: response.data.ticketUrl,
        });
      } else {
        setSubmitResult({
          success: false,
          error: response.error ?? "Failed to submit request",
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        error: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitResult?.success) {
    return (
      <RequestSuccessCard
        requestId={submitResult.requestId ?? ""}
        ticketUrl={submitResult.ticketUrl}
        description="Your VM access request has been submitted successfully."
        onBack={() => navigate("/")}
      >
        <p className="text-sm text-muted-foreground">
          You will receive an email notification once your request has been
          reviewed and processed.
        </p>
      </RequestSuccessCard>
    );
  }

  if (submitResult?.success === false) {
    return (
      <RequestErrorCard
        error={submitResult.error ?? "An unexpected error occurred"}
        onTryAgain={() => setSubmitResult(null)}
        onBack={() => navigate("/")}
      />
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Request VM Access</h1>
        <p className="mt-2 text-muted-foreground">
          Request access to an existing virtual machine.
        </p>
      </div>

      <VMAccessRequestForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
