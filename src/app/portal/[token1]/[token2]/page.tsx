"use client";

import { useParams } from "next/navigation";

import PortalGate from "~/components/portal/PortalGate";
import PortalLanding from "~/components/portal/PortalLanding";

export default function PortalLandingPage() {
  const { token1, token2 } = useParams<{ token1: string; token2: string }>();
  const portalRef = { token1, token2 };
  const basePath = `/portal/${token1}/${token2}`;

  return (
    <PortalGate portalRef={portalRef}>
      {(password) => (
        <PortalLanding
          portalRef={portalRef}
          basePath={basePath}
          password={password}
        />
      )}
    </PortalGate>
  );
}
