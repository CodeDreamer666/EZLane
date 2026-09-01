import type { Client, Project, Settings } from "~/type";

export function money(n: number | undefined | null): string {
    return "$" + Number(n ?? 0).toLocaleString("en-US");
}

export function companyOrName(
    client: Pick<Client, "company" | "name"> | undefined,
): string {
    if (!client) return "";
    return client.company || client.name;
}

export function fmtDate(value: string | undefined | null): string {
    if (!value) return "—";
    return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function fmtTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function ago(timestamp: number): string {
    const minutes = Math.round((Date.now() - timestamp) / 60000);
    if (minutes < 60) return minutes + " min ago";
    const hours = Math.round(minutes / 60);
    if (hours < 24) return hours + (hours === 1 ? " hr ago" : " hrs ago");
    const days = Math.round(hours / 24);
    return days + (days === 1 ? " day ago" : " days ago");
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

const PROPOSAL_STATUS_LABELS: Record<string, string> = {
    DRAFT: "Draft",
    SENT: "Sent",
    CLIENT_COMMENTED: "Client Commented",
    REVISED: "Revised",
    ACCEPTED: "Accepted",
};

export function proposalStatusLabel(status: string): string {
    return PROPOSAL_STATUS_LABELS[status] ?? "Draft";
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
    NOT_STARTED: "Not started",
    IN_PROGRESS: "In Progress",
    DELIVERED: "Delivered",
    AWAITING_REVIEW: "Awaiting Review",
    APPROVED: "Approved",
};

export function projectStatusLabel(status: string): string {
    return PROJECT_STATUS_LABELS[status] ?? "Not started";
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

export function received(project: Project): number {
    return (
        (project.deposit ? project.price / 2 : 0) +
        (project.final ? project.price / 2 : 0)
    );
}
