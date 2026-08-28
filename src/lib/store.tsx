"use client";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { companyOrName, uid } from "~/lib/format";
import initialState from "~/lib/initialState";
import { notifyError, notifySuccess } from "~/lib/messages";
import type {
  AppNotification,
  Client,
  ComposerDraft,
  EzlaneState,
  Plan,
  Project,
  ProjectMessage,
  Proposal,
  Settings,
} from "~/lib/types";

/** Limit on simultaneously active (non-completed) projects for the Free plan;
 * Pro is unlimited. Mirrors the mock's `limit()`. */
const FREE_ACTIVE_PROJECT_LIMIT = 2;

export interface EzlaneApi {
  state: EzlaneState;

  // lookups
  client: (id: string) => Client;
  project: (id: string) => Project | undefined;
  proposal: (id: string) => Proposal | undefined;
  activeProjects: () => Project[];
  limit: () => number;

  // ui
  say: (text: string) => void;
  /** Top-level green success banner (auto-dismisses; also has a ✕). */
  success: (text: string) => void;
  /** Top-level red error banner (auto-dismisses; also has a ✕). */
  error: (text: string) => void;
  openPalette: () => void;
  closePalette: () => void;
  setPaletteQuery: (q: string) => void;
  openAddClient: () => void;
  closeAddClient: () => void;
  toggleNav: () => void;
  closeNav: () => void;
  closeTransientUi: () => void;

  // clients
  addClient: (
    nc: { name: string; email: string; company: string; notes: string },
    thenPropose: boolean,
  ) => void;

  // proposals / projects lifecycle
  newProposal: (clientId: string) => string;
  patchProject: (id: string, patch: Partial<Project>) => void;
  patchProposal: (id: string, patch: Partial<Proposal>) => void;
  saveProposal: (id: string, html: string) => void;
  sendProposal: (id: string, html: string) => void;
  setStatus: (projectId: string, value: string) => void;
  toggleDeposit: (projectId: string) => void;
  toggleFinal: (projectId: string) => void;
  completeProject: (projectId: string) => void;
  reopenProject: (projectId: string) => void;
  addDeliverable: (proposalId: string) => void;
  setDeliverable: (proposalId: string, index: number, text: string) => void;
  removeDeliverable: (proposalId: string, index: number) => void;
  addProposalComment: (
    proposalId: string,
    anchor: string,
    text: string,
  ) => void;
  toggleProposalComment: (proposalId: string, commentId: string) => void;
  addClientComment: (
    projectId: string,
    proposalId: string,
    anchor: string,
    text: string,
  ) => void;

  // tabs (proposal editor)
  openTab: (id: string) => void;
  closeTab: (id: string) => void;

  // notifications
  notify: (n: Omit<AppNotification, "id" | "ts" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: (audience?: "freelancer" | "client", projectId?: string) => void;

  // messaging
  composer: (projectId: string) => ComposerDraft;
  setComposer: (projectId: string, patch: Partial<ComposerDraft>) => void;
  post: (
    projectId: string,
    msg: Omit<ProjectMessage, "id" | "ts" | "file"> & { file?: string | null },
  ) => void;
  sendMessage: (projectId: string, side: "freelancer" | "client") => void;
  setDragOver: (projectId: string) => void;
  clearDragOver: () => void;

  // portal
  setGatePw: (v: string) => void;
  tryUnlock: (project: Project) => void;
  openGatePreview: (projectId: string) => void;
  previewPortal: (projectId: string) => void;
  openAccept: () => void;
  closeAccept: () => void;
  setSignName: (v: string) => void;
  setPendingAnchor: (v: string) => void;
  setCommentDraft: (v: string) => void;
  cancelComment: () => void;
  acceptProposal: (project: Project, proposal: Proposal) => void;
  signContract: (project: Project) => void;
  approveWork: (project: Project) => void;

  // settings / plan
  setSetting: (key: keyof Settings, value: Settings[keyof Settings]) => void;
  setBilling: (v: "monthly" | "annual") => void;
  setPlan: (plan: Plan) => void;

  // navigation
  go: (path: string) => void;
}

export const EzlaneContext = createContext<EzlaneApi | null>(null);

export default function EzlaneProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EzlaneState>(initialState);
  const router = useRouter();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback(
    (path: string) => {
      setState((s) => ({ ...s, paletteOpen: false, navOpen: false }));
      router.push(path);
    },
    [router],
  );

