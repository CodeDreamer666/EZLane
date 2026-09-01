"use client";

import { useParams } from "next/navigation";

import PortalGate from "~/components/portal/PortalGate";
import PortalProposalView from "~/components/portal/PortalProposalView";

export default function PortalProposalPage() {
  const { token1, token2, proposalId } = useParams<{
    token1: string;
    token2: string;
    proposalId: string;
  }>();
  const portalRef = { token1, token2 };
  const basePath = `/portal/${token1}/${token2}`;

  return (
    <PortalGate portalRef={portalRef}>
      {(password) => (
        <PortalProposalView
          portalRef={portalRef}
          basePath={basePath}
          password={password}
          proposalId={proposalId}
        />
      )}
    </PortalGate>
  );
}
