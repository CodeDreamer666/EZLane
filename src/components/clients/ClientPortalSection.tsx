"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import z from "zod";
import {
    Button,
    Field,
    Input,
    LoadingIcon,
    LoadingScreen,
    ServerError,
} from "~/components/shared";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

const urlSegmentSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Each URL part must be at least 3 characters")
    .max(40, "Each URL part must be at most 40 characters")
    .regex(
        /^[a-z0-9-]+$/,
        "URL parts can use lowercase letters, numbers and hyphens only",
    );

export default function ClientPortalSection({
    clientId,
    clientName,
}: {
    clientId: string;
    clientName: string;
}) {
    const { showMessage } = useStatusMessage();
    const router = useRouter();
    const utils = api.useUtils();

    const {
        data: portal,
        isLoading,
        error,
    } = api.clientPortal.get.useQuery({ clientId });
    const { data: plan } = api.settings.getPlan.useQuery();

    const [freshPassword, setFreshPassword] = useState<string | null>(null);
    const [revealPassword, setRevealPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [editingUrl, setEditingUrl] = useState(false);
    const [token1Input, setToken1Input] = useState("");
    const [token2Input, setToken2Input] = useState("");
    const [openingPortal, setOpeningPortal] = useState(false);

    const createPortal = api.clientPortal.create.useMutation({
        onSuccess: (result) => {
            setFreshPassword(result.password);
            setRevealPassword(false);
            showMessage("Portal created", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.clientPortal.get.invalidate({ clientId });
        },
    });

    const changePassword = api.clientPortal.changePassword.useMutation({
        onSuccess: (result) => {
            setFreshPassword(result.password);
            setRevealPassword(false);
            setChangingPassword(false);
            setPasswordInput("");
            showMessage("Password changed", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },
    });

    const setCustomUrl = api.clientPortal.setCustomUrl.useMutation({
        onSuccess: () => {
            setEditingUrl(false);
            setToken1Input("");
            setToken2Input("");
            showMessage("Portal URL saved", true);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },

        onSettled: async () => {
            await utils.clientPortal.get.invalidate({ clientId });
        },
    });

    const isPro = plan?.plan === "PRO";

    const busy =
        createPortal.isPending ||
        changePassword.isPending ||
        setCustomUrl.isPending;

    const portalPath = portal?.url ?? "";
    const portalUrl = portal?.fullUrl ?? "";
    const portalPrefix = portal
        ? portal.fullUrl.slice(0, portal.fullUrl.length - portal.url.length) +
          "/portal/"
        : "";

    const copy = (text: string) => {
        void navigator.clipboard
            .writeText(text)
            .then(() => showMessage("Copied", true));
    };

    const handleCreatePortal = () => {
        if (createPortal.isPending) return;
        createPortal.mutate({ clientId });
    };

    const handleChangePassword = () => {
        if (busy) return;

        const password = passwordInput.trim();

        if (password.length < 8 || password.length > 72) {
            showMessage("Password must be between 8 and 72 characters", false);
            return;
        }

        changePassword.mutate({ clientId, password });
    };

    const handleSaveUrl = () => {
        if (busy) return;

        const first = urlSegmentSchema.safeParse(token1Input);
        const second = urlSegmentSchema.safeParse(token2Input);

        if (!first.success) {
            showMessage(first.error.issues[0]?.message ?? "", false);
            return;
        }

        if (!second.success) {
            showMessage(second.error.issues[0]?.message ?? "", false);
            return;
        }

        setCustomUrl.mutate({
            clientId,
            token1: first.data,
            token2: second.data,
        });
    };

    if (isLoading) return <LoadingScreen />;

    if (error) return <ServerError />;

    return (
        <div className="mt-6">
            <hr className="bg-divider my-4 h-px border-0" />
            <h6 className="font-heading text-text/50 mb-2 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
                Client portal
            </h6>
            <div className="text-text/58 mb-3 text-[12.5px] leading-[1.55]">
                One password-protected link for {clientName}. It lists every
                proposal you have sent and every project — no client account
                needed.
            </div>

            {!portal ? (
                <div className="flex w-full items-center justify-end">
                    <Button
                        variant="primary"
                        disabled={createPortal.isPending}
                        onClick={handleCreatePortal}
                    >
                        {createPortal.isPending ? (
                            <span className="flex items-center gap-2">
                                <LoadingIcon />
                                Creating...
                            </span>
                        ) : (
                            "Create client portal"
                        )}
                    </Button>
                </div>
            ) : (
                <div className="border-divider bg-surface flex flex-col gap-[14px] rounded-[5px] border p-[15px]">
                    <Field label="Portal link">
                        <div className="flex items-center gap-2">
                            <code className="border-divider flex-1 rounded-md border p-[8px_10px] font-mono text-[11.5px] break-all">
                                {portalUrl}
                            </code>
                            <Button
                                variant="secondary"
                                onClick={() => copy(portalUrl)}
                            >
                                Copy
                            </Button>
                        </div>
                    </Field>

                    {freshPassword ? (
                        <Field label="Password">
                            <div className="flex items-center gap-2">
                                <code className="border-divider flex-1 rounded-md border p-[8px_10px] font-mono text-[12px] break-all">
                                    {revealPassword
                                        ? freshPassword
                                        : "••••••••••••"}
                                </code>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        setRevealPassword(!revealPassword)
                                    }
                                >
                                    {revealPassword ? "Hide" : "Reveal"}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => copy(freshPassword)}
                                >
                                    Copy
                                </Button>
                            </div>
                            <div className="text-text/42 mt-[6px] text-[11px] leading-[1.5]">
                                Save this now — it is hashed on save and cannot be
                                shown again.
                            </div>
                        </Field>
                    ) : (
                        <div className="text-text/55 text-[12px]">
                            Password is set. Change it below if you have lost it.
                        </div>
                    )}

                    {changingPassword ? (
                        <div className="border-divider flex flex-col gap-2 rounded-md border p-3">
                            <Input
                                value={passwordInput}
                                onChange={(e) =>
                                    setPasswordInput(e.target.value)
                                }
                                placeholder="New password"
                                maxLength={72}
                            />
                            <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={busy}
                                    onClick={() => {
                                        setChangingPassword(false);
                                        setPasswordInput("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={busy}
                                    onClick={handleChangePassword}
                                >
                                    {changePassword.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <LoadingIcon />
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save password"
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {isPro && editingUrl ? (
                        <div className="border-divider flex flex-col gap-3 rounded-md border p-3">
                            <Field label={`URL part 1 — ${portalPrefix}`}>
                                <Input
                                    value={token1Input}
                                    onChange={(e) =>
                                        setToken1Input(e.target.value)
                                    }
                                    placeholder="acme-co"
                                    maxLength={40}
                                />
                            </Field>
                            <Field label="URL part 2 (required)">
                                <Input
                                    value={token2Input}
                                    onChange={(e) =>
                                        setToken2Input(e.target.value)
                                    }
                                    placeholder="welcome"
                                    maxLength={40}
                                />
                            </Field>
                            <div className="text-text/45 font-mono text-[11px] break-all">
                                {portalPrefix}
                                {token1Input || "…"}/{token2Input || "…"}
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={busy}
                                    onClick={() => {
                                        setEditingUrl(false);
                                        setToken1Input("");
                                        setToken2Input("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={busy}
                                    onClick={handleSaveUrl}
                                >
                                    {setCustomUrl.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <LoadingIcon />
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save URL"
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {!changingPassword && !editingUrl ? (
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    disabled={busy}
                                    onClick={() => setChangingPassword(true)}
                                >
                                    Change password
                                </Button>

                                {isPro ? (
                                    <Button
                                        variant="secondary"
                                        disabled={busy}
                                        onClick={() => {
                                            setToken1Input(portal.token1);
                                            setToken2Input(portal.token2);
                                            setEditingUrl(true);
                                        }}
                                    >
                                        Change portal URL
                                    </Button>
                                ) : null}
                            </div>

                            <Button
                                variant="primary"
                                disabled={busy || openingPortal}
                                onClick={() => {
                                    if (openingPortal) return;
                                    setOpeningPortal(true);
                                    router.push(portalPath);
                                }}
                            >
                                {openingPortal ? (
                                    <span className="flex items-center gap-2">
                                        <LoadingIcon />
                                        Opening...
                                    </span>
                                ) : (
                                    "Open portal →"
                                )}
                            </Button>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
