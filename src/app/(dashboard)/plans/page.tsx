"use client";

import { Button } from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";
import { api } from "~/trpc/react";

export default function PlansPage() {
  const { state, setBilling, setPlan, go, say } = useEzlane();
  const annual = state.billing === "annual";
  const priceStr = annual ? "$16" : "$20";
  const billingNote = annual
    ? "$192 billed once a year"
    : "billed monthly, cancel any time";
  const ctaLabel = annual ? "Upgrade — $192 / year" : "Upgrade — $20 / month";

  const utils = api.useUtils();
  const { data: planData } = api.settings.getPlan.useQuery(undefined, {
    retry: false,
  });
  const currentPlan: "free" | "pro" = planData
    ? (String(planData.plan).toLowerCase() as "free" | "pro")
    : state.plan;

  const planMutation = api.settings.updatePlan.useMutation({
    onSuccess: (res) => {
      const normalized = String(res.plan).toLowerCase() as "free" | "pro";
      setPlan(normalized);
      void utils.settings.getPlan.invalidate();
      void utils.settings.getBranding.invalidate();
      void utils.settings.getAll.invalidate();
    },
    onError: () => {
      say("We couldn't save your changes. Please try again.");
    },
  });

  const upgrade = () => {
    planMutation.mutate(
      { plan: "PRO" },
      {
        onSuccess: () => {
          say("You are on Pro — unlimited projects, branding unlocked");
          go("/settings/plan");
        },
      },
    );
  };
  const downgrade = () => {
    planMutation.mutate(
      { plan: "FREE" },
      {
        onSuccess: () => {
          say("Moved to Free");
        },
      },
    );
  };

  return (
    <div className="max-w-[820px]">
      <div className="flex flex-wrap items-center gap-[18px]">
        <div className="min-w-[260px] flex-1">
          <h3 className="font-heading m-[0_0_4px] text-[25px] leading-[1.12] font-semibold tracking-[-0.015em]">
            Two plans, one difference that matters
          </h3>
          <div className="text-text/58 text-[13px]">
            Every feature is on Free. Pro lifts the project ceiling and lets the
            portal be entirely yours.
          </div>
        </div>
        <div className="border-divider inline-flex overflow-hidden rounded-md border">
          <label className="has-checked:text-accent has-focus-visible:outline-accent [&+&]:border-divider [&:not(:has(input:checked))]:hover:bg-text/7 relative inline-flex cursor-pointer items-center gap-1.5 px-3 py-[7px] text-[13px] has-checked:shadow-[inset_0_0_0_1px_var(--color-accent)] has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 [&+&]:border-l [&>input]:pointer-events-none [&>input]:absolute [&>input]:h-0 [&>input]:w-0 [&>input]:opacity-0">
            <input
              type="radio"
              name="billing"
              checked={!annual}
              onChange={() => setBilling("monthly")}
            />
            Monthly
          </label>
          <label className="has-checked:text-accent has-focus-visible:outline-accent [&+&]:border-divider [&:not(:has(input:checked))]:hover:bg-text/7 relative inline-flex cursor-pointer items-center gap-1.5 px-3 py-[7px] text-[13px] has-checked:shadow-[inset_0_0_0_1px_var(--color-accent)] has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 [&+&]:border-l [&>input]:pointer-events-none [&>input]:absolute [&>input]:h-0 [&>input]:w-0 [&>input]:opacity-0">
            <input
              type="radio"
              name="billing"
              checked={annual}
              onChange={() => setBilling("annual")}
            />
            Annual — save $48
          </label>
        </div>
      </div>

      <div className="mt-[26px] grid grid-cols-[1fr_1fr] gap-[18px] max-sm:grid-cols-1!">
        <div className="border-divider flex flex-col gap-[14px] rounded-[6px] border p-[22px_24px]">
          <div>
            <div className="text-accent text-[10px] tracking-[0.1em] uppercase">
              Free
            </div>
            <div className="font-heading mt-[6px] text-[38px] leading-[1.1] tabular-nums">
              $0
            </div>
            <div className="text-text/50 text-[12.5px]">forever</div>
          </div>
          <ul className="text-text/80 m-0 pl-[18px] text-[13.5px] leading-[1.9]">
            <li>
              <strong>2 active projects</strong>
            </li>
            <li>Proposals, threads, contracts</li>
            <li>50 / 50 payment tracking</li>
            <li>Client portal, password-protected</li>
            <li>&ldquo;Powered by EZLane&rdquo; on the portal</li>
          </ul>
          <div className="mt-auto">
            {currentPlan === "free" ? (
              <Button variant="secondary" block disabled>
                Your current plan
              </Button>
            ) : (
              <Button
                variant="secondary"
                block
                onClick={downgrade}
                disabled={planMutation.isPending}
              >
                {planMutation.isPending ? "Saving..." : "Move to Free"}
              </Button>
            )}
          </div>
        </div>

        <div className="bg-accent/6 border-accent flex flex-col gap-[14px] rounded-[6px] border p-[22px_24px]">
          <div>
            <div className="text-accent text-[10px] tracking-[0.1em] uppercase">
              Pro
            </div>
            <div className="mt-[6px] flex items-baseline gap-[8px]">
              <div className="font-heading text-[38px] leading-[1.1] tabular-nums">
                {priceStr}
              </div>
              <div className="text-text/55 text-[13px]">/ month</div>
            </div>
            <div className="text-text/55 text-[12.5px]">{billingNote}</div>
          </div>
          <ul className="text-text/85 m-0 pl-[18px] text-[13.5px] leading-[1.9]">
            <li>
              <strong>Unlimited active projects</strong>
            </li>
            <li>Everything on Free</li>
            <li>Remove EZLane branding</li>
            <li>Portal accent colour and logo</li>
            <li>Font family and size in the proposal editor</li>
          </ul>
          <div className="mt-auto">
            {currentPlan === "free" ? (
              <Button
                variant="primary"
                block
                onClick={upgrade}
                disabled={planMutation.isPending}
              >
                {planMutation.isPending ? "Saving..." : ctaLabel}
              </Button>
            ) : (
              <Button variant="primary" block disabled>
                Your current plan
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="text-text/40 mt-[16px] text-[11.5px] leading-[1.6]">
        Annual billing is charged once at $192. There is no discount clock and
        no crossed-out price — the annual rate is simply lower than the monthly
        one.
      </div>
    </div>
  );
}
