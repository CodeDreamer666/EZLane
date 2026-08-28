import type { HTMLAttributes } from "react";

export function Kbd(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className="border-divider text-text/50 rounded-[3px] border px-1 py-px font-mono text-[10px]"
      {...props}
    />
  );
}
