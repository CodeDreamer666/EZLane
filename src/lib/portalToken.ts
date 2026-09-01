import { randomInt } from "crypto";

const TOKEN_ALPHABET =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// No l, o, 0 or 1 — the password is read off a screen and typed by hand.
const PASSWORD_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

/** A URL token of `length` mixed-case alphanumeric characters. */
export function generatePortalToken(length: number): string {
    let token = "";

    for (let i = 0; i < length; i++) {
        token += TOKEN_ALPHABET[randomInt(TOKEN_ALPHABET.length)];
    }

    return token;
}

/** A readable random portal password, e.g. `k7mq-9xrp-r4tn`. */
export function generatePortalPassword(): string {
    let password = "";

    for (let i = 0; i < 14; i++) {
        password +=
            i === 4 || i === 9
                ? "-"
                : PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
    }

    return password;
}
