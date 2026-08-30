import type { ButtonHTMLAttributes } from "react";
import cn from "~/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    block?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary: "border-accent! text-accent! hover:bg-accent/12 active:bg-accent/22",
    secondary: "border-divider! hover:bg-text/7 active:bg-text/14",
    ghost: "px-1 text-accent hover:bg-accent/10 active:bg-accent/18",
    icon: "h-9 w-9 p-0",
};

export default function Button({
    variant = "secondary",
    block = false,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "font-heading text-text inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11",
                VARIANT_CLASS[variant],
                block && "mt-2 w-full",
                className,
            )}
            {...props}
        />
    );
}
