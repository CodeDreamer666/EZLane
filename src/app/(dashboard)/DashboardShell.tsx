"use client";
import { useEffect, useState, type ReactNode } from "react";
import AddClientDialog from "~/components/shell/AddClientDialog";
import CommandPalette from "~/components/shell/CommandPalette";
import Header from "~/components/shell/Header";
import Sidebar from "~/components/shell/Sidebar";

export default function DashboardShell({ children }: { children: ReactNode }) {
    const [navOpen, setNavOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setPaletteOpen((open) => !open);
            }
            if (e.key === "Escape") setPaletteOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);

        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <>
            <div className="font-body flex min-h-screen">
                {navOpen ? (
                    <div
                        className="hidden max-lg:fixed max-lg:inset-0 max-lg:z-44 max-lg:block max-lg:bg-black/55"
                        onClick={() => setNavOpen(false)}
                    />
                ) : null}

                <Sidebar
                    navOpen={navOpen}
                    closeNav={() => setNavOpen(false)}
                    openPalette={() => setPaletteOpen(true)}
                />

                <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
                    <Header toggleNav={() => setNavOpen((open) => !open)} />
                        
                    <div className="max-w-[1180px] p-[28px_30px_70px] max-lg:px-[18px]! max-lg:pt-[22px]! max-lg:pb-20! max-sm:px-3.5! max-sm:pt-[18px]! max-sm:pb-[98px]!">
                        {children}
                    </div>
                </main>
            </div>

            <CommandPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
            />

            <AddClientDialog />
        </>
    );
}
