import type { ReactNode } from "react";

import { cn } from "~/lib/cn";

interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Field({ label, children, className }: FieldProps) {
  return (
    <div
      className={cn(
        "[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]",
        className,
      )}
    >
      <label>{label}</label>
      {children}
    </div>
  );
}
