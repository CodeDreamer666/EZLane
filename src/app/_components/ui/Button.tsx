import type { ButtonHTMLAttributes } from "react";

import { cn } from "~/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  icon: "btn-icon",
};

export function Button({
  variant = "secondary",
  block = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn("btn", VARIANT_CLASS[variant], block && "btn-block", className)}
      {...props}
    />
  );
}
