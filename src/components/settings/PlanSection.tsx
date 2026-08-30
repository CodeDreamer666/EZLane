"use client";
import { useRouter } from "next/navigation";
import { Button, LoadingScreen, ServerError, LoadingIcon } from "~/components/shared";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

export default function PlanSection() {
    const { showMessage } = useStatusMessage();
    const { data: planData, isLoading, error } = api.settings.getPlan.useQuery();
    const router = useRouter();
    const utils = api.useUtils();

    const mutation = api.settings.updatePlan.useMutation({
        onSuccess: (res) => {
            showMessage(
                res.plan === "PRO"
                    ? "You are on Pro — unlimited projects, branding unlocked"
                    : "Moved to Free — active projects stay open",
                true,
            );
        },

        onError: (err) => {
            const msg = getFriendlyError(err);
            showMessage(msg, false);
        },

        onSettled: async () => {
            await utils.invalidate();
        },
    });

    const isPro = planData?.plan === "PRO";

    if (isLoading) return <LoadingScreen />;

    if (error || !planData) return <ServerError />;

    return (
        <div className="flex flex-col gap-[18px]">
            <div>
                <h4 className="font-heading m-[0_0_3px] text-[20px] leading-[1.12] font-semibold tracking-[-0.015em]">
                    Plan &amp; billing
                </h4>
                <div className="text-text/55 text-[12.5px]">
                    Plan limits are enforced on active projects only. Completed work never
                    counts.
                </div>
            </div>

            <div className="border-divider flex flex-col gap-[12px] rounded-[5px] border p-[18px_20px]">
                <div className="flex items-baseline gap-[10px]">
                    <span className="font-heading text-[24px]">
                        {isPro ? "Pro" : "Free"}
                    </span>
                </div>
                <div className="bg-text/12 h-[4px] overflow-hidden rounded-sm">
                    <svg className="text-accent block h-full w-full" aria-hidden="true">
                        <rect
                            width={isPro ? "100%" : "0%"}
                            height="100%"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <div className="text-text/60 text-[12.5px]">
                    {isPro ? "Unlimited active projects" : "Up to 2 active projects"}
                </div>

                <div className="mt-[4px] flex gap-[9px]">
                    {!isPro ? (
                        <Button
                            variant="primary"
                            onClick={() => router.push("/plans")}
                            disabled={mutation.isPending}
                        >
                            Upgrade to Pro
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={() => mutation.mutate({ plan: "FREE" })}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <div className="flex items-center gap-2">
                                    <LoadingIcon />
                                    Saving...
                                </div>
                            ) : "Downgrade to Free"}
                        </Button>
                    )}

                    <Button
                        variant="secondary"
                        onClick={() => router.push("/plans")}
                        disabled={mutation.isPending}
                    >
                        Compare plans
                    </Button>
                </div>
            </div>

            {isPro ? (
                <div className="text-text/55 text-[12.5px] leading-[1.6]">
                    Downgrading with more than two active projects keeps them all open —
                    you simply cannot start a third until you are back under the limit.
                </div>
            ) : null}
        </div>
    );
}
