"use client";

import { Button } from "~/app/_components/ui";
import { useEzlane } from "~/lib/store";

export default function ClientsPage() {
    const { state, go, openAddClient, newProposal } = useEzlane();

    if (state.clients.length === 0) {
        return (
            <div
                style={{
                    border: "1px dashed var(--color-divider)",
                    borderRadius: 5,
                    padding: 56,
                    textAlign: "center",
                }}
            >
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>No clients yet</div>
                <p
                    style={{
                        fontSize: 13.5,
                        color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                        margin: "8px auto 16px",
                        maxWidth: 360,
                    }}
                >
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
        const active = ps.filter((p) => p.stage === "active" && !p.completed).length;
        const past = ps.filter((p) => p.completed).length;
        return { c, active, past };
    });

    return (
        <>
            <table className="table tbl hidden sm:table">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Company</th>
                        <th style={{ textAlign: "right" }}>Projects</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ c, active, past }) => (
                        <tr key={c.id} className="row" onClick={() => go(`/clients/${c.id}`)}>
                            <td style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15 }}>
                                {c.name}
                            </td>
                            <td
                                style={{ color: "color-mix(in srgb, var(--color-text) 62%, transparent)", fontSize: 13 }}
                            >
                                {c.email}
                            </td>
                            <td style={{ fontSize: 13 }}>{c.company || "—"}</td>
                            <td
                                style={{
                                    textAlign: "right",
                                    fontSize: 12.5,
                                    color: "color-mix(in srgb, var(--color-text) 62%, transparent)",
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {active} active · {past} past
                            </td>
                            <td style={{ textAlign: "right", width: 120 }}>
                                <button
                                    className="lnk"
                                    style={{ fontSize: 12.5 }}
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

            <ul className="cli-cards">
                {rows.map(({ c, active, past }) => (
                    <li key={c.id}>
                        <div
                            className="cli-card"
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
                            <div className="cli-card-head">
                                <div className="cli-card-name">{c.name}</div>
                                {c.company ? <span className="cli-card-co">{c.company}</span> : null}
                            </div>
                            <a href={`mailto:${c.email}`} className="cli-card-email" onClick={(e) => e.stopPropagation()}>
                                {c.email}
                            </a>
                            <div className="cli-card-foot">
                                <span className="cli-card-count">
                                    {active} active · {past} past
                                </span>
                                <button
                                    className="lnk"
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
