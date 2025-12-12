import { format } from "date-fns";
import { AlertTriangle, CalendarIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepHeader } from "@/components/ui/step-header";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  GENDER_LABELS,
  genders,
  type TUMGuestRequest,
} from "@/types/tum-guest-request";

// Common nationalities with labels
const NATIONALITY_OPTIONS = [
  { value: "german", label: "German" },
  { value: "austrian", label: "Austrian" },
  { value: "swiss", label: "Swiss" },
  { value: "american", label: "American" },
  { value: "british", label: "British" },
  { value: "french", label: "French" },
  { value: "italian", label: "Italian" },
  { value: "spanish", label: "Spanish" },
  { value: "dutch", label: "Dutch" },
  { value: "polish", label: "Polish" },
  { value: "chinese", label: "Chinese" },
  { value: "indian", label: "Indian" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "brazilian", label: "Brazilian" },
  { value: "mexican", label: "Mexican" },
  { value: "canadian", label: "Canadian" },
  { value: "australian", label: "Australian" },
  { value: "russian", label: "Russian" },
  { value: "turkish", label: "Turkish" },
  { value: "other", label: "Other" },
];

export function GuestInfoStep() {
  const form = useFormContext<TUMGuestRequest>();
  const { isAuthenticated } = useAuth();
  const nationality = form.watch("nationality");

  return (
    <div className="space-y-6">
      <StepHeader
        title="Guest Information"
        description={
          isAuthenticated
            ? "Enter the guest's personal information."
            : "Enter your personal information."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>External Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="john.doe@example.com"
                {...field}
              />
            </FormControl>
            <FormDescription>
              The guest's external (non-TUM) email address.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="birthDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date of Birth</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) =>
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                  }
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  defaultMonth={new Date(1990, 0)}
                  captionLayout="dropdown"
                  fromYear={1940}
                  toYear={new Date().getFullYear() - 16}
                />
              </PopoverContent>
            </Popover>
            <FormDescription>
              Must match the guest's official documents exactly.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genders.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {GENDER_LABELS[gender]}
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
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NATIONALITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {nationality === "other" && (
        <FormField
          control={form.control}
          name={"nationalityOther" as keyof TUMGuestRequest}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify nationality</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter nationality"
                  {...field}
                  value={(field.value as string) || ""}
                />
              </FormControl>
              <FormDescription>
                Must match the guest's official documents exactly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {!isAuthenticated && (
        <FormField
          control={form.control}
          name={"contactPerson" as keyof TUMGuestRequest}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person at TUM</FormLabel>
              <FormControl>
                <Input
                  placeholder="Name of your TUM contact"
                  {...field}
                  value={(field.value as string) || ""}
                />
              </FormControl>
              <FormDescription>
                A TUM member who can confirm your guest account request.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Please ensure the date of birth and nationality are entered correctly.
          These details are required for TUM guest account creation and
          successful login. Incorrect information will prevent account
          activation.
        </AlertDescription>
      </Alert>
    </div>
  );
}
