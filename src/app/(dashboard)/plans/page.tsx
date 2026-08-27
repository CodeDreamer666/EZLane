"use client";

import { Button } from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

export default function PlansPage() {
  const { state, setBilling, setPlan, go, say } = useEzlane();
  const annual = state.billing === "annual";
  const priceStr = annual ? "$16" : "$20";
  const billingNote = annual ? "$192 billed once a year" : "billed monthly, cancel any time";
  const ctaLabel = annual ? "Upgrade — $192 / year" : "Upgrade — $20 / month";

  const upgrade = () => {
    setPlan("pro");
    say("You are on Pro — unlimited projects, branding unlocked");
    go("/settings/plan");
  };
  const downgrade = () => {
    setPlan("free");
    say("Moved to Free");
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h3 style={{ margin: "0 0 4px" }}>Two plans, one difference that matters</h3>
          <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 58%, transparent)" }}>
            Every feature is on Free. Pro lifts the project ceiling and lets
            the portal be entirely yours.
          </div>
        </div>
        <div className="seg">
          <label className="seg-opt">
            <input type="radio" name="billing" checked={!annual} onChange={() => setBilling("monthly")} />
            Monthly
          </label>
          <label className="seg-opt">
            <input type="radio" name="billing" checked={annual} onChange={() => setBilling("annual")} />
            Annual — save $48
          </label>
        </div>
      </div>

      <div className="plansgrid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 26 }}>
        <div
          style={{
            border: "1px solid var(--color-divider)",
            borderRadius: 6,
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <div className="card-kicker">Free</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 38, lineHeight: 1.1, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              $0
            </div>
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 50%, transparent)" }}>forever</div>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.9, color: "color-mix(in srgb, var(--color-text) 80%, transparent)" }}>
            <li><strong>2 active projects</strong></li>
            <li>Proposals, threads, contracts</li>
            <li>50 / 50 payment tracking</li>
            <li>Client portal, password-protected</li>
            <li>&ldquo;Powered by EZLane&rdquo; on the portal</li>
          </ul>
          <div style={{ marginTop: "auto" }}>
            {state.plan === "free" ? (
              <Button variant="secondary" block disabled>
                Your current plan
              </Button>
            ) : (
              <Button variant="secondary" block onClick={downgrade}>
                Move to Free
              </Button>
            )}
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--color-accent)",
            borderRadius: 6,
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            background: "color-mix(in srgb, var(--color-accent) 6%, transparent)",
          }}
        >
          <div>
            <div className="card-kicker">Pro</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 38, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                {priceStr}
              </div>
              <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>/ month</div>
            </div>
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{billingNote}</div>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.9, color: "color-mix(in srgb, var(--color-text) 85%, transparent)" }}>
            <li><strong>Unlimited active projects</strong></li>
            <li>Everything on Free</li>
            <li>Remove EZLane branding</li>
            <li>Portal accent colour and logo</li>
            <li>Font family and size in the proposal editor</li>
          </ul>
          <div style={{ marginTop: "auto" }}>
            {state.plan === "free" ? (
              <Button variant="primary" block onClick={upgrade}>
                {ctaLabel}
              </Button>
            ) : (
              <Button variant="primary" block disabled>
                Your current plan
              </Button>
            )}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 40%, transparent)", marginTop: 16, lineHeight: 1.6 }}>
        Annual billing is charged once at $192. There is no discount clock
        and no crossed-out price — the annual rate is simply lower than the
        monthly one.
      </div>
    </div>
  );
}
