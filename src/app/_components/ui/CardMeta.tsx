import type { HTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export default function CardMeta({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "text-text/50 flex items-center gap-1.5 text-[11px]",
        className,
      )}
      {...props}
    />
  );
}
