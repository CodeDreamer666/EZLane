# Implementation Rules

These rules apply whenever implementing or modifying application functionality.

Prefer the smallest production-safe solution that follows the existing architecture. Do not introduce additional abstractions unless they solve a real existing problem.

## Input Validation

All user-controlled input must be validated.

### Strings

- Every string input must use `.trim()`.
- Every user-controlled string must have an appropriate minimum and maximum length.
- Choose limits based on what the field represents rather than applying one arbitrary limit everywhere.

Examples:
- Name or username: 1–120 characters.
- Short description: 1–255 characters.
- Longer text fields may use a larger appropriate limit.

### Sanitisation

- Sanitise all user-controlled string input using `sanitize-html`.
- Sanitisation must happen before data is persisted or otherwise trusted by the server.

### Formats

Validate formats whenever applicable.

Examples include:
- Email addresses.
- URLs.
- Hex colours.
- IDs.
- Dates.
- Numeric values.
- File types.

### Client and Server Validation

Never rely on client-side validation alone.

When using Zod:
- Validate the input on the frontend for immediate user feedback.
- Validate the input again on the server before performing any operation.

The server is the source of truth.

---

## Errors

Errors shown to users must never expose internal implementation details.

### Expected Errors

Expected errors are failures caused by known conditions, such as:

- Invalid input.
- Missing required values.
- Invalid formats.
- Insufficient permission.
- Unsupported files.
- A requested resource not existing.

For expected errors:

- Show a clear and non-technical message.
- Explain what the user needs to change when appropriate.
- Make the error actionable whenever possible.
- Never expose raw Zod errors.
- Never expose Prisma errors.
- Never expose stack traces.
- Never expose database details.
- Never expose implementation details.

Example:

`Enter a valid email address.`

Instead of:

`ZodError: invalid_string validation=email`

### Unexpected Errors

Unexpected errors include:

- Database failures.
- Storage failures.
- Network or service failures.
- Unknown server exceptions.

For unexpected errors:

- Log the technical error server-side.
- Show the user a generic retry-oriented message.
- Never expose the underlying technical error.

Example:

`We couldn't save your changes. Please try again.`

---

## Mutation UI State

Whenever a user action triggers a mutation:

- Disable the relevant submit/action button while the mutation is pending.
- Prevent duplicate submissions.
- Show a loading state inside the relevant button.
- Use the existing loading indicator/component from the project's visual system.
- Keep unrelated controls usable unless they must also be disabled.
- Restore the normal UI state after success or failure.
- Show appropriate success feedback after success.
- Show appropriate error feedback after failure.
- Prevent race conditions caused by repeated submissions.

Do not introduce a different loading design when an existing project loading component already handles the use case.

---

## Database Writes

For ordinary CRUD whose primary purpose is storing application data or user configuration:

- Use the simplest production-safe implementation.
- Follow the existing Prisma and tRPC architecture.
- Reuse existing project patterns.
- Do not introduce unnecessary service layers, repositories, helpers, or abstractions.
- Routine mutation, function, and variable names may be chosen based on existing codebase conventions.

### User-Owned Data

For records belonging to a user:

- Determine the authenticated user on the server.
- Associate records with the authenticated user on the server.
- Never trust a client-provided `userId`.
- Verify ownership before reading, updating, or deleting user-owned resources where applicable.

---

## Code Quality

All implementations should be production-safe without becoming unnecessarily complex.

- Prefer simple and explicit code.
- Reuse existing project patterns.
- Follow the existing architecture.
- Do not change unrelated code.
- Do not perform unrelated refactors.
- Avoid speculative abstractions.
- Avoid creating variables or helpers that do not improve readability.
- Handle foreseeable failure states.
- Remove unused code introduced during implementation.
- Preserve existing behaviour unless the requested change explicitly modifies it.

When multiple implementations are valid, prefer the one that is easiest to read, review, and maintain.