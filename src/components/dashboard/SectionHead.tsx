import Link from "next/link";

export default function SectionHead({
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
            className={`border-divider flex items-baseline justify-between border-b ${small ? "mb-3 pb-[7px]" : "mb-4 pb-2"}`}
        >
            <h4 className="font-heading m-0 text-base leading-[1.12] font-semibold tracking-[-0.015em]">
                {title}
            </h4>
            <Link
                href={href}
                className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[12px] no-underline hover:underline"
            >
                {linkLabel}
            </Link>
        </div>
    );
}
