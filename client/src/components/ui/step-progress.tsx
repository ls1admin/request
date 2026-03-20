import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepProgressProps {
  steps: readonly Step[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex w-full items-start">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "flex items-start",
              index !== steps.length - 1 ? "flex-1" : "",
            )}
          >
            {/* Step with circle and label */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium sm:h-8 sm:w-8 sm:text-sm",
                  step.id < currentStep &&
                    "border-primary bg-primary text-primary-foreground",
                  step.id === currentStep &&
                    "border-primary bg-background text-primary",
                  step.id > currentStep &&
                    "border-muted-foreground/30 bg-background text-muted-foreground",
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  step.id
                )}
              </div>
              {/* Label centered under the circle */}
              <div className="mt-2 hidden text-center sm:block">
                <span
                  className={cn(
                    "text-sm font-medium",
                    step.id <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.name}
                </span>
              </div>
            </div>
            {/* Connector line */}
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "mt-3.5 h-0.5 flex-1 sm:mt-4",
                  step.id < currentStep ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </li>
        ))}
      </ol>
      {/* Mobile step indicator */}
      <div className="mt-4 text-center sm:hidden">
        <span className="text-sm font-medium">
          Step {currentStep} of {steps.length}:{" "}
          {steps.find((s) => s.id === currentStep)?.name}
        </span>
      </div>
    </nav>
  );
}
