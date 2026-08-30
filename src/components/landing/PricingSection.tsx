import Link from "next/link";
export default function PricingSection() {
  return (
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
            <Link
              href="/dashboard"
              className="font-heading border-divider text-text/78 hover:bg-text/7 mt-auto rounded-md border px-[18px] py-[11px] text-center text-sm font-semibold"
            >
              Start free
            </Link>
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
            <Link
              href="/plans"
              className="font-heading border-accent bg-accent/10 text-accent-700 hover:bg-accent/20 mt-auto rounded-md border px-[22px] py-3 text-center text-[15px] font-semibold"
            >
              Go Pro
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
