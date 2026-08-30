import type { MouseEvent, ReactNode } from "react";

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    /** Tailwind max-w-* class for the panel. Defaults to max-w-[440px]. */
    maxWidthClassName?: string;
}

export default function Dialog({
    open,
    onClose,
    title,
    children,
    actions,
    maxWidthClassName = "max-w-[440px]",
}: DialogProps) {
    if (!open) return null;

    const stop = (e: MouseEvent) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 sm:p-6"
            onClick={onClose}
        >
            <div
                className={`border-divider bg-surface flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-3 overflow-y-auto rounded-lg border p-4 shadow-lg ${maxWidthClassName}`}
                onClick={stop}
            >
                <div className="font-heading text-xl font-semibold">{title}</div>
                <div className="text-sm opacity-85">{children}</div>
                {actions ? (
                    <div className="mt-2 flex justify-end gap-2">{actions}</div>
                ) : null}
            </div>
        </div>
    );
}
