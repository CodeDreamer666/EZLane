"use client";

import { useParams } from "next/navigation";

import GateScreen from "~/components/portal/GateScreen";
import PortalShell from "~/components/portal/PortalShell";
import useEzlane from "~/hook/useEzlane";

export default function PortalPage() {
  const { projectId, tab } = useParams<{ projectId: string; tab?: string[] }>();
  const { state, project, proposal } = useEzlane();

  const p = project(projectId);
  if (!p) return <div className="text-text p-[40px]">Project not found.</div>;

  const pr = proposal(p.proposalId);
  const unlockedVal = state.unlocked[p.id];

  if (!unlockedVal) return <GateScreen project={p} />;

  return (
    <PortalShell
      project={p}
      proposalId={pr?.id ?? p.proposalId}
      tabName={tab?.[0] ?? ""}
      isPreview={unlockedVal === "preview"}
    />
  );
}
