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
import {
  DEFAULT_CPU_CORES,
  DEFAULT_RAM_GB,
  type VMRequest,
} from "@/types/vm-request";

export function ResourcesStep() {
  const form = useFormContext<VMRequest>();
  const cpuCores = form.watch("resources.cpuCores");
  const ramGB = form.watch("resources.ramGB");

  const needsJustification =
    cpuCores > DEFAULT_CPU_CORES || ramGB > DEFAULT_RAM_GB;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Resource Configuration"
        description={`Configure the CPU and RAM for your VM. Default is ${DEFAULT_CPU_CORES} cores and ${DEFAULT_RAM_GB} GB RAM.`}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="resources.cpuCores"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPU Cores</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={32}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>1-32 cores available</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resources.ramGB"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RAM (GB)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={64}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>1-64 GB available</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {needsJustification && (
        <FormField
          control={form.control}
          name="resources.justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justification for Additional Resources</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please explain why you need more than the default resources..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Required when requesting more than {DEFAULT_CPU_CORES} CPU cores
                or {DEFAULT_RAM_GB} GB RAM.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="rounded-lg bg-muted p-4">
        <h3 className="font-medium">Resource Summary</h3>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">CPU Cores:</span>{" "}
            <span className="font-medium">{cpuCores}</span>
            {cpuCores > DEFAULT_CPU_CORES && (
              <span className="ml-2 text-amber-600">
                (+{cpuCores - DEFAULT_CPU_CORES} extra)
              </span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">RAM:</span>{" "}
            <span className="font-medium">{ramGB} GB</span>
            {ramGB > DEFAULT_RAM_GB && (
              <span className="ml-2 text-amber-600">
                (+{ramGB - DEFAULT_RAM_GB} GB extra)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
