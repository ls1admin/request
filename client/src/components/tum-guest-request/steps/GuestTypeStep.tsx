import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepHeader } from "@/components/ui/step-header";
import { Textarea } from "@/components/ui/textarea";
import {
  GUEST_TYPE_LABELS,
  type GuestType,
  guestTypes,
  type TUMGuestRequest,
} from "@/types/tum-guest-request";

const GUEST_TYPE_DESCRIPTIONS: Record<GuestType, string> = {
  "ipraktikum-customer":
    "External customer participating in the iPraktikum program",
  artemis: "External collaborator working with the Artemis project",
  other: "Other reason for needing a TUM guest account",
};

export function GuestTypeStep() {
  const form = useFormContext<TUMGuestRequest>();
  const selectedGuestType = form.watch("guestType");

  return (
    <div className="space-y-6">
      <StepHeader
        title="Guest Type"
        description="Select the reason for the guest account request and provide additional details."
      />

      <FormField
        control={form.control}
        name="guestType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Type of Guest Account</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-3"
              >
                {guestTypes.map((type) => (
                  <FormItem
                    key={type}
                    className="flex items-center space-x-3 space-y-0 rounded-md border p-4"
                  >
                    <FormControl>
                      <RadioGroupItem value={type} />
                    </FormControl>
                    <FormLabel className="flex-1 cursor-pointer font-normal">
                      <span className="font-medium">
                        {GUEST_TYPE_LABELS[type]}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {GUEST_TYPE_DESCRIPTIONS[type]}
                      </p>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* iPraktikum Customer Fields */}
      {selectedGuestType === "ipraktikum-customer" && (
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">iPraktikum Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="ipraktikumFields.teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Team Alpha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ipraktikumFields.coachName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coach / Project Lead</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of coach or PL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Artemis Fields */}
      {selectedGuestType === "artemis" && (
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Artemis Details</h3>
          <FormField
            control={form.control}
            name="artemisFields.universityOrCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University / Company</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Stanford University or Acme Corp"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The guest's affiliated university or company.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Other Fields */}
      {selectedGuestType === "other" && (
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Additional Information</h3>
          <FormField
            control={form.control}
            name="otherFields.reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Guest Account</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please explain why a TUM guest account is needed..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed explanation of why the guest account is
                  required.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={form.control}
        name="additionalComments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Comments (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Add any other relevant information for this request.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
