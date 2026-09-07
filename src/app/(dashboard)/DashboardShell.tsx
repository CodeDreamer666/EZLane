"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
    Button,
    Dialog,
    Field,
    IconBell,
    IconClients,
    IconDashboard,
    IconMenu,
    IconProjects,
    IconProposals,
    IconSearch,
    Input,
    Kbd,
    LoadingIcon,
    Textarea,
} from "~/components/shared";
import useAddClientModal from "~/hook/useAddClientModal";
import useStatusMessage from "~/hook/useStatusMessage";
import { proposalStatusLabel } from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import { clientCreateZodSchema } from "~/schema/client";
import { authClient } from "~/server/better-auth/client";
import { api } from "~/trpc/react";

const FREE_ACTIVE_PROJECT_LIMIT = 2;

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
    { href: "/clients", label: "Clients", Icon: IconClients },
    { href: "/proposals", label: "Proposals", Icon: IconProposals },
    { href: "/projects", label: "Projects", Icon: IconProjects },
] as const;

const SETTINGS_ITEMS = [
    { href: "/settings/profile", label: "Profile", pro: false },
    { href: "/settings/invoice", label: "Invoice details", pro: false },
    { href: "/settings/branding", label: "Portal branding", pro: true },
    { href: "/settings/plan", label: "Plan & billing", pro: false },
    { href: "/settings/account", label: "Account", pro: false },
] as const;

const GO_COMMANDS = [
    { label: "Dashboard", route: "/dashboard" },
    { label: "Clients", route: "/clients" },
    { label: "Proposals", route: "/proposals" },
    { label: "Projects", route: "/projects" },
    { label: "Notifications", route: "/notifications" },
    { label: "Plans — Free vs Pro", route: "/plans" },
    { label: "Settings — Profile", route: "/settings/profile" },
    { label: "Settings — Invoice details", route: "/settings/invoice" },
    { label: "Settings — Portal branding", route: "/settings/branding" },
    { label: "Settings — Plan & billing", route: "/settings/plan" },
    { label: "Settings — Account", route: "/settings/account" },
] as const;

const PAGE_TITLES: Record<string, string> = {
    dashboard: "Dashboard",
    clients: "Clients",
    proposals: "Proposals",
    projects: "Projects",
    notifications: "Notifications",
    settings: "Settings",
    plans: "Plans",
};

const EMPTY_FORM = {
    name: "",
    email: "",
    company: "",
    notes: "",
};

interface Command {
    group: string;
    label: string;
    run: () => void;
}

const AVATAR_COLORS = [
    "#6366f1",
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
    "#f97316",
    "#3b82f6",
];

function avatarInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function avatarColor(name: string): string {
    let hash = 0;

    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

export default function DashboardShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const { open: addClientOpen, openModal, closeModal } = useAddClientModal();

    const { showMessage } = useStatusMessage();
    const { data: session } = authClient.useSession();

    const utils = api.useUtils();

    const [navOpen, setNavOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [pendingAction, setPendingAction] = useState<"save" | "propose" | null>(null);
    const [avatarBroken, setAvatarBroken] = useState(false);

    const pathParts = pathname.split("/").filter(Boolean);
    const section = pathParts[0] ?? "dashboard";
    const detailId = pathParts[1] ?? "";

    const { data: unreadCount } = api.notifications.unreadCount.useQuery();
    const { data: planData } = api.settings.getPlan.useQuery();
    const { data: projects } = api.projects.list.useQuery();
    const { data: proposals } = api.proposals.list.useQuery(undefined, {
        enabled: paletteOpen,
    });

    const { data: detailClient } = api.clients.byId.useQuery(
        { id: detailId },
        { enabled: section === "clients" && detailId.length > 0 },
    );

    const { data: detailProject } = api.projects.byId.useQuery(
        { id: detailId },
        { enabled: section === "projects" && detailId.length > 0 },
    );

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setPaletteOpen((open) => !open);
            }
            if (e.key === "Escape") setPaletteOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const createProposal = api.proposals.create.useMutation({
        onSuccess: (proposal) => {
            setForm(EMPTY_FORM);
            setPendingAction(null);
            closeModal();
            router.push(`/proposals/${proposal.id}`);
        },

        onError: (err) => {
            setPendingAction(null);
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const createClient = api.clients.create.useMutation({
        onError: (err) => {
            setPendingAction(null);
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const isPending = createClient.isPending || createProposal.isPending;

    const handleAddClient = (thenPropose: boolean) => {
        if (isPending) return;

        const result = clientCreateZodSchema.safeParse(form);

        if (!result.success) {
            showMessage(
                result.error.issues[0]?.message ??
                "Please check the form and try again.",
                false,
            );
            return;
        }

        setPendingAction(thenPropose ? "propose" : "save");

        createClient.mutate(result.data, {
            onSuccess: (client) => {
                if (thenPropose) {
                    createProposal.mutate({ clientId: client.id });
                    return;
                }

                setForm(EMPTY_FORM);
                setPendingAction(null);
                showMessage(`${client.name} added`, true);
                closeModal();
                router.push("/clients");
            },
        });
    };

    const navigate = (route: string) => {
        setPaletteOpen(false);
        router.push(route);
    };

    const commands: Command[] = [
        {
            group: "Action",
            label: "Add a client",
            run: () => {
                setPaletteOpen(false);
                openModal();
            },
        },
    ];

    for (const item of GO_COMMANDS) {
        commands.push({
            group: "Go",
            label: item.label,
            run: () => navigate(item.route),
        });
    }

    for (const project of projects ?? []) {
        commands.push({
            group: "Project",
            label: `${project.client.company ?? project.client.name} — ${project.proposal.title}`,
            run: () => navigate(`/projects/${project.id}`),
        });
    }

    for (const proposal of proposals ?? []) {
        commands.push({
            group: "Proposal",
            label: `${proposal.client.name} — ${proposal.title} (${proposalStatusLabel(proposal.status)})`,
            run: () => navigate(`/proposals/${proposal.id}`),
        });
    }

    const query = search.toLowerCase();
    const commandResults = commands
        .filter(
            (c) =>
                c.label.toLowerCase().includes(query) ||
                c.group.toLowerCase().includes(query),
        )
        .slice(0, 40);

    const isPro = planData?.plan === "PRO";
    const userName = session?.user.name ?? "";
    const userEmail = session?.user.email ?? "";
    const userImage = session?.user.image ?? null;
    const activeCount = (projects ?? []).filter((p) => !p.completed).length;

    let pageTitle: string;

    if (section === "clients" && detailId) {
        pageTitle = detailClient?.name ?? "Client";
    } else if (section === "projects" && detailId) {
        pageTitle = detailProject?.proposal.title ?? "Project";
    } else if (section === "proposals" && detailId) {
        pageTitle = "Proposal editor";
    } else {
        pageTitle = PAGE_TITLES[section] ?? "Dashboard";
    }

    return (
        <>
            <div className="font-body flex min-h-screen">
                {navOpen ? (
                    <div
                        className="hidden max-lg:fixed max-lg:inset-0 max-lg:z-44 max-lg:block max-lg:bg-black/55"
                        onClick={() => setNavOpen(false)}
                    />
                ) : null}

                {/* Sidebar */}
                <aside
                    className="border-divider [&::-webkit-scrollbar-thumb]:border-bg [&::-webkit-scrollbar-thumb]:bg-text/16 [&::-webkit-scrollbar-thumb:hover]:bg-text/28 [&::-webkit-scrollbar-track]:bg-bg [&::-webkit-scrollbar-corner]:bg-bg sticky top-0 flex h-screen w-[238px] flex-none [scrollbar-width:thin] [scrollbar-color:rgba(242,245,248,0.16)_#0a0b0e] flex-col gap-[16px] overflow-y-auto overscroll-contain border-r bg-[#080910] p-[18px_14px_20px] max-lg:fixed max-lg:top-0 max-lg:-left-[282px] max-lg:z-45 max-lg:w-[274px]! max-lg:overflow-y-auto max-lg:px-3.5! max-lg:pt-4! max-lg:pb-[26px]! max-lg:transition-[left] max-lg:duration-300 max-lg:ease-in-out max-lg:motion-reduce:transition-none max-lg:data-[open=1]:left-0 max-lg:data-[open=1]:shadow-lg lg:self-start [&::-webkit-scrollbar]:h-[8px] [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2"
                    data-open={navOpen ? "1" : "0"}
                >
                    <div className="flex items-center gap-[9px] p-[0_4px]">
                        <div className="border-accent grid h-[20px] w-[20px] place-items-center rounded-[3px] border">
                            <div className="bg-accent h-[7px] w-[7px]" />
                        </div>
                        <div className="font-heading text-[19px] font-semibold">
                            EZLane
                        </div>
                    </div>

                    <button
                        className="border-divider font-body text-text/45 hover:border-text/30 flex w-full cursor-pointer items-center gap-2 rounded border bg-transparent px-[9px] py-[7px] text-left text-[12.5px]"
                        onClick={() => setPaletteOpen(true)}
                    >
                        <IconSearch className="h-[13px] w-[13px] opacity-60" />
                        <span className="flex-1">Search or jump to…</span>
                        <span className="border-divider text-text/50 rounded-[3px] border px-1 py-px font-mono text-[10px]">
                            ⌘K
                        </span>
                    </button>

                    <nav className="flex flex-col gap-[2px]">
                        <div className="text-text/38 p-[4px_9px_6px] text-[9.5px] tracking-[0.12em] uppercase">
                            Work
                        </div>

                        {NAV_ITEMS.map(({ href, label, Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center gap-[9px] rounded px-[9px] py-1.5 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:flex-none [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:opacity-90"
                                data-cur={pathname.startsWith(href) ? "1" : "0"}
                                onClick={() => setNavOpen(false)}
                            >
                                <Icon />
                                {label}
                            </Link>
                        ))}

                        <Link
                            href="/notifications"
                            className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center gap-[9px] rounded px-[9px] py-1.5 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:flex-none [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:opacity-90"
                            data-cur={pathname.startsWith("/notifications") ? "1" : "0"}
                            onClick={() => setNavOpen(false)}
                        >
                            <IconBell />

                            <span className="flex-1">Notifications</span>

                            {unreadCount ? (
                                <span
                                    className="data-[s=sent]:bg-accent-100 data-[s=sent]:text-accent-800 data-[s=commented]:text-accent-700 data-[s=accepted]:bg-text data-[s=accepted]:text-bg data-[s=done]:text-text/60 data-[s=warn]:text-accent-700 inline-flex items-center rounded-[3px] px-[7px] py-[1px] text-[10px] tracking-[0.02em] whitespace-nowrap data-[s=commented]:bg-transparent data-[s=commented]:shadow-[inset_0_0_0_1px_var(--color-accent)] data-[s=done]:bg-transparent data-[s=done]:shadow-[inset_0_0_0_1px_var(--color-divider)] data-[s=draft]:bg-neutral-200 data-[s=draft]:text-neutral-800 data-[s=warn]:bg-transparent data-[s=warn]:shadow-[inset_0_0_0_1px_var(--color-accent-400)]"
                                    data-s="sent"
                                >
                                    {unreadCount}
                                </span>
                            ) : null}
                        </Link>

                        <div className="text-text/38 p-[14px_9px_6px] text-[9.5px] tracking-[0.12em] uppercase">
                            Settings
                        </div>

                        {SETTINGS_ITEMS.map(({ href, label, pro }) => (
                            <Link
                                key={href}
                                href={href}
                                className="font-body text-text/60 hover:bg-text/6 hover:text-text data-[cur=1]:border-accent/32 data-[cur=1]:bg-accent/15 data-[cur=1]:text-text flex cursor-pointer items-center gap-[9px] rounded px-[9px] py-1.5 text-[13px] no-underline data-[cur=1]:border max-lg:px-3 max-lg:py-[11px] max-lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:flex-none [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:opacity-90"
                                data-cur={pathname === href ? "1" : "0"}
                                onClick={() => setNavOpen(false)}
                            >
                                <span className="flex-1">{label}</span>
                                {pro && !isPro ? (
                                    <span className="text-accent-700 text-[9.5px] tracking-[0.08em]">
                                        PRO
                                    </span>
                                ) : null}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-divider mt-auto flex flex-col gap-[8px] rounded-[5px] border p-[11px_12px]">
                        <div className="flex items-baseline justify-between">
                            <span className="font-heading text-[14px] font-semibold">
                                {isPro ? "Pro" : "Free"} plan
                            </span>
                            <span className="text-text/50 text-[11px]">
                                {isPro
                                    ? "unlimited"
                                    : `${activeCount} / ${FREE_ACTIVE_PROJECT_LIMIT}`}
                            </span>
                        </div>

                        <div className="bg-text/12 h-[3px] overflow-hidden rounded-sm">
                            <svg
                                className="text-accent block h-full w-full"
                                aria-hidden="true"
                            >
                                <rect
                                    width={
                                        isPro
                                            ? "100%"
                                            : `${Math.min(100, (activeCount / FREE_ACTIVE_PROJECT_LIMIT) * 100)}%`
                                    }
                                    height="100%"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>

                        <div className="text-text/55 text-[11.5px] leading-[1.5]">
                            {isPro
                                ? "Unlimited active projects"
                                : `${activeCount} of ${FREE_ACTIVE_PROJECT_LIMIT} active projects used`}
                        </div>

                        {!isPro ? (
                            <Link href="/plans" onClick={() => setNavOpen(false)}>
                                <Button
                                    variant="primary"
                                    className="w-full p-[5px]! text-[12.5px]"
                                >
                                    Upgrade to Pro
                                </Button>
                            </Link>
                        ) : null}
                    </div>

                    <div className="border-divider flex items-center gap-[8px] border-t p-[0_4px] pt-[12px]">
                        {userImage && !avatarBroken ? (
                            <img
                                src={userImage}
                                alt={userName}
                                width={30}
                                height={30}
                                onError={() => setAvatarBroken(true)}
                                className="flex-none rounded-full object-cover"
                                style={{ width: "30px", height: "30px" }}
                            />
                        ) : (
                            <div
                                className="font-heading grid flex-none place-items-center rounded-full text-white"
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    fontSize: "13px",
                                    background: avatarColor(userName || "?"),
                                }}
                                aria-hidden="true"
                            >
                                {avatarInitials(userName) || "?"}
                            </div>
                        )}

                        <div className="min-w-0">
                            <div className="overflow-hidden text-[12.5px] text-ellipsis whitespace-nowrap">
                                {userName || "—"}
                            </div>
                            <div className="text-text/45 overflow-hidden text-[10.5px] text-ellipsis whitespace-nowrap">
                                {userEmail}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
                    {/* Header */}
                    <header className="bg-bg/92 border-divider sticky top-0 z-[5] flex items-center gap-[14px] border-b p-[15px_30px] backdrop-blur-[6px] max-lg:gap-3! max-lg:px-[18px]! max-lg:py-[11px]! max-sm:px-3.5! max-sm:py-[9px]!">
                        <button
                            className="max-lg:border-divider max-lg:text-text max-lg:hover:bg-text/8 hidden cursor-pointer max-lg:grid max-lg:h-11 max-lg:w-11 max-lg:flex-none max-lg:cursor-pointer max-lg:place-items-center max-lg:rounded-[5px] max-lg:border max-lg:bg-transparent"
                            onClick={() => setNavOpen((open) => !open)}
                            aria-label="Menu"
                        >
                            <IconMenu className="h-[19px] w-[19px]" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="font-heading text-[20px] leading-[1.25] font-semibold max-sm:text-[17px]!">
                                {pageTitle}
                            </div>
                        </div>
                        <Link href="/notifications" className="max-sm:hidden!">
                            <Button variant="secondary" className="gap-[7px]">
                                <IconBell />
                                {unreadCount ? `${unreadCount} new` : "No new"}
                            </Button>
                        </Link>
                        <Button variant="primary" onClick={openModal}>
                            +<span className="max-sm:hidden!"> Add Client</span>
                        </Button>
                    </header>

                    <div className="max-w-[1180px] p-[28px_30px_70px] max-lg:px-[18px]! max-lg:pt-[22px]! max-lg:pb-20! max-sm:px-3.5! max-sm:pt-[18px]! max-sm:pb-[98px]!">
                        {children}
                    </div>
                </main>
            </div>

            {/* Command palette */}
            {paletteOpen ? (
                <div
                    className="fixed inset-0 z-[60] grid place-items-center items-start bg-neutral-900/50 p-4 pt-[14vh]"
                    onClick={() => setPaletteOpen(false)}
                >
                    <div
                        className="border-divider bg-surface flex w-[min(520px,_100%)] animate-[fadeUp_.14s_ease-out] flex-col gap-0 rounded-lg border p-0 shadow-lg max-sm:max-h-[88vh] max-sm:w-[calc(100vw-26px)] max-sm:overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Input
                            placeholder="Jump to a screen or run a command…"
                            className="border-divider min-h-[48px] rounded-none border-0 border-b text-[15px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />

                        <div className="max-h-[320px] overflow-auto p-[6px]">
                            {commandResults.map((c, i) => (
                                <div
                                    key={i}
                                    className="text-text/78 hover:bg-accent/14 hover:text-text flex cursor-pointer items-center gap-2.5 rounded px-3 py-[9px] text-[13.5px]"
                                    onClick={c.run}
                                >
                                    <span className="text-text/35 w-[64px] flex-none text-[10px] tracking-[0.1em] uppercase">
                                        {c.group}
                                    </span>
                                    <span className="flex-1">{c.label}</span>
                                    <Kbd>↩</Kbd>
                                </div>
                            ))}

                            {commandResults.length === 0 ? (
                                <div className="text-text/45 p-[22px] text-center text-[13px]">
                                    Nothing matches that.
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Add client dialog */}
            {addClientOpen ? (
                <Dialog
                    open={addClientOpen}
                    onClose={() => {
                        if (isPending) return;

                        setForm(EMPTY_FORM);
                        closeModal();
                    }}
                    title="Add a client"
                    actions={
                        <>
                            <Button
                                variant="secondary"
                                className="disabled:cursor-not-allowed"
                                onClick={() => {
                                    if (isPending) return;

                                    setForm(EMPTY_FORM);
                                    closeModal();
                                }}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="secondary"
                                className="disabled:cursor-not-allowed"
                                onClick={() => handleAddClient(false)}
                                disabled={isPending}
                            >
                                {pendingAction === "save" ? (
                                    <div className="flex items-center gap-2">
                                        <LoadingIcon />
                                        Saving...
                                    </div>
                                ) : "Save client"}
                            </Button>
                            <Button
                                variant="primary"
                                className="disabled:cursor-not-allowed"
                                onClick={() => handleAddClient(true)}
                                disabled={isPending}
                            >
                                {pendingAction === "propose" ? (
                                    <div className="flex items-center gap-2">
                                        <LoadingIcon />
                                        Saving...
                                    </div>
                                ) : "Save & write proposal"}
                            </Button>
                        </>
                    }
                >
                    <div className="mb-[11px] text-[13px]">
                        Nothing is sent to them now. Their first contact with EZLane is
                        the proposal you send.
                    </div>
                    <div className="flex flex-col gap-[11px]">
                        <Field label="Name">
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Priya Raman"
                                maxLength={120}
                                disabled={isPending}
                            />
                        </Field>
                        <Field label="Email">
                            <Input
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                placeholder="priya@studio.co"
                                maxLength={254}
                                disabled={isPending}
                            />
                        </Field>
                        <Field
                            label={
                                <>
                                    Company <span className="opacity-50">optional</span>
                                </>
                            }
                        >
                            <Input
                                value={form.company}
                                onChange={(e) =>
                                    setForm({ ...form, company: e.target.value })
                                }
                                maxLength={120}
                                disabled={isPending}
                            />
                        </Field>
                        <Field
                            label={
                                <>
                                    Notes <span className="opacity-50">optional</span>
                                </>
                            }
                        >
                            <Textarea
                                rows={3}
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                maxLength={2000}
                                disabled={isPending}
                            />
                        </Field>
                    </div>
                </Dialog>
            ) : null}
        </>
    );
}
