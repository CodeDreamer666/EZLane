"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Button,
    Field,
    Input,
    Tag,
    Textarea,
    Toggle,
} from "~/app/_components/ui";
import useEzlane from "~/lib/useEzlane";
import { api } from "~/trpc/react";

function getFriendlyError(err: unknown): string {
    const e = err as {
        message?: string;
        data?: {
            code?: string;
            zodError?: {
                fieldErrors: Record<string, string[]>;
                formErrors: string[];
            };
        };
    };
    if (e?.data?.zodError) {
        const fe = e.data.zodError.fieldErrors;
        for (const k of Object.keys(fe)) {
            const msgs = fe[k];
            if (msgs && msgs.length > 0) return msgs[0]!;
        }
        if (e.data.zodError.formErrors?.length)
            return e.data.zodError.formErrors[0]!;
    }
    if (e?.data?.code === "FORBIDDEN" && e?.message) return e.message;
    if (e?.data?.code === "BAD_REQUEST" && e?.message) return e.message;
    if (e?.message && e.data?.code !== "INTERNAL_SERVER_ERROR") {
        // avoid exposing internal details, but allow known messages
        if (e.message === "We couldn't save your changes. Please try again.")
            return e.message;
        // For zod validation, message may be generic, fallback to zodError already handled
        if (e.message.includes("Invalid") || e.message.includes("Required"))
            return e.message;
        return e.message;
    }
    return "We couldn't save your changes. Please try again.";
}

export default function SettingsPage() {
    const { tab } = useParams<{ tab: string }>();

    return (
        <div className="max-w-[560px]">
            {tab === "profile" ? <ProfileSection /> : null}
            {tab === "invoice" ? <InvoiceSection /> : null}
            {tab === "branding" ? <BrandingSection /> : null}
            {tab === "plan" ? <PlanSection /> : null}
        </div>
    );
}

function ProfileSection() {
    const { state, setSetting, say } = useEzlane();

    const utils = api.useUtils();

    const { data, isLoading } = api.settings.getProfile.useQuery();

    const [name, setName] = useState(state.settings.name);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (data?.name !== undefined) setName(data.name);
    }, [data]);

    const mutation = api.settings.updateProfile.useMutation({
        onSuccess: (res) => {
            setError("");
            setSuccess("");
            setSetting("name", res.name);
            say("Settings saved");
        },

        onError: (err) => {
            const msg = getFriendlyError(err);
            setError(msg);
            say(msg);
        },

        onSettled: async () => {
            await utils.invalidate()
        }
    });

    const handleSave = () => {
        setError("");
        setSuccess("");

        const trimmed = name.trim();

        if (trimmed.length < 1) {
            const msg = "Display name is required";
            setError(msg);
            say(msg);
            return;
        }

        if (trimmed.length > 120) {
            const msg = "Display name must be at most 120 characters";
            setError(msg);
            say(msg);
            return;
        }

        mutation.mutate({ name: trimmed });
    };

    const isPending = mutation.isPending;
    const counter = `${name.length} / 120`;
    const counterOver = name.length > 120;

    return (
        <div className="flex flex-col gap-[16px]">
            <div>
                <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                    Profile
                </h4>
                <div className="text-text/55 text-[12.5px]">
                    Shown to clients on proposals and in the portal.
                </div>
            </div>

            <Field label="Username">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    aria-invalid={!!error}
                    disabled={isLoading && !data}
                />

                <div className="mt-[4px] flex justify-between">
                    <span className="text-[11px] text-red-500">{error}</span>
                    <span
                        className={`text-[11px] ${counterOver ? "text-red-500" : "text-text/45"}`}
                    >
                        {counter}
                    </span>
                </div>
            </Field>

            <Button
                variant="primary"
                className="self-start disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={isPending}
            >
                {isPending ? "Saving..." : "Save changes"}
            </Button>
            {success ? (
                <div className="text-text/60 text-[12px]">{success}</div>
            ) : null}
        </div>
    );
}

