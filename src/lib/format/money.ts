export default function money(n: number | undefined | null): string {
  return "$" + Number(n ?? 0).toLocaleString("en-US");
}
