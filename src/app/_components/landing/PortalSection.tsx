export default function PortalSection() {
    return (
        <section className="border-divider border-t px-[34px] py-[74px] max-[820px]:px-5 max-[820px]:py-[54px]">
            <div className="mx-auto grid max-w-[1080px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-14 max-[820px]:grid-cols-1 max-[820px]:gap-[30px]">
                <div>
                    <div className="text-accent text-[10px] tracking-[.14em] uppercase">
                        The portal
                    </div>
                    <h2 className="font-heading mt-3 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-semibold">
                        Your client sees one link, not ten emails.
                    </h2>
                    <p className="text-text/62 mt-2.5 max-w-[52ch] text-[15.5px] leading-[1.7]">
                        Proposal, contract, progress and payment status, on a page they can
                        open any time. On Pro it carries your logo and colour instead of
                        ours.
                    </p>

                </div>
                <div className="border-divider overflow-hidden rounded-lg border bg-[#0d0f14] shadow-lg">
                    <div className="border-divider flex items-center gap-1.5 border-b bg-[#080910] px-3 py-[9px]">
                        {[0, 1, 2].map((n) => (
                            <i key={n} className="bg-text/16 size-2 rounded-full" />
                        ))}
                        <span className="text-text/38 ml-2 text-[11px]">
                            Client portal — Ferrous &amp; Co.
                        </span>
                    </div>
                    <div className="border-divider text-text/50 flex gap-4 border-b px-4 py-[11px] text-[11.5px]">
                        <span className="text-accent">Overview</span>
                        <span>Proposal</span>
                        <span>Contract</span>
                        <span>Updates</span>
                    </div>
                    <div className="flex flex-col gap-3.5 px-4 py-[18px]">
                        <div className="flex items-start gap-3.5">
                            <div className="flex-1">
                                <h3 className="font-heading text-[17px] font-semibold">
                                    Marketing site rebuild
                                </h3>
                                <p className="text-text/50 mt-[3px] text-[11.5px]">
                                    Alex Mercer · started Jul 8
                                </p>
                            </div>
                            <span className="border-accent text-accent-700 rounded-sm border px-2 py-0.5 text-[9.5px] tracking-[.08em] uppercase">
                                In progress
                            </span>
                        </div>
                        <div className="bg-text/12 h-[3px] overflow-hidden rounded-sm">
                            <div className="bg-accent h-full w-[62%]" />
                        </div>
                        <div className="border-divider bg-divider grid grid-cols-2 gap-px overflow-hidden rounded-[5px] border">
                            <div className="bg-[#0d0f14] px-3.5 py-3">
                                <div className="text-text/42 text-[9.5px] tracking-[.11em] uppercase">
                                    Deposit
                                </div>
                                <div className="text-accent-700 mt-1 text-sm">Received</div>
                            </div>
                            <div className="bg-[#0d0f14] px-3.5 py-3">
                                <div className="text-text/42 text-[9.5px] tracking-[.11em] uppercase">
                                    Final payment
                                </div>
                                <div className="mt-1 text-sm">$3,400 on delivery</div>
                            </div>
                        </div>
                        <div className="border-divider text-text/62 rounded-[5px] border px-3.5 py-3 text-xs leading-[1.65]">
                            <span className="text-text">Latest update · </span>Homepage and
                            product templates are on staging for review.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
