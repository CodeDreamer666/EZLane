import { usePathname } from "next/navigation";

import { api } from "~/trpc/react";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
  proposals: "Proposals",
  projects: "Projects",
  notifications: "Notifications",
  settings: "Settings",
  plans: "Plans",
};

export default function usePageTitle(): string {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const root = parts[0] ?? "dashboard";
  const detailId = parts[1] ?? "";

  const { data: client } = api.clients.byId.useQuery(
    { id: detailId },
    { enabled: root === "clients" && detailId.length > 0 },
  );
  const { data: project } = api.projects.byId.useQuery(
    { id: detailId },
    { enabled: root === "projects" && detailId.length > 0 },
  );

  if (root === "clients" && detailId) return client?.name ?? "Client";
  if (root === "projects" && detailId)
    return project?.proposal.title ?? "Project";
  if (root === "proposals" && detailId) return "Proposal editor";
  return TITLES[root] ?? "Dashboard";
}
