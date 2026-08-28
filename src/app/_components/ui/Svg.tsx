import type { SVGProps } from "react";

import { cn } from "~/lib/cn";

export default function Svg({ className, ...props }: SVGProps<SVGSVGElement>) {
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
