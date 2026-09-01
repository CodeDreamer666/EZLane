import type { Client } from "./client";
import type { AppNotification } from "./notification";
import type { Project } from "./project";
import type { Proposal } from "./proposal";
import type { Settings } from "./setting";
import type { Plan } from "./plan";
import type { ComposerDraft } from "./composerDraft";

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
    toast: string;
    openTabs: string[];
    composer: Record<string, ComposerDraft>;
    dragOver: string;
    navOpen: boolean;
}