import cn from "~/lib/cn";
import LoadingIcon from "./LoadingIcon";

interface LoadingScreenProps {
    label?: string;
    className?: string;
}

export default function LoadingScreen({
    label = "Loading...",
    className,
}: LoadingScreenProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "bg-bg fixed inset-0 z-50 flex flex-col items-center justify-center gap-4",
                className,
            )}
        >
            <LoadingIcon className="h-10 w-10" />
            <p className="font-heading text-text text-lg font-semibold tracking-wide">
                {label}
            </p>
        </div>
    );
}
