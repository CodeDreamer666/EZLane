/**
 * Top-level success / error message bus.
 *
 * Any code — frontend event handlers, tRPC error hooks, plain utilities — can
 * push a message here and it shows in the app-wide <MessageCenter/> banner.
 * It is a framework-free external store so non-React code can use it too;
 * React subscribes via `useSyncExternalStore`.
 */

export type AppMessageKind = "success" | "error";

export interface AppMessage {
  id: string;
  kind: AppMessageKind;
  text: string;
}

/** How long a message lingers before it auto-dismisses (0 disables it). */
const AUTO_DISMISS_MS: Record<AppMessageKind, number> = {
  success: 4500,
  error: 8000,
};

/** Most banners shown at once; oldest fall off the top. */
const MAX_STACK = 4;

let messages: AppMessage[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

function makeId() {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function subscribeMessages(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMessagesSnapshot(): AppMessage[] {
  return messages;
}

/** Remove one message (called by its ✕ button and by the auto-dismiss timer). */
export function dismissMessage(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  const next = messages.filter((m) => m.id !== id);
  if (next.length === messages.length) return;
  messages = next;
  emit();
}

/** Clear the whole stack. */
export function clearMessages() {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  if (messages.length === 0) return;
  messages = [];
  emit();
}

/**
 * Show a message. Returns its id so callers can dismiss it early.
 * Pass `durationMs: 0` to make it stay until the user closes it.
 */
export function pushMessage(
  kind: AppMessageKind,
  text: string,
  options?: { durationMs?: number },
): string {
  const trimmed = typeof text === "string" ? text.trim() : String(text ?? "");
  if (!trimmed) return "";

  const id = makeId();
  // Drop an identical banner that's already on screen so repeats don't stack.
  const deduped = messages.filter(
    (m) => !(m.kind === kind && m.text === trimmed),
  );
  messages = [...deduped, { id, kind, text: trimmed }].slice(-MAX_STACK);
  emit();

  const duration = options?.durationMs ?? AUTO_DISMISS_MS[kind];
  if (duration > 0 && typeof window !== "undefined") {
    timers.set(
      id,
      setTimeout(() => dismissMessage(id), duration),
    );
  }
  return id;
}

export function notifySuccess(text: string, options?: { durationMs?: number }) {
  return pushMessage("success", text, options);
}

export function notifyError(text: string, options?: { durationMs?: number }) {
  return pushMessage("error", text, options);
}

/** Best-effort human-readable string from anything that was thrown. */
export function toMessageText(err: unknown): string {
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Something went wrong. Please try again.";
}
