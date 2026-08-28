"use client";

import { useSyncExternalStore } from "react";

import {
  dismissMessage,
  getMessagesSnapshot,
  subscribeMessages,
  type AppMessage,
} from "~/lib/messages";

const EMPTY: AppMessage[] = [];

/**
 * App-wide success / error banner. Rendered once at the root so it floats over
 * every page (fixed to the viewport top — stays put while the page scrolls).
 * Green reads as success, red as error; each banner carries a ✕ to dismiss it.
 */
export default function MessageCenter() {
  const messages = useSyncExternalStore(
    subscribeMessages,
    getMessagesSnapshot,
    () => EMPTY,
  );

  if (messages.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-3">
      {messages.map((m) => {
        const success = m.kind === "success";
        return (
          <div
            key={m.id}
            role={success ? "status" : "alert"}
            aria-live={success ? "polite" : "assertive"}
            className={[
              "font-body pointer-events-auto flex w-full max-w-[440px] items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-[13px] shadow-lg backdrop-blur-sm",
              success
                ? "border-success/35 bg-success/12 text-success-fg"
                : "border-danger/35 bg-danger/12 text-danger-fg",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "mt-[3px] h-2 w-2 shrink-0 rounded-full",
                success ? "bg-success" : "bg-danger",
              ].join(" ")}
            />
            <p className="min-w-0 flex-1 leading-snug break-words">{m.text}</p>
            <button
              type="button"
              onClick={() => dismissMessage(m.id)}
              aria-label="Dismiss message"
              className="-mt-0.5 -mr-1 shrink-0 cursor-pointer rounded p-1 leading-none opacity-70 transition hover:bg-white/10 hover:opacity-100"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
