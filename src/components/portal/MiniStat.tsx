export default function MiniStat({
  label,
  value,
  big = false,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className={big ? "bg-bg px-4 py-3.5" : undefined}>
      <div className="text-text/42 text-[10px] tracking-[0.12em] uppercase">
        {label}
      </div>
      <div className="font-heading mt-[4px] text-[22px] tabular-nums">
        {value}
      </div>
    </div>
  );
}
