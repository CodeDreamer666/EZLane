import Link from "next/link";
import Arrow from "~/app/_components/landing/Arrow";
import AllInOneSection from "~/app/_components/landing/AllInOneSection";
import PortalSection from "~/app/_components/landing/PortalSection";
import PricingSection from "~/app/_components/landing/PricingSection";
import WorkflowSection from "~/app/_components/landing/WorkflowSection";

const cta =
    "font-heading text-accent-700 hover:text-accent-800 inline-flex items-center gap-[9px] rounded-md border border-accent bg-accent/10 px-[22px] py-3 text-[15px] font-semibold transition duration-200 hover:-translate-y-px hover:bg-accent/20";
const section =
    "border-divider border-t px-[34px] py-[74px] max-[820px]:px-5 max-[820px]:py-[54px]";
const h2 =
    "font-heading m-0 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-semibold";
const kick = "text-accent text-[10px] tracking-[.14em] uppercase tabular-nums";
const copy = "text-text/62 mt-2 text-[14px] leading-[1.7]";

const features = [
    [
        "Win work faster",
        "Write a proposal, send a link, and see the moment your client opens or comments on it.",
        "PROPOSAL",
        "PORTAL",
    ],
    [
        "Stop chasing paperwork",
        "An accepted proposal becomes a contract with the scope, price and dates already filled in.",
        "ACCEPTED",
        "CONTRACT",
    ],
    [
        "Know what you're owed",
        "Deposit and final payment are tracked per project, so the unpaid total is never a guess.",
        "DEPOSIT",
        "ON DELIVERY",
    ],
];

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

