"use client";

import useEzlane from "~/lib/useEzlane";

export default function Toast() {
  const { state } = useEzlane();
  if (!state.toast) return null;
  return (
    <div className="text-text bg-surface border-divider fixed bottom-[26px] left-1/2 z-[80] -translate-x-1/2 rounded-[5px] border p-[11px_18px] text-[13px] whitespace-nowrap shadow-lg">
      {state.toast}
    </div>
  );
}
