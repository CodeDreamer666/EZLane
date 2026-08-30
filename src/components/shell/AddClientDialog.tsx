"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";

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

const EMPTY_FORM = { name: "", email: "", company: "", notes: "" };

export default function AddClientDialog() {
  const { open, closeModal } = useAddClientModal();
  const { showMessage } = useStatusMessage();
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingAction, setPendingAction] = useState<"save" | "propose" | null>(
    null,
  );

  const utils = api.useUtils();
  const createClient = api.clients.create.useMutation();
  const createProposal = api.proposals.create.useMutation();

  const isPending = createClient.isPending || createProposal.isPending;

  const setField =
    (key: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value });

  const close = () => {
    if (isPending) return;
    setForm(EMPTY_FORM);
    closeModal();
  };

  const handleSubmit = async (thenPropose: boolean) => {
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

    try {
      const client = await createClient.mutateAsync(result.data);

      if (thenPropose) {
        const proposal = await createProposal.mutateAsync({
          clientId: client.id,
        });
        await Promise.all([
          utils.clients.list.invalidate(),
          utils.proposals.list.invalidate(),
        ]);
        setForm(EMPTY_FORM);
        closeModal();
        router.push(`/proposals/${proposal.id}`);
        return;
      }

      await utils.clients.list.invalidate();
      setForm(EMPTY_FORM);
      showMessage(`${client.name} added`, true);
      closeModal();
      router.push("/clients");
    } catch (err) {
      showMessage(getFriendlyError(err), false);
    } finally {
      setPendingAction(null);
    }
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
              <span className="flex items-center gap-2">
                <LoadingIcon />
                Saving...
              </span>
            ) : (
              "Save client"
            )}
          </Button>
          <Button
            variant="primary"
            className="disabled:cursor-not-allowed"
            onClick={() => handleSubmit(true)}
            disabled={isPending}
          >
            {pendingAction === "propose" ? (
              <span className="flex items-center gap-2">
                <LoadingIcon />
                Saving...
              </span>
            ) : (
              "Save & write proposal"
            )}
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
            onChange={setField("name")}
            placeholder="Priya Raman"
            maxLength={120}
            disabled={isPending}
          />
        </Field>
        <Field label="Email">
          <Input
            value={form.email}
            onChange={setField("email")}
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
            onChange={setField("company")}
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
            onChange={setField("notes")}
            maxLength={2000}
            disabled={isPending}
          />
        </Field>
      </div>
    </Dialog>
  );
}
