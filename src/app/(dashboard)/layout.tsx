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
      <div className="font-body flex min-h-screen overflow-x-hidden">
        {state.navOpen ? (
          <div
            className="hidden max-lg:fixed max-lg:inset-0 max-lg:z-44 max-lg:block max-lg:bg-black/55"
            onClick={closeNav}
          />
        ) : null}
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Header />
          <div className="max-w-[1180px] p-[28px_30px_70px] max-lg:px-[18px]! max-lg:pt-[22px]! max-lg:pb-20! max-sm:px-3.5! max-sm:pt-[18px]! max-sm:pb-[98px]!">
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
