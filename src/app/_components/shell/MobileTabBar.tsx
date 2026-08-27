"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IconDashboard,
  IconMenu,
  IconBell,
  IconProjects,
  IconProposals,
} from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

const TABS = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/projects", label: "Projects", Icon: IconProjects },
  { href: "/proposals", label: "Proposals", Icon: IconProposals },
  { href: "/notifications", label: "Alerts", Icon: IconBell },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const { toggleNav } = useEzlane();

  return (
    <nav className="btabs">
      {TABS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className="btab" data-cur={pathname.startsWith(href) ? "1" : "0"}>
          <Icon />
          {label}
        </Link>
      ))}
      <button className="btab" onClick={toggleNav}>
        <IconMenu />
        More
      </button>
    </nav>
  );
}
