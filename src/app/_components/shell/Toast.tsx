"use client";

import { useEzlane } from "~/lib/store";

export function Toast() {
  const { state } = useEzlane();
  if (!state.toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 26,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-divider)",
        boxShadow: "var(--shadow-lg)",
        borderRadius: 5,
        padding: "11px 18px",
        fontSize: 13,
        whiteSpace: "nowrap",
        zIndex: 80,
        color: "var(--color-text)",
      }}
    >
      {state.toast}
    </div>
  );
}
