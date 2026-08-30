"use client";

import ContractTab from "~/components/portal/ContractTab";
import NotificationsTab from "~/components/portal/NotificationsTab";
import OverviewTab from "~/components/portal/OverviewTab";
import ProposalTab from "~/components/portal/ProposalTab";
import ThreadTab from "~/components/portal/ThreadTab";
import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

const TABS = [
  { key: "proposal", label: "Proposal" },
  { key: "contract", label: "Contract" },
  { key: "overview", label: "Overview" },
  { key: "thread", label: "Messages" },
  { key: "notifications", label: "Activity" },
] as const;

export default function PortalShell({
  project: p,
  proposalId,
  tabName,
  isPreview,
}: {
  project: Project;
  proposalId: string;
  tabName: string;
  isPreview: boolean;
}) {
  const { state, client, go } = useEzlane();
  const c = client(p.clientId);
  const proBrand = state.plan === "pro" && state.settings.hideBranding;
  const brandName = proBrand ? state.settings.invoiceName : "EZLane";
  const clientNotifs = state.notifications
    .filter((n) => n.audience === "client" && n.projectId === p.id)
    .sort((a, b) => b.ts - a.ts);
  const unreadCount = clientNotifs.filter((n) => !n.read).length;
  const tab = tabName || "overview";
  const welcomeShown =
    state.plan === "pro" && !!state.settings.welcome && tab === "overview";

  const base = `/portal/${p.id}`;

  return (
    <div>
      <header className="bg-bg border-divider border-b">
        <div className="m-[0_auto] max-w-[940px] p-[16px_26px_0] max-lg:px-[18px]! max-lg:pt-3.5!">
          <div className="flex items-center gap-[12px]">
            <div className="border-accent grid h-[20px] w-[20px] place-items-center rounded-[3px] border">
              <div className="bg-accent h-[7px] w-[7px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading text-[17px] font-semibold">
                {brandName}
              </div>
              <div className="text-text/45 text-[11.5px]">
                {p.title} · for {c.company || c.name}
              </div>
            </div>
            {isPreview ? (
              <button
                className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent p-[5px_11px] px-[calc(var(--spacing-3)*1.2)] py-2 text-sm text-[12px] leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                onClick={() => go(`/projects/${p.id}`)}
              >
                ← Back to EZLane
              </button>
            ) : null}
          </div>
          <nav className="mt-[16px] flex gap-[2px] max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:[&_.nv]:px-[13px] max-lg:[&_.nv]:py-[11px] max-lg:[&_.nv]:text-sm max-lg:[&_.nv]:whitespace-nowrap">
            {TABS.map((t) => (
              <a
                key={t.key}
                className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center gap-[9px] rounded rounded-[4px_4px_0_0] px-[9px] py-1.5 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:flex-none [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:opacity-90"
                data-cur={
                  tab === t.key || (t.key === "overview" && !tabName)
                    ? "1"
                    : "0"
                }
                onClick={() => go(`${base}/${t.key}`)}
              >
                <span>{t.label}</span>
                {t.key === "notifications" && unreadCount > 0 ? (
                  <span
                    className="data-[s=sent]:bg-accent-100 data-[s=sent]:text-accent-800 data-[s=commented]:text-accent-700 data-[s=accepted]:bg-text data-[s=accepted]:text-bg data-[s=done]:text-text/60 data-[s=warn]:text-accent-700 ml-[6px] inline-flex items-center rounded-[3px] px-[6px] py-[1px] text-[10px] tracking-[0.02em] whitespace-nowrap data-[s=commented]:bg-transparent data-[s=commented]:shadow-[inset_0_0_0_1px_var(--color-accent)] data-[s=done]:bg-transparent data-[s=done]:shadow-[inset_0_0_0_1px_var(--color-divider)] data-[s=draft]:bg-neutral-200 data-[s=draft]:text-neutral-800 data-[s=warn]:bg-transparent data-[s=warn]:shadow-[inset_0_0_0_1px_var(--color-accent-400)]"
                    data-s="sent"
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="m-[0_auto] max-w-[940px] p-[30px_26px_70px] max-lg:px-[18px]! max-lg:pt-6! max-lg:pb-[70px]! max-sm:px-3.5! max-sm:pt-5! max-sm:pb-[34px]!">
        {welcomeShown ? (
          <div className="text-text/72 border-accent mb-[26px] border-l-[2px] p-[2px_0_2px_14px] text-[13.5px] leading-[1.65]">
            {state.settings.welcome}
          </div>
        ) : null}

        {tab === "proposal" ? (
          <ProposalTab project={p} proposalId={proposalId} />
        ) : null}
        {tab === "contract" ? (
          <ContractTab project={p} proposalId={proposalId} />
        ) : null}
        {tab === "overview" ? (
          <OverviewTab project={p} proposalId={proposalId} />
        ) : null}
        {tab === "thread" ? <ThreadTab project={p} /> : null}
        {tab === "notifications" ? <NotificationsTab project={p} /> : null}
      </main>

      <footer className="border-divider border-t p-[20px_26px] text-center">
        {!proBrand ? (
          <div className="text-text/38 text-[11.5px]">
            Powered by <span className="font-heading">EZLane</span>
          </div>
        ) : (
          <div className="text-text/38 text-[11.5px]">
            {brandName} · {state.settings.email}
          </div>
        )}
      </footer>
    </div>
  );
}
