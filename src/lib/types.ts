export type Plan = "free" | "pro";

export type ProjectStage = "proposal" | "active" | "completed";

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  notes: string;
}

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
  | "Draft"
  | "Sent"
  | "Client Commented"
  | "Revised"
  | "Accepted";

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

export type NotificationAudience = "freelancer" | "client";

export interface AppNotification {
  id: string;
  projectId: string;
  audience: NotificationAudience;
  title: string;
  ts: number;
  read: boolean;
  route: string;
}

export interface Settings {
  name: string;
  email: string;
  invoiceName: string;
  invoiceContact: string;
  prefix: string;
  accent: string;
  logo: string;
  welcome: string;
  hideBranding: boolean;
}

export interface ComposerDraft {
  text: string;
  file: string;
}

/** Everything the mock's `Component.state` holds. */
export interface EzlaneState {
  clients: Client[];
  projects: Project[];
  proposals: Proposal[];
  notifications: AppNotification[];
  settings: Settings;
  plan: Plan;
  billing: "monthly" | "annual";

  paletteOpen: boolean;
  paletteQuery: string;
  addClientOpen: boolean;
  toast: string;
  openTabs: string[];
  unlocked: Record<string, true | "preview">;
  gatePw: string;
  gateError: string;
  composer: Record<string, ComposerDraft>;
  dragOver: string;
  signName: string;
  acceptOpen: boolean;
  pendingAnchor: string;
  commentDraft: string;
  navOpen: boolean;
}
