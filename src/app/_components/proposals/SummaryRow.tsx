export default function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-text/55">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
