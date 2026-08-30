"use client";

import Link from "next/link";

export default function ProposalTabBar({
  proposal,
}: {
  proposal: { title: string; client: { name: string } };
}) {
  return (
    <div className="border-divider mb-[22px] flex items-end gap-[3px] overflow-auto border-b max-sm:hidden!">
      <div className="font-body border-divider bg-surface text-text flex max-w-[230px] items-center gap-2 rounded-t-[5px] border border-b-0 px-[13px] py-2 text-[12.5px] leading-[normal] whitespace-nowrap">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {proposal.client.name.split(" ")[0]} — {proposal.title}
        </span>
      </div>
      <Link
        href="/proposals"
        className="font-body text-text/72 hover:bg-text/8 hover:text-text mb-[6px] ml-[4px] min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap max-lg:min-h-[38px] max-lg:min-w-[38px]"
      >
        All proposals
      </Link>
    </div>
  );
}
