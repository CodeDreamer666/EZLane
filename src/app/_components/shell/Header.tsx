"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button, IconBell, IconMenu } from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
  proposals: "Proposals",
  projects: "Projects",
  notifications: "Notifications",
  settings: "Settings",
  plans: "Plans",
};

function usePageTitle(): string {
  const pathname = usePathname();
  const { client, project } = useEzlane();
  const parts = pathname.split("/").filter(Boolean);
  const r0 = parts[0] ?? "dashboard";
  if (r0 === "clients" && parts[1]) return client(parts[1]).name;
  if (r0 === "projects" && parts[1]) return project(parts[1])?.title ?? "Project";
  if (r0 === "proposals" && parts[1]) return "Proposal editor";
  return TITLES[r0] ?? "Dashboard";
}

export function Header() {
  const { state, toggleNav, openAddClient } = useEzlane();
  const title = usePageTitle();
  const unreadCount = state.notifications.filter(
    (n) => n.audience === "freelancer" && !n.read,
  ).length;
  const unreadLabel = unreadCount ? `${unreadCount} new` : "No new";

  return (
    <header
      className="hdr"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "15px 30px",
        borderBottom: "1px solid var(--color-divider)",
        position: "sticky",
        top: 0,
        background: "color-mix(in srgb, var(--color-bg) 92%, transparent)",
        backdropFilter: "blur(6px)",
        zIndex: 5,
      }}
    >
      <button className="burger" onClick={toggleNav} aria-label="Menu">
        <IconMenu style={{ width: 19, height: 19 }} />
      </button>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          className="hdr-title"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, lineHeight: 1.25 }}
        >
          {title}
        </div>
      </div>
      <Link href="/notifications" className="hide-sm">
        <Button variant="secondary" style={{ gap: 7 }}>
          <IconBell />
          {unreadLabel}
        </Button>
      </Link>
      <Button variant="primary" onClick={openAddClient}>
        +<span className="hide-sm"> Add Client</span>
      </Button>
    </header>
  );
}
