export default function AllInOneSection() {
  return (
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
  );
}
