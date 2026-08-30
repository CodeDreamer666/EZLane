import type { SVGProps } from "react";
import Svg from "./Svg";

export default function IconProposals(props: SVGProps<SVGSVGElement>) {
    return (
        <Svg {...props}>
            <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
            <path d="M14 3v4h4" />
            <path d="M9 13h6M9 17h4" />
        </Svg>
    );
}
