import type { SVGProps } from "react";
import Svg from "./Svg";

export default function IconClients(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M16.5 5.2a3 3 0 0 1 0 5.6" />
      <path d="M18.5 20c0-2-.5-3.5-1.5-4.6" />
    </Svg>
  );
}
