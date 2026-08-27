"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"
import {
  Button,
  IconBell,
  IconClients,
  IconDashboard,
  IconProjects,
  IconProposals,
  IconSearch,
} from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/clients", label: "Clients", Icon: IconClients },
  { href: "/proposals", label: "Proposals", Icon: IconProposals },
  { href: "/projects", label: "Projects", Icon: IconProjects },
] as const;

const SETTINGS_ITEMS = [
  { href: "/settings/profile", label: "Profile", pro: false },
  { href: "/settings/invoice", label: "Invoice details", pro: false },
  { href: "/settings/branding", label: "Portal branding", pro: true },
  { href: "/settings/plan", label: "Plan & billing", pro: false },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { state, activeProjects, limit, openPalette, closeNav } = useEzlane();

  const unreadCount = state.notifications.filter(
    (n) => n.audience === "freelancer" && !n.read,
  ).length;
  const active = activeProjects();
  const lim = limit();
  const usageShort = state.plan === "pro" ? "unlimited" : `${active.length} / 2`;
  const usageBar =
    state.plan === "pro" ? "100%" : `${Math.min(100, (active.length / 2) * 100)}%`;
  const usageNote =
    state.plan === "pro"
      ? "Unlimited active projects"
      : `${active.length} of ${lim} active projects used`;

  return (
    <aside
      className="side"
      data-open={state.navOpen ? "1" : "0"}
      style={{
        width: 238,
        flex: "none",
        borderRight: "1px solid var(--color-divider)",
        padding: "18px 14px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        overscrollBehavior: "contain",
        background: "#080910",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 4px" }}>
        <div
          style={{
            width: 20,
            height: 20,
            border: "1px solid var(--color-accent)",
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ width: 7, height: 7, background: "var(--color-accent)" }} />
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19 }}>
          EZLane
        </div>
      </div>

      <button className="pal" onClick={openPalette}>
        <IconSearch style={{ width: 13, height: 13, opacity: 0.6 }} />
        <span style={{ flex: 1 }}>Search or jump to…</span>
        <span className="kbd">⌘K</span>
      </button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "color-mix(in srgb, var(--color-text) 38%, transparent)",
            padding: "4px 9px 6px",
          }}
        >
          Work
        </div>
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="nv"
            data-cur={pathname.startsWith(href) ? "1" : "0"}
            onClick={closeNav}
          >
            <Icon />
            {label}
          </Link>
        ))}
        <Link
          href="/notifications"
          className="nv"
          data-cur={pathname.startsWith("/notifications") ? "1" : "0"}
          onClick={closeNav}
        >
          <IconBell />
          <span style={{ flex: 1 }}>Notifications</span>
          {unreadCount > 0 ? (
            <span className="tag" data-s="sent" style={{ padding: "1px 7px", fontSize: 10 }}>
              {unreadCount}
            </span>
          ) : null}
        </Link>

        <div
          style={{
            fontSize: 9.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "color-mix(in srgb, var(--color-text) 38%, transparent)",
            padding: "14px 9px 6px",
          }}
        >
          Settings
        </div>
        {SETTINGS_ITEMS.map(({ href, label, pro }) => (
          <Link
            key={href}
            href={href}
            className="nv"
            data-cur={pathname === href ? "1" : "0"}
            onClick={closeNav}
          >
            <span style={{ flex: 1 }}>{label}</span>
            {pro && state.plan === "free" ? (
              <span style={{ fontSize: 9.5, letterSpacing: "0.08em", color: "var(--color-accent-700)" }}>
                PRO
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          border: "1px solid var(--color-divider)",
          borderRadius: 5,
          padding: "11px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14 }}>
            {state.plan === "pro" ? "Pro" : "Free"} plan
          </span>
          <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>
            {usageShort}
          </span>
        </div>
        <div
          style={{
            height: 3,
            background: "color-mix(in srgb, var(--color-text) 12%, transparent)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div style={{ height: "100%", background: "var(--color-accent)", width: usageBar }} />
        </div>
        <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)", lineHeight: 1.5 }}>
          {usageNote}
        </div>
        {state.plan === "free" ? (
          <Link href="/plans" onClick={closeNav}>
            <Button variant="primary" style={{ width: "100%", fontSize: 12.5, padding: 5 }}>
              Upgrade to Pro
            </Button>
          </Link>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 4px",
          borderTop: "1px solid var(--color-divider)",
          paddingTop: 12,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "1px solid var(--color-divider)",
            display: "grid",
            placeItems: "center",
            fontSize: 10.5,
            fontFamily: "var(--font-heading)",
          }}
        >
          {initials(state.settings.name)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {state.settings.name}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: "color-mix(in srgb, var(--color-text) 45%, transparent)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {state.settings.email}
          </div>
        </div>
      </div>
    </aside>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
