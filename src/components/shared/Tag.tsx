import type { HTMLAttributes } from "react";
import cn from "~/lib/cn";

export type StatusKey =
    "draft" | "sent" | "commented" | "accepted" | "done" | "warn";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
    status: StatusKey;
}

export default function Tag({ status, className, ...props }: TagProps) {
    return (
        <span
            className={cn(
                "data-[s=sent]:bg-accent-100 data-[s=sent]:text-accent-800 data-[s=commented]:text-accent-700 data-[s=accepted]:bg-text data-[s=accepted]:text-bg data-[s=done]:text-text/60 data-[s=warn]:text-accent-700 inline-flex items-center rounded-[calc(var(--radius-md)*.75)] px-2.5 py-[3px] text-[11px] tracking-[.02em] whitespace-nowrap data-[s=commented]:bg-transparent data-[s=commented]:shadow-[inset_0_0_0_1px_var(--color-accent)] data-[s=done]:bg-transparent data-[s=done]:shadow-[inset_0_0_0_1px_var(--color-divider)] data-[s=draft]:bg-neutral-200 data-[s=draft]:text-neutral-800 data-[s=warn]:bg-transparent data-[s=warn]:shadow-[inset_0_0_0_1px_var(--color-accent-400)]",
                className,
            )}
            data-s={status}
            {...props}
        />
    );
}
