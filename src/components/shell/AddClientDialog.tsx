"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Button,
    Dialog,
    Field,
    Input,
    LoadingIcon,
    Textarea,
} from "~/components/shared";
import useAddClientModal from "~/hook/useAddClientModal";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { clientCreateZodSchema } from "~/schema/client";
import { api } from "~/trpc/react";

const EMPTY_FORM = {
    name: "",
    email: "",
    company: "",
    notes: "",
};

export default function AddClientDialog() {
    const { open, closeModal } = useAddClientModal();
    const { showMessage } = useStatusMessage();

    const router = useRouter();
    const utils = api.useUtils();

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

    const [form, setForm] = useState(EMPTY_FORM);
    const [pendingAction, setPendingAction] = useState<"save" | "propose" | null>(
        null,
    );

    const isPending = createClient.isPending || createProposal.isPending;

    const close = () => {
        if (isPending) return;

        setForm(EMPTY_FORM);

        closeModal();
    };

    const handleSubmit = (thenPropose: boolean) => {
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
                    createProposal.mutate({
                        clientId: client.id,
                    });

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

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={close}
            title="Add a client"
            actions={
                <>
                    <Button
                        variant="secondary"
                        className="disabled:cursor-not-allowed"
                        onClick={close}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        className="disabled:cursor-not-allowed"
                        onClick={() => handleSubmit(false)}
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
                        onClick={() => handleSubmit(true)}
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
                Nothing is sent to them now. Their first contact with EZLane is the
                proposal you send.
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
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
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
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        maxLength={2000}
                        disabled={isPending}
                    />
                </Field>
            </div>
        </Dialog>
    );
}
