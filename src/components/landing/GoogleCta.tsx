"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "~/server/better-auth/client";
import useStatusMessage from "~/hook/useStatusMessage";

export default function GoogleCta({
    wantArrow = true,
    callbackURL = "/dashboard",
    label = "Open EZLane",
    fullWidth = false,
    variant = "primary",
}: {
    wantArrow?: boolean;
    callbackURL?: string;
    label?: string;
    fullWidth?: boolean;
    variant?: "primary" | "secondary";
}) {
    const router = useRouter();

    const { showMessage } = useStatusMessage();

    const { data: session, isPending } = authClient.useSession();

    const [busy, setBusy] = useState(false);

    async function handleClick() {
        if (session) {
            router.push(callbackURL);
            return;
        }

        setBusy(true);

        try {
            const { error } = await authClient.signIn.social({
                provider: "google",
                callbackURL,
                errorCallbackURL: "/?error=oauth-failed",
            });

            if (error) throw new Error(error.message ?? "sign-in failed");
        } catch {
            setBusy(false);
            showMessage("Could not start Google sign-in. Please try again.", false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={busy || isPending}
            className={`${!wantArrow ? "px-4 py-[9px] text-[13.5px]" : ""} ${fullWidth ? "w-full justify-center" : ""} ${
                variant === "secondary"
                    ? "border-divider text-text/78 hover:text-text hover:bg-text/7"
                    : "border-accent text-accent-700 hover:text-accent-800 bg-accent/10 hover:bg-accent/20"
            } font-heading inline-flex items-center gap-[9px] rounded-md border px-[22px] py-3 text-[15px] font-semibold transition duration-200 hover:-translate-y-px cursor-pointer disabled:pointer-events-none disabled:opacity-60`}
            aria-busy={busy}
        >
            {busy ? "Connecting…" : wantArrow ? (
                <div className="flex items-center gap-2">
                    {label}
                    <svg
                        className="size-4 fill-none stroke-current stroke-[1.5]"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M5 12h13M13 6l6 6-6 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            ) : label}
        </button>
    );
}
