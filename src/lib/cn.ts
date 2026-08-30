type ClassValue = string | number | null | undefined | false | ClassValue[];

export default function cn(...values: ClassValue[]): string {
    const out: string[] = [];
    const pending = [...values];

    while (pending.length) {
        const value = pending.shift();

        if (!value) continue;
        if (Array.isArray(value)) pending.unshift(...value);
        
        else out.push(String(value));
    }

    return out.join(" ");
}
