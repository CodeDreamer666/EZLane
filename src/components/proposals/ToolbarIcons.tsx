import type { SVGProps } from "react";
import Svg from "~/components/shared/icon/Svg";

const P = (d: string) =>
    function Icon(props: SVGProps<SVGSVGElement>) {
        return (
            <Svg strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d={d} />
            </Svg>
        );
    };

export const IconBold = P("M7 5h5.5a3.5 3.5 0 0 1 0 7H7zM7 12h6.5a3.5 3.5 0 0 1 0 7H7z");
export const IconItalic = P("M15 5h-4M13 19H9M14 5l-3 14");
export const IconUnderline = P("M7 4v6a5 5 0 0 0 10 0V4M6 20h12");
export const IconLink = P("M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.3 1.3M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.3-1.3",);
export const IconAlignLeft = P("M4 6h16M4 10h10M4 14h16M4 18h10");
export const IconAlignCenter = P("M4 6h16M7 10h10M4 14h16M7 18h10");
export const IconAlignRight = P("M4 6h16M10 10h10M4 14h16M10 18h10");
export const IconAlignJustify = P("M4 6h16M4 10h16M4 14h16M4 18h16");
export const IconBulletList = P("M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01");
export const IconNumberList = P("M9 6h11M9 12h11M9 18h11M4 5.5 5.2 5v3.2M3.8 12h1.9l-1.9 2.6h2M3.8 17.4h1.9L4 19h1.7",);
export const IconMore = P("M12 5.5h.01M12 12h.01M12 18.5h.01");
export const IconClearFormat = P("M8 6h11M12.5 6 9.5 18M6 18h7M17 14l4 4M21 14l-4 4");
export const IconClose = P("M6 6l12 12M18 6L6 18");
