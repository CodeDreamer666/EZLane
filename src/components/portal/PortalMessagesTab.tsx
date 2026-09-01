"use client";

import { useState, type DragEvent } from "react";

import type { PortalRef } from "~/components/portal/PortalGate";
import { Button, LoadingIcon, Tag, Textarea } from "~/components/shared";
import { fmtTime } from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api, type RouterOutputs } from "~/trpc/react";

type PortalProject = RouterOutputs["portal"]["project"]["project"];

export default function PortalMessagesTab({
  project,
  brandName,
  portalRef,
  password,
  projectId,
}: {
  project: PortalProject;
  brandName: string;
  portalRef: PortalRef;
  password: string;
  projectId: string;
}) {
  const { showMessage } = useStatusMessage();
  const utils = api.useUtils();

  const [messageText, setMessageText] = useState("");
  const [messageFile, setMessageFile] = useState("");
  const [dropActive, setDropActive] = useState(false);

  const postMessage = api.portal.postMessage.useMutation({
    onSuccess: () => {
      showMessage("Message posted", true);
      setMessageText("");
      setMessageFile("");
    },

    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
      await utils.portal.invalidate();
    },
  });

  const approveWork = api.portal.approveWork.useMutation({
    onSuccess: () => {
      showMessage("Approved — thank you", true);
    },

    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
      await utils.portal.invalidate();
    },
  });

  const handlePostMessage = () => {
    if (postMessage.isPending) return;

    if (messageText.trim().length < 1 && messageFile.length < 1) {
      showMessage("Write a message or attach a file.", false);
      return;
    }

    postMessage.mutate({
      ref: portalRef,
      password,
      projectId,
      text: messageText.trim(),
      file: messageFile || undefined,
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setMessageFile(file.name);
  };

  const canApprove = !!project.contractName && project.status !== "APPROVED";

  return (
    <div className="max-w-[760px]">
      <div className="border-divider flex items-baseline justify-between border-b pb-[8px]">
        <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
          Messages
        </h4>
        <span className="text-text/45 text-[11.5px]">
          New messages appear when you reload — nothing is live
        </span>
      </div>
      <div className="flex flex-col">
        {project.messages.map((message) => (
          <div
            key={message.id}
            className="border-divider border-b p-[15px_2px]"
          >
            {message.side === "system" ? (
              <div className="text-text/42 text-[11.5px] italic">
                {message.text} ·{" "}
                {fmtTime(new Date(message.createdAt).getTime())}
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-[9px]">
                  <span className="font-heading text-[14px] font-semibold">
                    {message.author}
                  </span>
                  <Tag
                    status={message.side === "client" ? "sent" : "done"}
                    className="px-[7px]! py-[1px]! text-[9.5px]!"
                  >
                    {message.side === "client" ? "You" : brandName}
                  </Tag>
                  <span className="text-text/40 text-[11px]">
                    {fmtTime(new Date(message.createdAt).getTime())}
                  </span>
                </div>
                <div className="mt-[6px] max-w-[62ch] text-[14px] leading-[1.7] max-sm:max-w-full!">
                  {message.text}
                </div>
                {message.file ? (
                  <div className="border-divider mt-[9px] inline-flex items-center gap-[8px] rounded-md border p-[6px_11px] text-[12px]">
                    {message.file}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
        {project.messages.length === 0 ? (
          <div className="text-text/45 p-[16px_2px] text-[13px]">
            No messages yet.
          </div>
        ) : null}
      </div>
      <div
        className={`mt-[18px] rounded-[5px] border p-[13px] ${
          dropActive ? "border-accent bg-accent/8" : "border-divider"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dropActive) setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={handleDrop}
      >
        <Textarea
          className="border-0! p-0! text-[14px]!"
          rows={3}
          placeholder="Reply…"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        {messageFile ? (
          <div className="text-accent-700 border-accent-400 mb-[10px] inline-flex items-center gap-[8px] rounded-md border p-[5px_10px] text-[12px]">
            {messageFile}
            <button
              className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[13px] no-underline hover:underline"
              onClick={() => setMessageFile("")}
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="mt-[8px] flex flex-wrap items-center gap-[10px]">
          <span className="text-text/40 flex-1 text-[11.5px]">
            {dropActive
              ? "Drop to attach"
              : "Drag a file into this box to attach it"}
          </span>
          <label className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-sm leading-[1.2] font-semibold whitespace-nowrap no-underline max-lg:min-h-11">
            Attach
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setMessageFile(file.name);
              }}
            />
          </label>
          <Button
            variant="primary"
            disabled={postMessage.isPending}
            onClick={handlePostMessage}
          >
            {postMessage.isPending ? (
              <span className="flex items-center gap-1.5">
                <LoadingIcon className="h-4 w-4" />
                Sending...
              </span>
            ) : (
              "Send message"
            )}
          </Button>
        </div>
      </div>
      {canApprove ? (
        <div className="bg-accent/6 border-accent mt-[20px] flex items-center gap-[16px] rounded-[5px] border p-[16px_18px]">
          <div className="flex-1">
            <div className="font-heading text-[15px] font-semibold">
              Happy with the work?
            </div>
            <div className="text-text/60 mt-[3px] text-[12.5px]">
              Approving is a deliberate step, separate from messaging.
            </div>
          </div>
          <Button
            variant="primary"
            disabled={approveWork.isPending}
            onClick={() =>
              approveWork.mutate({ ref: portalRef, password, projectId })
            }
          >
            {approveWork.isPending ? (
              <span className="flex items-center gap-1.5">
                <LoadingIcon className="h-4 w-4" />
                Approving...
              </span>
            ) : (
              "Approve the work"
            )}
          </Button>
        </div>
      ) : null}
      {project.status === "APPROVED" ? (
        <div className="text-text/55 mt-[20px] text-[12.5px]">
          You approved this work.
        </div>
      ) : null}
    </div>
  );
}
