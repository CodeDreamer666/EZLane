import type { SVGProps } from "react";
import Svg from "./Svg";

export default function IconBell(props: SVGProps<SVGSVGElement>) {
    return (
        <Svg {...props}>
            <path d="M18 15V10a6 6 0 1 0-12 0v5l-2 3h16z" />
            <path d="M10 21h4" />
        </Svg>
    );
}
