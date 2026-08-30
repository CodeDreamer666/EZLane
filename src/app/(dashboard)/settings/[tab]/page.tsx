"use client";
import { useParams } from "next/navigation";
import AccountSection from "~/components/settings/AccountSection";
import BrandingSection from "~/components/settings/BrandingSection";
import InvoiceSection from "~/components/settings/InvoiceSection";
import PlanSection from "~/components/settings/PlanSection";
import ProfileSection from "~/components/settings/ProfileSection";

export default function SettingsPage() {
  const { tab } = useParams<{ tab: string }>();

  return (
    <div className="max-w-[560px]">
      {tab === "profile" ? <ProfileSection /> : null}
      {tab === "invoice" ? <InvoiceSection /> : null}
      {tab === "branding" ? <BrandingSection /> : null}
      {tab === "plan" ? <PlanSection /> : null}
      {tab === "account" ? <AccountSection /> : null}
    </div>
  );
}
