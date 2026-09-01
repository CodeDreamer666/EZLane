"use client";

import Link from "next/link";

import PortalChrome from "~/components/portal/PortalChrome";
import type { PortalRef } from "~/components/portal/PortalGate";
import {
  LoadingScreen,
  ServerError,
  Tag,
  type StatusKey,
} from "~/components/shared";
import {
  fmtDate,
  money,
  projectStatusLabel,
  proposalStatusLabel,
  statusKey,
} from "~/lib/format";
import { api } from "~/trpc/react";

export default function PortalLanding({
  portalRef,
  basePath,
  password,
}: {
  portalRef: PortalRef;
  basePath: string;
  password: string;
}) {
  const { data, isLoading, error } = api.portal.overview.useQuery({
    ref: portalRef,
    password,
  });

  if (isLoading) return <LoadingScreen />;

  if (error || !data) return <ServerError />;

  const { branding, client, items } = data;

  return (
    <PortalChrome
      brandName={branding.brandName}
      hideBranding={branding.hideBranding}
      subtitle={`Workspace for ${client.company ?? client.name}`}
    >
      {branding.welcomeMessage ? (
        <div className="text-text/72 border-accent mb-[26px] border-l-[2px] p-[2px_0_2px_14px] text-[13.5px] leading-[1.65]">
          {branding.welcomeMessage}
        </div>
      ) : null}

      <h3 className="font-heading m-[0_0_18px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
        Proposals &amp; projects
      </h3>

      {items.length === 0 ? (
        <div className="text-text/55 border-divider rounded-[5px] border border-dashed p-[40px] text-center text-[13px]">
          No proposals yet — {branding.brandName} hasn&apos;t sent anything.
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {items.map((item) => {
            const href = item.project
              ? `${basePath}/project/${item.project.id}`
              : `${basePath}/proposal/${item.id}`;
            const label = item.project?.completed
              ? "Completed"
              : item.project
                ? projectStatusLabel(item.project.status)
                : proposalStatusLabel(item.status);

            return (
              <Link
                key={item.id}
                href={href}
                className="border-divider hover:bg-text/5 flex items-start gap-[12px] rounded-md border bg-transparent p-3 no-underline"
              >
                <div className="flex-1">
                  <div className="font-heading text-text text-[17px] leading-[1.2] font-semibold">
                    {item.title}
                  </div>
                  <div className="text-text/50 mt-[5px] flex items-center gap-[14px] text-[11px]">
                    <span className="tabular-nums">{money(item.price)}</span>
                    <span>Due {fmtDate(item.due)}</span>
                  </div>
                </div>
                <Tag status={statusKey(label) as StatusKey}>{label}</Tag>
              </Link>
            );
          })}
        </div>
      )}
    </PortalChrome>
  );
}
