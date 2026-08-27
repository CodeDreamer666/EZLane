import type { Client, Project, Settings } from "~/lib/types";

export function money(n: number | undefined | null): string {
  return "$" + Number(n ?? 0).toLocaleString("en-US");
}

/** Company name, falling back to the person's name when no company is set —
 * used throughout for client-facing labels ("client" column, card kickers). */
export function companyOrName(c: Pick<Client, "company" | "name"> | undefined): string {
  if (!c) return "";
  return c.company ? c.company : c.name;
}

export function fmtDate(s: string | undefined | null): string {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ago(ts: number): string {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 60) return m + " min ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + (h === 1 ? " hr ago" : " hrs ago");
  const d = Math.round(h / 24);
  return d + (d === 1 ? " day ago" : " days ago");
}

export function uid(prefix: string): string {
  return prefix + Math.random().toString(36).slice(2, 7);
}

const STATUS_KEY_MAP: Record<string, string> = {
  Draft: "draft",
  Sent: "sent",
  "Client Commented": "commented",
  Accepted: "accepted",
  Revised: "sent",
  "In Progress": "sent",
  Delivered: "commented",
  "Awaiting Review": "commented",
  Approved: "accepted",
  "Not started": "draft",
  Completed: "done",
};

export function statusKey(value: string): string {
  return STATUS_KEY_MAP[value] ?? "draft";
}

export function contractText(
  project: Project,
  client: Client,
  settings: Settings,
) {
  return {
    parties: `This agreement is made between ${settings.invoiceName} (“the Contractor”) and ${client.company || client.name} (“the Client”).`,
    scope: project.deliverables,
    price: money(project.price),
    half: money(Math.round(project.price / 2)),
    due: fmtDate(project.due),
  };
}

export function received(p: Project): number {
  return (p.deposit ? p.price / 2 : 0) + (p.final ? p.price / 2 : 0);
}
