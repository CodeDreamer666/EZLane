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
  if (r0 === "projects" && parts[1])
    return project(parts[1])?.title ?? "Project";
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
    <header className="bg-bg/92 border-divider sticky top-0 z-[5] flex items-center gap-[14px] border-b p-[15px_30px] backdrop-blur-[6px] max-lg:gap-3! max-lg:px-[18px]! max-lg:py-[11px]! max-sm:px-3.5! max-sm:py-[9px]!">
      <button
        className="max-lg:border-divider max-lg:text-text max-lg:hover:bg-text/8 hidden max-lg:grid max-lg:h-11 max-lg:w-11 max-lg:flex-none max-lg:cursor-pointer max-lg:place-items-center max-lg:rounded-[5px] max-lg:border max-lg:bg-transparent"
        onClick={toggleNav}
        aria-label="Menu"
      >
        <IconMenu className="h-[19px] w-[19px]" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="font-heading text-[20px] leading-[1.25] font-semibold max-sm:text-[17px]!">
          {title}
        </div>
      </div>
      <Link href="/notifications" className="max-sm:hidden!">
        <Button variant="secondary" className="gap-[7px]">
          <IconBell />
          {unreadLabel}
        </Button>
      </Link>
      <Button variant="primary" onClick={openAddClient}>
        +<span className="max-sm:hidden!"> Add Client</span>
      </Button>
    </header>
  );
}
