import { Info, LogIn } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepHeader } from "@/components/ui/step-header";
import { useAuth } from "@/hooks/useAuth";
import type { TUMGuestRequest } from "@/types/tum-guest-request";

interface RequestTypeStepProps {
  onLogin: () => void;
}

export function RequestTypeStep({ onLogin }: RequestTypeStepProps) {
  const form = useFormContext<TUMGuestRequest>();
  const { isAuthenticated } = useAuth();

  // This step is only shown for anonymous users
  if (isAuthenticated) {
    return null;
  }

  const requestingForSelf = form.watch(
    "requestingForSelf" as keyof TUMGuestRequest,
  );

  return (
    <div className="space-y-6">
      <StepHeader
        title="Who is this request for?"
        description="Please indicate whether you are requesting a TUM guest account for yourself or for someone else."
      />

      <FormField
        control={form.control}
        name={"requestingForSelf" as keyof TUMGuestRequest}
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "self")}
                value={
                  field.value === true
                    ? "self"
                    : field.value === false
                      ? "other"
                      : undefined
                }
                className="flex flex-col space-y-3"
              >
                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <RadioGroupItem value="self" />
                  </FormControl>
                  <FormLabel className="flex-1 cursor-pointer font-normal">
                    <span className="font-medium">For myself</span>
                    <p className="text-sm text-muted-foreground">
                      I am the guest and I need a TUM account
                    </p>
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <RadioGroupItem value="other" />
                  </FormControl>
                  <FormLabel className="flex-1 cursor-pointer font-normal">
                    <span className="font-medium">For someone else</span>
                    <p className="text-sm text-muted-foreground">
                      I am requesting a guest account on behalf of another
                      person
                    </p>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {requestingForSelf === false && (
        <Alert>
          <LogIn className="h-4 w-4" />
          <AlertTitle>Please log in</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              If you are requesting a guest account for someone else, please log
              in with your TUM account first. This helps us verify your identity
              and process the request faster.
            </p>
            <button
              type="button"
              onClick={onLogin}
              className="text-primary underline hover:no-underline"
            >
              Sign in with your university account
            </button>
          </AlertDescription>
        </Alert>
      )}

      {requestingForSelf === true && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Guest Account Request</AlertTitle>
          <AlertDescription>
            You will need to provide your personal information in the following
            steps. Please ensure all information is accurate, especially your
            date of birth and nationality, as these are required for successful
            account creation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
