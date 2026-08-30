"use client";

import { Tag } from "~/components/shared";
import { ago } from "~/lib/format";
import useEzlane from "~/hook/useEzlane";

export default function NotificationsPage() {
  const { state, project, markRead, markAllRead, go } = useEzlane();

  const notifs = state.notifications.slice().sort((a, b) => b.ts - a.ts);

  return (
    <div>
      <div className="border-divider mb-[4px] flex items-baseline justify-between border-b pb-[8px]">
        <span className="text-text/55 text-[12.5px]">
          Every event across proposals, contracts, payments, threads and status.
        </span>
        <button
          className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[12.5px] no-underline hover:underline"
          onClick={() => markAllRead()}
        >
          Mark all read
        </button>
      </div>
      <div>
        {notifs.map((n) => (
          <div
            key={n.id}
            className="hover:bg-text/5 border-divider flex cursor-pointer items-start gap-[13px] border-b p-[15px_6px]"
            onClick={() => {
              markRead(n.id);
              go(
                n.audience === "client" ? `/projects/${n.projectId}` : n.route,
              );
            }}
          >
            <div
              className={`bg-accent mt-[7px] h-1.5 w-1.5 flex-none rounded-full ${n.read ? "opacity-22" : "opacity-100"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] leading-[1.5]">{n.title}</div>
              <div className="text-text/42 mt-[3px] text-[11px]">
                {project(n.projectId)?.title ?? "—"} · {ago(n.ts)}
              </div>
            </div>
            <Tag status="done" className="text-[9.5px]">
              {n.audience === "client" ? "Client saw this" : "You"}
            </Tag>
          </div>
        ))}
      </div>
    </div>
  );
}
