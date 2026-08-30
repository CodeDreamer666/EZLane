"use client"
import {
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import type { StatusMessage } from "~/type/statusMessage";
import { StatusMessageContext } from "~/context/statusMessage";

const AUTO_DISMISS_MS = 8000;
const MAX_STACK = 4;

export default function StatusMessageProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [messages, setMessages] = useState<StatusMessage[]>([]);

    const dismissMessage = useCallback((id: string) => {
        setMessages((current) => current.filter((m) => m.id !== id));
    }, []);

    const showMessage = useCallback(
        (message: string, isSuccess = false) => {
            const text =
                typeof message === "string" ? message.trim() : String(message ?? "");
            if (!text) return;

            const id = `msg_${Date.now().toString(36)}_${Math.random()
                .toString(36)
                .slice(2, 8)}`;

            setMessages((current) => {
                const deduped = current.filter((m) => m.text !== text);
                const next: StatusMessage = {
                    id,
                    text,
                    isSuccess,
                    createdAt: Date.now(),
                };
                return [...deduped, next].slice(-MAX_STACK);
            });
        },
        [],
    );

    useEffect(() => {
        if (messages.length === 0) return;

        const now = Date.now();
        const timers = messages.map((m) => {
            const remaining = Math.max(0, m.createdAt + AUTO_DISMISS_MS - now);
            return setTimeout(() => dismissMessage(m.id), remaining);
        });

        return () => {
            for (const timer of timers) clearTimeout(timer);
        };
    }, [messages, dismissMessage]);

    return (
        <StatusMessageContext.Provider
            value={{ messages, showMessage, dismissMessage }}
        >
            {children}
        </StatusMessageContext.Provider>
    );
}
