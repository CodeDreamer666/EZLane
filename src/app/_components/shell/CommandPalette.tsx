"use client";

import type { MouseEvent } from "react";

import { Input, Kbd } from "~/app/_components/ui";
import { companyOrName } from "~/lib/format";
import useEzlane from "~/lib/useEzlane";

interface Command {
  group: string;
  label: string;
  run: () => void;
}

const GO_COMMANDS = [
  { group: "Go", label: "Dashboard", route: "/dashboard" },
  { group: "Go", label: "Clients", route: "/clients" },
  { group: "Go", label: "Proposals", route: "/proposals" },
  { group: "Go", label: "Projects", route: "/projects" },
  { group: "Go", label: "Notifications", route: "/notifications" },
  { group: "Go", label: "Plans — Free vs Pro", route: "/plans" },
  { group: "Go", label: "Settings — Profile", route: "/settings/profile" },
  {
    group: "Go",
    label: "Settings — Invoice details",
    route: "/settings/invoice",
  },
  {
    group: "Go",
    label: "Settings — Portal branding",
    route: "/settings/branding",
  },
  { group: "Go", label: "Settings — Plan & billing", route: "/settings/plan" },
] as const;

export default function CommandPalette() {
  const { state, closePalette, setPaletteQuery, go, client, openAddClient } =
    useEzlane();

  if (!state.paletteOpen) return null;

  const q = state.paletteQuery.toLowerCase();

  const commands: Command[] = [];
  commands.push({
    group: "Action",
    label: "Add a client",
    run: () => {
      closePalette();
      openAddClient();
    },
  });
  for (const c of GO_COMMANDS) {
    commands.push({ group: c.group, label: c.label, run: () => go(c.route) });
  }
  for (const p of state.projects.filter((x) => x.stage !== "proposal")) {
    commands.push({
      group: "Project",
      label: `${companyOrName(client(p.clientId))} — ${p.title}`,
      run: () => go(`/projects/${p.id}`),
    });
  }
  for (const p of state.proposals) {
    commands.push({
      group: "Proposal",
      label: `${client(p.clientId).name} — ${p.title} (${p.status})`,
      run: () => go(`/proposals/${p.id}`),
    });
  }

  const results = commands
    .filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q),
    )
    .slice(0, 40);

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center items-start bg-neutral-900/50 p-4 pt-[14vh]"
      onClick={closePalette}
    >
      <div
        className="border-divider bg-surface flex w-[min(520px,_100%)] animate-[fadeUp_.14s_ease-out] flex-col gap-0 rounded-lg border p-0 shadow-lg max-sm:max-h-[88vh] max-sm:w-[calc(100vw-26px)] max-sm:overflow-y-auto"
        onClick={stop}
      >
        <Input
          placeholder="Jump to a screen or run a command…"
          className="border-divider min-h-[48px] rounded-none border-0 border-b text-[15px]"
          value={state.paletteQuery}
          onChange={(e) => setPaletteQuery(e.target.value)}
          autoFocus
        />
        <div className="max-h-[320px] overflow-auto p-[6px]">
          {results.map((c, i) => (
            <div
              key={i}
              className="text-text/78 hover:bg-accent/14 hover:text-text flex cursor-pointer items-center gap-2.5 rounded px-3 py-[9px] text-[13.5px]"
              onClick={c.run}
            >
              <span className="text-text/35 w-[64px] flex-none text-[10px] tracking-[0.1em] uppercase">
                {c.group}
              </span>
              <span className="flex-1">{c.label}</span>
              <Kbd>↩</Kbd>
            </div>
          ))}
          {results.length === 0 ? (
            <div className="text-text/45 p-[22px] text-center text-[13px]">
              Nothing matches that.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