function InvoiceSection() {
    const { state, setSetting, say } = useEzlane();
    const utils = api.useUtils();
    const { data } = api.settings.getInvoice.useQuery(undefined, {
        retry: false,
    });
    const [invoiceName, setInvoiceName] = useState(state.settings.invoiceName);
    const [contact, setContact] = useState(state.settings.invoiceContact);
    const [prefix, setPrefix] = useState(state.settings.prefix);
    const [errors, setErrors] = useState<{
        name?: string;
        contact?: string;
        prefix?: string;
    }>({});

    useEffect(() => {
        if (data) {
            setInvoiceName(data.invoiceDisplayName);
            setContact(data.invoiceContact);
            setPrefix(data.invoicePrefix);
        }
    }, [data]);

    const mutation = api.settings.updateInvoice.useMutation({
        onSuccess: (res) => {
            setErrors({});
            setSetting("invoiceName", res.invoiceDisplayName ?? "");
            setSetting("invoiceContact", res.invoiceContact ?? "");
            setSetting("prefix", res.invoicePrefix ?? "");
            say("Settings saved");
            void utils.settings.getInvoice.invalidate();
            void utils.settings.getAll.invalidate();
        },
        onError: (err) => {
            const msg = getFriendlyError(err);
            // try to map to field
            if (msg.toLowerCase().includes("display name"))
                setErrors((p) => ({ ...p, name: msg }));
            else if (msg.toLowerCase().includes("contact"))
                setErrors((p) => ({ ...p, contact: msg }));
            else if (msg.toLowerCase().includes("prefix"))
                setErrors((p) => ({ ...p, prefix: msg }));
            else setErrors({ name: msg });
            say(msg);
        },
    });

    const handleSave = () => {
        setErrors({});
        const n = invoiceName.trim();
        const c = contact.trim();
        const p = prefix.trim();
        const newErrors: typeof errors = {};
        if (n.length < 1) newErrors.name = "Invoice display name is required";
        else if (n.length > 120)
            newErrors.name = "Invoice display name must be at most 120 characters";
        if (c.length < 1) newErrors.contact = "Contact info is required";
        else if (c.length > 120)
            newErrors.contact = "Contact info must be at most 120 characters";
        if (p.length < 1) newErrors.prefix = "Invoice prefix is required";
        else if (p.length > 20)
            newErrors.prefix = "Invoice prefix must be at most 20 characters";
        else if (!/^[A-Z0-9-]+$/.test(p))
            newErrors.prefix =
                "Invoice prefix must be uppercase letters, numbers and hyphens only (e.g. MD-2026-)";
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            const first =
                newErrors.name ??
                newErrors.contact ??
                newErrors.prefix ??
                "Please fix the highlighted fields";
            say(first);
            return;
        }
        mutation.mutate({
            invoiceDisplayName: n,
            invoiceContact: c,
            invoicePrefix: p,
        });
    };

    const isPending = mutation.isPending;

    return (
        <div className="flex flex-col gap-[16px]">
            <div>
                <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                    Invoice details
                </h4>
                <div className="text-text/55 text-[12.5px]">
                    Used on the generated contract and on the two 50% invoices you send
                    outside EZLane.
                </div>
            </div>
            <Field label="Invoice display name">
                <Input
                    value={invoiceName}
                    onChange={(e) => setInvoiceName(e.target.value)}
                    maxLength={120}
                />
                <div className="mt-[4px] flex justify-between">
                    <span className="text-[11px] text-red-500">{errors.name}</span>
                    <span
                        className={`text-[11px] ${invoiceName.length > 120 ? "text-red-500" : "text-text/45"}`}
                    >
                        {invoiceName.length} / 120
                    </span>
                </div>
            </Field>
            <Field label="Contact info">
                <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    maxLength={120}
                />
                <div className="mt-[4px] flex justify-between">
                    <span className="text-[11px] text-red-500">{errors.contact}</span>
                    <span
                        className={`text-[11px] ${contact.length > 120 ? "text-red-500" : "text-text/45"}`}
                    >
                        {contact.length} / 120
                    </span>
                </div>
            </Field>
            <Field label="Invoice prefix">
                <Input
                    className="font-mono"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    maxLength={20}
                />
                <div className="mt-[4px] flex justify-between">
                    <span className="text-[11px] text-red-500">{errors.prefix}</span>
                    <span
                        className={`text-[11px] ${prefix.length > 20 ? "text-red-500" : "text-text/45"}`}
                    >
                        {prefix.length} / 20
                    </span>
                </div>
                <div className="text-text/42 mt-[5px] text-[11px]">
                    Next invoice: {prefix}014
                </div>
            </Field>
            <Button
                variant="primary"
                className="self-start"
                onClick={handleSave}
                disabled={isPending}
            >
                {isPending ? "Saving..." : "Save changes"}
            </Button>
        </div>
    );
}

