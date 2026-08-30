"use client";

import type { Dispatch, SetStateAction } from "react";

import type { ProposalEditorForm } from "~/schema/proposal";

export default function ProposalTerms({
  form,
  setForm,
  locked,
}: {
  form: ProposalEditorForm;
  setForm: Dispatch<SetStateAction<ProposalEditorForm>>;
  locked: boolean;
}) {
  const setDeliverable = (index: number, text: string) =>
    setForm((s) => ({
      ...s,
      deliverables: s.deliverables.map((d, i) => (i === index ? text : d)),
    }));

  const removeDeliverable = (index: number) =>
    setForm((s) => ({
      ...s,
      deliverables: s.deliverables.filter((_, i) => i !== index),
    }));

  const addDeliverable = () =>
    setForm((s) => ({ ...s, deliverables: s.deliverables.concat([""]) }));

  return (
    <div className="bg-surface/55 border-divider flex flex-col gap-[16px] rounded-[5px] border p-[18px_20px]">
      <div className="flex items-baseline justify-between">
        <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
          Terms — the source of truth
        </h6>
        <span className="text-text/42 text-[11px]">
          Copied into the contract on accept
        </span>
      </div>
      <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
        <label>Project title</label>
        <input
          className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
          value={form.title}
          maxLength={200}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
          disabled={locked}
        />
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-[14px] max-sm:grid-cols-1!">
        <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
          <label>Price (USD)</label>
          <input
            className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm tabular-nums focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                price: Math.trunc(Number(e.target.value) || 0),
              }))
            }
            disabled={locked}
          />
        </div>
        <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
          <label>Estimated due date</label>
          <input
            className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
            type="date"
            value={form.due}
            onChange={(e) => setForm((s) => ({ ...s, due: e.target.value }))}
            disabled={locked}
          />
        </div>
      </div>
      <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
        <label>Deliverables</label>
        <div className="flex flex-col gap-[7px]">
          {form.deliverables.map((d, i) => (
            <div key={i} className="flex items-center gap-[8px]">
              <span className="text-text/38 w-[14px] text-[11px] tabular-nums">
                {i + 1}
              </span>
              <input
                className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                value={d}
                maxLength={255}
                onChange={(e) => setDeliverable(i, e.target.value)}
                disabled={locked}
              />
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={() => removeDeliverable(i)}
                disabled={locked}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-md border bg-transparent px-[11px] py-[5px] text-[12.5px] leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
            onClick={addDeliverable}
            disabled={locked}
          >
            + Add item
          </button>
        </div>
      </div>
    </div>
  );
}
