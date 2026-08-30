export default function getFriendlyError(err: unknown): string {
    const e = err as {
        message?: string;
        data?: {
            code?: string;
            zodError?: {
                fieldErrors: Record<string, string[]>;
                formErrors: string[];
            };
        };
    };

    const zodError = e?.data?.zodError;

    if (zodError) {
        for (const messages of Object.values(zodError.fieldErrors)) {
            if (messages && messages.length > 0) return messages[0]!;
        }
        
        if (zodError.formErrors?.length) return zodError.formErrors[0]!;
    }

    if (e?.message && e.data?.code !== "INTERNAL_SERVER_ERROR") return e.message;

    return "We couldn't save your changes. Please try again.";
}
