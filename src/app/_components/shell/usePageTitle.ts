import { usePathname } from "next/navigation";

import useEzlane from "~/lib/useEzlane";

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
  const { client, project } = useEzlane();
  const parts = pathname.split("/").filter(Boolean);
  const root = parts[0] ?? "dashboard";
  if (root === "clients" && parts[1]) return client(parts[1]).name;
  if (root === "projects" && parts[1])
    return project(parts[1])?.title ?? "Project";
  if (root === "proposals" && parts[1]) return "Proposal editor";
  return TITLES[root] ?? "Dashboard";
}
