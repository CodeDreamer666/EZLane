type ClassValue = string | number | null | undefined | false | ClassValue[];

function flatten(value: ClassValue, out: string[]) {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const v of value) flatten(v, out);
    return;
  }
  out.push(String(value));
}

/** Joins conditional class names, skipping falsy values. No dependency needed
 * for the small amount of merging this app does. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  flatten(values, out);
  return out.join(" ");
}
