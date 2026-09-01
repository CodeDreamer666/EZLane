"use client";

import { useEffect, useState, type ReactNode } from "react";

import GateScreen from "~/components/portal/GateScreen";
import { LoadingScreen } from "~/components/shared";
import getFriendlyError from "~/lib/getFriendlyError";
import { api } from "~/trpc/react";

export type PortalRef = { token1: string; token2: string };

export default function PortalGate({
  portalRef,
  children,
}: {
  portalRef: PortalRef;
  children: (password: string) => ReactNode;
}) {
  const key = `ezlane-portal:${portalRef.token1}:${portalRef.token2}`;

  const [password, setPassword] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setPassword(sessionStorage.getItem(key));
    setChecked(true);
  }, [key]);

  const verify = api.portal.verify.useMutation({
    onError: (err) => {
      setError(getFriendlyError(err));
    },
  });

  const handleSubmit = () => {
    if (verify.isPending) return;

    const entered = draft.trim();

    if (entered.length < 1) {
      setError("Enter the portal password");
      return;
    }

    verify.mutate(
      { ref: portalRef, password: entered },
      {
        onSuccess: () => {
          sessionStorage.setItem(key, entered);
          setPassword(entered);
          setDraft("");
          setError("");
        },
      },
    );
  };

  if (!checked) return <LoadingScreen />;

  if (!password)
    return (
      <GateScreen
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        error={error}
        pending={verify.isPending}
      />
    );

  return <>{children(password)}</>;
}
