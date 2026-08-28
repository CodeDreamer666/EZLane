import type { HTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export function Card({
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

export function CardKicker(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="text-accent text-[10px] tracking-[0.1em] uppercase"
      {...props}
    />
  );
}

export function CardTitle(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="font-heading text-text text-[17px] leading-[1.2] font-semibold"
      {...props}
    />
  );
}

export function CardMeta({
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
