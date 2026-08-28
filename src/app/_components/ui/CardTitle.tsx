import type { HTMLAttributes } from "react";

export default function CardTitle(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="font-heading text-text text-[17px] leading-[1.2] font-semibold"
      {...props}
    />
  );
}
