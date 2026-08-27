import type { ReactNode } from "react";

import { cn } from "~/lib/cn";

interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <div className={cn("field", className)}>
      <label>{label}</label>
      {children}
    </div>
  );
}
