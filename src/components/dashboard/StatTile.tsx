export default function StatTile({
    label,
    value,
    note,
}: {
    label: string;
    value: string | number;
    note: string;
}) {
    return (
        <div className="bg-bg p-[16px_18px]">
            <div className="text-accent text-[10px] tracking-[0.12em] uppercase">
                {label}
            </div>
            <div className="font-heading mt-[6px] text-[30px] leading-[1.1] tabular-nums">
                {value}
            </div>
            <div className="text-text/55 text-[12px]">{note}</div>
        </div>
    );
}
