"use client";

import { Button } from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

export default function ClientsPage() {
  const { state, go, openAddClient, newProposal } = useEzlane();

  if (state.clients.length === 0) {
    return (
      <div className="border-divider rounded-[5px] border border-dashed p-[56px] text-center">
        <div className="font-heading text-[22px]">No clients yet</div>
        <p className="text-text/55 m-[8px_auto_16px] max-w-[360px] text-[13.5px]">
          Clients are added by hand — nothing is sent to them until you send a
          proposal.
        </p>
        <Button variant="primary" onClick={openAddClient}>
          + Add your first client
        </Button>
      </div>
    );
  }

  const rows = state.clients.map((c) => {
    const ps = state.projects.filter((p) => p.clientId === c.id);
    const active = ps.filter(
      (p) => p.stage === "active" && !p.completed,
    ).length;
    const past = ps.filter((p) => p.completed).length;
    return { c, active, past };
  });

  return (
    <>
      <table className="[&_th]:border-divider [&_th]:text-text/60 [&_td]:border-divider [&_tbody_tr]:hover:bg-text/4 max-sm:[&_tr]:border-divider max-sm:[&_td[data-l]::before]:text-text/40 w-full border-collapse text-sm leading-[1.55] max-sm:block! max-sm:w-auto! max-sm:[&_tbody]:block! [&_td]:border-b [&_td]:p-2 max-sm:[&_td]:flex! max-sm:[&_td]:w-auto! max-sm:[&_td]:items-baseline max-sm:[&_td]:justify-between max-sm:[&_td]:gap-3.5 max-sm:[&_td]:border-0! max-sm:[&_td]:px-0! max-sm:[&_td]:py-1! max-sm:[&_td]:text-left! max-sm:[&_td[data-l]::before]:flex-none max-sm:[&_td[data-l]::before]:text-[9.5px] max-sm:[&_td[data-l]::before]:tracking-[.11em] max-sm:[&_td[data-l]::before]:uppercase max-sm:[&_td[data-l]::before]:content-[attr(data-l)] [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:tracking-[.08em] [&_th]:uppercase max-sm:[&_thead]:hidden max-sm:[&_tr]:mb-2.5 max-sm:[&_tr]:block! max-sm:[&_tr]:w-auto! max-sm:[&_tr]:rounded-[5px] max-sm:[&_tr]:border max-sm:[&_tr]:px-3.5 max-sm:[&_tr]:py-3">
        <thead>
          <tr>
            <th>Client</th>
            <th>Email</th>
            <th>Company</th>
            <th className="text-right">Projects</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, active, past }) => (
            <tr
              key={c.id}
              className="hover:bg-text/5 cursor-pointer"
              onClick={() => go(`/clients/${c.id}`)}
            >
              <td className="font-heading text-[15px] font-semibold">
                {c.name}
              </td>
              <td data-l="Email" className="text-text/62 text-[13px]">
                {c.email}
              </td>
              <td data-l="Company" className="text-[13px]">
                {c.company || "—"}
              </td>
              <td
                data-l="Projects"
                className="text-text/62 text-right text-[12.5px] tabular-nums"
              >
                {active} active · {past} past
              </td>
              <td className="w-[120px] text-right">
                <button
                  className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[12.5px] no-underline hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    newProposal(c.id);
                  }}
                >
                  New proposal
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="hidden">
        {rows.map(({ c, active, past }) => (
          <li key={c.id}>
            <div
              className="max-sm:border-divider max-sm:bg-text/2 max-sm:active:border-text/22 max-sm:active:bg-text/6 max-sm:flex max-sm:cursor-pointer max-sm:flex-col max-sm:gap-2 max-sm:rounded-md max-sm:border max-sm:p-3.5 max-sm:transition-[border-color,background] max-sm:duration-100"
              role="button"
              tabIndex={0}
              onClick={() => go(`/clients/${c.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  go(`/clients/${c.id}`);
                }
              }}
            >
              <div className="max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-2.5">
                <div className="max-sm:font-heading max-sm:min-w-0 max-sm:truncate max-sm:text-base max-sm:leading-tight max-sm:font-semibold">
                  {c.name}
                </div>
                {c.company ? (
                  <span className="max-sm:bg-text/8 max-sm:text-text/68 max-sm:max-w-[45%] max-sm:flex-none max-sm:truncate max-sm:rounded-full max-sm:px-[9px] max-sm:py-[3px] max-sm:text-[11px] max-sm:leading-normal">
                    {c.company}
                  </span>
                ) : null}
              </div>
              <a
                href={`mailto:${c.email}`}
                className="max-sm:text-text/60 max-sm:truncate max-sm:text-[13px] max-sm:no-underline"
                onClick={(e) => e.stopPropagation()}
              >
                {c.email}
              </a>
              <div className="max-sm:border-divider max-sm:mt-0.5 max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:border-t max-sm:pt-2.5">
                <span className="max-sm:text-text/55 max-sm:text-xs max-sm:tabular-nums">
                  {active} active · {past} past
                </span>
                <button
                  className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 no-underline hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    newProposal(c.id);
                  }}
                >
                  New proposal →
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
