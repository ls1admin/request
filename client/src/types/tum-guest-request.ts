import { z } from "zod";

// Guest types
export const guestTypes = ["ipraktikum-customer", "artemis", "other"] as const;

export type GuestType = (typeof guestTypes)[number];

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  "ipraktikum-customer": "iPraktikum Customer",
  artemis: "Artemis",
  other: "Other",
};

// Gender options
export const genders = ["male", "female", "diverse"] as const;
export type Gender = (typeof genders)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  diverse: "Diverse",
};

// Common nationalities (can be extended)
export const commonNationalities = [
  "german",
  "austrian",
  "swiss",
  "american",
  "british",
  "french",
  "italian",
  "spanish",
  "chinese",
  "indian",
  "other",
] as const;

// Email validation
const emailSchema = z.string().email("Please enter a valid email address");

// Date validation for birth date
const birthDateSchema = z.string().refine(
  (val) => {
    if (!val) return false;
    const date = new Date(val);
    // Must be a valid date in the past, and person must be at least 16
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 16);
    return date < minAge && date > new Date("1900-01-01");
  },
  {
    message:
      "Please enter a valid date of birth (must be at least 16 years old)",
  },
);

// iPraktikum customer fields
const ipraktikumFieldsSchema = z.object({
  teamName: z.string().optional(),
  coachName: z.string().optional(),
});

// Artemis fields
const artemisFieldsSchema = z.object({
  universityOrCompany: z.string().optional(),
});

// Other fields
const otherFieldsSchema = z.object({
  reason: z.string().optional(),
});

// Base guest info schema
const guestInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailSchema,
  birthDate: birthDateSchema,
  gender: z.enum(genders, { message: "Please select a gender" }),
  nationality: z.string().min(1, "Nationality is required"),
  nationalityOther: z.string().optional(),
});

// Schema for logged-in users (requesting for someone else)
const loggedInGuestRequestSchema = z
  .object({
    isLoggedIn: z.literal(true),
    requestingForSelf: z.literal(false), // Logged-in users always request for someone else
    guestType: z.enum(guestTypes, { message: "Please select a guest type" }),
    // Guest type specific fields (optional, validated via superRefine)
    ipraktikumFields: ipraktikumFieldsSchema.optional(),
    artemisFields: artemisFieldsSchema.optional(),
    otherFields: otherFieldsSchema.optional(),
    additionalComments: z.string().optional(),
  })
  .merge(guestInfoSchema);

// Schema for anonymous users
const anonymousGuestRequestSchema = z
  .object({
    isLoggedIn: z.literal(false),
    requestingForSelf: z.boolean(),
    contactPerson: z.string().min(1, "Contact person at TUM is required"),
    guestType: z.enum(guestTypes, { message: "Please select a guest type" }),
    // Guest type specific fields
    ipraktikumFields: ipraktikumFieldsSchema.optional(),
    artemisFields: artemisFieldsSchema.optional(),
    otherFields: otherFieldsSchema.optional(),
    additionalComments: z.string().optional(),
  })
  .merge(guestInfoSchema);

// Combined schema
export const tumGuestRequestSchema = z
  .discriminatedUnion("isLoggedIn", [
    loggedInGuestRequestSchema,
    anonymousGuestRequestSchema,
  ])
  .superRefine((data, ctx) => {
    // Validate guest type specific fields
    if (data.guestType === "ipraktikum-customer") {
      if (!data.ipraktikumFields?.teamName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Team name is required for iPraktikum Customer",
          path: ["ipraktikumFields", "teamName"],
        });
      }
      if (!data.ipraktikumFields?.coachName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Coach/PL name is required for iPraktikum Customer",
          path: ["ipraktikumFields", "coachName"],
        });
      }
    }

    if (data.guestType === "artemis") {
      if (!data.artemisFields?.universityOrCompany?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "University or company is required for Artemis",
          path: ["artemisFields", "universityOrCompany"],
        });
      }
    }

    if (data.guestType === "other") {
      if (
        !data.otherFields?.reason?.trim() ||
        data.otherFields.reason.length < 10
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please provide a detailed reason (at least 10 characters)",
          path: ["otherFields", "reason"],
        });
      }
    }

    // Validate nationality other field
    if (data.nationality === "other" && !data.nationalityOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify nationality",
        path: ["nationalityOther"],
      });
    }
  });

export type TUMGuestRequest = z.infer<typeof tumGuestRequestSchema>;

// Step schemas for validation
export const guestInfoStepSchema = guestInfoSchema.superRefine((data, ctx) => {
  if (data.nationality === "other" && !data.nationalityOther?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify nationality",
      path: ["nationalityOther"],
    });
  }
});

export const guestTypeStepSchema = z
  .object({
    guestType: z.enum(guestTypes, { message: "Please select a guest type" }),
    ipraktikumFields: ipraktikumFieldsSchema.optional(),
    artemisFields: artemisFieldsSchema.optional(),
    otherFields: otherFieldsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.guestType === "ipraktikum-customer") {
      if (!data.ipraktikumFields?.teamName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Team name is required",
          path: ["ipraktikumFields", "teamName"],
        });
      }
      if (!data.ipraktikumFields?.coachName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Coach/PL name is required",
          path: ["ipraktikumFields", "coachName"],
        });
      }
    }
    if (data.guestType === "artemis") {
      if (!data.artemisFields?.universityOrCompany?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "University or company is required",
          path: ["artemisFields", "universityOrCompany"],
        });
      }
    }
    if (data.guestType === "other") {
      if (
        !data.otherFields?.reason?.trim() ||
        data.otherFields.reason.length < 10
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please provide a detailed reason",
          path: ["otherFields", "reason"],
        });
      }
    }
  });

export const contactStepSchema = z.object({
  contactPerson: z.string().min(1, "Contact person at TUM is required"),
});

// Default values
export const getDefaultTUMGuestRequestValues = (
  isLoggedIn: boolean,
): Partial<TUMGuestRequest> => {
  if (isLoggedIn) {
    return {
      isLoggedIn: true,
      requestingForSelf: false, // Logged-in users always request for someone else
      firstName: "",
      lastName: "",
      email: "",
      birthDate: "",
      gender: undefined,
      nationality: "",
      nationalityOther: "",
      guestType: undefined,
      additionalComments: "",
    };
  }
  return {
    isLoggedIn: false,
    requestingForSelf: true,
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    gender: undefined,
    nationality: "",
    nationalityOther: "",
    contactPerson: "",
    guestType: undefined,
    additionalComments: "",
  };
};
