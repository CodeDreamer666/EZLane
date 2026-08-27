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
      className={cn("tgl", className)}
      data-on={on ? "1" : "0"}
      {...props}
    />
  );
}
