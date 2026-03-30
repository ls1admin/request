import { format } from "date-fns";
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { getKeyTypeLabel, validateSSHKey } from "@/lib/validation/ssh-key";
import { sshKeysService } from "@/services/ssh-keys";
import type { StoredSSHKey } from "@/types/vm-request";

function maskPublicKey(publicKey: string): string {
  if (publicKey.length <= 40) {
    return publicKey;
  }

  return `${publicKey.slice(0, 28)}...${publicKey.slice(-16)}`;
}

export function SSHKeysPage() {
  const [keys, setKeys] = useState<StoredSSHKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>(
    {},
  );
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const keyValidation = useMemo(
    () => (publicKey ? validateSSHKey(publicKey) : null),
    [publicKey],
  );

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      setListError(null);

      try {
        const response = await sshKeysService.list();
        setKeys(response);
      } catch (loadError) {
        setListError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load SSH keys",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitMessage(null);
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedKey = publicKey.trim();

    if (!trimmedName || !trimmedKey) {
      setFormError("Name and public key are required.");
      return;
    }

    if (!keyValidation?.valid) {
      setFormError(
        keyValidation?.error ?? "Please enter a valid SSH public key.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const createdKey = await sshKeysService.create({
        name: trimmedName,
        publicKey: trimmedKey,
      });

      setKeys((currentKeys) => [createdKey, ...currentKeys]);
      setName("");
      setPublicKey("");
      setSubmitMessage("SSH key added.");
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to add SSH key.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const shouldDelete = window.confirm(
      "Delete this stored SSH key? This cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    setListError(null);
    setSubmitMessage(null);

    try {
      await sshKeysService.delete(id);
      setKeys((currentKeys) => currentKeys.filter((key) => key.id !== id));
      setSubmitMessage("SSH key deleted.");
    } catch (deleteError) {
      setListError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete SSH key.",
      );
    }
  }

  async function handleCopy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKeyId(id);
      window.setTimeout(() => {
        setCopiedKeyId((currentId) => (currentId === id ? null : currentId));
      }, 1500);
    } catch {
      setListError("Failed to copy SSH key to clipboard.");
    }
  }

  function toggleReveal(id: string) {
    setRevealedKeyIds((currentIds) => ({
      ...currentIds,
      [id]: !currentIds[id],
    }));
  }

  return (
    <PageLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Account
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Stored SSH Keys
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Manage reusable SSH public keys for VM requests and VM access
              requests.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Your keys</CardTitle>
                <CardDescription>
                  View fingerprints, reveal stored public keys, or remove old
                  entries.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {listError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action failed</AlertTitle>
                    <AlertDescription>{listError}</AlertDescription>
                  </Alert>
                ) : null}

                {submitMessage ? (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>Updated</AlertTitle>
                    <AlertDescription>{submitMessage}</AlertDescription>
                  </Alert>
                ) : null}

                {isLoading ? (
                  <div className="flex min-h-48 items-center justify-center">
                    <Spinner className="size-8 text-primary" />
                  </div>
                ) : keys.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center">
                    <KeyRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <h2 className="font-medium">No stored SSH keys yet</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add your first public key to reuse it across VM-related
                      request flows.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {keys.map((key) => {
                      const isRevealed = revealedKeyIds[key.id] ?? false;

                      return (
                        <div
                          key={key.id}
                          className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
                        >
                          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h2 className="font-semibold">{key.name}</h2>
                                <Badge variant="secondary">
                                  {getKeyTypeLabel(key.type)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Added {format(new Date(key.createdAt), "PP")}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleReveal(key.id)}
                              >
                                {isRevealed ? (
                                  <EyeOff className="mr-2 h-4 w-4" />
                                ) : (
                                  <Eye className="mr-2 h-4 w-4" />
                                )}
                                {isRevealed ? "Hide" : "Reveal"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCopy(key.id, key.publicKey)
                                }
                              >
                                {copiedKeyId === key.id ? (
                                  <Check className="mr-2 h-4 w-4" />
                                ) : (
                                  <Copy className="mr-2 h-4 w-4" />
                                )}
                                {copiedKeyId === key.id ? "Copied" : "Copy"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(key.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                              <p className="mb-1 font-medium">Fingerprint</p>
                              <p className="break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                                {key.fingerprint}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 font-medium">Public key</p>
                              <p className="break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                                {isRevealed
                                  ? key.publicKey
                                  : maskPublicKey(key.publicKey)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>Add a new key</CardTitle>
                <CardDescription>
                  Store a public key now and select it later in VM-related
                  request forms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Could not add SSH key</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="ssh-key-name"
                    >
                      Key name
                    </label>
                    <Input
                      id="ssh-key-name"
                      placeholder="My laptop"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="ssh-public-key"
                    >
                      Public key
                    </label>
                    <Textarea
                      id="ssh-public-key"
                      className="field-sizing-fixed min-h-40 font-mono text-sm"
                      placeholder="ssh-ed25519 AAAA... or ssh-rsa AAAA..."
                      value={publicKey}
                      onChange={(event) => setPublicKey(event.target.value)}
                    />
                    {keyValidation ? (
                      keyValidation.valid ? (
                        <p className="text-sm text-muted-foreground">
                          Valid {getKeyTypeLabel(keyValidation.keyType)} key
                          detected.
                        </p>
                      ) : (
                        <p className="text-sm text-destructive">
                          {keyValidation.error}
                        </p>
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        RSA 4096+, Ed25519, and ECDSA public keys are supported.
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Spinner className="mr-2 size-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add SSH Key
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
