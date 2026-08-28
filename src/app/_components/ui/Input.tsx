import type { InputHTMLAttributes } from "react";

import { cn } from "~/lib/cn";

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent! focus-visible:outline-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm leading-[1.55] focus-visible:outline-2 focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]",
        className,
      )}
      {...props}
    />
  );
}
