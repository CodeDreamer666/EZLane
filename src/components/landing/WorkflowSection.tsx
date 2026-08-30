export default function WorkflowSection() {
  const steps = [
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
  return (
    <section
      id="how"
      className="border-divider border-t px-[34px] py-[74px] max-[820px]:px-5 max-[820px]:py-[54px]"
    >
      <div className="mx-auto max-w-[1080px]">
        <h2 className="font-heading m-0 text-[clamp(26px,3.4vw,38px)] leading-[1.15] font-semibold">
          Three steps from first email to final payment.
        </h2>
        <div className="mt-9 grid grid-cols-3 items-stretch gap-[26px] max-[820px]:grid-cols-1">
          {steps.map((step) => (
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
  );
}
