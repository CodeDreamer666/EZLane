import sanitizeHtml from "sanitize-html";

export default function sanitizeRichText(value: string): string {
    return sanitizeHtml(value, {
        allowedTags: [
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
        ],
        allowedAttributes: {
            a: ["href", "title"],
        },
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", {
                rel: "noopener noreferrer",
                target: "_blank",
            }),
        },
    }).trim();
}
