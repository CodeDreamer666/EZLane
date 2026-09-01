"use client";
import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleCta from "~/components/landing/GoogleCta";
import { LoadingScreen } from "~/components/shared";
import useStatusMessage from "~/hook/useStatusMessage";

const section ="border-divider border-t px-[34px] py-[74px] max-[820px]:px-5 max-[820px]:py-[54px]";
const h2 ="font-heading m-0 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-semibold";
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

const AUTH_MESSAGES: Record<string, string> = {
    "auth-required": "Please log in first — that page needs you signed in.",
    "oauth-failed": "Google sign-in didn't complete. Please try again.",
};

const workflowSteps = [
    {
        n: "01",
        title: "Write the proposal",
        body: "Scope, deliverables, price, dates. One editor, one page.",
        mock: (
            <div className="flex-1 p-3.5">
                <div className="bg-text/22 h-1.5 w-3/5 rounded-sm" />
                <div className="bg-text/10 mt-[9px] h-[5px] rounded-sm" />
                <div className="bg-text/10 mt-1.5 h-[5px] w-[92%] rounded-sm" />
                <div className="bg-text/10 mt-1.5 h-[5px] w-[70%] rounded-sm" />
                <div className="mt-3.5 flex gap-2">
                    <span className="border-divider text-text/55 rounded-sm border px-[9px] py-[5px] text-[10.5px]">
                        $6,800
                    </span>
                    <span className="border-divider text-text/55 rounded-sm border px-[9px] py-[5px] text-[10.5px]">
                        Due Sep 12
                    </span>
                </div>
            </div>
        ),
    },
    {
        n: "02",
        title: "Client accepts in the portal",
        body: "They read it, comment, and accept. No account to create.",
        mock: (
            <div className="flex flex-1 flex-col gap-[9px] p-3.5">
                <div className="border-divider text-text/60 max-w-[80%] rounded-sm border px-2.5 py-[7px] text-[11px]">
                    Can we move the launch a week?
                </div>
                <div className="border-accent/45 bg-accent/10 text-accent-800 max-w-[80%] self-end rounded-sm border px-2.5 py-[7px] text-[11px]">
                    Updated — new date is in the scope.
                </div>
                <div className="text-accent mt-0.5 text-[10px] tracking-[.1em] uppercase">
                    Proposal accepted
                </div>
            </div>
        ),
    },
    {
        n: "03",
        title: "Work, then get paid",
        body: "Contract, updates and the 50 / 50 split live in the same project.",
        mock: (
            <div className="flex-1 p-3.5 text-[11px]">
                <div className="text-text/60 flex justify-between">
                    <span>Deposit</span>
                    <span className="text-accent-700">$3,400 received</span>
                </div>
                <div className="border-divider text-text/60 mt-[9px] flex justify-between border-t pt-[9px]">
                    <span>On delivery</span>
                    <span>$3,400 due</span>
                </div>
                <div className="bg-text/12 mt-[13px] h-[3px] overflow-hidden rounded-sm">
                    <div className="bg-accent h-full w-1/2" />
                </div>
            </div>
        ),
    },
];

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { showMessage } = useStatusMessage();

    const error = searchParams.get("error");
    const authNoticeShown = useRef(false);

    const scrollToHow = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        document.getElementById("how")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    useEffect(() => {
        if (!error || authNoticeShown.current) return;

        authNoticeShown.current = true;

        showMessage(AUTH_MESSAGES[error] ?? "Please log in to continue.", false);

        router.replace("/");
    }, [error, router, showMessage]);

    return (
        <div className="font-body overflow-x-hidden">
            <header className="border-divider bg-bg/90 sticky top-0 z-20 flex items-center gap-5 border-b px-[34px] py-3.5 backdrop-blur-[8px]">
                <div className="flex flex-1 items-center gap-[9px]">
                    <svg
                        viewBox="0 0 32 32"
                        className="size-5"
                        fill="none"
                        aria-hidden="true"
                    >
                        <rect width="32" height="32" rx="7" className="fill-accent" />
                        <path
                            d="M8 10.5H24L9 21.5H26"
                            className="stroke-text"
                            strokeWidth="3.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="font-heading text-[19px] font-semibold">EZLane</div>
                </div>
                <GoogleCta wantArrow={false} />
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
                            <GoogleCta />
                            <a
                                href="#how"
                                onClick={scrollToHow}
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

            <section className="border-divider border-t px-[34px] py-[74px] max-[820px]:px-5 max-[820px]:py-[54px]">
                <div className="mx-auto max-w-[1080px]">
                    <h2 className="font-heading m-0 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-semibold">
                        Everything about one job, in one place.
                    </h2>

                    <div className="border-divider bg-divider mt-[34px] grid grid-cols-3 gap-px overflow-hidden rounded-md border max-[820px]:grid-cols-1">
                        <article className="bg-bg px-6 py-[26px]">
                            <svg
                                viewBox="0 0 300 96"
                                className="font-body block h-auto w-full"
                                fill="none"
                            >
                                <g className="stroke-text/16">
                                    <rect x="1" y="12" width="96" height="72" rx="4" />
                                    <rect x="203" y="12" width="96" height="72" rx="4" />
                                    <path d="M1 34h96M203 34h96" />
                                </g>
                                <text
                                    x="11"
                                    y="28"
                                    fontSize="10"
                                    letterSpacing="1"
                                    className="fill-text/45"
                                >
                                    PROPOSAL
                                </text>
                                <text
                                    x="213"
                                    y="28"
                                    fontSize="10"
                                    letterSpacing="1"
                                    className="fill-text/45"
                                >
                                    PORTAL
                                </text>
                                <g className="fill-text/14">
                                    <rect x="11" y="46" width="70" height="5" rx="2.5" />
                                    <rect x="11" y="59" width="78" height="5" rx="2.5" />
                                    <rect x="11" y="72" width="46" height="5" rx="2.5" />
                                </g>
                                <path
                                    d="M103 50h94"
                                    className="stroke-accent/55"
                                    strokeDasharray="4 4"
                                >
                                    <animate
                                        attributeName="stroke-dashoffset"
                                        from="0"
                                        to="-24"
                                        dur="1.6s"
                                        repeatCount="indefinite"
                                    />
                                </path>
                                <path d="m104 45 10 5-10 5 1.8-5z" className="fill-accent-700">
                                    <animateTransform
                                        attributeName="transform"
                                        type="translate"
                                        values="0 0;0 0;96 0;104 0"
                                        keyTimes="0;.1;.72;1"
                                        dur="4s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0;1;1;0"
                                        keyTimes="0;.18;.72;1"
                                        dur="4s"
                                        repeatCount="indefinite"
                                    />
                                </path>
                                <g>
                                    <animate
                                        attributeName="opacity"
                                        values="0;0;1;1;0"
                                        keyTimes="0;.62;.74;.94;1"
                                        dur="4s"
                                        repeatCount="indefinite"
                                    />
                                    <rect
                                        x="213"
                                        y="43"
                                        width="66"
                                        height="21"
                                        rx="3"
                                        className="fill-accent/14 stroke-accent"
                                    />
                                    <text x="222" y="58" fontSize="10" className="fill-accent-700">
                                        Opened
                                    </text>
                                    <rect
                                        x="213"
                                        y="72"
                                        width="76"
                                        height="5"
                                        rx="2.5"
                                        className="fill-text/16"
                                    />
                                </g>
                            </svg>
                            <h3 className="font-heading mt-5 text-[19px] font-semibold">
                                Win work faster
                            </h3>
                            <p className="text-text/62 mt-2 text-sm leading-[1.7]">
                                Write a proposal, send a link, and see the moment your client
                                opens or comments on it.
                            </p>
                        </article>

                        <article className="bg-bg px-6 py-[26px]">
                            <svg
                                viewBox="0 0 300 96"
                                className="font-body block h-auto w-full"
                                fill="none"
                            >
                                <g className="stroke-text/16">
                                    <rect x="1" y="12" width="96" height="72" rx="4" />
                                    <rect x="203" y="12" width="96" height="72" rx="4" />
                                    <path d="M1 34h96M203 34h96" />
                                </g>
                                <text
                                    x="11"
                                    y="28"
                                    fontSize="10"
                                    letterSpacing="1"
                                    className="fill-accent"
                                >
                                    ACCEPTED
                                </text>
                                <text
                                    x="213"
                                    y="28"
                                    fontSize="10"
                                    letterSpacing="1"
                                    className="fill-text/45"
                                >
                                    CONTRACT
                                </text>
                                <g className="fill-text/14">
                                    <rect x="11" y="46" width="70" height="5" rx="2.5" />
                                    <rect x="11" y="59" width="78" height="5" rx="2.5" />
                                    <rect x="11" y="72" width="46" height="5" rx="2.5" />
                                </g>
                                <path d="M105 50h84" className="stroke-accent/45" />
                                <path
                                    d="m185 45 6 5-6 5"
                                    className="stroke-accent"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {[
                                    ["46", "72", "0s"],
                                    ["59", "58", ".18s"],
                                    ["72", "38", ".36s"],
                                ].map(([y, w, delay]) => (
                                    <rect
                                        key={y}
                                        x="213"
                                        y={y}
                                        width={w}
                                        height="5"
                                        rx="2.5"
                                        className="fill-accent/55"
                                    >
                                        <animate
                                            attributeName="width"
                                            values={`0;${w};${w};0`}
                                            keyTimes="0;.38;.9;1"
                                            dur="4s"
                                            begin={delay}
                                            repeatCount="indefinite"
                                        />
                                    </rect>
                                ))}
                                <path
                                    d="m262 74 5 5 12-13"
                                    className="stroke-accent-700"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="26"
                                >
                                    <animate
                                        attributeName="stroke-dashoffset"
                                        values="26;26;0;0;26"
                                        keyTimes="0;.1;.45;.88;1"
                                        dur="4s"
                                        repeatCount="indefinite"
                                    />
                                </path>
                            </svg>
                            <h3 className="font-heading mt-5 text-[19px] font-semibold">
                                Stop chasing paperwork
                            </h3>
                            <p className="text-text/62 mt-2 text-sm leading-[1.7]">
                                An accepted proposal becomes a contract with the scope, price and
                                dates already filled in.
                            </p>
                        </article>

                        <article className="bg-bg px-6 py-[26px]">
                            <svg viewBox="0 0 300 96" className="font-body block h-auto w-full">
                                <text
                                    x="1"
                                    y="16"
                                    fontSize="10"
                                    letterSpacing="1"
                                    className="fill-text/45"
                                >
                                    DEPOSIT
                                </text>
                                <text
                                    x="299"
                                    y="16"
                                    fontSize="10"
                                    letterSpacing="1"
                                    textAnchor="end"
                                    className="fill-text/45"
                                >
                                    ON DELIVERY
                                </text>
                                <rect
                                    x="1"
                                    y="26"
                                    width="298"
                                    height="12"
                                    rx="6"
                                    className="fill-text/10"
                                />
                                <rect x="1" y="26" height="12" rx="6" className="fill-accent/70">
                                    <animate
                                        attributeName="width"
                                        values="0;149;149;0"
                                        keyTimes="0;.38;.9;1"
                                        dur="4s"
                                        repeatCount="indefinite"
                                    />
                                </rect>
                                <text x="1" y="68" fontSize="16" className="fill-accent-700">
                                    $3,400
                                </text>
                                <text x="1" y="86" fontSize="10" className="fill-text/50">
                                    received
                                </text>
                                <text
                                    x="299"
                                    y="68"
                                    fontSize="16"
                                    textAnchor="end"
                                    className="fill-text/80"
                                >
                                    $3,400
                                </text>
                                <text
                                    x="299"
                                    y="86"
                                    fontSize="10"
                                    textAnchor="end"
                                    className="fill-text/50"
                                >
                                    outstanding
                                </text>
                            </svg>
                            <h3 className="font-heading mt-5 text-[19px] font-semibold">
                                Know what you&apos;re owed
                            </h3>
                            <p className="text-text/62 mt-2 text-sm leading-[1.7]">
                                Deposit and final payment are tracked per project, so the unpaid
                                total is never a guess.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section
                id="how"
                className="border-divider scroll-mt-[70px] border-t px-[34px] py-[74px] max-[820px]:px-5 max-[820px]:py-[54px]"
            >
                <div className="mx-auto max-w-[1080px]">
                    <h2 className="font-heading m-0 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-semibold">
                        Three steps from first email to final payment.
                    </h2>

                    <div className="mt-9 grid grid-cols-3 items-stretch gap-[26px] max-[820px]:grid-cols-1">
                        {workflowSteps.map((step) => (
                            <article key={step.n} className="flex flex-col">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-accent text-[10px] tracking-[.14em] uppercase">
                                        {step.n}
                                    </span>
                                    <div className="bg-divider h-px flex-1" />
                                </div>
                                <h3 className="font-heading mt-3.5 text-xl font-semibold">
                                    {step.title}
                                </h3>
                                <p className="text-text/62 mt-1.5 mb-4 text-sm leading-[1.7]">
                                    {step.body}
                                </p>
                                <div className="border-divider mt-auto flex min-h-[132px] overflow-hidden rounded-lg border bg-[#0d0f14] shadow-sm">
                                    {step.mock}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

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

            <section
                id="pricing"
                className="border-divider border-t px-[34px] py-[74px] max-[820px]:px-5 max-[820px]:py-[54px]"
            >
                <div className="mx-auto max-w-[1080px]">
                    <h2 className="font-heading text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-semibold">
                        Two plans, one difference that matters.
                    </h2>
                    <p className="text-text/62 mt-2.5 max-w-[52ch] text-[15.5px] leading-[1.7]">
                        Every feature is on Free. Pro lifts the project ceiling and makes the
                        portal entirely yours.
                    </p>

                    <div className="mt-[34px] grid grid-cols-2 gap-[18px] max-[820px]:grid-cols-1">
                        <article className="border-divider flex min-h-[307px] flex-col gap-3.5 rounded-md border px-[26px] py-6">
                            <div>
                                <div className="text-text/50 text-[10px] tracking-[.14em] uppercase">
                                    Free
                                </div>
                                <div className="font-heading mt-1.5 text-[40px] leading-[1.1]">
                                    $0
                                </div>
                                <div className="text-text/50 text-[12.5px]">forever</div>
                            </div>
                            <ul className="text-text/78 m-0 pl-[18px] text-sm leading-[1.95]">
                                <li>2 active projects</li>
                                <li>Proposals, threads, contracts</li>
                                <li>50 / 50 payment tracking</li>
                                <li>Client portal, password-protected</li>
                            </ul>
                            <div className="mt-auto">
                                <GoogleCta
                                    wantArrow={false}
                                    callbackURL="/plans"
                                    label="Start free"
                                    variant="secondary"
                                    fullWidth
                                />
                            </div>
                        </article>

                        <article className="border-accent bg-accent/6 flex min-h-[307px] flex-col gap-3.5 rounded-md border px-[26px] py-6">
                            <div>
                                <div className="text-accent text-[10px] tracking-[.14em] uppercase">
                                    Pro
                                </div>
                                <div className="mt-1.5 flex items-baseline gap-2">
                                    <span className="font-heading text-[40px] leading-[1.1]">
                                        $20
                                    </span>
                                    <span className="text-text/55 text-[13px]">/ month</span>
                                </div>
                                <div className="text-text/55 text-[12.5px]">
                                    or $16 / month billed annually
                                </div>
                            </div>
                            <ul className="text-text/85 m-0 pl-[18px] text-sm leading-[1.95]">
                                <li>Unlimited active projects</li>
                                <li>Everything on Free</li>
                                <li>Your logo and colour on the portal</li>
                                <li>Font control in the proposal editor</li>
                            </ul>
                            <div className="mt-auto">
                                <GoogleCta
                                    wantArrow={false}
                                    callbackURL="/plans"
                                    label="Start Pro"
                                    fullWidth
                                />
                            </div>
                        </article>
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
                    <GoogleCta />
                </div>
            </section>

            <footer className="border-divider text-text/45 flex flex-wrap items-center gap-4 border-t px-[34px] py-[26px] text-[12.5px]">
                <div className="flex flex-1 items-center gap-2">
                    <svg
                        viewBox="0 0 32 32"
                        className="size-[15px]"
                        fill="none"
                        aria-hidden="true"
                    >
                        <rect width="32" height="32" rx="7" className="fill-accent" />
                        <path
                            d="M8 10.5H24L9 21.5H26"
                            className="stroke-text"
                            strokeWidth="3.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    EZLane
                </div>
                <span>© 2026 EZLane</span>
            </footer>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <HomeContent />
        </Suspense>
    );
}
