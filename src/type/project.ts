export type ProjectStage = "proposal" | "active" | "completed";

export interface Contract {
    name: string;
    ts: number;
}

export interface ProjectMessage {
    id: string;
    from: string;
    side: "freelancer" | "client" | "system";
    ts: number;
    text: string;
    file: string | null;
}

export interface Project {
    id: string;
    clientId: string;
    title: string;
    stage: ProjectStage;
    completed: boolean;
    price: number;
    due: string;
    deliverables: string[];
    status: string;
    progress: number;
    password: string;
    contract: Contract | null;
    deposit: boolean;
    final: boolean;
    proposalId: string;
    messages: ProjectMessage[];
}