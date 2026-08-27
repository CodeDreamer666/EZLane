"use client";

import { Tag } from "~/app/_components/ui";
import { ago } from "~/lib/format";
import { useEzlane } from "~/lib/store";

export default function NotificationsPage() {
  const { state, project, markRead, markAllRead, go } = useEzlane();

  const notifs = state.notifications.slice().sort((a, b) => b.ts - a.ts);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-divider)",
          paddingBottom: 8,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
          Every event across proposals, contracts, payments, threads and status.
        </span>
        <button className="lnk" style={{ fontSize: 12.5 }} onClick={() => markAllRead()}>
          Mark all read
        </button>
      </div>
      <div>
        {notifs.map((n) => (
          <div
            key={n.id}
            className="row"
            onClick={() => {
              markRead(n.id);
              go(n.audience === "client" ? `/projects/${n.projectId}` : n.route);
            }}
            style={{
              display: "flex",
              gap: 13,
              alignItems: "flex-start",
              padding: "15px 6px",
              borderBottom: "1px solid var(--color-divider)",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                marginTop: 7,
                flex: "none",
                background: "var(--color-accent)",
                opacity: n.read ? 0.22 : 1,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", marginTop: 3 }}>
                {project(n.projectId)?.title ?? "—"} · {ago(n.ts)}
              </div>
            </div>
            <Tag status="done" style={{ fontSize: 9.5 }}>
              {n.audience === "client" ? "Client saw this" : "You"}
            </Tag>
          </div>
        ))}
      </div>
    </div>
  );
}
