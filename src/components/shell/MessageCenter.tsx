"use client";
import useStatusMessage from "~/hook/useStatusMessage";

export default function MessageCenter() {
    const { messages, dismissMessage } = useStatusMessage();

    if (messages.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-3">
            {messages.map((m) => (
                <div
                    key={m.id}
                    role="alert"
                    aria-live="assertive"
                    className={`font-body pointer-events-auto flex w-full max-w-[440px] items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-[13px] shadow-lg backdrop-blur-sm ${
                        m.isSuccess
                            ? "border-success/35 bg-success/12 text-success-fg"
                            : "border-danger/35 bg-danger/12 text-danger-fg"
                    }`}
                >
                    <span
                        aria-hidden
                        className={`mt-[3px] h-2 w-2 shrink-0 rounded-full ${
                            m.isSuccess ? "bg-success" : "bg-danger"
                        }`}
                    />
                    <p className="min-w-0 flex-1 leading-snug break-words">{m.text}</p>
                    <button
                        type="button"
                        onClick={() => dismissMessage(m.id)}
                        aria-label="Dismiss message"
                        className="-mt-0.5 -mr-1 shrink-0 cursor-pointer rounded p-1 leading-none opacity-70 transition hover:bg-white/10 hover:opacity-100"
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden
                        >
                            <path
                                d="M1 1l10 10M11 1L1 11"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
