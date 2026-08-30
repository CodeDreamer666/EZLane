"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Dialog, Field, Input } from "~/components/shared";
import { authClient } from "~/server/better-auth/client";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

const CONFIRM_WORD = "DELETE";

export default function AccountSection() {
    const { showMessage } = useStatusMessage();
    const router = useRouter();

    const leaveToLoggedOut = () => {
        router.replace("/");
        router.refresh();
    };

    const [signingOut, setSigningOut] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [error, setError] = useState("");

    const handleSignOut = async () => {
        setSigningOut(true);

        try {
            const { error: signOutError } = await authClient.signOut();

            if (signOutError) {
                setSigningOut(false);
                showMessage("Could not sign out. Please try again.", false);
                return;
            }

            leaveToLoggedOut();
        } catch {
            setSigningOut(false);
            showMessage("Could not sign out. Please try again.", false);
        }
    };

    const deleteAccount = api.account.deleteAccount.useMutation({
        onSuccess: async () => {
            showMessage("Your account and all its data have been deleted", true);
            try {
                await authClient.signOut();
            } catch {
                // Session rows are already gone; ignore and redirect regardless.
            }
            leaveToLoggedOut();
        },
        onError: (err) => {
            setError(getFriendlyError(err));
        },
    });

    const closeConfirm = () => {
        if (deleteAccount.isPending) return;
        setConfirmOpen(false);
        setConfirmText("");
        setError("");
    };

    const canDelete = confirmText.trim() === CONFIRM_WORD;

    const handleConfirmDelete = () => {
        if (!canDelete || deleteAccount.isPending) return;
        setError("");
        deleteAccount.mutate();
    };

    return (
        <div className="flex flex-col gap-[18px]">
            <div>
                <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                    Account
                </h4>
                <div className="text-text/55 text-[12.5px]">
                    Manage your session and your EZLane account.
                </div>
            </div>

            <div className="border-divider flex flex-col gap-[12px] rounded-[5px] border p-[18px_20px]">
                <div className="font-heading text-[15px] font-semibold">Sign out</div>
                <div className="text-text/60 text-[12.5px] leading-[1.6]">
                    End your session on this device. You can sign back in with Google any
                    time.
                </div>
                <Button
                    variant="secondary"
                    className="self-start disabled:cursor-not-allowed"
                    onClick={handleSignOut}
                    disabled={signingOut}
                >
                    {signingOut ? "Signing out..." : "Sign out"}
                </Button>
            </div>

            <div className="border-divider flex flex-col gap-[12px] rounded-[5px] border p-[18px_20px]">
                <div className="font-heading text-[15px] font-semibold">
                    Delete account
                </div>
                <div className="text-text/60 text-[12.5px] leading-[1.6]">
                    Permanently removes your account, your sign-in methods and every record
                    tied to it.{" "}
                    <span className="text-red-500">
                        This is permanent and cannot be undone.
                    </span>
                </div>
                <Button
                    variant="secondary"
                    className="self-start disabled:cursor-not-allowed"
                    onClick={() => setConfirmOpen(true)}
                >
                    Delete account
                </Button>
            </div>

            <Dialog
                open={confirmOpen}
                onClose={closeConfirm}
                title="Delete account permanently?"
                actions={
                    <>
                        <Button
                            variant="secondary"
                            onClick={closeConfirm}
                            disabled={deleteAccount.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="disabled:cursor-not-allowed"
                            onClick={handleConfirmDelete}
                            disabled={!canDelete || deleteAccount.isPending}
                        >
                            {deleteAccount.isPending ? "Deleting..." : "Delete account"}
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-3">
                    <p className="leading-[1.6]">
                        This deletes your account and all data owned by it — sessions,
                        connected sign-in methods and every record tied to your user. It
                        cannot be undone.
                    </p>
                    <Field label={`Type ${CONFIRM_WORD} to confirm`}>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            maxLength={20}
                            autoFocus
                            aria-invalid={!!error}
                            disabled={deleteAccount.isPending}
                        />
                        {error ? (
                            <div className="mt-[4px] text-[11px] text-red-500">{error}</div>
                        ) : null}
                    </Field>
                </div>
            </Dialog>
        </div>
    );
}
