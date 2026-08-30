export default function toMessageText(err: unknown): string {
    if (typeof err === "string" && err.trim()) return err;

    if (err && typeof err === "object" && "message" in err) {
        const message = (err as { message?: unknown }).message;

        if (typeof message === "string" && message.trim()) return message;
    }

    return "Something went wrong. Please try again.";
}
