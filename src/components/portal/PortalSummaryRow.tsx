export default function PortalSummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-divider flex justify-between border-b pb-[7px]">
      <span className="text-text/55">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
