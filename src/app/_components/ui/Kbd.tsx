import type { HTMLAttributes } from "react";

export function Kbd(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className="kbd" {...props} />;
}
