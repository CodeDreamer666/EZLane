import type { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: "100vh", fontFamily: "var(--font-body)", background: "#07080b" }}>{children}</div>;
}
