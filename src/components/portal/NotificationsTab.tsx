"use client";

import { ago } from "~/lib/format";
import useEzlane from "~/hook/useEzlane";
import type { Project } from "~/type";

export default function NotificationsTab({ project: p }: { project: Project }) {
  const { state, markAllRead } = useEzlane();
  const notifs = state.notifications
    .filter((n) => n.audience === "client" && n.projectId === p.id)
    .sort((a, b) => b.ts - a.ts);

  return (
    <div className="max-w-[700px]">
      <div className="border-divider flex items-baseline justify-between border-b pb-[8px]">
        <h4 className="font-heading m-0 text-[16px] leading-[1.12] font-semibold tracking-[-0.015em]">
          Activity on this project
        </h4>
        <button
          className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[12.5px] no-underline hover:underline"
          onClick={() => markAllRead("client", p.id)}
        >
          Mark all read
        </button>
      </div>
      <div>
        {notifs.map((n) => (
          <div
            key={n.id}
            className="border-divider flex items-start gap-[13px] border-b p-[15px_4px]"
          >
            <div
              className={`bg-accent mt-[7px] h-1.5 w-1.5 flex-none rounded-full ${n.read ? "opacity-22" : "opacity-100"}`}
            />
            <div className="flex-1">
              <div className="text-[13.5px] leading-[1.5]">{n.title}</div>
              <div className="text-text/42 mt-[3px] text-[11px]">
                {ago(n.ts)} · {n.read ? "read" : "unread"}
              </div>
            </div>
          </div>
        ))}
        {notifs.length === 0 ? (
          <div className="text-text/45 p-[16px_4px] text-[13px]">
            Nothing yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
