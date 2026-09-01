"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export default function PortalChrome({
  brandName,
  hideBranding,
  subtitle,
  backHref,
  children,
}: {
  brandName: string;
  hideBranding: boolean;
  subtitle: string;
  backHref?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <header className="bg-bg border-divider border-b">
        <div className="m-[0_auto] max-w-[940px] p-[16px_26px] max-lg:px-[18px]! max-lg:py-3.5!">
          <div className="flex items-center gap-[12px]">
            <div className="border-accent grid h-[20px] w-[20px] place-items-center rounded-[3px] border">
              <div className="bg-accent h-[7px] w-[7px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading text-[17px] font-semibold">
                {brandName}
              </div>
              <div className="text-text/45 text-[11.5px]">{subtitle}</div>
            </div>
            {backHref ? (
              <Link
                href={backHref}
                className="font-heading text-text border-divider hover:bg-text/7 active:bg-text/14 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border bg-transparent px-[calc(var(--spacing-3)*1.2)] py-2 text-[12px] leading-[1.2] font-semibold whitespace-nowrap no-underline max-lg:min-h-11"
              >
                ← All projects
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <main className="m-[0_auto] max-w-[940px] p-[30px_26px_70px] max-lg:px-[18px]! max-lg:pt-6! max-lg:pb-[70px]! max-sm:px-3.5! max-sm:pt-5! max-sm:pb-[34px]!">
        {children}
      </main>

      <footer className="border-divider border-t p-[20px_26px] text-center">
        <div className="text-text/38 text-[11.5px]">
          {hideBranding ? (
            brandName
          ) : (
            <>
              Powered by <span className="font-heading">EZLane</span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
