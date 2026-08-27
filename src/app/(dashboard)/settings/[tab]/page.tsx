"use client";

import { useParams } from "next/navigation";

import { Button, Field, Input, Tag, Textarea, Toggle } from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

export default function SettingsPage() {
  const { tab } = useParams<{ tab: string }>();
  const { state, activeProjects, limit, setSetting, setPlan, go, say } = useEzlane();
  const s = state.settings;

  return (
    <div style={{ maxWidth: 560 }}>
      {tab === "profile" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h4 style={{ margin: "0 0 3px" }}>Profile</h4>
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
              Shown to clients on proposals and in the portal.
            </div>
          </div>
          <Field label="Username">
            <Input value={s.name} onChange={(e) => setSetting("name", e.target.value)} />
          </Field>
          <Field label="Contact email">
            <Input value={s.email} onChange={(e) => setSetting("email", e.target.value)} />
          </Field>
          <Button variant="primary" style={{ alignSelf: "flex-start" }} onClick={() => say("Settings saved")}>
            Save changes
          </Button>
        </div>
      ) : null}

      {tab === "invoice" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h4 style={{ margin: "0 0 3px" }}>Invoice details</h4>
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
              Used on the generated contract and on the two 50% invoices you
              send outside EZLane.
            </div>
          </div>
          <Field label="Invoice display name">
            <Input value={s.invoiceName} onChange={(e) => setSetting("invoiceName", e.target.value)} />
          </Field>
          <Field label="Contact info">
            <Input value={s.invoiceContact} onChange={(e) => setSetting("invoiceContact", e.target.value)} />
          </Field>
          <Field label="Invoice prefix">
            <Input
              style={{ fontFamily: "ui-monospace, Menlo, monospace" }}
              value={s.prefix}
              onChange={(e) => setSetting("prefix", e.target.value)}
            />
            <div style={{ fontSize: 11, color: "color-mix(in srgb, var(--color-text) 42%, transparent)", marginTop: 5 }}>
              Next invoice: {s.prefix}014
            </div>
          </Field>
          <Button variant="primary" style={{ alignSelf: "flex-start" }} onClick={() => say("Settings saved")}>
            Save changes
          </Button>
        </div>
      ) : null}

      {tab === "branding" ? (
        <BrandingTab />
      ) : null}

      {tab === "plan" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <h4 style={{ margin: "0 0 3px" }}>Plan &amp; billing</h4>
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
              Plan limits are enforced on active projects only. Completed work
              never counts.
            </div>
          </div>
          <PlanSummaryCard />
          {state.plan === "pro" ? (
            <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)", lineHeight: 1.6 }}>
              Downgrading with more than two active projects keeps them all
              open — you simply cannot start a third until you are back under
              the limit.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  function PlanSummaryCard() {
    const active = activeProjects();
    const lim = limit();
    const usageBar = state.plan === "pro" ? "100%" : `${Math.min(100, (active.length / 2) * 100)}%`;
    const usageNote =
      state.plan === "pro"
        ? "Unlimited active projects"
        : `${active.length} of ${lim} active projects used`;
    const planPrice =
      state.plan === "pro"
        ? state.billing === "annual"
          ? "$16 / month, billed annually"
          : "$20 / month"
        : "$0 / month";

    return (
      <div
        style={{
          border: "1px solid var(--color-divider)",
          borderRadius: 5,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 24 }}>
            {state.plan === "pro" ? "Pro" : "Free"}
          </span>
          <span style={{ fontSize: 13, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
            {planPrice}
          </span>
        </div>
        <div style={{ height: 4, background: "color-mix(in srgb, var(--color-text) 12%, transparent)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "var(--color-accent)", width: usageBar }} />
        </div>
        <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>{usageNote}</div>
        <div style={{ display: "flex", gap: 9, marginTop: 4 }}>
          {state.plan === "free" ? (
            <Button variant="primary" onClick={() => go("/plans")}>
              Upgrade to Pro
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                setPlan("free");
                say("Moved to Free — active projects stay open");
              }}
            >
              Downgrade to Free
            </Button>
          )}
          <Button variant="secondary" onClick={() => go("/plans")}>
            Compare plans
          </Button>
        </div>
      </div>
    );
  }
}

function BrandingTab() {
  const { state, setSetting } = useEzlane();
  const s = state.settings;
  const locked = state.plan !== "pro";
  const opacity = state.plan === "pro" ? 1 : 0.45;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 3px" }}>Portal branding</h4>
          <div style={{ fontSize: 12.5, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>
            How the client&apos;s portal looks and who it appears to come from.
          </div>
        </div>
        {state.plan === "free" ? <Tag status="sent">Pro</Tag> : null}
      </div>
      {state.plan === "free" ? (
        <div
          style={{
            border: "1px solid var(--color-accent-400)",
            borderRadius: 5,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
          }}
        >
          <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.55 }}>
            Branding is a Pro feature. On Free, the portal carries a small
            &ldquo;Powered by EZLane&rdquo; line and your accent colour stays
            default.
          </div>
          <a href="/plans">
            <Button variant="primary">Upgrade</Button>
          </a>
        </div>
      ) : null}
      <Field label="Accent colour">
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <Input
            style={{ fontFamily: "ui-monospace, Menlo, monospace", width: 120 }}
            value={s.accent}
            onChange={(e) => setSetting("accent", e.target.value)}
            disabled={locked}
          />
          <div style={{ width: 32, height: 32, borderRadius: 4, border: "1px solid var(--color-divider)", background: s.accent }} />
        </div>
      </Field>
      <Field label="Logo">
        <label className="btn btn-secondary" style={{ alignSelf: "flex-start", cursor: "pointer", opacity }}>
          Upload a file
          <input
            type="file"
            style={{ display: "none" }}
            disabled={locked}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setSetting("logo", f.name);
            }}
          />
        </label>
        <div style={{ fontSize: 11.5, color: "color-mix(in srgb, var(--color-text) 45%, transparent)", marginTop: 6 }}>
          {s.logo || "No logo uploaded — the portal shows your name instead."}
        </div>
      </Field>
      <Field label="Welcome message">
        <Textarea
          rows={4}
          value={s.welcome}
          onChange={(e) => setSetting("welcome", e.target.value)}
          disabled={locked}
        />
      </Field>
      <Toggle
        on={s.hideBranding}
        onClick={() => setSetting("hideBranding", !s.hideBranding)}
        disabled={locked}
        style={{ alignSelf: "flex-start" }}
      >
        Remove &ldquo;Powered by EZLane&rdquo; from the portal
      </Toggle>
      <Button variant="primary" style={{ alignSelf: "flex-start" }} disabled={locked}>
        Save changes
      </Button>
    </div>
  );
}
