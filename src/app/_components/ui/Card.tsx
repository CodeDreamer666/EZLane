import type { HTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export default function Card({
  className,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "border-divider flex flex-col gap-2 rounded-md border bg-transparent p-3",
        interactive && "hover:bg-text/5 cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}