function PlanSection() {
    const { state, activeProjects, setPlan, go, say } = useEzlane();
    const utils = api.useUtils();
    const { data: planData } = api.settings.getPlan.useQuery(undefined, {
        retry: false,
    });

    // sync server plan to store if available
    useEffect(() => {
        if (planData?.plan) {
            const normalized = String(planData.plan).toLowerCase() as "free" | "pro";
            if (normalized === "free" || normalized === "pro") {
                if (normalized !== state.plan) setPlan(normalized);
            }
        }
    }, [planData, state.plan, setPlan]);

    const currentPlan = (
        planData ? String(planData.plan).toLowerCase() : state.plan
    ) as "free" | "pro";
    const isPro = currentPlan === "pro";

    const mutation = api.settings.updatePlan.useMutation({
        onSuccess: (res) => {
            const normalized = String(res.plan).toLowerCase() as "free" | "pro";
            setPlan(normalized);
            say(
                normalized === "pro"
                    ? "You are on Pro — unlimited projects, branding unlocked"
                    : "Moved to Free — active projects stay open",
            );
            void utils.settings.getPlan.invalidate();
            void utils.settings.getAll.invalidate();
            void utils.settings.getBranding.invalidate();
        },
        onError: (err) => {
            const msg = getFriendlyError(err);
            say(msg);
        },
    });

    const active = activeProjects();
    // recompute limit based on currentPlan for display consistency
    const displayLimit = isPro ? Infinity : 2;
    const usageBar = isPro
        ? "100%"
        : `${Math.min(100, (active.length / 2) * 100)}%`;
    const usageNote = isPro
        ? "Unlimited active projects"
        : `${active.length} of ${displayLimit} active projects used`;
    const planPrice = isPro
        ? state.billing === "annual"
            ? "$16 / month, billed annually"
            : "$20 / month"
        : "$0 / month";

    const handleDowngrade = () => {
        mutation.mutate({ plan: "FREE" });
    };
    const handleUpgradeNav = () => go("/plans");

    return (
        <div className="flex flex-col gap-[18px]">
            <div>
                <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                    Plan &amp; billing
                </h4>
                <div className="text-text/55 text-[12.5px]">
                    Plan limits are enforced on active projects only. Completed work never
                    counts.
                </div>
            </div>
            <div className="border-divider flex flex-col gap-[12px] rounded-[5px] border p-[18px_20px]">
                <div className="flex items-baseline gap-[10px]">
                    <span className="font-heading text-[24px]">
                        {isPro ? "Pro" : "Free"}
                    </span>
                    <span className="text-text/55 text-[13px]">{planPrice}</span>
                </div>
                <div className="bg-text/12 h-[4px] overflow-hidden rounded-sm">
                    <svg className="text-accent block h-full w-full" aria-hidden="true">
                        <rect width={usageBar} height="100%" fill="currentColor" />
                    </svg>
                </div>
                <div className="text-text/60 text-[12.5px]">{usageNote}</div>
                <div className="mt-[4px] flex gap-[9px]">
                    {!isPro ? (
                        <Button
                            variant="primary"
                            onClick={handleUpgradeNav}
                            disabled={mutation.isPending}
                        >
                            Upgrade to Pro
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={handleDowngrade}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? "Saving..." : "Downgrade to Free"}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={() => go("/plans")}
                        disabled={mutation.isPending}
                    >
                        Compare plans
                    </Button>
                </div>
            </div>
            {isPro ? (
                <div className="text-text/55 text-[12.5px] leading-[1.6]">
                    Downgrading with more than two active projects keeps them all open —
                    you simply cannot start a third until you are back under the limit.
                </div>
            ) : null}
        </div>
    );
}

function BrandingSection() {
    const { state, setSetting, say } = useEzlane();
    const utils = api.useUtils();
    const { data: brandingData } = api.settings.getBranding.useQuery(undefined, {
        retry: false,
    });
    const { data: planData } = api.settings.getPlan.useQuery(undefined, {
        retry: false,
    });

    const serverPlan = planData
        ? String(planData.plan).toLowerCase()
        : state.plan;
    const isPro = serverPlan === "pro";
    const locked = !isPro;

    const [accent, setAccent] = useState(state.settings.accent);
    const [logo, setLogo] = useState(state.settings.logo);
    const [welcome, setWelcome] = useState(state.settings.welcome);
    const [hideBranding, setHideBranding] = useState(state.settings.hideBranding);
    const [errors, setErrors] = useState<{
        accent?: string;
        logo?: string;
        welcome?: string;
        general?: string;
    }>({});

    useEffect(() => {
        if (brandingData) {
            setAccent(brandingData.accentColour);
            setLogo(brandingData.logo);
            setWelcome(brandingData.welcomeMessage);
            setHideBranding(brandingData.hideBranding);
        }
    }, [brandingData]);

    const mutation = api.settings.updateBranding.useMutation({
        onSuccess: (res) => {
            setErrors({});
            setSetting("accent", res.accentColour ?? "");
            setSetting("logo", res.logo ?? "");
            setSetting("welcome", res.welcomeMessage ?? "");
            setSetting("hideBranding", res.hideBranding);
            say("Branding saved");
            void utils.settings.getBranding.invalidate();
            void utils.settings.getAll.invalidate();
        },
        onError: (err) => {
            const msg = getFriendlyError(err);
            if (msg.toLowerCase().includes("accent")) setErrors({ accent: msg });
            else if (msg.toLowerCase().includes("logo")) setErrors({ logo: msg });
            else if (msg.toLowerCase().includes("welcome"))
                setErrors({ welcome: msg });
            else if (msg.toLowerCase().includes("pro")) setErrors({ general: msg });
            else setErrors({ general: msg });
            say(msg);
        },
    });

    const handleSave = () => {
        setErrors({});
        const a = accent.trim();
        const l = logo.trim();
        const w = welcome.trim();
        const newErrors: typeof errors = {};
        if (!/^#[0-9A-Fa-f]{6}$/.test(a))
            newErrors.accent = "Accent colour must be a hex value like #4F46E5";
        if (l.length > 255) newErrors.logo = "Logo must be at most 255 characters";
        if (w.length < 1) newErrors.welcome = "Welcome message is required";
        else if (w.length > 255)
            newErrors.welcome = "Welcome message must be at most 255 characters";
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            const first =
                newErrors.accent ??
                newErrors.welcome ??
                newErrors.logo ??
                "Please fix the highlighted fields";
            say(first);
            return;
        }
        if (locked) {
            const msg =
                "Portal branding is available on the Pro plan. Upgrade to Pro to save branding changes.";
            setErrors({ general: msg });
            say(msg);
            return;
        }
        mutation.mutate({
            accentColour: a,
            logo: l,
            welcomeMessage: w,
            hideBranding,
        });
    };

    const isPending = mutation.isPending;
    const opacity = locked ? 0.45 : 1;

    return (
        <div className="flex flex-col gap-[16px]">
            <div className="flex items-start gap-[12px]">
                <div className="flex-1">
                    <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                        Portal branding
                    </h4>
                    <div className="text-text/55 text-[12.5px]">
                        How the client&apos;s portal looks and who it appears to come from.
                    </div>
                </div>
                {locked ? <Tag status="sent">Pro</Tag> : null}
            </div>
            {locked ? (
                <div className="bg-accent/8 border-accent-400 flex items-center gap-[14px] rounded-[5px] border p-[14px_16px]">
                    <div className="flex-1 text-[12.5px] leading-[1.55]">
                        Branding is a Pro feature. On Free, the portal carries a small
                        &ldquo;Powered by EZLane&rdquo; line and your accent colour stays
                        default.
                    </div>
                    <a href="/plans">
                        <Button variant="primary">Upgrade</Button>
                    </a>
                </div>
            ) : null}
            {errors.general ? (
                <div className="text-[12px] text-red-500">{errors.general}</div>
            ) : null}
            <Field label="Accent colour">
                <div className="flex items-center gap-[9px]">
                    <Input
                        className="w-[120px]! font-mono"
                        value={accent}
                        onChange={(e) => setAccent(e.target.value)}
                        disabled={locked}
                        maxLength={7}
                    />
                    <svg
                        className="border-divider h-8 w-8 rounded border"
                        aria-label="Accent colour preview"
                    >
                        <rect
                            width="100%"
                            height="100%"
                            fill={/^#[0-9A-Fa-f]{6}$/.test(accent) ? accent : "#5b93ff"}
                        />
                    </svg>
                </div>
                <div className="mt-[4px] flex justify-between">
                    <span className="text-[11px] text-red-500">{errors.accent}</span>
                    <span className="text-text/45 text-[11px]">{accent.length} / 7</span>
                </div>
            </Field>
            <Field label="Logo">
                <label
                    className={`border-divider font-heading text-text hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-md border bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline max-lg:min-h-11 ${opacity === 1 ? "opacity-100" : "opacity-45"}`}
                >
                    Upload a file
                    <input
                        type="file"
                        className="hidden"
                        disabled={locked}
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                                const clean = f.name.trim().slice(0, 255);
                                setLogo(clean);
                            }
                        }}
                    />
                </label>
                <div className="mt-[4px] flex justify-between">
                    <span className="text-[11px] text-red-500">{errors.logo}</span>
                    <span className="text-text/45 text-[11px]">{logo.length} / 255</span>
                </div>
                <div className="text-text/45 mt-[6px] text-[11.5px]">
                    {logo || "No logo uploaded — the portal shows your name instead."}
                </div>
            </Field>
            <Field label="Welcome message">
                <Textarea
                    className="min-h-[74px]!"
                    rows={2}
                    value={welcome}
                    onChange={(e) => setWelcome(e.target.value)}
                    disabled={locked}
                    maxLength={255}
                />
                <div className="mt-[4px] flex justify-between">
                    <span className="text-[11px] text-red-500">{errors.welcome}</span>
                    <span
                        className={`text-[11px] ${welcome.length > 255 ? "text-red-500" : "text-text/45"}`}
                    >
                        {welcome.length} / 255
                    </span>
                </div>
            </Field>
            <Toggle
                on={hideBranding}
                onClick={() => !locked && setHideBranding(!hideBranding)}
                disabled={locked}
                className="self-start"
            >
                Remove &ldquo;Powered by EZLane&rdquo; from the portal
            </Toggle>
            <Button
                variant="primary"
                className="self-start"
                disabled={locked || isPending}
                onClick={handleSave}
            >
                {isPending ? "Saving..." : "Save changes"}
            </Button>
        </div>
    );
}
