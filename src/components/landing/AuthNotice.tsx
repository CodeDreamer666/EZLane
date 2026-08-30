"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import useStatusMessage from "~/hook/useStatusMessage";

const MESSAGES: Record<string, string> = {
  "auth-required": "Please log in first — that page needs you signed in.",
  "oauth-failed": "Google sign-in didn't complete. Please try again.",
};

/**
 * Reads a `?error=` code left behind by a redirect (e.g. the dashboard guard),
 * shows it in the top-level banner, then strips it from the URL so a refresh
 * doesn't repeat it.
 */
export default function AuthNotice({ code }: { code: string }) {
  const router = useRouter();
  const { showMessage } = useStatusMessage();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    showMessage(MESSAGES[code] ?? "Please log in to continue.", false);
    router.replace("/");
  }, [code, router, showMessage]);

  return null;
}
