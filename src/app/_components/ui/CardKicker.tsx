import type { HTMLAttributes } from "react";

export default function CardKicker(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="text-accent text-[10px] tracking-[0.1em] uppercase"
      {...props}
    />
  );
}
