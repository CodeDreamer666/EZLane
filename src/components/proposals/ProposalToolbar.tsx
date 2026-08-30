"use client";

import type { Dispatch, SetStateAction } from "react";

import Divider from "~/components/proposals/Divider";
import { Select } from "~/components/shared";
import {
  PROPOSAL_FONTS,
  PROPOSAL_FONT_SIZES,
  type ProposalEditorForm,
} from "~/schema/proposal";

const BTN =
  "font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]";

export default function ProposalToolbar({
  form,
  setForm,
  locked,
  fontLocked,
  exec,
}: {
  form: ProposalEditorForm;
  setForm: Dispatch<SetStateAction<ProposalEditorForm>>;
  locked: boolean;
  fontLocked: boolean;
  exec: (cmd: string, val?: string) => void;
}) {
  return (
    <div className="max-sm:bg-bg! bg-surface/55 border-divider flex flex-wrap items-center gap-[2px] border-b p-[7px_9px] max-sm:sticky max-sm:top-14 max-sm:z-4">
      <button className={`${BTN} font-bold`} onClick={() => exec("bold")} disabled={locked}>
        B
      </button>
      <button className={`${BTN} italic`} onClick={() => exec("italic")} disabled={locked}>
        I
      </button>
      <Divider />
      <button
        className={BTN}
        onClick={() => exec("formatBlock", "h2")}
        disabled={locked}
      >
        H2
      </button>
      <button
        className={BTN}
        onClick={() => exec("formatBlock", "h3")}
        disabled={locked}
      >
        H3
      </button>
      <button
        className={BTN}
        onClick={() => exec("formatBlock", "p")}
        disabled={locked}
      >
        ¶
      </button>
      <Divider />
      <button
        className={BTN}
        onClick={() => exec("insertUnorderedList")}
        disabled={locked}
      >
        •<span className="max-sm:hidden!"> List</span>
      </button>
      <button
        className={BTN}
        onClick={() => exec("insertOrderedList")}
        disabled={locked}
      >
        1.<span className="max-sm:hidden!"> List</span>
      </button>
      <Divider />
      <div
        className={`flex items-center gap-1.5 max-sm:hidden! ${fontLocked ? "opacity-45" : "opacity-100"}`}
      >
        <Select
          className="min-h-[28px]! w-[130px]! text-[12px]!"
          disabled={fontLocked || locked}
          value={form.font}
          onChange={(e) => setForm((s) => ({ ...s, font: e.target.value }))}
        >
          {PROPOSAL_FONTS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </Select>
        <Select
          className="min-h-[28px]! w-[64px]! text-[12px]!"
          disabled={fontLocked || locked}
          value={form.fontSize}
          onChange={(e) => setForm((s) => ({ ...s, fontSize: e.target.value }))}
        >
          {PROPOSAL_FONT_SIZES.map((size) => (
            <option key={size}>{size}</option>
          ))}
        </Select>
      </div>
      <span className="flex-1" />
    </div>
  );
}
