"use client";

import Link from "next/link";

import PortalChrome from "~/components/portal/PortalChrome";
import PortalContractTab from "~/components/portal/PortalContractTab";
import type { PortalRef } from "~/components/portal/PortalGate";
import PortalMessagesTab from "~/components/portal/PortalMessagesTab";
import PortalOverviewTab from "~/components/portal/PortalOverviewTab";
import { LoadingScreen, ServerError } from "~/components/shared";
import { api } from "~/trpc/react";

const TABS = [
  { key: "", label: "Overview" },
  { key: "contract", label: "Contract" },
  { key: "messages", label: "Messages" },
] as const;

export default function PortalProjectView({
  portalRef,
  basePath,
  password,
  projectId,
  tab,
}: {
  portalRef: PortalRef;
  basePath: string;
  password: string;
  projectId: string;
  tab: string;
}) {
  const { data, isLoading, error } = api.portal.project.useQuery({
    ref: portalRef,
    password,
    projectId,
  });

  if (isLoading) return <LoadingScreen />;

  if (error || !data) return <ServerError />;

  const { branding, client, project } = data;
  const clientLabel = client.company ?? client.name;

  return (
    <PortalChrome
      brandName={branding.brandName}
      hideBranding={branding.hideBranding}
      subtitle={`${project.proposal.title} · for ${clientLabel}`}
      backHref={basePath}
    >
      <nav className="border-divider mb-[26px] flex gap-[2px] border-b">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`${basePath}/project/${projectId}${t.key ? `/${t.key}` : ""}`}
            className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center rounded-[4px_4px_0_0] px-[11px] py-2 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm"
            data-cur={tab === t.key ? "1" : "0"}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "" ? (
        <PortalOverviewTab project={project} brandName={branding.brandName} />
      ) : null}

      {tab === "contract" ? (
        <PortalContractTab
          project={project}
          brandName={branding.brandName}
          clientLabel={clientLabel}
          portalRef={portalRef}
          password={password}
          projectId={projectId}
        />
      ) : null}

      {tab === "messages" ? (
        <PortalMessagesTab
          project={project}
          brandName={branding.brandName}
          portalRef={portalRef}
          password={password}
          projectId={projectId}
        />
      ) : null}
    </PortalChrome>
  );
}
