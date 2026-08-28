export default function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-bg p-[13px_15px]">
      <div className="text-text/42 text-[10px] tracking-[0.12em] uppercase">
        {label}
      </div>
      <div className="font-heading mt-[4px] text-[21px] tabular-nums">
        {value}
      </div>
    </div>
  );
}
