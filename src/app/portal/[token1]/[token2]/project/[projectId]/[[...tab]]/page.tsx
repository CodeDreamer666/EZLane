"use client";

import { useParams } from "next/navigation";

import PortalGate from "~/components/portal/PortalGate";
import PortalProjectView from "~/components/portal/PortalProjectView";

export default function PortalProjectPage() {
  const { token1, token2, projectId, tab } = useParams<{
    token1: string;
    token2: string;
    projectId: string;
    tab?: string[];
  }>();
  const portalRef = { token1, token2 };
  const basePath = `/portal/${token1}/${token2}`;

  return (
    <PortalGate portalRef={portalRef}>
      {(password) => (
        <PortalProjectView
          portalRef={portalRef}
          basePath={basePath}
          password={password}
          projectId={projectId}
          tab={tab?.[0] ?? ""}
        />
      )}
    </PortalGate>
  );
}
