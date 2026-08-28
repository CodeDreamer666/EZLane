import type { Client, Project, Settings } from "~/lib/types";
import fmtDate from "./fmtDate";
import money from "./money";
export default function contractText(
  project: Project,
  client: Client,
  settings: Settings,
) {
  return {
    parties: `This agreement is made between ${settings.invoiceName} (“the Contractor”) and ${client.company || client.name} (“the Client”).`,
    scope: project.deliverables,
    price: money(project.price),
    half: money(Math.round(project.price / 2)),
    due: fmtDate(project.due),
  };
}
