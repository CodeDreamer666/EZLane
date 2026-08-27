import type { HTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export type StatusKey =
  | "draft"
  | "sent"
  | "commented"
  | "accepted"
  | "done"
  | "warn";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusKey;
}

export function Tag({ status, className, ...props }: TagProps) {
  return <span className={cn("tag", className)} data-s={status} {...props} />;
}
