"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SectionHead from "~/components/dashboard/SectionHead";
import StatTile from "~/components/dashboard/StatTile";

import { Button, LoadingScreen, ServerError } from "~/components/shared";
import ProjectCard from "~/components/ProjectCard";
import useAddClientModal from "~/hook/useAddClientModal";
import { ago, money, projectStatusLabel } from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

const AWAITING_CLIENT_STATUSES = ["SENT", "CLIENT_COMMENTED", "REVISED"];

function payLabel(depositPaid: boolean, finalPaid: boolean): string {
  if (depositPaid && finalPaid) return "Paid in full";
  if (depositPaid) return "Deposit in";
  return "Unpaid";
}

export default function DashboardPage() {
  const router = useRouter();
  const { openModal } = useAddClientModal();
  const { showMessage } = useStatusMessage();
  const utils = api.useUtils();

  const { data: projects, isLoading, error } = api.projects.list.useQuery();
  const { data: proposals } = api.proposals.list.useQuery();
  const { data: plan } = api.settings.getPlan.useQuery();
  const { data: notifications } = api.notifications.list.useQuery();

  const markRead = api.notifications.markRead.useMutation({
    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
      await utils.notifications.invalidate();
    },
  });

  if (isLoading) return <LoadingScreen />;

  if (error || !projects) return <ServerError />;

  const isPro = plan?.plan === "PRO";
  const limit = isPro ? Infinity : 2;
  const active = projects.filter((p) => !p.completed);
  const overLimit = active.length > limit;
  const usageNote = isPro
    ? "Unlimited active projects"
    : `${active.length} of ${limit} active projects used`;
  const awaitingCount = (proposals ?? []).filter((p) =>
    AWAITING_CLIENT_STATUSES.includes(p.status),
  ).length;
  const unpaid = active.reduce(
    (total, p) =>
      total +
      (p.depositPaid ? 0 : p.proposal.price / 2) +
      (p.finalPaid ? 0 : p.proposal.price / 2),
    0,
  );
  const recentNotifs = (notifications ?? [])
    .filter((n) => n.audience === "FREELANCER")
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-[26px]">
      {overLimit ? (
        <div className="bg-accent/8 border-accent-400 flex items-center gap-[16px] rounded-[5px] border p-[14px_16px]">
          <div className="flex-1">
            <div className="font-heading text-[15px] font-semibold">
              You&apos;re over your plan&apos;s active-project limit
            </div>
            <div className="text-text/62 mt-[3px] text-[12.5px]">
              A client accepted a proposal while both Free slots were in use.
              Upgrade to Pro, or mark a project completed to free a slot.
            </div>
          </div>
          <Button variant="primary" onClick={() => router.push("/plans")}>
            See plans
          </Button>
        </div>
      ) : null}

      <div className="bg-divider border-divider grid grid-cols-[1fr_1fr_1fr] gap-[1px] overflow-hidden rounded-[5px] border max-sm:grid-cols-1!">
        <StatTile label="Active work" value={active.length} note={usageNote} />
        <StatTile
          label="Awaiting client"
          value={awaitingCount}
          note="proposals sent or commented"
        />
        <StatTile
          label="Outstanding"
          value={money(unpaid)}
          note="across unpaid halves"
        />
      </div>

      <div className="grid grid-cols-[minmax(0,_1.6fr)_minmax(260px,_1fr)] items-start gap-[28px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
        <section>
          <SectionHead
            title="Active projects"
            href="/projects"
            linkLabel="All projects →"
          />
          {active.length > 0 ? (
            <div className="flex flex-col gap-[12px]">
              {active.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  href={`/projects/${p.id}`}
                  clientLabel={p.client.company ?? p.client.name}
                  title={p.proposal.title}
                  statusLabel={projectStatusLabel(p.status)}
                  progress={p.progress}
                  price={p.proposal.price}
                  due={p.proposal.due}
                  payLabel={payLabel(p.depositPaid, p.finalPaid)}
                  blocked={i >= limit}
                />
              ))}
            </div>
          ) : (
            <div className="border-divider rounded-[5px] border border-dashed p-[34px] text-center">
              <div className="font-heading text-[18px]">No active projects</div>
              <p className="text-text/55 m-[6px_auto_14px] max-w-[320px] text-[13px]">
                A project appears here the moment a client accepts a proposal.
                Start by adding the client.
              </p>
              <Button variant="primary" onClick={openModal}>
                + Add Client
              </Button>
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-[22px]">
          <div>
            <SectionHead
              title="Recent activity"
              href="/notifications"
              linkLabel="All →"
              small
            />
            <div className="flex flex-col">
              {recentNotifs.map((n) => (
                <div
                  key={n.id}
                  className="hover:bg-text/5 border-divider flex cursor-pointer items-start gap-[9px] border-b p-[9px_6px]"
                  onClick={() => {
                    if (!n.read) markRead.mutate({ id: n.id });
                    router.push(n.route);
                  }}
                >
                  <div
                    className={`bg-accent mt-1.5 h-[5px] w-[5px] flex-none rounded-full ${n.read ? "opacity-22" : "opacity-100"}`}
                  />
                  <div className="min-w-0">
                    <div className="text-[12.5px] leading-[1.45]">
                      {n.title}
                    </div>
                    <div className="text-text/42 mt-[2px] text-[10.5px]">
                      {ago(new Date(n.createdAt).getTime())}
                    </div>
                  </div>
                </div>
              ))}
              {recentNotifs.length === 0 ? (
                <div className="text-text/42 p-[9px_6px] text-[12px]">
                  Nothing yet.
                </div>
              ) : null}
            </div>
          </div>
          <div className="border-divider rounded-[5px] border p-[14px]">
            <h4 className="font-heading m-[0_0_4px] text-[15px] leading-[1.12] font-semibold tracking-[-0.015em]">
              Quick start
            </h4>
            <p className="text-text/55 m-[0_0_12px] text-[12px]">
              Add a client, then write their proposal — the two are one flow.
            </p>
            <div className="flex flex-col gap-[7px]">
              <Button
                variant="primary"
                block
                className="mt-0!"
                onClick={openModal}
              >
                + Add Client
              </Button>
              <Link href="/proposals">
                <Button variant="secondary" block className="mt-0!">
                  Open proposals
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
