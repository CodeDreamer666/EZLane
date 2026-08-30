"use client";
import type { ReactNode } from "react";

export default function SheetButton({
    label,
    onClick,
    disabled,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            role="menuitem"
            className="text-text/85 hover:bg-text/8 active:bg-text/14 flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-[6px] border border-transparent bg-transparent px-2.5 text-left text-[13.5px] disabled:cursor-not-allowed disabled:opacity-35"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
        >
            {children}
            <span>{label}</span>
        </button>
    );
}
