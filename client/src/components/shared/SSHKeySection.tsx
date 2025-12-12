import { Key, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { fetchSSHKeys } from "@/lib/api";
import { getKeyTypeLabel, validateSSHKey } from "@/lib/validation/ssh-key";
import type { StoredSSHKey } from "@/types/vm-request";

interface SSHKeySectionProps {
  /** Field path prefix for the SSH key fields (e.g., "sshKey" for form.sshKey.type) */
  fieldPrefix?: string;
}

export function SSHKeySection({ fieldPrefix = "sshKey" }: SSHKeySectionProps) {
  const form = useFormContext();
  const [storedKeys, setStoredKeys] = useState<StoredSSHKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sshKeyType = form.watch(`${fieldPrefix}.type`);
  const newPublicKey = form.watch(`${fieldPrefix}.publicKey`);

  useEffect(() => {
    async function loadKeys() {
      const response = await fetchSSHKeys();
      if (response.success && response.data) {
        setStoredKeys(response.data);
      }
      setIsLoading(false);
    }
    loadKeys();
  }, []);

  const keyValidation = newPublicKey ? validateSSHKey(newPublicKey) : null;

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name={`${fieldPrefix}.type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Key Source</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div>
                  <RadioGroupItem
                    value="existing"
                    id="existing"
                    className="peer sr-only"
                    disabled={storedKeys.length === 0}
                  />
                  <Label
                    htmlFor="existing"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50 [&:has([data-state=checked])]:border-primary"
                  >
                    <Key className="mb-2 h-6 w-6" />
                    Use Existing Key
                    {storedKeys.length === 0 && (
                      <span className="mt-1 text-xs text-muted-foreground">
                        No keys available
                      </span>
                    )}
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="new"
                    id="new"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="new"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Key className="mb-2 h-6 w-6" />
                    Add New Key
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {sshKeyType === "existing" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : storedKeys.length > 0 ? (
            <FormField
              control={form.control}
              name={`${fieldPrefix}.keyId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Key</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-2"
                    >
                      {storedKeys.map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center space-x-3 rounded-lg border p-4"
                        >
                          <RadioGroupItem value={key.id} id={key.id} />
                          <Label
                            htmlFor={key.id}
                            className="flex flex-1 cursor-pointer items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">{key.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {key.fingerprint}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {key.type.toUpperCase()}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No stored SSH keys found. Please add a new key.
            </div>
          )}
        </div>
      )}

      {sshKeyType === "new" && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`${fieldPrefix}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., My Laptop, Work Desktop"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A friendly name to identify this key (e.g., &quot;My
                  Laptop&quot;)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`${fieldPrefix}.publicKey`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Public Key</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ssh-ed25519 AAAA... or ssh-rsa AAAA..."
                    className="min-h-[120px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Paste your SSH public key. RSA keys must be at least 4096
                  bits. Ed25519 and ECDSA keys are also accepted.
                </FormDescription>
                {keyValidation && (
                  <div className="mt-2">
                    {keyValidation.valid ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Valid {getKeyTypeLabel(keyValidation.keyType)} Key
                      </Badge>
                    ) : (
                      <p className="text-sm text-destructive">
                        {keyValidation.error}
                      </p>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
