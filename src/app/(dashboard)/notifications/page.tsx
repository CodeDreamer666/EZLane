"use client";

import { useRouter } from "next/navigation";
import { LoadingScreen, ServerError, Tag } from "~/components/shared";
import { ago } from "~/lib/format";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

export default function NotificationsPage() {
  const router = useRouter();
  const { showMessage } = useStatusMessage();
  const utils = api.useUtils();

  const { data: notifications, isLoading, error } =
    api.notifications.list.useQuery();

  const markRead = api.notifications.markRead.useMutation({
    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
      await utils.notifications.invalidate();
    },
  });

  const markAllRead = api.notifications.markAllRead.useMutation({
    onSuccess: () => {
      showMessage("All notifications marked read", true);
    },

    onError: (err) => {
      showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
      await utils.notifications.invalidate();
    },
  });

  if (isLoading) return <LoadingScreen />;

  if (error || !notifications) return <ServerError />;

  return (
    <div>
      <div className="border-divider mb-[4px] flex items-baseline justify-between border-b pb-[8px]">
        <span className="text-text/55 text-[12.5px]">
          Every event across proposals, contracts, payments, threads and status.
        </span>
        <button
          className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[12.5px] no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-45"
          disabled={markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          Mark all read
        </button>
      </div>
      <div>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="hover:bg-text/5 border-divider flex cursor-pointer items-start gap-[13px] border-b p-[15px_6px]"
            onClick={() => {
              if (!n.read) markRead.mutate({ id: n.id });
              router.push(n.route);
            }}
          >
            <div
              className={`bg-accent mt-[7px] h-1.5 w-1.5 flex-none rounded-full ${n.read ? "opacity-22" : "opacity-100"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] leading-[1.5]">{n.title}</div>
              <div className="text-text/42 mt-[3px] text-[11px]">
                {ago(new Date(n.createdAt).getTime())}
              </div>
            </div>
            <Tag status="done" className="text-[9.5px]">
              {n.audience === "CLIENT" ? "Client saw this" : "You"}
            </Tag>
          </div>
        ))}
        {notifications.length === 0 ? (
          <div className="text-text/45 p-[22px_6px] text-[13px]">
            Nothing yet. Events land here as proposals, contracts and messages
            move.
          </div>
        ) : null}
      </div>
    </div>
  );
}
