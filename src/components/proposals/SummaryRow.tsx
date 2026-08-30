export default function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="border-text/10 bg-bg/50 flex min-w-0 flex-col gap-[3px] rounded-md border p-[9px_10px]">
            <span className="text-text/38 text-[9.5px] font-medium tracking-[0.1em] uppercase">
                {label}
            </span>
            <span
                className="font-heading text-text truncate text-[14.5px] leading-tight font-semibold tabular-nums"
                title={value}
            >
                {value}
            </span>
        </div>
    );
}
