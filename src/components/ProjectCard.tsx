import Link from "next/link";

import { Tag, type StatusKey } from "~/components/shared";
import { fmtDate, money, statusKey } from "~/lib/format";

interface ProjectCardProps {
    href: string;
    clientLabel: string;
    title: string;
    statusLabel: string;
    progress: number;
    price: number;
    due: string;
    payLabel: string;
    blocked?: boolean;
}

export default function ProjectCard({
    href,
    clientLabel,
    title,
    statusLabel,
    progress,
    price,
    due,
    payLabel,
    blocked = false,
}: ProjectCardProps) {
    return (
        <Link
            href={href}
            className="border-divider hover:bg-text/5 flex cursor-pointer flex-col gap-2 gap-[10px] rounded-md border bg-transparent p-3"
        >
            <div className="flex items-start gap-[12px]">
                <div className="min-w-0 flex-1">
                    <div className="text-accent text-[10px] tracking-[0.1em] uppercase">
                        {clientLabel}
                    </div>
                    <div className="font-heading text-text mt-[3px] text-[17px] leading-[1.2] font-semibold">
                        {title}
                    </div>
                </div>
                <Tag status={statusKey(statusLabel) as StatusKey}>{statusLabel}</Tag>
            </div>
            <div className="flex items-center gap-[10px]">
                <div className="bg-text/12 h-[3px] flex-1 overflow-hidden rounded-sm">
                    <svg className="text-accent block h-full w-full" aria-hidden="true">
                        <rect width={`${progress}%`} height="100%" fill="currentColor" />
                    </svg>
                </div>
                <span className="text-text/55 text-[11px] tabular-nums">{progress}%</span>
            </div>
            <div className="text-text/50 flex items-center gap-1.5 gap-[14px] text-[11px]">
                <span className="tabular-nums">{money(price)}</span>
                <span>Due {fmtDate(due)}</span>
                <span>{payLabel}</span>
                {blocked ? <Tag status="warn">needs a slot</Tag> : null}
            </div>
        </Link>
    );
}
