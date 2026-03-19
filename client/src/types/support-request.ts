import { z } from "zod";

// Support categories
export const supportCategories = [
  "bug",
  "feature_request",
  "question",
  "other",
] as const;
export type SupportCategory = (typeof supportCategories)[number];

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  bug: "Bug Report",
  feature_request: "Feature Request",
  question: "Question",
  other: "Other",
};

// Schemas for authenticated vs anonymous
const loggedInSupportRequestSchema = z.object({
  isLoggedIn: z.literal(true),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(supportCategories, "Please select a category"),
});

const anonymousSupportRequestSchema = z.object({
  isLoggedIn: z.literal(false),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  tumId: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(supportCategories, "Please select a category"),
});

export const supportRequestSchema = z.discriminatedUnion("isLoggedIn", [
  loggedInSupportRequestSchema,
  anonymousSupportRequestSchema,
]);

export type SupportRequest = z.infer<typeof supportRequestSchema>;

export const getDefaultSupportRequestValues = (
  isLoggedIn: boolean,
): Partial<SupportRequest> => {
  if (isLoggedIn) {
    return {
      isLoggedIn: true,
      subject: "",
      description: "",
      category: undefined,
    };
  }
  return {
    isLoggedIn: false,
    fullName: "",
    email: "",
    tumId: "",
    subject: "",
    description: "",
    category: undefined,
  };
};
