"use client";
import { useRouter } from "next/navigation";
import {
    createContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { uid } from "~/lib/format";
import { LoadingScreen } from "~/components/shared";
import seed from "~/data/seed-data";
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
} from "~/type";

/** Limit on simultaneously active (non-completed) projects for the Free plan;
 * Pro is unlimited. Mirrors the mock's `limit()`. */
const FREE_ACTIVE_PROJECT_LIMIT = 2;

const EMPTY_CLIENT: Client = {
    id: "",
    name: "",
    email: "",
    company: "",
    notes: "",
};

function initialState(): EzlaneState {
    const { clients, projects, proposals, notifications, settings } = seed();
    return {
        clients,
        projects,
        proposals,
        notifications,
        settings,
        plan: "free",
        billing: "monthly",
        paletteOpen: false,
        paletteQuery: "",
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
    openPalette: () => void;
    closePalette: () => void;
    setPaletteQuery: (q: string) => void;
    toggleNav: () => void;
    closeNav: () => void;

    // proposals / projects lifecycle
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
    const [appReady, setAppReady] = useState(false);
    const router = useRouter();
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const go = (path: string) => {
        setState((s) => ({ ...s, paletteOpen: false, navOpen: false }));
        router.push(path);
    };

    const say = (text: string) => {
        setState((s) => ({ ...s, toast: text }));

        if (toastTimer.current) clearTimeout(toastTimer.current);
        
        toastTimer.current = setTimeout(
            () => setState((s) => ({ ...s, toast: "" })),
            2800,
        );
    };

    const client = (id: string): Client =>
        state.clients.find((c) => c.id === id) ?? EMPTY_CLIENT;
    const project = (id: string) => state.projects.find((p) => p.id === id);
    const proposal = (id: string) => state.proposals.find((p) => p.id === id);
    const activeProjects = () =>
        state.projects.filter((p) => p.stage === "active" && !p.completed);
    const limit = () =>
        state.plan === "pro" ? Infinity : FREE_ACTIVE_PROJECT_LIMIT;

    const patchProject = (id: string, patch: Partial<Project>) => {
        setState((s) => ({
            ...s,
            projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
    };
    const patchProposal = (id: string, patch: Partial<Proposal>) => {
        setState((s) => ({
            ...s,
            proposals: s.proposals.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
    };

    const notify = (n: Omit<AppNotification, "id" | "ts" | "read">) => {
        setState((s) => ({
            ...s,
            notifications: [
                { ...n, id: uid("n"), ts: Date.now(), read: false },
                ...s.notifications,
            ],
        }));
    };

    const post = (
        projectId: string,
        msg: Omit<ProjectMessage, "id" | "ts" | "file"> & { file?: string | null },
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
    };

    // ── ui ──────────────────────────────────────────────────────────────
    const openPalette = () =>
        setState((s) => ({ ...s, paletteOpen: true, paletteQuery: "" }));
    const closePalette = () => setState((s) => ({ ...s, paletteOpen: false }));
    const setPaletteQuery = (q: string) =>
        setState((s) => ({ ...s, paletteQuery: q }));
    const toggleNav = () => setState((s) => ({ ...s, navOpen: !s.navOpen }));
    const closeNav = () => setState((s) => ({ ...s, navOpen: false }));

    // ── proposal editor ─────────────────────────────────────────────────
    const saveProposal = (id: string, html: string) => {
        patchProposal(id, { body: html, lastSaved: Date.now() });
        say(
            `Saved at ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
        );
    };

    const sendProposal = (id: string, html: string) => {
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
    };

    const addDeliverable = (proposalId: string) =>
        setState((s) => ({
            ...s,
            proposals: s.proposals.map((p) =>
                p.id === proposalId
                    ? { ...p, deliverables: p.deliverables.concat([""]) }
                    : p,
            ),
        }));
    const setDeliverable = (proposalId: string, index: number, text: string) =>
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
        }));
    const removeDeliverable = (proposalId: string, index: number) =>
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
        }));

    const addProposalComment = (
        proposalId: string,
        anchor: string,
        text: string,
    ) =>
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
        }));
    const toggleProposalComment = (proposalId: string, commentId: string) =>
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
        }));

    /** Client-side comment from the portal — flips the proposal to "Client
     * Commented" (unless already accepted) and notifies the freelancer. */
    const addClientComment = (
        projectId: string,
        proposalId: string,
        anchor: string,
        text: string,
    ) => {
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
        say(`Comment added — it reaches ${state.settings.name} on their next load`);
    };

    // ── tabs ────────────────────────────────────────────────────────────
    const openTab = (id: string) =>
        setState((s) => ({
            ...s,
            openTabs: s.openTabs.includes(id) ? s.openTabs : s.openTabs.concat([id]),
        }));
    const closeTab = (id: string) =>
        setState((s) => ({ ...s, openTabs: s.openTabs.filter((x) => x !== id) }));

    // ── status / payments / lifecycle ──────────────────────────────────
    const setStatus = (projectId: string, value: string) => {
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
    };

    const toggleDeposit = (projectId: string) => {
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
    };

    const toggleFinal = (projectId: string) => {
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
    };

    const completeProject = (projectId: string) => {
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
    };

    const reopenProject = (projectId: string) => {
        patchProject(projectId, { completed: false, stage: "active" });
        say("Reopened as an active project");
    };

    // ── notifications ───────────────────────────────────────────────────
    const markRead = (id: string) =>
        setState((s) => ({
            ...s,
            notifications: s.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n,
            ),
        }));
    const markAllRead = (
        audience?: "freelancer" | "client",
        projectId?: string,
    ) =>
        setState((s) => ({
            ...s,
            notifications: s.notifications.map((n) => {
                if (audience && n.audience !== audience) return n;
                if (projectId && n.projectId !== projectId) return n;
                return { ...n, read: true };
            }),
        }));

    // ── messaging ───────────────────────────────────────────────────────
    const composer = (projectId: string): ComposerDraft =>
        state.composer[projectId] ?? { text: "", file: "" };
    const setComposer = (projectId: string, patch: Partial<ComposerDraft>) =>
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
        }));
    const setDragOver = (projectId: string) =>
        setState((s) => ({ ...s, dragOver: projectId }));
    const clearDragOver = () => setState((s) => ({ ...s, dragOver: "" }));

    const sendMessage = (projectId: string, side: "freelancer" | "client") => {
        const c = state.composer[projectId] ?? { text: "", file: "" };
        const p = state.projects.find((x) => x.id === projectId);
        if (!c.text.trim() && !c.file) {
            say("Write something first");
            return;
        }
        const who =
            side === "client" ? client(p?.clientId ?? "").name : state.settings.name;
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
    };

    // ── portal ──────────────────────────────────────────────────────────
    const setGatePw = (v: string) =>
        setState((s) => ({ ...s, gatePw: v, gateError: "" }));

    const tryUnlock = (p: Project) => {
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
    };

    const openGatePreview = (projectId: string) => {
        setState((s) => {
            const unlocked = { ...s.unlocked };
            delete unlocked[projectId];
            return { ...s, unlocked };
        });
    };

    const previewPortal = (projectId: string) => {
        setState((s) => ({
            ...s,
            unlocked: { ...s.unlocked, [projectId]: "preview" },
        }));
        go(`/portal/${projectId}/overview`);
    };

    const openAccept = () => setState((s) => ({ ...s, acceptOpen: true }));
    const closeAccept = () => setState((s) => ({ ...s, acceptOpen: false }));
    const setSignName = (v: string) => setState((s) => ({ ...s, signName: v }));
    const setPendingAnchor = (v: string) =>
        setState((s) => ({ ...s, pendingAnchor: v }));
    const setCommentDraft = (v: string) =>
        setState((s) => ({ ...s, commentDraft: v }));
    const cancelComment = () =>
        setState((s) => ({ ...s, pendingAnchor: "", commentDraft: "" }));

    const acceptProposal = (p: Project, pr: Proposal) => {
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
    };

    const signContract = (p: Project) => {
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
    };

    const approveWork = (p: Project) => {
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
    };

    // ── settings / plan ─────────────────────────────────────────────────
    const setSetting = (key: keyof Settings, value: Settings[keyof Settings]) =>
        setState((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
    const setBilling = (v: "monthly" | "annual") =>
        setState((s) => ({ ...s, billing: v }));
    const setPlan = (plan: Plan) => setState((s) => ({ ...s, plan }));

    useEffect(() => {
        setAppReady(true);
    }, []);

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
                    acceptOpen: false,
                }));
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const value: EzlaneApi = {
        state,
        client,
        project,
        proposal,
        activeProjects,
        limit,
        say,
        openPalette,
        closePalette,
        setPaletteQuery,
        toggleNav,
        closeNav,
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
    };

    if (!appReady) return <LoadingScreen />;

    return (
        <EzlaneContext.Provider value={value}>{children}</EzlaneContext.Provider>
    );
}
