"use client";

import Link from "next/link";

import { Button, IconBell, IconMenu } from "~/components/shared";
import useAddClientModal from "~/hook/useAddClientModal";
import { api } from "~/trpc/react";
import usePageTitle from "./usePageTitle";

export default function Header({ toggleNav }: { toggleNav: () => void }) {
  const { openModal } = useAddClientModal();
  const title = usePageTitle();
  const { data: unreadCount } = api.notifications.unreadCount.useQuery();
  const unreadLabel = unreadCount ? `${unreadCount} new` : "No new";

  return (
    <header className="bg-bg/92 border-divider sticky top-0 z-[5] flex items-center gap-[14px] border-b p-[15px_30px] backdrop-blur-[6px] max-lg:gap-3! max-lg:px-[18px]! max-lg:py-[11px]! max-sm:px-3.5! max-sm:py-[9px]!">
      <button
        className="max-lg:border-divider max-lg:text-text max-lg:hover:bg-text/8 hidden cursor-pointer max-lg:grid max-lg:h-11 max-lg:w-11 max-lg:flex-none max-lg:cursor-pointer max-lg:place-items-center max-lg:rounded-[5px] max-lg:border max-lg:bg-transparent"
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
      <Button variant="primary" onClick={openModal}>
        +<span className="max-sm:hidden!"> Add Client</span>
      </Button>
    </header>
  );
}
