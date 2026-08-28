import type { Project } from "~/lib/types";
export default function received(project: Project): number {
  return (
    (project.deposit ? project.price / 2 : 0) +
    (project.final ? project.price / 2 : 0)
  );
}
