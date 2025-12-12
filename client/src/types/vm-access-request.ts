import { z } from "zod";

import { sshKeySchema } from "./vm-request";

// Zod schemas
export const hostnameSchema = z
  .string()
  .min(1, "Hostname is required")
  .max(63, "Hostname must be at most 63 characters")
  .regex(
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/,
    "Hostname must be lowercase alphanumeric with hyphens, no leading/trailing hyphens",
  );

export const vmAccessRequestSchema = z.object({
  hostname: hostnameSchema,
  justification: z
    .string()
    .min(
      10,
      "Please provide a detailed justification (at least 10 characters)",
    ),
  contactPerson: z.string().optional(),
  sshKey: sshKeySchema,
});

export type VMAccessRequest = z.infer<typeof vmAccessRequestSchema>;

// Step validation schemas
export const accessDetailsStepSchema = z.object({
  hostname: hostnameSchema,
  justification: z
    .string()
    .min(
      10,
      "Please provide a detailed justification (at least 10 characters)",
    ),
  contactPerson: z.string().optional(),
});

export const sshKeyStepSchema = z.object({
  sshKey: sshKeySchema,
});

// Default values
export const defaultVMAccessRequestValues: Partial<VMAccessRequest> = {
  hostname: "",
  justification: "",
  contactPerson: "",
  sshKey: {
    type: "new",
    name: "",
    publicKey: "",
  },
};
