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
export default function statusKey(value: string): string {
  return STATUS_KEY_MAP[value] ?? "draft";
}
