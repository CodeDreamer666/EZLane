"use client";

import type { MouseEvent } from "react";

import { Input, Kbd } from "~/app/_components/ui";
import { companyOrName } from "~/lib/format";
import { useEzlane } from "~/lib/store";

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
  { group: "Go", label: "Settings — Invoice details", route: "/settings/invoice" },
  { group: "Go", label: "Settings — Portal branding", route: "/settings/branding" },
  { group: "Go", label: "Settings — Plan & billing", route: "/settings/plan" },
] as const;

export function CommandPalette() {
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
    .filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
    .slice(0, 40);

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      className="dialog-backdrop"
      style={{ alignItems: "flex-start", paddingTop: "14vh", zIndex: 60 }}
      onClick={closePalette}
    >
      <div
        className="dialog"
        style={{
          width: "min(520px, 100%)",
          padding: 0,
          gap: 0,
          background: "var(--color-surface)",
          animation: "fadeUp .14s ease-out",
        }}
        onClick={stop}
      >
        <Input
          placeholder="Jump to a screen or run a command…"
          style={{
            border: 0,
            borderBottom: "1px solid var(--color-divider)",
            borderRadius: 0,
            minHeight: 48,
            fontSize: 15,
          }}
          value={state.paletteQuery}
          onChange={(e) => setPaletteQuery(e.target.value)}
          autoFocus
        />
        <div style={{ maxHeight: 320, overflow: "auto", padding: 6 }}>
          {results.map((c, i) => (
            <div key={i} className="pcmd" onClick={c.run}>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "color-mix(in srgb, var(--color-text) 35%, transparent)",
                  width: 64,
                  flex: "none",
                }}
              >
                {c.group}
              </span>
              <span style={{ flex: 1 }}>{c.label}</span>
              <Kbd>↩</Kbd>
            </div>
          ))}
          {results.length === 0 ? (
            <div
              style={{
                padding: 22,
                textAlign: "center",
                fontSize: 13,
                color: "color-mix(in srgb, var(--color-text) 45%, transparent)",
              }}
            >
              Nothing matches that.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
