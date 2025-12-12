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
import { StepHeader } from "@/components/ui/step-header";
import { Textarea } from "@/components/ui/textarea";
import type { VMAccessRequest } from "@/types/vm-access-request";

export function AccessDetailsStep() {
  const form = useFormContext<VMAccessRequest>();

  return (
    <div className="space-y-6">
      <StepHeader
        title="Access Details"
        description="Provide information about the VM you need access to."
      />

      <FormField
        control={form.control}
        name="hostname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>VM Hostname</FormLabel>
            <FormControl>
              <Input placeholder="vm-hostname" {...field} />
            </FormControl>
            <FormDescription>
              The hostname of the VM you need access to.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="justification"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Justification</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Please explain why you need access to this VM..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide a detailed explanation of why you need access to this VM.
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
            <FormLabel>Contact Person (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Name of person who can confirm your request"
                {...field}
              />
            </FormControl>
            <FormDescription>
              A person who can verify your need for access (e.g., project lead,
              VM owner).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
