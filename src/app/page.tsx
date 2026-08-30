import Arrow from "~/components/landing/Arrow";
import AuthNotice from "~/components/landing/AuthNotice";
import GoogleCta from "~/components/landing/GoogleCta";
import AllInOneSection from "~/components/landing/AllInOneSection";
import PortalSection from "~/components/landing/PortalSection";
import PricingSection from "~/components/landing/PricingSection";
import WorkflowSection from "~/components/landing/WorkflowSection";

const cta =
    "font-heading text-accent-700 hover:text-accent-800 inline-flex items-center gap-[9px] rounded-md border border-accent bg-accent/10 px-[22px] py-3 text-[15px] font-semibold transition duration-200 hover:-translate-y-px hover:bg-accent/20";
const section =
    "border-divider border-t px-[34px] py-[74px] max-[820px]:px-5 max-[820px]:py-[54px]";
const h2 =
    "font-heading m-0 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-semibold";
const kick = "text-accent text-[10px] tracking-[.14em] uppercase tabular-nums";
const faqs = [
    [
        "Does my client need an account?",
        "No. They open a link and enter the portal password you set.",
    ],
    [
        "What happens when a project ends?",
        "Mark it completed and the slot frees up. The portal, contract and thread stay readable.",
    ],
    [
        "Can I cancel Pro?",
        "Any time. You keep every project you have open; only the Free limit applies to new ones.",
    ],
    [
        "Do you handle the payments themselves?",
        "No. EZLane tracks what is due and what has landed. You invoice and collect however you already do.",
    ],
];

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;

    return (
        <div className="font-body overflow-x-hidden">

            {error ? <AuthNotice code={error} /> : null}
            
            <header className="border-divider bg-bg/90 sticky top-0 z-20 flex items-center gap-5 border-b px-[34px] py-3.5 backdrop-blur-[8px]">
                <div className="flex flex-1 items-center gap-[9px]">
                    <div className="border-accent grid size-5 place-items-center rounded-[3px] border">
                        <div className="bg-accent size-[7px]" />
                    </div>
                    <div className="font-heading text-[19px] font-semibold">EZLane</div>
                </div>
                <nav className="flex gap-[22px] text-[13.5px] max-[820px]:hidden">
                    <a href="#how" className="text-text/60 hover:text-accent-700">
                        How it works
                    </a>
                    <a href="#pricing" className="text-text/60 hover:text-accent-700">
                        Pricing
                    </a>
                    <a href="#faq" className="text-text/60 hover:text-accent-700">
                        FAQ
                    </a>
                </nav>
                <GoogleCta className={`${cta} px-4 py-[9px] text-[13.5px]`}>
                    Open EZLane
                </GoogleCta>
            </header>

            <section className="px-[34px] pt-16 pb-[74px] max-[820px]:px-5 max-[820px]:py-[54px]">
                <div className="mx-auto grid max-w-[1080px] grid-cols-[minmax(0,_1fr)_minmax(0,_1.05fr)] items-center gap-14 max-[820px]:grid-cols-1 max-[820px]:gap-[30px]">
                    <div>
                        <div className={kick}>For freelancers</div>
                        <h1 className="font-heading mt-3.5 text-[clamp(36px,5vw,58px)] leading-[1.08] font-semibold text-pretty">
                            Send the proposal. Get paid. Skip the mess.
                        </h1>
                        <p className="text-text/66 mt-[18px] max-w-[44ch] text-[17px] leading-[1.65]">
                            EZLane turns one proposal into a contract, a client portal and a
                            payment plan. No spreadsheets, no lost email threads.
                        </p>
                        <div className="mt-[30px] flex flex-wrap gap-3">
                            <GoogleCta className={cta}>
                                Open EZLane
                                <Arrow />
                            </GoogleCta>
                            <a
                                href="#how"
                                className="font-heading text-text/78 hover:text-text border-divider hover:bg-text/7 flex items-center justify-center rounded-md border px-[18px] py-[11px] text-center text-[14px] font-semibold"
                            >
                                <span>See how it works</span>
                            </a>
                        </div>
                    </div>
                    <div className="border-divider overflow-hidden rounded-lg border bg-[#0d0f14] shadow-lg">
                        <div className="border-divider flex items-center gap-1.5 border-b bg-[#080910] px-3 py-[9px]">
                            {[0, 1, 2].map((n) => (
                                <div key={n} className="bg-text/16 size-2 rounded-full" />
                            ))}
                            <span className="text-text/38 ml-2 text-[11px]">
                                EZLane — Dashboard
                            </span>
                        </div>
                        <div className="bg-divider grid grid-cols-3 gap-px">
                            {[
                                ["Active work", "3"],
                                ["Awaiting client", "2"],
                                ["Outstanding", "$8,200"],
                            ].map(([label, value]) => (
                                <div key={label} className="bg-[#0d0f14] px-[15px] py-[13px]">
                                    <div className={kick}>{label}</div>
                                    <div className="font-heading mt-1 text-[26px] tabular-nums">
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {[
                            [
                                "Ferrous & Co.",
                                "Marketing site rebuild",
                                "w-[62%]",
                                "In progress",
                            ],
                            [
                                "Priya Raman",
                                "Catalogue site + store migration",
                                "w-1/4",
                                "Proposal sent",
                            ],
                            [
                                "Studio Larch",
                                "Booking flow + site refresh",
                                "w-[88%]",
                                "Delivered",
                            ],
                        ].map(([client, name, width, status], i) => (
                            <div
                                key={client}
                                className={`flex items-center gap-3 px-3.5 py-[11px] text-[12.5px] ${i < 2 ? "border-divider border-b" : ""}`}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="text-text/40 text-[10px] tracking-[.1em] uppercase">
                                        {client}
                                    </div>
                                    <div className="font-heading mt-0.5 font-semibold">
                                        {name}
                                    </div>
                                    <div className="bg-text/12 mt-2 h-[3px] rounded-sm">
                                        <div className={`bg-accent h-full ${width}`} />
                                    </div>
                                </div>
                                <span className="text-accent-700 border-accent rounded-[3px] border px-2 py-0.5 text-[9.5px] tracking-[.08em] whitespace-nowrap uppercase">
                                    {status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <AllInOneSection />
            <WorkflowSection />
            <PortalSection />
            <PricingSection />

            <section id="faq" className={section}>
                <div className="mx-auto max-w-[800px]">
                    <h2 className={h2}>Questions</h2>
                    <div className="mt-[26px]">
                        {faqs.map(([q, a]) => (
                            <details
                                key={q}
                                className="group border-divider border-b py-[18px]"
                            >
                                <summary className="font-heading hover:text-accent-700 flex cursor-pointer list-none items-center justify-between gap-5 text-[17px] font-semibold">
                                    {q}
                                    <span className="text-accent text-[20px] transition-transform group-open:rotate-45">
                                        +
                                    </span>
                                </summary>
                                <p className="text-text/65 mt-2.5 max-w-[64ch] text-[14.5px] leading-[1.75]">
                                    {a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
            <section className={`${section} text-center`}>
                <h2 className={h2}>Your next project can start clean.</h2>
                <p className="text-text/62 mt-3 text-[15.5px]">
                    Set up a client and send a proposal in a few minutes.
                </p>
                <div className="mt-7">
                    <GoogleCta className={cta}>
                        Open EZLane
                        <Arrow />
                    </GoogleCta>
                </div>
            </section>
            <footer className="border-divider text-text/45 flex flex-wrap items-center gap-4 border-t px-[34px] py-[26px] text-[12.5px]">
                <div className="flex flex-1 items-center gap-2">
                    <div className="border-accent grid size-[15px] place-items-center rounded-sm border">
                        <div className="bg-accent size-[5px]" />
                    </div>
                    EZLane
                </div>
                <span>© 2026 EZLane</span>
            </footer>
        </div>
    );
}
