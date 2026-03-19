import { z } from "zod";

// Project Types
export const projectTypes = ["ipraktikum", "thesis", "chair_project"] as const;
export type ProjectType = (typeof projectTypes)[number];

export const studyLevels = ["BA", "MA"] as const;
export type StudyLevel = (typeof studyLevels)[number];

export const protocols = ["tcp", "udp"] as const;
export type Protocol = (typeof protocols)[number];

// Default values
export const DEFAULT_CPU_CORES = 4;
export const DEFAULT_RAM_GB = 4;
export const DEFAULT_PORTS = [22, 80, 443] as const;

// Zod Schemas
export const hostnameSchema = z
  .string()
  .min(1, "Hostname is required")
  .max(63, "Hostname must be at most 63 characters")
  .regex(
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/,
    "Hostname must be lowercase alphanumeric with hyphens, no leading/trailing hyphens",
  );

// These schemas validate the required fields when the project type is selected
export const ipraktikumSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  coachName: z.string().min(1, "Coach name is required"),
});

export const thesisSchema = z.object({
  studyLevel: z.enum(studyLevels, "Study level is required"),
  title: z.string().min(1, "Thesis title is required"),
  advisor: z.string().min(1, "Advisor name is required"),
});

export const chairProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(1, "Project description is required"),
  responsiblePerson: z.string().optional(),
});

// Partial schemas for form state - allows empty values when project type is not selected
const ipraktikumPartialSchema = z
  .object({
    teamName: z.string().optional(),
    coachName: z.string().optional(),
  })
  .optional();

const thesisPartialSchema = z
  .object({
    studyLevel: z.enum(studyLevels).optional(),
    title: z.string().optional(),
    advisor: z.string().optional(),
  })
  .optional();

const chairProjectPartialSchema = z
  .object({
    projectName: z.string().optional(),
    projectDescription: z.string().optional(),
    responsiblePerson: z.string().optional(),
  })
  .optional();

export const additionalPortSchema = z.object({
  port: z
    .number()
    .int()
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535"),
  protocol: z.enum(protocols),
  reason: z.string().min(1, "Reason is required for additional ports"),
});

export const resourcesSchema = z
  .object({
    cpuCores: z
      .number()
      .int()
      .min(1, "At least 1 CPU core required")
      .max(32, "Maximum 32 CPU cores"),
    ramGB: z
      .number()
      .int()
      .min(1, "At least 1 GB RAM required")
      .max(64, "Maximum 64 GB RAM"),
    justification: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.cpuCores > DEFAULT_CPU_CORES || data.ramGB > DEFAULT_RAM_GB) {
        return !!data.justification && data.justification.trim().length > 0;
      }
      return true;
    },
    {
      message:
        "Justification is required when requesting more than default resources",
      path: ["justification"],
    },
  );

export const firewallSchema = z.object({
  defaultPorts: z.boolean().default(true),
  additionalPorts: z.array(additionalPortSchema).default([]),
});

export const sshKeySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("existing"),
    keyId: z.string().min(1, "Please select an SSH key"),
  }),
  z.object({
    type: z.literal("new"),
    name: z.string().min(1, "SSH key name is required"),
    publicKey: z.string().min(1, "SSH public key is required"),
  }),
]);

// Base schema without project-specific fields
const baseVMRequestSchema = z.object({
  hostname: hostnameSchema,
  description: z.string().min(10, "Description must be at least 10 characters"),
  projectType: z.enum(projectTypes, "Project type is required"),
  resources: resourcesSchema,
  firewall: firewallSchema,
  additionalUsers: z.array(z.string().min(1, "Username cannot be empty")),
  sshKey: sshKeySchema,
  additionalComments: z.string().optional(),
});

// Helper to add validation errors for project-specific fields
const addProjectFieldErrors = (
  data: {
    projectType: ProjectType;
    ipraktikum?: { teamName?: string; coachName?: string };
    thesis?: { studyLevel?: string; title?: string; advisor?: string };
    chairProject?: {
      projectName?: string;
      projectDescription?: string;
      responsiblePerson?: string;
    };
  },
  ctx: z.RefinementCtx,
) => {
  if (data.projectType === "ipraktikum") {
    if (!data.ipraktikum?.teamName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Team name is required",
        path: ["ipraktikum", "teamName"],
      });
    }
    if (!data.ipraktikum?.coachName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Coach name is required",
        path: ["ipraktikum", "coachName"],
      });
    }
  }

  if (data.projectType === "thesis") {
    if (!data.thesis?.studyLevel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Study level is required",
        path: ["thesis", "studyLevel"],
      });
    }
    if (!data.thesis?.title?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thesis title is required",
        path: ["thesis", "title"],
      });
    }
    if (!data.thesis?.advisor?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Advisor name is required",
        path: ["thesis", "advisor"],
      });
    }
  }

  if (data.projectType === "chair_project") {
    if (!data.chairProject?.projectName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project name is required",
        path: ["chairProject", "projectName"],
      });
    }
    if (!data.chairProject?.projectDescription?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project description is required",
        path: ["chairProject", "projectDescription"],
      });
    }
  }
};

// Full schema with conditional project fields
export const vmRequestSchema = baseVMRequestSchema
  .extend({
    ipraktikum: ipraktikumPartialSchema,
    thesis: thesisPartialSchema,
    chairProject: chairProjectPartialSchema,
  })
  .superRefine(addProjectFieldErrors);

export type VMRequest = z.infer<typeof vmRequestSchema>;
export type IPraktikum = z.infer<typeof ipraktikumSchema>;
export type Thesis = z.infer<typeof thesisSchema>;
export type ChairProject = z.infer<typeof chairProjectSchema>;
export type Resources = z.infer<typeof resourcesSchema>;
export type Firewall = z.infer<typeof firewallSchema>;
export type AdditionalPort = z.infer<typeof additionalPortSchema>;
export type SSHKey = z.infer<typeof sshKeySchema>;

// Form step schemas for step-by-step validation
export const basicInfoStepSchema = z
  .object({
    hostname: hostnameSchema,
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    projectType: z.enum(projectTypes, "Project type is required"),
    ipraktikum: ipraktikumPartialSchema,
    thesis: thesisPartialSchema,
    chairProject: chairProjectPartialSchema,
  })
  .superRefine(addProjectFieldErrors);

export const resourcesStepSchema = resourcesSchema;
export const firewallStepSchema = firewallSchema;
export const usersStepSchema = z.object({
  additionalUsers: z.array(z.string().min(1, "Username cannot be empty")),
});
export const sshKeyStepSchema = z.object({
  sshKey: sshKeySchema,
});
export const reviewStepSchema = z.object({
  additionalComments: z.string().optional(),
});

// Default form values
export const defaultVMRequestValues: Partial<VMRequest> = {
  hostname: "",
  description: "",
  projectType: undefined,
  resources: {
    cpuCores: DEFAULT_CPU_CORES,
    ramGB: DEFAULT_RAM_GB,
    justification: "",
  },
  firewall: {
    defaultPorts: true,
    additionalPorts: [],
  },
  additionalUsers: [],
  sshKey: {
    type: "new",
    name: "",
    publicKey: "",
  },
  additionalComments: "",
};

// SSH Key types for mocked API
export interface StoredSSHKey {
  id: string;
  name: string;
  fingerprint: string;
  type: "rsa" | "ed25519" | "ecdsa";
  createdAt: string;
}
