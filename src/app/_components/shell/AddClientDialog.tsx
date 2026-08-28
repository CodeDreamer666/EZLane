"use client";

import { useState } from "react";

import { Dialog, Field, Input, Textarea } from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

export function AddClientDialog() {
  const { state, closeAddClient, addClient } = useEzlane();
  const [nc, setNc] = useState({ name: "", email: "", company: "", notes: "" });
  const [error, setError] = useState(false);

  if (!state.addClientOpen) return null;

  const set =
    (key: keyof typeof nc) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setNc((s) => ({ ...s, [key]: e.target.value }));

  const submit = (thenPropose: boolean) => {
    if (!nc.name.trim() || !nc.email.trim()) {
      setError(true);
      return;
    }
    addClient(nc, thenPropose);
    setNc({ name: "", email: "", company: "", notes: "" });
    setError(false);
  };

  return (
    <Dialog
      open={state.addClientOpen}
      onClose={closeAddClient}
      title="Add a client"
      actions={
        <>
          <button
            className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={closeAddClient}
          >
            Cancel
          </button>
          <button
            className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={() => submit(false)}
          >
            Save client
          </button>
          <button
            className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={() => submit(true)}
          >
            Save &amp; write proposal
          </button>
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
            value={nc.name}
            onChange={set("name")}
            placeholder="Priya Raman"
          />
        </Field>
        <Field label="Email">
          <Input
            value={nc.email}
            onChange={set("email")}
            placeholder="priya@studio.co"
          />
        </Field>
        <Field
          label={
            <>
              Company <span className="opacity-50">optional</span>
            </>
          }
        >
          <Input value={nc.company} onChange={set("company")} />
        </Field>
        <Field
          label={
            <>
              Notes <span className="opacity-50">optional</span>
            </>
          }
        >
          <Textarea rows={3} value={nc.notes} onChange={set("notes")} />
        </Field>
      </div>
      {error ? (
        <div className="text-accent-700 mt-[8px] text-[12px]">
          Name and email are both required.
        </div>
      ) : null}
    </Dialog>
  );
}
