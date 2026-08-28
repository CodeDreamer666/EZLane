"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { Select, Tag, type StatusKey } from "~/app/_components/ui";
import { ago, fmtDate, money, statusKey } from "~/lib/format";
import { useEzlane } from "~/lib/store";

export default function ProposalEditorPage() {
  const { id } = useParams<{ id: string }>();
  const {
    state,
    client,
    proposal,
    patchProposal,
    addDeliverable,
    setDeliverable,
    removeDeliverable,
    saveProposal,
    sendProposal,
    addProposalComment,
    toggleProposalComment,
    closeTab,
    previewPortal,
    go,
    say,
  } = useEzlane();

  const bodyRef = useRef<HTMLDivElement>(null);
  const loadedId = useRef<string | null>(null);

  const pr = proposal(id);

  useEffect(() => {
    if (bodyRef.current && pr && loadedId.current !== pr.id) {
      bodyRef.current.innerHTML = pr.body;
      loadedId.current = pr.id;
    }
  }, [pr]);

  if (!pr) return <div>Proposal not found.</div>;

  const locked = pr.status === "Accepted";
  const c = client(pr.clientId);
  const font = pr.font ?? "Lora";
  const fontSize = pr.fontSize ?? "15";
  const fontLocked = state.plan !== "pro";

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val ?? undefined);
    bodyRef.current?.focus();
  };

  const currentHtml = () => bodyRef.current?.innerHTML ?? pr.body;

  const tabIds = state.openTabs.includes(id)
    ? state.openTabs
    : state.openTabs.concat([id]);
  const tabs = tabIds
    .map((tid) => state.proposals.find((p) => p.id === tid))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const closeThisTab = (tid: string) => {
    const rest = state.openTabs.filter((x) => x !== tid);
    closeTab(tid);
    if (id === tid) {
      go(rest.length ? `/proposals/${rest[rest.length - 1]}` : "/proposals");
    }
  };

  const commentSelection = () => {
    const sel = String(window.getSelection());
    if (!sel.trim()) {
      say("Select some text in the proposal first");
      return;
    }
    const text = window.prompt(`Comment on: "${sel.slice(0, 80)}"`);
    if (!text) return;
    addProposalComment(pr.id, sel, text);
  };

  const openComments = pr.comments.filter((cm) => !cm.resolved).length;

  return (
    <div>
      <Select
        className="hidden max-sm:mb-[18px] max-sm:block max-sm:w-full"
        value={id}
        onChange={(e) => {
          if (e.target.value) go(`/proposals/${e.target.value}`);
        }}
      >
        {tabs.map((t) => (
          <option key={t.id} value={t.id}>
            {client(t.clientId).name.split(" ")[0]} — {t.title}
          </option>
        ))}
      </Select>

      <div className="border-divider mb-[22px] flex items-end gap-[3px] overflow-auto border-b max-sm:hidden!">
        {tabs.map((t) => (
          <div
            key={t.id}
            className="font-body text-text/58 hover:text-text data-[cur=1]:border-divider data-[cur=1]:bg-surface data-[cur=1]:text-text flex max-w-[230px] cursor-pointer items-center gap-2 rounded-t-[5px] border border-b-0 border-transparent bg-transparent px-[13px] py-2 text-[12.5px] leading-[normal] whitespace-nowrap"
            data-cur={t.id === id ? "1" : "0"}
            onClick={() => go(`/proposals/${t.id}`)}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {client(t.clientId).name.split(" ")[0]} — {t.title}
            </span>
            <span
              className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[14px] leading-[1] no-underline opacity-50 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                closeThisTab(t.id);
              }}
            >
              ×
            </span>
          </div>
        ))}
        <button
          className="font-body text-text/72 hover:bg-text/8 hover:text-text mb-[6px] ml-[4px] min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
          onClick={() => go("/proposals")}
        >
          +
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,_1fr)_282px] items-start gap-[30px] max-lg:grid-cols-[minmax(0,1fr)]! max-lg:gap-[26px]! max-lg:[&>aside]:static!">
        <div>
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
                value={pr.title}
                onChange={(e) =>
                  patchProposal(pr.id, { title: e.target.value })
                }
                disabled={locked}
              />
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-[14px] max-sm:grid-cols-1!">
              <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
                <label>Price (USD)</label>
                <input
                  className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm tabular-nums focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                  type="number"
                  value={pr.price}
                  onChange={(e) =>
                    patchProposal(pr.id, { price: Number(e.target.value || 0) })
                  }
                  disabled={locked}
                />
              </div>
              <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
                <label>Estimated due date</label>
                <input
                  className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                  type="date"
                  value={pr.due}
                  onChange={(e) =>
                    patchProposal(pr.id, { due: e.target.value })
                  }
                  disabled={locked}
                />
              </div>
            </div>
            <div className="[&>label]:text-text/70 [&>label]:mb-[5px] [&>label]:block [&>label]:text-xs [&>label]:leading-[1.55]">
              <label>Deliverables</label>
              <div className="flex flex-col gap-[7px]">
                {pr.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-[8px]">
                    <span className="text-text/38 w-[14px] text-[11px] tabular-nums">
                      {i + 1}
                    </span>
                    <input
                      className="border-divider font-inherit text-text caret-accent hover:border-text/45 focus-visible:border-accent min-h-9 w-full rounded-md border bg-transparent px-2.5 py-1.5 text-sm focus-visible:outline-offset-0 max-lg:min-h-11 max-lg:text-[15px]"
                      value={d}
                      onChange={(e) => setDeliverable(pr.id, i, e.target.value)}
                      disabled={locked}
                    />
                    <button
                      className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                      onClick={() => removeDeliverable(pr.id, i)}
                      disabled={locked}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-md border bg-transparent px-[11px] py-[5px] text-[12.5px] leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                  onClick={() => addDeliverable(pr.id)}
                  disabled={locked}
                >
                  + Add item
                </button>
              </div>
            </div>
          </div>

          <div className="border-divider mt-[20px] overflow-hidden rounded-[5px] border">
            <div className="max-sm:bg-bg! bg-surface/55 border-divider flex flex-wrap items-center gap-[2px] border-b p-[7px_9px] max-sm:sticky max-sm:top-14 max-sm:z-4">
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={() => exec("bold")}
                disabled={locked}
              >
                B
              </button>
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap italic disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={() => exec("italic")}
                disabled={locked}
              >
                I
              </button>
              <Divider />
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={() => exec("formatBlock", "h2")}
                disabled={locked}
              >
                H2
              </button>
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={() => exec("formatBlock", "h3")}
                disabled={locked}
              >
                H3
              </button>
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={() => exec("formatBlock", "p")}
                disabled={locked}
              >
                ¶
              </button>
              <Divider />
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={() => exec("insertUnorderedList")}
                disabled={locked}
              >
                •<span className="max-sm:hidden!"> List</span>
              </button>
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={() => exec("insertOrderedList")}
                disabled={locked}
              >
                1.<span className="max-sm:hidden!"> List</span>
              </button>
              <Divider />
              <div
                className={`flex items-center gap-1.5 max-sm:hidden! ${state.plan === "pro" ? "opacity-100" : "opacity-45"}`}
              >
                <Select
                  className="min-h-[28px]! w-[130px]! text-[12px]!"
                  disabled={fontLocked}
                  value={font}
                  onChange={(e) =>
                    patchProposal(pr.id, { font: e.target.value })
                  }
                >
                  <option>Lora</option>
                  <option>Cormorant Garamond</option>
                  <option>System sans</option>
                </Select>
                <Select
                  className="min-h-[28px]! w-[64px]! text-[12px]!"
                  disabled={fontLocked}
                  value={fontSize}
                  onChange={(e) =>
                    patchProposal(pr.id, { fontSize: e.target.value })
                  }
                >
                  <option>14</option>
                  <option>15</option>
                  <option>16</option>
                  <option>18</option>
                </Select>
                {state.plan === "free" ? (
                  <button
                    className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[10px] tracking-[0.08em] no-underline hover:underline"
                    onClick={() => go("/plans")}
                  >
                    PRO
                  </button>
                ) : null}
              </div>
              <span className="flex-1" />
              <button
                className="font-body text-text/72 hover:bg-text/8 hover:text-text min-w-7 cursor-pointer rounded-[3px] border border-transparent bg-transparent px-[8px] py-[3px] text-[13px] leading-[normal] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-35 max-lg:min-h-[38px] max-lg:min-w-[38px]"
                onClick={commentSelection}
                disabled={locked}
                title="Comment on selection"
              >
                +<span className="max-sm:hidden!"> Comment on selection</span>
              </button>
            </div>
            <div
              ref={bodyRef}
              contentEditable={!locked}
              suppressContentEditableWarning
              className={`data-[anch=1]:[&_p]:hover:bg-accent/12 data-[anch=1]:[&_p]:hover:outline-accent/30 data-[anch=1]:[&_li]:hover:bg-accent/12 data-[anch=1]:[&_li]:hover:outline-accent/30 [&_h2]:font-heading [&_h3]:font-heading min-h-[420px] px-[30px] pt-[26px] pb-10 leading-[1.72] outline-none max-sm:px-4 max-sm:pt-[18px] max-sm:pb-8 [&_h2]:mt-[22px] [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:leading-[1.12] [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:mt-[18px] [&_h3]:mb-1.5 [&_h3]:text-lg [&_h3]:leading-[1.12] [&_h3]:font-semibold [&_h3]:tracking-[-0.015em] [&_li]:mb-1 data-[anch=1]:[&_li]:hover:cursor-text data-[anch=1]:[&_li]:hover:outline [&_ol]:mb-3 [&_ol]:pl-[22px] [&_ol]:leading-[1.7] [&_p]:mb-3 [&_p]:leading-[1.72] data-[anch=1]:[&_p]:hover:cursor-text data-[anch=1]:[&_p]:hover:outline [&_ul]:mb-3 [&_ul]:pl-[22px] [&_ul]:leading-[1.7] ${font === "Lora" ? "font-body" : font === "Cormorant Garamond" ? "font-heading" : "font-sans"} ${fontSize === "14" ? "text-sm" : fontSize === "15" ? "text-[15px]" : fontSize === "16" ? "text-base" : "text-lg"}`}
            />
          </div>
          {locked ? (
            <div className="text-text/55 mt-[12px] text-[12.5px]">
              Accepted on{" "}
              {pr.sentAt
                ? fmtDate(new Date(pr.sentAt).toISOString().slice(0, 10))
                : "—"}{" "}
              — this proposal is locked. The live terms now belong to{" "}
              <button
                className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 no-underline hover:underline"
                onClick={() => go(`/projects/${pr.projectId}`)}
              >
                the project
              </button>
              .
            </div>
          ) : null}
        </div>

        <aside className="sticky top-[96px] flex flex-col gap-[18px]">
          <div className="border-divider flex flex-col gap-[11px] rounded-[5px] border p-[15px]">
            <div className="flex items-center justify-between">
              <Tag status={statusKey(pr.status) as StatusKey}>{pr.status}</Tag>
              <span className="text-text/45 text-[11px]">
                {pr.lastSaved
                  ? `Last saved at ${new Date(pr.lastSaved).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                  : "Never saved"}
              </span>
            </div>
            <div className="text-text/60 text-[12.5px] leading-[1.5]">
              {locked
                ? "Accepted and locked. The project is live."
                : pr.status === "Client Commented"
                  ? "The client left comments. Revise, save, then send again."
                  : pr.status === "Sent"
                    ? "Sent — waiting on the client. No decline button: it simply stays here until they respond."
                    : "Draft — nothing is visible to the client until you send."}
            </div>
            <div className="flex gap-[8px]">
              <button
                className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                onClick={() => saveProposal(pr.id, currentHtml())}
                disabled={locked}
              >
                Save
              </button>
              <button
                className="font-heading text-text border-accent text-accent hover:bg-accent/12 active:bg-accent/22 inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
                onClick={() => sendProposal(pr.id, currentHtml())}
                disabled={locked}
              >
                {pr.status === "Draft" ? "Send" : "Send revision"}
              </button>
            </div>
            <hr className="bg-divider m-[2px_0] my-4 h-px border-0" />
            <div className="flex flex-col gap-[5px] text-[12px]">
              <SummaryRow label="Client" value={c.name} />
              <SummaryRow label="Price" value={money(pr.price)} />
              <SummaryRow label="Due" value={fmtDate(pr.due)} />
            </div>
            <button
              className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline disabled:cursor-not-allowed disabled:opacity-45 max-lg:min-h-11"
              onClick={() => previewPortal(pr.projectId)}
            >
              Preview client view
            </button>
          </div>

          <div>
            <div className="border-divider mb-[10px] flex items-baseline justify-between border-b pb-[7px]">
              <h6 className="font-heading text-text/50 m-0 text-[13px] leading-[1.12] font-semibold tracking-[0.08em] uppercase">
                Comments
              </h6>
              <span className="text-text/40 text-[11px]">
                {openComments ? `${openComments} open` : ""}
              </span>
            </div>
            <div className="flex flex-col gap-[10px]">
              {pr.comments.map((cm) => (
                <div
                  key={cm.id}
                  className={`border-accent border-l-2 py-0.5 pl-2.5 ${cm.resolved ? "opacity-22" : "opacity-100"}`}
                >
                  <div className="text-text/45 text-[11px]">
                    {cm.author} · {ago(cm.ts)}
                  </div>
                  <div className="text-text/50 m-[3px_0] text-[11.5px] italic">
                    &ldquo;{cm.anchor}&rdquo;
                  </div>
                  <div className="text-[12.5px] leading-[1.5]">{cm.text}</div>
                  <button
                    className="font-inherit text-accent mt-[4px] cursor-pointer border-0 bg-transparent p-0 text-[11px] no-underline hover:underline"
                    onClick={() => toggleProposalComment(pr.id, cm.id)}
                  >
                    {cm.resolved ? "Reopen" : "Resolve"}
                  </button>
                </div>
              ))}
              {pr.comments.length === 0 ? (
                <div className="text-text/42 text-[12px] leading-[1.5]">
                  No comments. Client comments appear here the next time you
                  open the proposal — nothing syncs live.
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="bg-divider m-[0_6px] h-[18px] w-[1px]" />;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text/55">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
