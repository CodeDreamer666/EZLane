export interface ProposalComment {
    id: string;
    author: string;
    side: "freelancer" | "client";
    anchor: string;
    text: string;
    ts: number;
    resolved: boolean;
}

export type ProposalStatus =
    "Draft" | "Sent" | "Client Commented" | "Revised" | "Accepted";

export interface Proposal {
    id: string;
    clientId: string;
    projectId: string;
    title: string;
    price: number;
    due: string;
    deliverables: string[];
    body: string;
    status: ProposalStatus;
    lastSaved: number | null;
    sentAt: number | null;
    comments: ProposalComment[];
    font?: string;
    fontSize?: string;
}