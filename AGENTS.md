# University Resource Request System

## Project Overview

A modern, user-friendly web application for requesting resources at a university chair. The system provides well-structured, validated forms to collect all necessary information from users efficiently. Call the System **AET Request**.

## Tech Stack

### Frontend

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Code Quality**: Biome 2.3.8

### Project Structure

```
request-v2/
└── client/
    ├── src/
    │   ├── components/      # React components
    │   │   └── ui/          # shadcn/ui components
    │   ├── lib/             # Utility functions
    │   ├── hooks/           # Custom React hooks
    │   ├── assets/          # Static assets
    │   ├── App.tsx          # Main app component
    │   ├── main.tsx         # Application entry point
    │   └── index.css        # Global styles and Tailwind directives
    ├── public/              # Static public assets
    ├── biome.json           # Biome configuration
    ├── components.json      # shadcn/ui configuration
    ├── tsconfig.json        # TypeScript configuration
    └── vite.config.ts       # Vite configuration
```

## Development Setup

### Prerequisites

- Node.js (compatible with React 19)
- npm or pnpm

### Installation

```bash
cd client
npm install
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format code
npm run lint
```

## Code Standards

### Biome Configuration

- **Formatter**: Enabled with 2-space indentation
- **Linter**: Enabled with recommended rules
- **Quote Style**: Double quotes
- **Auto Import Organization**: Enabled
- **Tailwind Directives**: CSS parser support enabled

### TypeScript

- Strict mode enabled
- Path aliases configured:
  - `@/components` → `src/components`
  - `@/lib` → `src/lib`
  - `@/hooks` → `src/hooks`
  - `@/ui` → `src/components/ui`

### UI Component Guidelines

#### shadcn/ui Configuration

- **Style**: New York
- **Base Color**: Slate
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React
- **Framework**: React (non-RSC)

#### Component Installation

```bash
npx shadcn@latest add [component-name]
```

#### Always Use shadcn Components

When building UI, always check if a shadcn component exists before creating custom components:
- Forms: Use Form (with React Hook Form and Zod), Field, Input, Input Group, Label, Textarea, Select, Checkbox, Radio, Switch, etc.
- Layout: Use Card, Separator, Tabs, Accordion, Sheet, Dialog, Item, Container, etc.
- Feedback: Use Alert, Toast, Badge, Progress, Skeleton, etc.
- Navigation: Use Button, Navigation Menu, Breadcrumb, Dropdown Menu, Button Group, etc.
- Data Display: Use Table, Avatar, Calendar, Command, Empty, Spinner, etc.

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS variables for theme colors (defined in index.css)
- Leverage Tailwind's design system for consistency

## Project Goals

### Core Principles

1. **User Experience**: Clean, intuitive interface that guides users through the request process
2. **Accessibility**: WCAG compliant, keyboard navigable, screen reader friendly
3. **Validation**: Comprehensive client-side validation with clear error messages
4. **Maintainability**: Well-structured, documented code following React best practices
5. **Performance**: Fast load times, optimized bundle size, efficient rendering

### Features to Implement

- Multi-step resource request forms
- Form validation with helpful error messages
- Dynamic form fields based on request type
- Request status tracking
- Responsive design for all devices
- Form data persistence (local storage)
- File upload capabilities
- Confirmation and success screens

## Form Design Principles

### Validation Strategy

- Real-time validation feedback (on blur)
- Clear, actionable error messages
- Visual indicators for required fields
- Inline validation for complex fields
- Summary of errors before submission

### User Experience

- Progressive disclosure (show relevant fields based on selections)
- Auto-save drafts
- Clear progress indicators for multi-step forms
- Confirmation before submission
- Success feedback with next steps

## Best Practices

### Component Architecture

- Keep components small and focused
- Use composition over inheritance
- Implement proper prop typing with TypeScript
- Separate business logic from presentation
- Use custom hooks for shared logic

### State Management

- Keep state as local as possible
- Use React hooks (useState, useReducer) for local state
- Consider context API for global state if needed
- Avoid prop drilling with proper component composition

### Performance

- Lazy load routes and heavy components
- Optimize images and assets
- Use React.memo for expensive components
- Implement proper loading states
- Minimize re-renders
- Avoid unnecessary use of useEffect (You Might Not Need an Effect)

### Code Organization

- One component per file
- Group related components in folders
- Keep utility functions in lib/
- Use custom hooks for reusable logic
- Follow consistent naming conventions

## Dependencies

### Core Dependencies

- react, react-dom: UI framework
- @tailwindcss/vite: Styling integration
- lucide-react: Icon library
- clsx, tailwind-merge: Utility classes
- class-variance-authority: Component variants

### Development Dependencies

- @biomejs/biome: Linting and formatting
- @vitejs/plugin-react: React support for Vite
- TypeScript and type definitions
- tw-animate-css: Animation utilities

## Form Implementation Patterns

This project uses consistent patterns for implementing request forms. Follow these patterns when creating new forms.

### File Structure for Forms

```text
src/
├── types/
│   └── {form-name}-request.ts      # Zod schemas and TypeScript types
├── components/
│   └── {form-name}-request/
│       ├── {FormName}RequestForm.tsx    # Main form component
│       ├── StepProgress.tsx             # Step indicator (multi-step only)
│       └── steps/                       # Step components (multi-step only)
│           ├── Step1.tsx
│           ├── Step2.tsx
│           └── ReviewStep.tsx
├── pages/
│   └── {FormName}RequestPage.tsx   # Page wrapper with submit handling
└── lib/
    └── api.ts                      # API submission functions
```

