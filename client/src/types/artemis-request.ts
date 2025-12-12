import { z } from "zod";

// Subteam options
export const subteams = [
  "apollon",
  "ares",
  "athena",
  "atlas",
  "communication",
  "hephaestus",
  "hyperion",
  "iris",
  "lectures",
  "logos",
  "lti",
  "mobile-apps",
  "operations",
  "plagiarism",
  "programming",
  "quiz",
  "other",
] as const;
export type Subteam = (typeof subteams)[number];

export const SUBTEAM_LABELS: Record<Subteam, string> = {
  apollon: "Apollon",
  ares: "Ares",
  athena: "Athena",
  atlas: "Atlas",
  communication: "Communication",
  hephaestus: "Hephaestus",
  hyperion: "Hyperion",
  iris: "Iris",
  lectures: "Lectures",
  logos: "Logos",
  lti: "LTI",
  "mobile-apps": "Mobile Apps",
  operations: "Operations",
  plagiarism: "Plagiarism",
  programming: "Programming",
  quiz: "Quiz",
  other: "Other",
};

// GitHub user info from API
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  html_url: string;
}

export interface GitHubVerificationResult {
  valid: boolean;
  user?: GitHubUser;
  error?: string;
  warnings: string[];
}

// Zod schemas
export const githubUsernameSchema = z
  .string()
  .min(1, "GitHub username is required")
  .max(39, "GitHub username must be at most 39 characters")
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
    "Invalid GitHub username format",
  );

export const emailSchema = z.string().email("Please enter a valid email");

// Base schema for logged-in users
const loggedInArtemisRequestSchema = z.object({
  isLoggedIn: z.literal(true),
  githubUsername: githubUsernameSchema,
  profileAcknowledgment: z.literal(
    true,
    "You must acknowledge the profile requirements",
  ),
  slackEmail: emailSchema,
  contactPerson: z.string().min(1, "Contact person is required"),
  advisor: z.string().min(1, "Advisor is required"),
  subteams: z
    .array(z.enum(subteams))
    .min(1, "Please select at least one subteam"),
  otherSubteam: z.string().optional(),
  additionalComments: z.string().optional(),
});

// Schema for anonymous users (not logged in)
const anonymousArtemisRequestSchema = z.object({
  isLoggedIn: z.literal(false),
  name: z.string().min(1, "Name is required"),
  mainEmail: emailSchema,
  githubUsername: githubUsernameSchema,
  profileAcknowledgment: z.literal(
    true,
    "You must acknowledge the profile requirements",
  ),
  slackEmail: emailSchema,
  contactPerson: z.string().min(1, "Contact person is required"),
  advisor: z.string().min(1, "Advisor is required"),
  subteams: z
    .array(z.enum(subteams))
    .min(1, "Please select at least one subteam"),
  otherSubteam: z.string().optional(),
  additionalComments: z.string().optional(),
});

// Combined schema with conditional validation for "other" subteam
export const artemisRequestSchema = z
  .discriminatedUnion("isLoggedIn", [
    loggedInArtemisRequestSchema,
    anonymousArtemisRequestSchema,
  ])
  .superRefine((data, ctx) => {
    if (data.subteams.includes("other") && !data.otherSubteam?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the subteam",
        path: ["otherSubteam"],
      });
    }
  });

export type ArtemisRequest = z.infer<typeof artemisRequestSchema>;
export type LoggedInArtemisRequest = z.infer<
  typeof loggedInArtemisRequestSchema
>;
export type AnonymousArtemisRequest = z.infer<
  typeof anonymousArtemisRequestSchema
>;

// Form step schemas
export const githubStepSchema = z.object({
  githubUsername: githubUsernameSchema,
});

export const contactStepSchema = z
  .object({
    slackEmail: emailSchema,
    contactPerson: z.string().min(1, "Contact person is required"),
    advisor: z.string().min(1, "Advisor is required"),
    subteams: z
      .array(z.enum(subteams))
      .min(1, "Please select at least one subteam"),
    otherSubteam: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.subteams.includes("other")) {
        return !!data.otherSubteam?.trim();
      }
      return true;
    },
    {
      message: "Please specify the subteam",
      path: ["otherSubteam"],
    },
  );

export const anonymousInfoStepSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mainEmail: emailSchema,
});

// Default values
export const getDefaultArtemisRequestValues = (
  isLoggedIn: boolean,
  userEmail?: string,
): Partial<ArtemisRequest> => {
  if (isLoggedIn) {
    return {
      isLoggedIn: true,
      githubUsername: "",
      profileAcknowledgment: undefined,
      slackEmail: userEmail ?? "",
      contactPerson: "",
      advisor: "",
      subteams: [],
      otherSubteam: "",
      additionalComments: "",
    };
  }
  return {
    isLoggedIn: false,
    name: "",
    mainEmail: "",
    githubUsername: "",
    profileAcknowledgment: undefined,
    slackEmail: "",
    contactPerson: "",
    advisor: "",
    subteams: [],
    otherSubteam: "",
    additionalComments: "",
  };
};
