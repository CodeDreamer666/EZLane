"use client";

import { useState } from "react";

import { Dialog, Field, Input, Textarea } from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

export function AddClientDialog() {
  const { state, closeAddClient, addClient } = useEzlane();
  const [nc, setNc] = useState({ name: "", email: "", company: "", notes: "" });
  const [error, setError] = useState(false);

  if (!state.addClientOpen) return null;

  const set = (key: keyof typeof nc) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
          <button className="btn btn-secondary" onClick={closeAddClient}>
            Cancel
          </button>
          <button className="btn btn-secondary" onClick={() => submit(false)}>
            Save client
          </button>
          <button className="btn btn-primary" onClick={() => submit(true)}>
            Save &amp; write proposal
          </button>
        </>
      }
    >
      <div style={{ fontSize: 13, marginBottom: 11 }}>
        Nothing is sent to them now. Their first contact with EZLane is the
        proposal you send.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <Field label="Name">
          <Input value={nc.name} onChange={set("name")} placeholder="Priya Raman" />
        </Field>
        <Field label="Email">
          <Input value={nc.email} onChange={set("email")} placeholder="priya@studio.co" />
        </Field>
        <Field
          label={
            <>
              Company <span style={{ opacity: 0.5 }}>optional</span>
            </>
          }
        >
          <Input value={nc.company} onChange={set("company")} />
        </Field>
        <Field
          label={
            <>
              Notes <span style={{ opacity: 0.5 }}>optional</span>
            </>
          }
        >
          <Textarea rows={3} value={nc.notes} onChange={set("notes")} />
        </Field>
      </div>
      {error ? (
        <div style={{ fontSize: 12, color: "var(--color-accent-700)", marginTop: 8 }}>
          Name and email are both required.
        </div>
      ) : null}
    </Dialog>
  );
}