### Types and Validation (Zod)

Create schemas in `src/types/{form-name}-request.ts`:

```typescript
import { z } from "zod";

// Define field schemas
const fieldSchema = z.string().min(1, "Field is required");

// For forms with different flows (logged in vs anonymous):
const loggedInSchema = z.object({
  isLoggedIn: z.literal(true),
  // ... fields for logged-in users
});

const anonymousSchema = z.object({
  isLoggedIn: z.literal(false),
  // ... additional fields for anonymous users
});

// Use discriminatedUnion for conditional schemas
export const formSchema = z.discriminatedUnion("isLoggedIn", [
  loggedInSchema,
  anonymousSchema,
]);

// Use superRefine for cross-field validation
export const formSchemaWithCrossValidation = formSchema.superRefine((data, ctx) => {
  if (data.someField === "other" && !data.otherField?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify details",
      path: ["otherField"],
    });
  }
});

// Export type and default values
export type FormRequest = z.infer<typeof formSchema>;
export const getDefaultValues = (isLoggedIn: boolean): Partial<FormRequest> => ({...});
```

### Multi-Step Form Pattern

Used for complex forms (VM Request, Artemis Request, TUM Guest Request):

```typescript
// Form component structure
export function RequestForm({ onSubmit, isSubmitting }: Props) {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = isAuthenticated ? STEPS_LOGGED_IN : STEPS_ANONYMOUS;

  const form = useForm<FormRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(isAuthenticated),
    mode: "onChange",
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    // Validate only fields relevant to current step
    const result = stepSchema.safeParse(form.getValues());
    if (!result.success) {
      // Set errors on form
      return false;
    }
    return true;
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StepProgress steps={steps} currentStep={currentStep} />
        {renderCurrentStep()}
        <NavigationButtons />
      </form>
    </FormProvider>
  );
}
```

### Single-Page Form Pattern

Used for simple forms (VM Access Request):

```typescript
export function SimpleRequestForm({ onSubmit, isSubmitting }: Props) {
  const form = useForm<FormRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Form Title</CardTitle></CardHeader>
          <CardContent>
            <FormField ... />
          </CardContent>
        </Card>
        <Button type="submit" disabled={isSubmitting}>Submit</Button>
      </form>
    </FormProvider>
  );
}
```

### Page Wrapper Pattern

Each form has a page component handling submission and result states:

```typescript
export function RequestPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    requestId?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (data: FormRequest) => {
    setIsSubmitting(true);
    try {
      const response = await submitRequest({
        ...data,
        user: isAuthenticated && user ? { id: user.id, ... } : undefined,
      });
      setSubmitResult({ success: true, requestId: response.data.requestId });
    } catch {
      setSubmitResult({ success: false, error: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render success state, error state, or form
  if (submitResult?.success) return <SuccessCard />;
  if (submitResult?.success === false) return <ErrorCard />;
  return <RequestForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
}
```

### API Functions Pattern

Add submission functions to `src/lib/api.ts`:

```typescript
export type RequestSubmission = FormRequest & {
  user?: {
    id: string;
    email: string | null;
    username: string | null;
    fullName: string | null;
  };
};

export async function submitRequest(
  request: RequestSubmission,
): Promise<APIResponse<{ requestId: string }>> {
  // Currently mocked - will connect to real backend
  await delay(MOCK_DELAY);
  console.log(`[MOCK API] POST ${API_BASE_URL}/requests`);
  return { success: true, data: { requestId: `req-${Date.now()}` } };
}
```

### Routing Pattern

Add routes in `src/App.tsx`:

```typescript
// Protected route (requires authentication)
<Route
  path="/request/vm"
  element={
    <ProtectedRoute>
      <VMRequestPage />
    </ProtectedRoute>
  }
/>

// Public route (anonymous access allowed)
<Route
  path="/request/tum-guest"
  element={<TUMGuestRequestPage />}
/>
```

### Authentication-Aware Forms

For forms that behave differently based on login status:

1. Use `useAuth()` hook to get `isAuthenticated` and `user`
2. Use `z.discriminatedUnion("isLoggedIn", [...])` for conditional schemas
3. Show different steps/fields based on `isAuthenticated`
4. Include user info in submission when authenticated

### Existing Forms Reference

| Form | Route | Auth Required | Type |
|------|-------|---------------|------|
| VM Request | `/request/vm` | Yes | Multi-step |
| VM Access Request | `/request/vm-access` | Yes | Single-page |
| Artemis Developer | `/request/artemis` | No* | Multi-step |
| TUM Guest Account | `/request/tum-guest` | No | Multi-step |

*Artemis form works for both authenticated and anonymous users with different flows.

## Notes for AI Assistant

### When Adding Features

1. Always check if a shadcn component exists first
2. Use TypeScript interfaces for all props and data structures
3. Implement proper form validation
4. Follow the established folder structure
5. Use Biome for all formatting (npm run lint)
6. Test responsive design at mobile, tablet, and desktop sizes
7. Ensure accessibility (ARIA labels, keyboard navigation)

### Common Tasks

- **Add new form field**: Use shadcn Form components with validation
- **New page/route**: Consider React Router setup
- **API integration**: Plan for fetch/axios with TypeScript types
- **Form state**: Use React Hook Form or similar for complex forms
- **Styling**: Use Tailwind utilities, refer to theme in index.css

### Code Quality Checklist

- [ ] TypeScript types defined
- [ ] Components properly typed
- [ ] Biome lint passes
- [ ] Responsive design implemented
- [ ] Accessibility considered
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Form validation working
- [ ] shadcn components used where applicable
