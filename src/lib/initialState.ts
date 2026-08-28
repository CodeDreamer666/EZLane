import seed from "~/lib/seed-data";
import type { EzlaneState } from "~/lib/types";

export default function initialState(): EzlaneState {
  const state = seed();
  return {
    clients: state.clients,
    projects: state.projects,
    proposals: state.proposals,
    notifications: state.notifications,
    settings: state.settings,
    plan: "free",
    billing: "monthly",
    paletteOpen: false,
    paletteQuery: "",
    addClientOpen: false,
    toast: "",
    openTabs: ["pr5"],
    unlocked: {},
    gatePw: "",
    gateError: "",
    composer: {},
    dragOver: "",
    signName: "",
    acceptOpen: false,
    pendingAnchor: "",
    commentDraft: "",
    navOpen: false,
  };
}
