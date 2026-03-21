import { Info, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepHeader } from "@/components/ui/step-header";
import { DEFAULT_PORTS, protocols, type VMRequest } from "@/types/vm-request";

export function FirewallStep() {
  const form = useFormContext<VMRequest>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "firewall.additionalPorts",
  });

  const addPort = () => {
    append({
      port: 8080,
      protocol: "tcp",
      reason: "",
      publicAccess: false,
      publicJustification: "",
    });
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Firewall Configuration"
        description="Configure which ports should be open on your VM."
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>eduVPN only</AlertTitle>
        <AlertDescription>
          All ports are by default only accessible via the eduVPN. Making a port
          publicly accessible requires justification and is only granted in
          exceptional cases.
        </AlertDescription>
      </Alert>

      <FormField
        control={form.control}
        name="firewall.defaultPorts"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Enable Default Ports</FormLabel>
              <FormDescription>
                Open ports {DEFAULT_PORTS.join(", ")} (SSH, HTTP, HTTPS)
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Additional Ports</h3>
            <p className="text-sm text-muted-foreground">
              Each additional port requires a reason.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="sm:w-auto sm:px-3"
            onClick={addPort}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Port</span>
          </Button>
        </div>

        {fields.length > 0 && (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const publicAccess = form.watch(
                `firewall.additionalPorts.${index}.publicAccess`,
              );
              return (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr_auto]">
                    <FormField
                      control={form.control}
                      name={`firewall.additionalPorts.${index}.port`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={65535}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`firewall.additionalPorts.${index}.protocol`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protocol</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select protocol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {protocols.map((protocol) => (
                                <SelectItem key={protocol} value={protocol}>
                                  {protocol.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`firewall.additionalPorts.${index}.reason`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Why is this port needed?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name={`firewall.additionalPorts.${index}.publicAccess`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Publicly accessible</FormLabel>
                          <FormDescription>
                            Open this port to all network traffic, not just
                            eduVPN
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {publicAccess && (
                    <FormField
                      control={form.control}
                      name={`firewall.additionalPorts.${index}.publicJustification`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Public access justification</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Why does this port need to be publicly accessible?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {fields.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No additional ports configured. Click &quot;Add Port&quot; to open
            custom ports.
          </div>
        )}
      </div>
    </div>
  );
}
