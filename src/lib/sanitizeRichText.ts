import sanitizeHtml from "sanitize-html";

/** Tags that may carry a text-align style set by the editor's alignment controls. */
const ALIGNABLE = ["h1", "h2", "h3", "p", "ul", "ol", "li", "blockquote", "div"];

export default function sanitizeRichText(value: string): string {
    return sanitizeHtml(value, {
        allowedTags: [
            "h1",
            "h2",
            "h3",
            "p",
            "ul",
            "ol",
            "li",
            "b",
            "strong",
            "i",
            "em",
            "u",
            "br",
            "blockquote",
            "a",
            "div",
            "span",
        ],
        allowedAttributes: {
            a: ["href", "title"],
            ...Object.fromEntries(ALIGNABLE.map((tag) => [tag, ["style"]])),
        },
        allowedStyles: Object.fromEntries(
            ALIGNABLE.map((tag) => [
                tag,
                { "text-align": [/^(left|right|center|justify)$/] },
            ]),
        ),
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", {
                rel: "noopener noreferrer",
                target: "_blank",
            }),
        },
    }).trim();
}
