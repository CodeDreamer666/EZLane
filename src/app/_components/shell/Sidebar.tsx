"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const usageShort =
    state.plan === "pro" ? "unlimited" : `${active.length} / 2`;
  const usageBar =
    state.plan === "pro"
      ? "100%"
      : `${Math.min(100, (active.length / 2) * 100)}%`;
  const usageNote =
    state.plan === "pro"
      ? "Unlimited active projects"
      : `${active.length} of ${lim} active projects used`;

  return (
    <aside
      className="border-divider sticky top-0 flex h-screen w-[238px] flex-none flex-col gap-[16px] overflow-y-auto overscroll-contain border-r bg-[#080910] p-[18px_14px_20px] max-lg:fixed max-lg:top-0 max-lg:-left-[282px] max-lg:z-45 max-lg:w-[274px]! max-lg:overflow-y-auto max-lg:px-3.5! max-lg:pt-4! max-lg:pb-[26px]! max-lg:data-[open=1]:left-0 max-lg:data-[open=1]:shadow-lg"
      data-open={state.navOpen ? "1" : "0"}
    >
      <div className="flex items-center gap-[9px] p-[0_4px]">
        <div className="border-accent grid h-[20px] w-[20px] place-items-center rounded-[3px] border">
          <div className="bg-accent h-[7px] w-[7px]" />
        </div>
        <div className="font-heading text-[19px] font-semibold">EZLane</div>
      </div>

      <button
        className="border-divider font-body text-text/45 hover:border-text/30 flex w-full cursor-pointer items-center gap-2 rounded border bg-transparent px-[9px] py-[7px] text-left text-[12.5px]"
        onClick={openPalette}
      >
        <IconSearch className="h-[13px] w-[13px] opacity-60" />
        <span className="flex-1">Search or jump to…</span>
        <span className="border-divider text-text/50 rounded-[3px] border px-1 py-px font-mono text-[10px]">
          ⌘K
        </span>
      </button>

      <nav className="flex flex-col gap-[2px]">
        <div className="text-text/38 p-[4px_9px_6px] text-[9.5px] tracking-[0.12em] uppercase">
          Work
        </div>
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center gap-[9px] rounded px-[9px] py-1.5 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:flex-none [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:opacity-90"
            data-cur={pathname.startsWith(href) ? "1" : "0"}
            onClick={closeNav}
          >
            <Icon />
            {label}
          </Link>
        ))}
        <Link
          href="/notifications"
          className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center gap-[9px] rounded px-[9px] py-1.5 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:flex-none [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:opacity-90"
          data-cur={pathname.startsWith("/notifications") ? "1" : "0"}
          onClick={closeNav}
        >
          <IconBell />
          <span className="flex-1">Notifications</span>
          {unreadCount > 0 ? (
            <span
              className="data-[s=sent]:bg-accent-100 data-[s=sent]:text-accent-800 data-[s=commented]:text-accent-700 data-[s=accepted]:bg-text data-[s=accepted]:text-bg data-[s=done]:text-text/60 data-[s=warn]:text-accent-700 inline-flex items-center rounded-[3px] px-[7px] py-[1px] text-[10px] tracking-[0.02em] whitespace-nowrap data-[s=commented]:bg-transparent data-[s=commented]:shadow-[inset_0_0_0_1px_var(--color-accent)] data-[s=done]:bg-transparent data-[s=done]:shadow-[inset_0_0_0_1px_var(--color-divider)] data-[s=draft]:bg-neutral-200 data-[s=draft]:text-neutral-800 data-[s=warn]:bg-transparent data-[s=warn]:shadow-[inset_0_0_0_1px_var(--color-accent-400)]"
              data-s="sent"
            >
              {unreadCount}
            </span>
          ) : null}
        </Link>

        <div className="text-text/38 p-[14px_9px_6px] text-[9.5px] tracking-[0.12em] uppercase">
          Settings
        </div>
        {SETTINGS_ITEMS.map(({ href, label, pro }) => (
          <Link
            key={href}
            href={href}
            className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center gap-[9px] rounded px-[9px] py-1.5 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:flex-none [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:opacity-90"
            data-cur={pathname === href ? "1" : "0"}
            onClick={closeNav}
          >
            <span className="flex-1">{label}</span>
            {pro && state.plan === "free" ? (
              <span className="text-accent-700 text-[9.5px] tracking-[0.08em]">
                PRO
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="border-divider mt-auto flex flex-col gap-[8px] rounded-[5px] border p-[11px_12px]">
        <div className="flex items-baseline justify-between">
          <span className="font-heading text-[14px] font-semibold">
            {state.plan === "pro" ? "Pro" : "Free"} plan
          </span>
          <span className="text-text/50 text-[11px]">{usageShort}</span>
        </div>
        <div className="bg-text/12 h-[3px] overflow-hidden rounded-sm">
          <svg className="text-accent block h-full w-full" aria-hidden="true">
            <rect width={usageBar} height="100%" fill="currentColor" />
          </svg>
        </div>
        <div className="text-text/55 text-[11.5px] leading-[1.5]">
          {usageNote}
        </div>
        {state.plan === "free" ? (
          <Link href="/plans" onClick={closeNav}>
            <Button variant="primary" className="w-full p-[5px] text-[12.5px]">
              Upgrade to Pro
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="border-divider flex items-center gap-[8px] border-t p-[0_4px] pt-[12px]">
        <div className="font-heading border-divider grid h-[24px] w-[24px] place-items-center rounded-full border text-[10.5px]">
          {initials(state.settings.name)}
        </div>
        <div className="min-w-0">
          <div className="overflow-hidden text-[12.5px] text-ellipsis whitespace-nowrap">
            {state.settings.name}
          </div>
          <div className="text-text/45 overflow-hidden text-[10.5px] text-ellipsis whitespace-nowrap">
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
