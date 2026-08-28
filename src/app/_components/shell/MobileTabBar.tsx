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
import useEzlane from "~/lib/useEzlane";

const TABS = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
  { href: "/projects", label: "Projects", Icon: IconProjects },
  { href: "/proposals", label: "Proposals", Icon: IconProposals },
  { href: "/notifications", label: "Alerts", Icon: IconBell },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();
  const { toggleNav } = useEzlane();

  return (
    <nav className="max-sm:border-divider hidden max-sm:fixed max-sm:right-0 max-sm:bottom-0 max-sm:left-0 max-sm:z-42 max-sm:flex max-sm:border-t max-sm:bg-[#080910] max-sm:px-1 max-sm:pt-[5px] max-sm:pb-[calc(5px+env(safe-area-inset-bottom))]">
      {TABS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className="max-sm:font-body max-sm:text-text/52 max-sm:data-[cur=1]:text-accent max-sm:flex max-sm:min-h-[52px] max-sm:flex-1 max-sm:cursor-pointer max-sm:flex-col max-sm:items-center max-sm:gap-1 max-sm:rounded-[5px] max-sm:border-0 max-sm:bg-transparent max-sm:px-0.5 max-sm:py-[7px] max-sm:text-[10px] max-sm:no-underline max-sm:[&_svg]:h-[19px] max-sm:[&_svg]:w-[19px] max-sm:[&_svg]:fill-none max-sm:[&_svg]:stroke-current"
          data-cur={pathname.startsWith(href) ? "1" : "0"}
        >
          <Icon />
          {label}
        </Link>
      ))}
      <button
        className="max-sm:font-body max-sm:text-text/52 max-sm:data-[cur=1]:text-accent max-sm:flex max-sm:min-h-[52px] max-sm:flex-1 max-sm:cursor-pointer max-sm:flex-col max-sm:items-center max-sm:gap-1 max-sm:rounded-[5px] max-sm:border-0 max-sm:bg-transparent max-sm:px-0.5 max-sm:py-[7px] max-sm:text-[10px] max-sm:no-underline max-sm:[&_svg]:h-[19px] max-sm:[&_svg]:w-[19px] max-sm:[&_svg]:fill-none max-sm:[&_svg]:stroke-current"
        onClick={toggleNav}
      >
        <IconMenu />
        More
      </button>
    </nav>
  );
}
