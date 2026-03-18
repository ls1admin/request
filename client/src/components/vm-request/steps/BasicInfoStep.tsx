import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
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
import { StepHeader } from "@/components/ui/step-header";
import { Textarea } from "@/components/ui/textarea";
import {
  type ProjectType,
  projectTypes,
  studyLevels,
  type VMRequest,
} from "@/types/vm-request";

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  ipraktikum: "iPraktikum",
  thesis: "Thesis",
  chair_project: "Chair Project",
};

export function BasicInfoStep() {
  const form = useFormContext<VMRequest>();
  const selectedProjectType = form.watch("projectType");
  const previousProjectType = useRef<ProjectType | undefined>(
    selectedProjectType,
  );

  // Clear errors for other project types when switching
  useEffect(() => {
    if (
      previousProjectType.current !== undefined &&
      previousProjectType.current !== selectedProjectType
    ) {
      // Clear errors for all project-specific fields
      form.clearErrors(["ipraktikum", "thesis", "chairProject"]);
    }
    previousProjectType.current = selectedProjectType;
  }, [selectedProjectType, form]);

  return (
    <div className="space-y-6">
      <StepHeader
        title="Basic Information"
        description="Enter the basic details for your VM request."
      />

      <FormField
        control={form.control}
        name="hostname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hostname</FormLabel>
            <FormControl>
              <Input placeholder="my-vm-name" {...field} />
            </FormControl>
            <FormDescription>
              Lowercase alphanumeric with hyphens. Max 63 characters.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what this VM will be used for..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Provide a clear description of the VM&apos;s purpose.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="projectType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                {projectTypes.map((type) => (
                  <div key={type}>
                    <RadioGroupItem
                      value={type}
                      id={type}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type}
                      className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      {PROJECT_TYPE_LABELS[type]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* iPraktikum Fields */}
      {selectedProjectType === "ipraktikum" && (
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">iPraktikum Details</h3>

          <FormField
            control={form.control}
            name="ipraktikum.teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter team name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ipraktikum.coachName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coach Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter coach name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Thesis Fields */}
      {selectedProjectType === "thesis" && (
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Thesis Details</h3>

          <FormField
            control={form.control}
            name="thesis.studyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Study Level</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-4"
                  >
                    {studyLevels.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <RadioGroupItem value={level} id={`level-${level}`} />
                        <Label htmlFor={`level-${level}`}>{level}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thesis.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thesis Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter thesis title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thesis.advisor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advisor</FormLabel>
                <FormControl>
                  <Input placeholder="Enter advisor name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Chair Project Fields */}
      {selectedProjectType === "chair_project" && (
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Chair Project Details</h3>

          <FormField
            control={form.control}
            name="chairProject.projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chairProject.projectDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the chair project..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chairProject.responsiblePerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsible Person (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter responsible person" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
