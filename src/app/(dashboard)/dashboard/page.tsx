"use client";

import Link from "next/link";

import { Button } from "~/app/_components/ui";
import { ProjectCard } from "~/app/_components/ProjectCard";
import { ago, money } from "~/lib/format";
import { useEzlane } from "~/lib/store";

export default function DashboardPage() {
  const { state, activeProjects, limit, markRead, go, openAddClient } = useEzlane();

  const active = activeProjects();
  const lim = limit();
  const overLimit = active.length > lim;
  const usageNote =
    state.plan === "pro"
      ? "Unlimited active projects"
      : `${active.length} of ${lim} active projects used`;
  const awaitingCount = state.proposals.filter(
    (p) => p.status === "Sent" || p.status === "Client Commented",
  ).length;
  const unpaid = state.projects
    .filter((p) => !p.completed)
    .reduce((n, p) => n + (p.deposit ? 0 : p.price / 2) + (p.final ? 0 : p.price / 2), 0);
  const recentNotifs = state.notifications
    .filter((n) => n.audience === "freelancer")
    .slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {overLimit ? (
        <div
          style={{
            border: "1px solid var(--color-accent-400)",
            borderRadius: 5,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>
              You&apos;re over your plan&apos;s active-project limit
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "color-mix(in srgb, var(--color-text) 62%, transparent)",
                marginTop: 3,
              }}
            >
              A client accepted a proposal while both Free slots were in use.
              Upgrade to Pro, or mark a project completed to free a slot.
            </div>
          </div>
          <Button variant="primary" onClick={() => go("/plans")}>
            See plans
          </Button>
        </div>
      ) : null}

      <div
        className="g3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          background: "var(--color-divider)",
          border: "1px solid var(--color-divider)",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <StatTile label="Active work" value={active.length} note={usageNote} />
        <StatTile
          label="Awaiting client"
          value={awaitingCount}
          note="proposals sent or commented"
        />
        <StatTile label="Outstanding" value={money(unpaid)} note="across unpaid halves" />
      </div>

      <div
        className="twocol"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(260px, 1fr)",
          gap: 28,
          alignItems: "start",
        }}
      >
        <section>
          <SectionHead title="Active projects" href="/projects" linkLabel="All projects →" />
          {active.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {active.map((p, i) => (
                <ProjectCard key={p.id} project={p} blocked={i >= lim} />
              ))}
            </div>
          ) : (
            <div
              style={{
                border: "1px dashed var(--color-divider)",
                borderRadius: 5,
                padding: 34,
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>
                No active projects
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                  margin: "6px auto 14px",
                  maxWidth: 320,
                }}
              >
                A project appears here the moment a client accepts a proposal.
                Start by adding the client.
              </p>
              <Button variant="primary" onClick={openAddClient}>
                + Add Client
              </Button>
            </div>
          )}
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <SectionHead title="Recent activity" href="/notifications" linkLabel="All →" small />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentNotifs.map((n) => (
                <div
                  key={n.id}
                  className="row"
                  onClick={() => {
                    markRead(n.id);
                    go(n.route);
                  }}
                  style={{
                    display: "flex",
                    gap: 9,
                    padding: "9px 6px",
                    borderBottom: "1px solid var(--color-divider)",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      marginTop: 6,
                      flex: "none",
                      background: "var(--color-accent)",
                      opacity: n.read ? 0.22 : 1,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>{n.title}</div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "color-mix(in srgb, var(--color-text) 42%, transparent)",
                        marginTop: 2,
                      }}
                    >
                      {ago(n.ts)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: "1px solid var(--color-divider)", borderRadius: 5, padding: 14 }}>
            <h4 style={{ margin: "0 0 4px", fontSize: 15 }}>Quick start</h4>
            <p
              style={{
                fontSize: 12,
                color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                margin: "0 0 12px",
              }}
            >
              Add a client, then write their proposal — the two are one flow.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <Button variant="primary" block style={{ margin: 0 }} onClick={openAddClient}>
                + Add Client
              </Button>
              <Link href="/proposals">
                <Button variant="secondary" block style={{ margin: 0 }}>
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

function StatTile({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div style={{ background: "var(--color-bg)", padding: "16px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 30,
          lineHeight: 1.1,
          marginTop: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{note}</div>
    </div>
  );
}

function SectionHead({
  title,
  href,
  linkLabel,
  small = false,
}: {
  title: string;
  href: string;
  linkLabel: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--color-divider)",
        paddingBottom: small ? 7 : 8,
        marginBottom: small ? 12 : 16,
      }}
    >
      <h4 style={{ margin: 0, fontSize: small ? 16 : 16 }}>{title}</h4>
      <Link href={href} className="lnk" style={{ fontSize: 12 }}>
        {linkLabel}
      </Link>
    </div>
  );
}
