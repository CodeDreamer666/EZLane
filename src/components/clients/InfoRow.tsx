export default function InfoRow({
    label,
    value,
    muted = false,
}: {
    label: string;
    value: string;
    muted?: boolean;
}) {
    return (
        <div>
            <div className="text-text/42 text-[10px] tracking-[0.12em] uppercase">
                {label}
            </div>
            <div className={`mt-[3px] text-[13px] ${muted ? "text-text/70" : ""}`}>
                {value}
            </div>
        </div>
    );
}
