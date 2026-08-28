import type { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <div className="font-body min-h-screen bg-[#07080b]">{children}</div>;
}
