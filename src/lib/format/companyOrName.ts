import type { Client } from "~/lib/types";
export default function companyOrName(
  client: Pick<Client, "company" | "name"> | undefined,
): string {
  if (!client) return "";
  return client.company || client.name;
}
