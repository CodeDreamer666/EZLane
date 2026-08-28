import type { SVGProps } from "react";

import { cn } from "~/lib/cn";

function Svg({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        "block h-[15px] w-[15px] fill-none stroke-current",
        className,
      )}
      {...props}
    />
  );
}

export function IconDashboard(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

export function IconClients(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M16.5 5.2a3 3 0 0 1 0 5.6" />
      <path d="M18.5 20c0-2-.5-3.5-1.5-4.6" />
    </Svg>
  );
}

export function IconProposals(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 17h4" />
    </Svg>
  );
}

export function IconProjects(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

export function IconBell(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M18 15V10a6 6 0 1 0-12 0v5l-2 3h16z" />
      <path d="M10 21h4" />
    </Svg>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}
