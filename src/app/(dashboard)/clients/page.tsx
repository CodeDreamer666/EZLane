"use client";
import { useRouter } from "next/navigation";
import { type MouseEvent } from "react";
import { Button, LoadingIcon, LoadingScreen, ServerError } from "~/components/shared";
import useAddClientModal from "~/hook/useAddClientModal";
import getFriendlyError from "~/lib/getFriendlyError";
import useStatusMessage from "~/hook/useStatusMessage";
import { api } from "~/trpc/react";

export default function ClientsPage() {
    const router = useRouter();
    const { openModal } = useAddClientModal();
    const { showMessage } = useStatusMessage();
    const { data: clients, isLoading, error } = api.clients.list.useQuery();

    const createProposal = api.proposals.create.useMutation({
        onSuccess: (proposal) => {
            router.push(`/proposals/${proposal.id}`);
        },

        onError: (err) => {
            showMessage(getFriendlyError(err), false);
        },
    });

    const handleNewProposal = (
        e: MouseEvent<HTMLButtonElement>,
        clientId: string,
    ) => {
        e.stopPropagation();

        if (createProposal.isPending) return;

        createProposal.mutate({ clientId });
    };

    const pendingClientId = createProposal.isPending
        ? createProposal.variables?.clientId
        : null;

    if (isLoading) return <LoadingScreen />;

    if (error || !clients) return <ServerError />;

    if (clients.length === 0) {
        return (
            <div className="border-divider rounded-[5px] border border-dashed p-[56px] text-center">
                <div className="font-heading text-[22px]">No clients yet</div>
                <p className="text-text/55 m-[8px_auto_16px] max-w-[360px] text-[13.5px]">
                    Clients are added by hand — nothing is sent to them until you send a
                    proposal.
                </p>
                <Button variant="primary" onClick={openModal}>
                    + Add your first client
                </Button>
            </div>
        );
    }

    return (
        <>
            {/* Mobile: card list */}
            <div className="flex flex-col gap-3 md:hidden">
                {clients.map((c) => (
                    <div
                        key={c.id}
                        className="border-divider bg-surface cursor-pointer rounded-[7px] border p-4"
                        onClick={() => router.push(`/clients/${c.id}`)}
                    >
                        <div className="font-heading text-[19px] font-semibold break-words">
                            {c.name}
                        </div>

                        <dl className="mt-3 flex flex-col">
                            <div className="py-2.5">
                                <dt className="text-text/40 text-[9.5px] tracking-[.11em] uppercase">
                                    Email
                                </dt>
                                <dd className="text-text/75 mt-1 text-[13.5px] break-all">
                                    {c.email}
                                </dd>
                            </div>
                            <div className="border-divider border-t py-2.5">
                                <dt className="text-text/40 text-[9.5px] tracking-[.11em] uppercase">
                                    Company
                                </dt>
                                <dd className="mt-1 text-[13.5px] break-words">
                                    {c.company ?? "—"}
                                </dd>
                            </div>
                        </dl>

                        <button
                            className="font-inherit border-divider text-accent mt-3 w-full cursor-pointer rounded-[5px] border bg-transparent px-3 py-2.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-45"
                            disabled={createProposal.isPending}
                            onClick={(e) => handleNewProposal(e, c.id)}
                        >
                            {pendingClientId === c.id ? (
                                <span className="flex items-center justify-center gap-2">
                                    <LoadingIcon />
                                    Creating...
                                </span>
                            ) : "New proposal"}
                        </button>
                    </div>
                ))}
            </div>

            {/* md+: table */}
            <table className="[&_th]:border-divider [&_th]:text-text/60 [&_td]:border-divider [&_tbody_tr]:hover:bg-text/4 hidden w-full border-collapse text-sm leading-[1.55] md:table [&_td]:border-b [&_td]:p-2 [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:tracking-[.08em] [&_th]:uppercase">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Company</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((c) => (
                        <tr
                            key={c.id}
                            className="hover:bg-text/5 cursor-pointer"
                            onClick={() => router.push(`/clients/${c.id}`)}
                        >
                            <td className="font-heading text-[15px] font-semibold">
                                {c.name}
                            </td>
                            <td className="text-text/62 text-[13px]">{c.email}</td>
                            <td className="text-[13px]">{c.company ?? "—"}</td>
                            <td className="w-[120px] text-right">
                                <button
                                    className="font-inherit text-accent cursor-pointer border-0 bg-transparent p-0 text-[12.5px] no-underline hover:underline disabled:cursor-not-allowed disabled:opacity-45"
                                    disabled={createProposal.isPending}
                                    onClick={(e) => handleNewProposal(e, c.id)}
                                >
                                    New proposal
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
