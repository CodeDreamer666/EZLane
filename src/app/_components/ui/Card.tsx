import type { HTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export function Card({
  className,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div className={cn("card", interactive && "row", className)} {...props} />
  );
}

export function CardKicker(props: HTMLAttributes<HTMLDivElement>) {
  return <div className="card-kicker" {...props} />;
}

export function CardTitle(props: HTMLAttributes<HTMLDivElement>) {
  return <div className="card-title" {...props} />;
}

export function CardMeta({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card-meta", className)} {...props} />;
}