  const say = useCallback((text: string) => {
    setState((s) => ({ ...s, toast: text }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setState((s) => ({ ...s, toast: "" })),
      2800,
    );
  }, []);

  const success = useCallback((text: string) => {
    notifySuccess(text);
  }, []);
  const error = useCallback((text: string) => {
    notifyError(text);
  }, []);

  const client = useCallback(
    (id: string): Client =>
      state.clients.find((c) => c.id === id) ?? {
        id: "",
        name: "",
        email: "",
        company: "",
        notes: "",
      },
    [state.clients],
  );
  const project = useCallback(
    (id: string) => state.projects.find((p) => p.id === id),
    [state.projects],
  );
  const proposal = useCallback(
    (id: string) => state.proposals.find((p) => p.id === id),
    [state.proposals],
  );
  const activeProjects = useCallback(
    () => state.projects.filter((p) => p.stage === "active" && !p.completed),
    [state.projects],
  );
  const limit = useCallback(
    () => (state.plan === "pro" ? Infinity : FREE_ACTIVE_PROJECT_LIMIT),
    [state.plan],
  );

  const patchProject = useCallback((id: string, patch: Partial<Project>) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);
  const patchProposal = useCallback((id: string, patch: Partial<Proposal>) => {
    setState((s) => ({
      ...s,
      proposals: s.proposals.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const notify = useCallback(
    (n: Omit<AppNotification, "id" | "ts" | "read">) => {
      setState((s) => ({
        ...s,
        notifications: [
          { ...n, id: uid("n"), ts: Date.now(), read: false },
          ...s.notifications,
        ],
      }));
    },
    [],
  );

  const post = useCallback(
    (
      projectId: string,
      msg: Omit<ProjectMessage, "id" | "ts" | "file"> & {
        file?: string | null;
      },
    ) => {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                messages: p.messages.concat([
                  {
                    id: uid("m"),
                    ts: Date.now(),
                    file: msg.file ?? null,
                    from: msg.from,
                    side: msg.side,
                    text: msg.text,
                  },
                ]),
              }
            : p,
        ),
      }));
    },
    [],
  );

  // ── ui ──────────────────────────────────────────────────────────────
  const openPalette = useCallback(
    () => setState((s) => ({ ...s, paletteOpen: true, paletteQuery: "" })),
    [],
  );
  const closePalette = useCallback(
    () => setState((s) => ({ ...s, paletteOpen: false })),
    [],
  );
  const setPaletteQuery = useCallback(
    (q: string) => setState((s) => ({ ...s, paletteQuery: q })),
    [],
  );
  const openAddClient = useCallback(
    () => setState((s) => ({ ...s, addClientOpen: true })),
    [],
  );
  const closeAddClient = useCallback(
    () => setState((s) => ({ ...s, addClientOpen: false })),
    [],
  );
  const toggleNav = useCallback(
    () => setState((s) => ({ ...s, navOpen: !s.navOpen })),
    [],
  );
  const closeNav = useCallback(
    () => setState((s) => ({ ...s, navOpen: false })),
    [],
  );
  const closeTransientUi = useCallback(
    () =>
      setState((s) => ({
        ...s,
        paletteOpen: false,
        addClientOpen: false,
        acceptOpen: false,
      })),
    [],
  );

  // ── clients ─────────────────────────────────────────────────────────
  const newProposal = useCallback(
    (clientId: string): string => {
      const prId = uid("pr");
      const pId = uid("p");
      const c = state.clients.find((x) => x.id === clientId);
      const slug = companyOrName(c)
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .slice(0, 8);
      const proj: Project = {
        id: pId,
        clientId,
        title: "Untitled project",
        stage: "proposal",
        completed: false,
        price: 0,
        due: "",
        deliverables: [],
        status: "Not started",
        progress: 0,
        password: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
        contract: null,
        deposit: false,
        final: false,
        proposalId: prId,
        messages: [],
      };
      const prop: Proposal = {
        id: prId,
        clientId,
        projectId: pId,
        title: "Untitled project",
        price: 0,
        due: "",
        deliverables: [],
        body: `<h2>Overview</h2><p className="mb-3">What the project is and why it matters to ${companyOrName(c)}.</p><h2>Approach</h2><p className="mb-3">How you will work, in the order you will work.</p><h2>Terms</h2><p className="mb-3">50% deposit to start, 50% on completion.</p>`,
        status: "Draft",
        lastSaved: null,
        sentAt: null,
        comments: [],
      };
      setState((s) => ({
        ...s,
        projects: s.projects.concat([proj]),
        proposals: s.proposals.concat([prop]),
        openTabs: s.openTabs.concat([prId]),
      }));
      go(`/proposals/${prId}`);
      return prId;
    },
    [state.clients, go],
  );

  const addClient = useCallback(
    (
      nc: { name: string; email: string; company: string; notes: string },
      thenPropose: boolean,
    ) => {
      const id = uid("c");
      setState((s) => ({
        ...s,
        clients: s.clients.concat([
          {
            id,
            name: nc.name.trim(),
            email: nc.email.trim(),
            company: nc.company.trim(),
            notes: nc.notes.trim(),
          },
        ]),
        addClientOpen: false,
      }));
      if (thenPropose) {
        setTimeout(() => newProposal(id), 0);
      } else {
        say(`${nc.name.trim()} added`);
        go("/clients");
      }
    },
    [newProposal, say, go],
  );

  // ── proposal editor ─────────────────────────────────────────────────
  const saveProposal = useCallback(
    (id: string, html: string) => {
      patchProposal(id, { body: html, lastSaved: Date.now() });
      say(
        `Saved at ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
      );
    },
    [patchProposal, say],
  );

  const sendProposal = useCallback(
    (id: string, html: string) => {
      const pr = state.proposals.find((p) => p.id === id);
      if (!pr) return;
      const wasOut = pr.status !== "Draft";
      patchProposal(id, {
        body: html,
        lastSaved: Date.now(),
        status: "Sent",
        sentAt: Date.now(),
      });
      patchProject(pr.projectId, {
        title: pr.title,
        price: pr.price,
        due: pr.due,
        deliverables: pr.deliverables.slice(),
      });
      const c = client(pr.clientId);
      notify({
        projectId: pr.projectId,
        audience: "freelancer",
        title:
          (wasOut ? "Revised proposal sent to " : "Proposal sent to ") +
          c.name +
          " — “" +
          pr.title +
          "”",
        route: `/proposals/${pr.id}`,
      });
      notify({
        projectId: pr.projectId,
        audience: "client",
        title:
          state.settings.name +
          (wasOut ? " sent a revised proposal" : " sent you a proposal"),
        route: "/proposal",
      });
      say(wasOut ? `Revision sent to ${c.name}` : `Proposal sent to ${c.name}`);
    },
    [
      state.proposals,
      state.settings.name,
      patchProposal,
      patchProject,
      client,
      notify,
      say,
    ],
  );

  const addDeliverable = useCallback(
    (proposalId: string) =>
      setState((s) => ({
        ...s,
        proposals: s.proposals.map((p) =>
          p.id === proposalId
            ? { ...p, deliverables: p.deliverables.concat([""]) }
            : p,
        ),
      })),
    [],
  );
  const setDeliverable = useCallback(
    (proposalId: string, index: number, text: string) =>
      setState((s) => ({
        ...s,
        proposals: s.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                deliverables: p.deliverables.map((x, j) =>
                  j === index ? text : x,
                ),
              }
            : p,
        ),
      })),
    [],
  );
  const removeDeliverable = useCallback(
    (proposalId: string, index: number) =>
      setState((s) => ({
        ...s,
        proposals: s.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                deliverables: p.deliverables.filter((_, j) => j !== index),
              }
            : p,
        ),
      })),
    [],
  );

  const addProposalComment = useCallback(
    (proposalId: string, anchor: string, text: string) =>
      setState((s) => ({
        ...s,
        proposals: s.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                comments: p.comments.concat([
                  {
                    id: uid("cm"),
                    author: s.settings.name,
                    side: "freelancer",
                    anchor: anchor.slice(0, 120),
                    text,
                    ts: Date.now(),
                    resolved: false,
                  },
                ]),
              }
            : p,
        ),
      })),
    [],
  );
  const toggleProposalComment = useCallback(
    (proposalId: string, commentId: string) =>
      setState((s) => ({
        ...s,
        proposals: s.proposals.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === commentId ? { ...c, resolved: !c.resolved } : c,
                ),
              }
            : p,
        ),
      })),
    [],
  );

  /** Client-side comment from the portal — flips the proposal to "Client
   * Commented" (unless already accepted) and notifies the freelancer. */
  const addClientComment = useCallback(
    (projectId: string, proposalId: string, anchor: string, text: string) => {
      const p = state.projects.find((x) => x.id === projectId);
      const pr = state.proposals.find((x) => x.id === proposalId);
      if (!p || !pr) return;
      const c = client(p.clientId);
      setState((s) => ({
        ...s,
        proposals: s.proposals.map((x) =>
          x.id === proposalId
            ? {
                ...x,
                status: x.status === "Accepted" ? x.status : "Client Commented",
                comments: x.comments.concat([
                  {
                    id: uid("cm"),
                    author: c.name,
                    side: "client",
                    anchor,
                    text: text.trim(),
                    ts: Date.now(),
                    resolved: false,
                  },
                ]),
              }
            : x,
        ),
        pendingAnchor: "",
        commentDraft: "",
      }));
      notify({
        projectId,
        audience: "freelancer",
        title: `${c.name} left a comment on “${pr.title}”`,
        route: `/proposals/${proposalId}`,
      });
      say(
        `Comment added — it reaches ${state.settings.name} on their next load`,
      );
    },
    [state.projects, state.proposals, state.settings.name, client, notify, say],
  );

  // ── tabs ────────────────────────────────────────────────────────────
  const openTab = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        openTabs: s.openTabs.includes(id)
          ? s.openTabs
          : s.openTabs.concat([id]),
      })),
    [],
  );
  const closeTab = useCallback((id: string) => {
    setState((s) => ({ ...s, openTabs: s.openTabs.filter((x) => x !== id) }));
  }, []);

  // ── status / payments / lifecycle ──────────────────────────────────
  const setStatus = useCallback(
    (projectId: string, value: string) => {
      const p = state.projects.find((x) => x.id === projectId);
      patchProject(projectId, { status: value });
      post(projectId, {
        from: "system",
        side: "system",
        text: `Status changed to ${value}`,
      });
      notify({
        projectId,
        audience: "client",
        title: `Status changed to ${value}`,
        route: "/overview",
      });
      notify({
        projectId,
        audience: "freelancer",
        title: `Status changed to ${value} on “${p?.title ?? ""}”`,
        route: `/projects/${projectId}`,
      });
    },
    [state.projects, patchProject, post, notify],
  );

  const toggleDeposit = useCallback(
    (projectId: string) => {
      const p = state.projects.find((x) => x.id === projectId);
      if (!p) return;
      const v = !p.deposit;
      const half = Math.round(p.price / 2);
      patchProject(projectId, { deposit: v });
      if (v) {
        notify({
          projectId,
          audience: "freelancer",
          title: `Deposit marked received — $${half.toLocaleString("en-US")} on “${p.title}”`,
          route: `/projects/${projectId}`,
        });
        notify({
          projectId,
          audience: "client",
          title: "Deposit received — thank you",
          route: "/contract",
        });
      }
      say(v ? "Deposit marked received" : "Deposit unmarked");
    },
    [state.projects, patchProject, notify, say],
  );

  const toggleFinal = useCallback(
    (projectId: string) => {
      const p = state.projects.find((x) => x.id === projectId);
      if (!p) return;
      const v = !p.final;
      const half = Math.round(p.price / 2);
      patchProject(projectId, { final: v });
      if (v) {
        notify({
          projectId,
          audience: "freelancer",
          title: `Final payment marked received — $${half.toLocaleString("en-US")} on “${p.title}”`,
          route: `/projects/${projectId}`,
        });
        notify({
          projectId,
          audience: "client",
          title: "Final payment received — thank you",
          route: "/contract",
        });
      }
      say(v ? "Final payment marked received" : "Final payment unmarked");
    },
    [state.projects, patchProject, notify, say],
  );

  const completeProject = useCallback(
    (projectId: string) => {
      const p = state.projects.find((x) => x.id === projectId);
      patchProject(projectId, {
        completed: true,
        stage: "completed",
        progress: 100,
      });
      post(projectId, {
        from: "system",
        side: "system",
        text: "Project marked completed",
      });
      notify({
        projectId,
        audience: "client",
        title: "Project marked completed",
        route: "/overview",
      });
      notify({
        projectId,
        audience: "freelancer",
        title: `“${p?.title ?? ""}” marked completed — a plan slot is free`,
        route: `/projects/${projectId}`,
      });
      say("Completed — a plan slot is free");
    },
    [state.projects, patchProject, post, notify, say],
  );

  const reopenProject = useCallback(
    (projectId: string) => {
      patchProject(projectId, { completed: false, stage: "active" });
      say("Reopened as an active project");
    },
    [patchProject, say],
  );

  // ── notifications ───────────────────────────────────────────────────
  const markRead = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      })),
    [],
  );
  const markAllRead = useCallback(
    (audience?: "freelancer" | "client", projectId?: string) =>
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => {
          if (audience && n.audience !== audience) return n;
          if (projectId && n.projectId !== projectId) return n;
          return { ...n, read: true };
        }),
      })),
    [],
  );

  // ── messaging ───────────────────────────────────────────────────────
  const composer = useCallback(
    (projectId: string): ComposerDraft =>
      state.composer[projectId] ?? { text: "", file: "" },
    [state.composer],
  );
  const setComposer = useCallback(
    (projectId: string, patch: Partial<ComposerDraft>) =>
      setState((s) => ({
        ...s,
        composer: {
          ...s.composer,
          [projectId]: {
            text: "",
            file: "",
            ...s.composer[projectId],
            ...patch,
          },
        },
      })),
    [],
  );
  const setDragOver = useCallback(
    (projectId: string) => setState((s) => ({ ...s, dragOver: projectId })),
    [],
  );
  const clearDragOver = useCallback(
    () => setState((s) => ({ ...s, dragOver: "" })),
    [],
  );

  const sendMessage = useCallback(
    (projectId: string, side: "freelancer" | "client") => {
      const c = state.composer[projectId] ?? { text: "", file: "" };
      const p = state.projects.find((x) => x.id === projectId);
      if (!c.text.trim() && !c.file) {
        say("Write something first");
        return;
      }
      const who =
        side === "client"
          ? client(p?.clientId ?? "").name
          : state.settings.name;
      post(projectId, {
        from: who,
        side,
        text: c.text.trim(),
        file: c.file || null,
      });
      setComposer(projectId, { text: "", file: "" });
      if (side === "client") {
        notify({
          projectId,
          audience: "freelancer",
          title: `New message from ${who} on “${p?.title ?? ""}”`,
          route: `/projects/${projectId}`,
        });
      } else {
        notify({
          projectId,
          audience: "client",
          title: `${who} posted an update`,
          route: "/thread",
        });
      }
      say("Message posted — the other side sees it on their next load");
    },
    [
      state.composer,
      state.projects,
      state.settings.name,
      client,
      post,
      setComposer,
      notify,
      say,
    ],
  );

  // ── portal ──────────────────────────────────────────────────────────
  const setGatePw = useCallback(
    (v: string) => setState((s) => ({ ...s, gatePw: v, gateError: "" })),
    [],
  );

  const tryUnlock = useCallback(
    (p: Project) => {
      if (state.gatePw.trim() === p.password) {
        setState((s) => ({
          ...s,
          unlocked: { ...s.unlocked, [p.id]: true },
          gatePw: "",
          gateError: "",
        }));
        const pr = state.proposals.find((x) => x.id === p.proposalId);
        go(
          `/portal/${p.id}/${pr && pr.status !== "Accepted" ? "proposal" : "overview"}`,
        );
      } else {
        setState((s) => ({ ...s, gateError: "bad" }));
      }
    },
    [state.gatePw, state.proposals, go],
  );

  const openGatePreview = useCallback((projectId: string) => {
    setState((s) => {
      const unlocked = { ...s.unlocked };
      delete unlocked[projectId];
      return { ...s, unlocked };
    });
  }, []);

  const previewPortal = useCallback(
    (projectId: string) => {
      setState((s) => ({
        ...s,
        unlocked: { ...s.unlocked, [projectId]: "preview" },
      }));
      go(`/portal/${projectId}/overview`);
    },
    [go],
  );

  const openAccept = useCallback(
    () => setState((s) => ({ ...s, acceptOpen: true })),
    [],
  );
  const closeAccept = useCallback(
    () => setState((s) => ({ ...s, acceptOpen: false })),
    [],
  );
  const setSignName = useCallback(
    (v: string) => setState((s) => ({ ...s, signName: v })),
    [],
  );
  const setPendingAnchor = useCallback(
    (v: string) => setState((s) => ({ ...s, pendingAnchor: v })),
    [],
  );
  const setCommentDraft = useCallback(
    (v: string) => setState((s) => ({ ...s, commentDraft: v })),
    [],
  );
  const cancelComment = useCallback(
    () => setState((s) => ({ ...s, pendingAnchor: "", commentDraft: "" })),
    [],
  );

  const acceptProposal = useCallback(
    (p: Project, pr: Proposal) => {
      const c = client(p.clientId);
      patchProposal(pr.id, { status: "Accepted" });
      patchProject(p.id, {
        stage: "active",
        title: pr.title,
        price: pr.price,
        due: pr.due,
        deliverables: pr.deliverables.slice(),
        status: "Not started",
      });
      notify({
        projectId: p.id,
        audience: "freelancer",
        title: `${c.name} accepted “${pr.title}” — $${pr.price.toLocaleString("en-US")}. The project is live.`,
        route: `/projects/${p.id}`,
      });
      notify({
        projectId: p.id,
        audience: "client",
        title: "You accepted the proposal — the agreement is ready to sign",
        route: "/contract",
      });
      setState((s) => ({ ...s, acceptOpen: false }));
      go(`/portal/${p.id}/contract`);
      say("Accepted — the agreement is generated from these terms");
    },
    [client, patchProposal, patchProject, notify, go, say],
  );

  const signContract = useCallback(
    (p: Project) => {
      const name = state.signName.trim();
      if (name.length < 3) {
        say("Type your full name to sign");
        return;
      }
      patchProject(p.id, {
        contract: { name, ts: Date.now() },
        status: "In Progress",
      });
      post(p.id, {
        from: "system",
        side: "system",
        text: `Agreement signed by ${name}`,
      });
      const half = Math.round(p.price / 2);
      notify({
        projectId: p.id,
        audience: "freelancer",
        title: `${name} signed the agreement on “${p.title}” — deposit of $${half.toLocaleString("en-US")} is due`,
        route: `/projects/${p.id}`,
      });
      notify({
        projectId: p.id,
        audience: "client",
        title: "Agreement signed — deposit invoice issued",
        route: "/contract",
      });
      setState((s) => ({ ...s, signName: "" }));
      say("Signed — work can start");
    },
    [state.signName, patchProject, post, notify, say],
  );

  const approveWork = useCallback(
    (p: Project) => {
      const c = client(p.clientId);
      patchProject(p.id, { status: "Approved", progress: 100 });
      post(p.id, {
        from: "system",
        side: "system",
        text: `${c.name} approved the work`,
      });
      notify({
        projectId: p.id,
        audience: "freelancer",
        title: `${c.name} approved the work on “${p.title}” — final payment is due`,
        route: `/projects/${p.id}`,
      });
      say(`Approved — ${state.settings.name} has been notified`);
    },
    [client, state.settings.name, patchProject, post, notify, say],
  );

  // ── settings / plan ─────────────────────────────────────────────────
  const setSetting = useCallback(
    (key: keyof Settings, value: Settings[keyof Settings]) =>
      setState((s) => ({ ...s, settings: { ...s.settings, [key]: value } })),
    [],
  );
  const setBilling = useCallback(
    (v: "monthly" | "annual") => setState((s) => ({ ...s, billing: v })),
    [],
  );
  const setPlan = useCallback(
    (plan: Plan) => setState((s) => ({ ...s, plan })),
    [],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setState((s) => ({
          ...s,
          paletteOpen: !s.paletteOpen,
          paletteQuery: "",
        }));
      }
      if (e.key === "Escape") {
        setState((s) => ({
          ...s,
          paletteOpen: false,
          addClientOpen: false,
          acceptOpen: false,
        }));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value: EzlaneApi = useMemo(
    () => ({
      state,
      client,
      project,
      proposal,
      activeProjects,
      limit,
      say,
      success,
      error,
      openPalette,
      closePalette,
      setPaletteQuery,
      openAddClient,
      closeAddClient,
      toggleNav,
      closeNav,
      closeTransientUi,
      addClient,
      newProposal,
      patchProject,
      patchProposal,
      saveProposal,
      sendProposal,
      setStatus,
      toggleDeposit,
      toggleFinal,
      completeProject,
      reopenProject,
      addDeliverable,
      setDeliverable,
      removeDeliverable,
      addProposalComment,
      toggleProposalComment,
      addClientComment,
      openTab,
      closeTab,
      notify,
      markRead,
      markAllRead,
      composer,
      setComposer,
      post,
      sendMessage,
      setDragOver,
      clearDragOver,
      setGatePw,
      tryUnlock,
      openGatePreview,
      previewPortal,
      openAccept,
      closeAccept,
      setSignName,
      setPendingAnchor,
      setCommentDraft,
      cancelComment,
      acceptProposal,
      signContract,
      approveWork,
      setSetting,
      setBilling,
      setPlan,
      go,
    }),
    [
      state,
      client,
      project,
      proposal,
      activeProjects,
      limit,
      say,
      success,
      error,
      openPalette,
      closePalette,
      setPaletteQuery,
      openAddClient,
      closeAddClient,
      toggleNav,
      closeNav,
      closeTransientUi,
      addClient,
      newProposal,
      patchProject,
      patchProposal,
      saveProposal,
      sendProposal,
      setStatus,
      toggleDeposit,
      toggleFinal,
      completeProject,
      reopenProject,
      addDeliverable,
      setDeliverable,
      removeDeliverable,
      addProposalComment,
      toggleProposalComment,
      addClientComment,
      openTab,
      closeTab,
      notify,
      markRead,
      markAllRead,
      composer,
      setComposer,
      post,
      sendMessage,
      setDragOver,
      clearDragOver,
      setGatePw,
      tryUnlock,
      openGatePreview,
      previewPortal,
      openAccept,
      closeAccept,
      setSignName,
      setPendingAnchor,
      setCommentDraft,
      cancelComment,
      acceptProposal,
      signContract,
      approveWork,
      setSetting,
      setBilling,
      setPlan,
      go,
    ],
  );

  return (
    <EzlaneContext.Provider value={value}>{children}</EzlaneContext.Provider>
  );
}
