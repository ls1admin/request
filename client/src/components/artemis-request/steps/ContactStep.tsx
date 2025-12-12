import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { StepHeader } from "@/components/ui/step-header";
import { Textarea } from "@/components/ui/textarea";
import {
  type ArtemisRequest,
  SUBTEAM_LABELS,
  type Subteam,
  subteams,
} from "@/types/artemis-request";

export function ContactStep() {
  const form = useFormContext<ArtemisRequest>();
  const selectedSubteams = form.watch("subteams") || [];
  const previousIncludedOther = useRef<boolean>(
    selectedSubteams.includes("other"),
  );

  // Clear otherSubteam error when "other" is deselected
  useEffect(() => {
    const currentIncludesOther = selectedSubteams.includes("other");
    if (previousIncludedOther.current && !currentIncludesOther) {
      form.clearErrors("otherSubteam");
    }
    previousIncludedOther.current = currentIncludesOther;
  }, [selectedSubteams, form]);

  const handleSubteamToggle = (team: Subteam, checked: boolean) => {
    const current = form.getValues("subteams") || [];
    if (checked) {
      form.setValue("subteams", [...current, team], { shouldValidate: true });
    } else {
      form.setValue(
        "subteams",
        current.filter((t) => t !== team),
        { shouldValidate: true },
      );
    }
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Contact Information"
        description="Provide contact details and team information."
      />

      <FormField
        control={form.control}
        name="slackEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slack Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="your.email@example.com"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Email address for Slack workspace invitation.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contactPerson"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Person</FormLabel>
            <FormControl>
              <Input placeholder="Name of your main contact" {...field} />
            </FormControl>
            <FormDescription>
              The person who referred or introduced you to Artemis development.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="advisor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advisor</FormLabel>
            <FormControl>
              <Input placeholder="Your thesis or project advisor" {...field} />
            </FormControl>
            <FormDescription>
              Your academic advisor or supervisor.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subteams"
        render={() => (
          <FormItem>
            <FormLabel>Subteams</FormLabel>
            <FormDescription>
              Select all subteams you will be working with.
            </FormDescription>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 mt-2">
              {subteams.map((team) => (
                <div
                  key={team}
                  className="flex items-center space-x-2 rounded-md border p-3"
                >
                  <Checkbox
                    id={`subteam-${team}`}
                    checked={selectedSubteams.includes(team)}
                    onCheckedChange={(checked) =>
                      handleSubteamToggle(team, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`subteam-${team}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {SUBTEAM_LABELS[team]}
                  </Label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedSubteams.includes("other") && (
        <FormField
          control={form.control}
          name="otherSubteam"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specify Subteam</FormLabel>
              <FormControl>
                <Input placeholder="Enter subteam name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
