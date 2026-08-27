"use client";

import type { ReactNode } from "react";

import { AddClientDialog } from "~/app/_components/shell/AddClientDialog";
import { CommandPalette } from "~/app/_components/shell/CommandPalette";
import { Header } from "~/app/_components/shell/Header";
import { MobileTabBar } from "~/app/_components/shell/MobileTabBar";
import { Sidebar } from "~/app/_components/shell/Sidebar";
import { Toast } from "~/app/_components/shell/Toast";
import { useEzlane } from "~/lib/store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { state, closeNav } = useEzlane();

  return (
    <>
      <div className="shell" style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
        {state.navOpen ? <div className="scrim" onClick={closeNav} /> : null}
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Header />
          <div className="page" style={{ padding: "28px 30px 70px", maxWidth: 1180 }}>
            {children}
          </div>
          <MobileTabBar />
        </main>
      </div>
      <CommandPalette />
      <AddClientDialog />
      <Toast />
    </>
  );
}