export default function Home() {
    return (
        <div className="font-body overflow-x-hidden">
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
                <Link
                    href="/dashboard"
                    className={`${cta} px-4 py-[9px] text-[13.5px]`}
                >
                    Open EZLane
                </Link>
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
                            <Link href="/dashboard" className={cta}>
                                Open EZLane
                                <Arrow />
                            </Link>
                            <a
                                href="#how"
                                className="font-heading flex items-center justify-center text-center text-text/78 hover:text-text border-divider hover:bg-text/7 rounded-md border px-[18px] py-[11px] text-[14px] font-semibold"
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

            <section className="hidden">
                <div className="mx-auto max-w-[1080px]">
                    <h2 className={h2}>Everything about one job, in one place.</h2>
                    <div className="border-divider bg-divider mt-[34px] grid grid-cols-3 gap-px overflow-hidden rounded-[6px] border max-[820px]:grid-cols-1">
                        {features.map(([title, body, left, right]) => (
                            <div key={title} className="bg-bg px-6 py-[26px]">
                                <div className="text-text/45 relative h-24 text-[10px] tracking-[.1em]">
                                    <div className="border-divider absolute top-3 left-0 h-[72px] w-24 rounded-md border px-2.5 pt-2.5">
                                        {left}
                                        <div className="bg-text/14 mt-3 h-[5px] w-[70px] rounded" />
                                        <div className="bg-text/14 mt-2 h-[5px] w-[78px] rounded" />
                                    </div>
                                    <div className="bg-accent/55 absolute top-1/2 left-[34%] h-px w-[32%]" />
                                    <div className="border-divider absolute top-3 right-0 h-[72px] w-24 rounded-md border px-2.5 pt-2.5">
                                        {right}
                                        <div className="bg-accent/55 mt-3 h-[5px] w-[66px] rounded" />
                                    </div>
                                </div>
                                <div className="font-heading mt-5 text-[19px] font-semibold">
                                    {title}
                                </div>
                                <p className={copy}>{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="hidden">
                <div className="mx-auto max-w-[1080px]">
                    <h2 className={h2}>Three steps from first email to final payment.</h2>
                    <div className="mt-9 grid grid-cols-3 gap-[26px] max-[820px]:grid-cols-1">
                        {[
                            [
                                "01",
                                "Write the proposal",
                                "Scope, deliverables, price, dates. One editor, one page.",
                            ],
                            [
                                "02",
                                "Client accepts in the portal",
                                "They read it, comment, and accept. No account to create.",
                            ],
                            [
                                "03",
                                "Work, then get paid",
                                "Contract, updates and the 50 / 50 split live in the same project.",
                            ],
                        ].map(([n, title, body]) => (
                            <div key={n} className="flex flex-col">
                                <div className="flex items-center gap-2.5">
                                    <span className={kick}>{n}</span>
                                    <div className="bg-divider h-px flex-1" />
                                </div>
                                <div className="font-heading mt-3.5 text-[20px] font-semibold">
                                    {title}
                                </div>
                                <p className="text-text/62 mt-1.5 mb-4 text-[14px] leading-[1.7]">
                                    {body}
                                </p>
                                <div className="border-divider mt-auto min-h-[132px] rounded-lg border bg-[#0d0f14] p-3.5 shadow-sm">
                                    <div className="bg-text/22 h-1.5 w-3/5 rounded" />
                                    <div className="bg-text/10 mt-[9px] h-[5px] rounded" />
                                    <div className="bg-text/10 mt-1.5 h-[5px] w-[92%] rounded" />
                                    <div className="mt-3.5 flex gap-2">
                                        <span className="border-divider text-text/55 rounded-[3px] border px-[9px] py-[5px] text-[10.5px]">
                                            $6,800
                                        </span>
                                        <span className="border-divider text-text/55 rounded-[3px] border px-[9px] py-[5px] text-[10.5px]">
                                            Due Sep 12
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="hidden">
                <div className="mx-auto grid max-w-[1080px] grid-cols-[minmax(0,_1fr)_minmax(0,_1.1fr)] items-center gap-14 max-[820px]:grid-cols-1">
                    <div>
                        <div className={kick}>The portal</div>
                        <h2 className={`${h2} mt-3`}>
                            Your client sees one link, not ten emails.
                        </h2>
                        <p className="text-text/62 mt-2.5 max-w-[52ch] text-[15.5px] leading-[1.7]">
                            Proposal, contract, progress and payment status, on a page they
                            can open any time. On Pro it carries your logo and colour instead
                            of ours.
                        </p>
                        <div className="mt-[26px]">
                            <Link href="/dashboard" className={cta}>
                                Open EZLane
                                <Arrow />
                            </Link>
                        </div>
                    </div>
                    <div className="border-divider overflow-hidden rounded-lg border bg-[#0d0f14] shadow-lg">
                        <div className="border-divider text-text/50 flex gap-4 border-b px-4 py-[11px] text-[11.5px]">
                            <span className="text-accent">Overview</span>
                            <span>Proposal</span>
                            <span>Contract</span>
                            <span>Updates</span>
                        </div>
                        <div className="flex flex-col gap-3.5 px-4 py-[18px]">
                            <div className="flex">
                                <div className="flex-1">
                                    <div className="font-heading text-[17px] font-semibold">
                                        Marketing site rebuild
                                    </div>
                                    <div className="text-text/50 text-[11.5px]">
                                        Alex Mercer · started Jul 8
                                    </div>
                                </div>
                                <span className="text-accent-700 border-accent h-fit rounded-[3px] border px-2 py-0.5 text-[9.5px] uppercase">
                                    In progress
                                </span>
                            </div>
                            <div className="bg-text/12 h-[3px]">
                                <div className="bg-accent h-full w-[62%]" />
                            </div>
                            <div className="border-divider bg-divider grid grid-cols-2 gap-px rounded-[5px] border">
                                <div className="bg-[#0d0f14] p-3">
                                    <div className={kick}>Deposit</div>
                                    <div className="text-accent-700 mt-1">Received</div>
                                </div>
                                <div className="bg-[#0d0f14] p-3">
                                    <div className={kick}>Final payment</div>
                                    <div className="mt-1">$3,400 on delivery</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hidden">
                <div className="mx-auto max-w-[1080px]">
                    <h2 className={h2}>Two plans, one difference that matters.</h2>
                    <p className="text-text/62 mt-2.5 text-[15.5px] leading-[1.7]">
                        Every feature is on Free. Pro lifts the project ceiling and makes
                        the portal entirely yours.
                    </p>
                    <div className="mt-[34px] grid grid-cols-2 gap-[18px] max-[820px]:grid-cols-1">
                        {[
                            { name: "Free", price: "$0", note: "forever", pro: false },
                            {
                                name: "Pro",
                                price: "$20",
                                note: "or $16 / month billed annually",
                                pro: true,
                            },
                        ].map(({ name, price, note, pro }) => (
                            <div
                                key={name}
                                className={`flex flex-col gap-3.5 rounded-[6px] border px-[26px] py-6 ${pro ? "border-accent bg-accent/6" : "border-divider"}`}
                            >
                                <div>
                                    <div className={kick}>{name}</div>
                                    <div className="font-heading mt-1.5 text-[40px] leading-[1.1]">
                                        {price}
                                    </div>
                                    <div className="text-text/55 text-[12.5px]">{note}</div>
                                </div>
                                <ul className="text-text/78 m-0 pl-[18px] text-[14px] leading-[1.95]">
                                    <li>{pro ? "Unlimited" : "2"} active projects</li>
                                    <li>Proposals, threads, contracts</li>
                                    <li>50 / 50 payment tracking</li>
                                    <li>
                                        {pro
                                            ? "Your logo and colour on the portal"
                                            : "Client portal, password-protected"}
                                    </li>
                                </ul>
                                <Link
                                    href={pro ? "/plans" : "/dashboard"}
                                    className={`${pro ? cta : "font-heading text-text/78 border-divider border px-[18px] py-[11px]"} mt-auto justify-center rounded-md text-center font-semibold`}
                                >
                                    {pro ? "Go Pro" : "Start free"}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                    <Link href="/dashboard" className={cta}>
                        Open EZLane
                        <Arrow />
                    </Link>
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
