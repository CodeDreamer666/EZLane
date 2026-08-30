"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { authClient } from "~/server/better-auth/client";
import useStatusMessage from "~/hook/useStatusMessage";

/**
 * Landing-page call-to-action. Signed-out visitors get the Google OAuth flow
 * (returning to `callbackURL` afterwards); signed-in visitors go straight there.
 */
export default function GoogleCta({
  className,
  children,
  callbackURL = "/dashboard",
}: {
  className?: string;
  children: ReactNode;
  callbackURL?: string;
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
      // Redirects the browser to Google; resolves only if it fails to start.
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
      className={`${className ?? ""} cursor-pointer disabled:pointer-events-none disabled:opacity-60`}
      aria-busy={busy}
    >
      {busy ? "Connecting…" : children}
    </button>
  );
}
