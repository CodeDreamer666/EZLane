"use client"
import {
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { AddClientModalContext } from "~/context/addClientModalContext";

export default function AddClientModalProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <AddClientModalContext.Provider
            value={{
                open,
                openModal: () => setOpen(true),
                closeModal: () => setOpen(false),
            }}
        >
            {children}
        </AddClientModalContext.Provider>
    );
}