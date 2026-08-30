import type { SVGProps } from "react";
import cn from "~/lib/cn";

export default function LoadingIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            role="img"
            aria-label="Loading"
            className={cn("block h-6 w-6 animate-spin text-accent", className)}
            {...props}
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeOpacity="0.2"
            />
            <path
                d="M21 12a9 9 0 0 0-9-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
