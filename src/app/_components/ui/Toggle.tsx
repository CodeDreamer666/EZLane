import type { ButtonHTMLAttributes } from "react";

import { cn } from "~/lib/cn";

interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  on: boolean;
}

/** The mock's `.tgl` pill button — an on/off toggle rendered as a button,
 * not a checkbox, so it can carry an icon + label. */
export function Toggle({ on, className, ...props }: ToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        "border-divider font-heading text-text/70 hover:bg-text/6 data-[on=1]:border-accent data-[on=1]:bg-accent/10 data-[on=1]:text-accent inline-flex cursor-pointer items-center gap-2 rounded border bg-transparent px-3 py-[7px] text-[13px] font-semibold whitespace-nowrap max-lg:min-h-11",
        className,
      )}
      data-on={on ? "1" : "0"}
      {...props}
    />
  );
}
