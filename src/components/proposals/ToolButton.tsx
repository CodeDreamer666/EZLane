"use client";
import type { ReactNode } from "react";

export default function ToolButton({
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
        <span className="group relative inline-flex">
            <button
                type="button"
                className={"text-text/72 hover:bg-text/8 hover:text-text active:bg-text/14 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[5px] border border-transparent bg-transparent disabled:cursor-not-allowed disabled:opacity-35 max-lg:h-10 max-lg:w-10"}
                aria-label={label}
                title={label}
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onClick}
            >
                {children}
            </button>
            <span role="tooltip" className={"bg-text text-bg pointer-events-none absolute top-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 scale-95 rounded-[5px] px-2 py-1 text-[11.5px] leading-[1.35] font-medium whitespace-nowrap opacity-0 transition-[opacity,transform] duration-100 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 max-lg:hidden"}>
                {label}
            </span>
        </span>
    );
}
