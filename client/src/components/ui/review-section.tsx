import type { ReactNode } from "react";

interface ReviewSectionProps {
  title: string;
  children: ReactNode;
}

export function ReviewSection({ title, children }: ReviewSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{title}</h3>
      <div className="rounded-lg border p-4 space-y-2 text-sm">{children}</div>
    </div>
  );
}

interface ReviewRowProps {
  label: string;
  value: ReactNode;
}

export function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:grid sm:grid-cols-[auto_1fr] sm:gap-2">
      <span className="text-muted-foreground">{label}:</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
