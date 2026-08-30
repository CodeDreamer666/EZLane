# Implementation Rules

These rules apply whenever implementing or modifying application functionality.

Prefer the **smallest production-safe solution** that follows the existing architecture.

Do not introduce additional abstractions unless they solve a real existing problem.

---

## 1. Input Validation

All user-controlled input must be validated.

### Strings

Every user-controlled string must:

- use `.trim()`
- have an appropriate minimum length
- have an appropriate maximum length

Choose limits based on what the field represents instead of applying one arbitrary limit everywhere.

Examples:

```text
Name / username:       1–120 characters
Short description:    1–255 characters
Longer text fields:   use a larger appropriate limit
```

Do not accept unlimited user-controlled strings without a deliberate reason.

### Sanitisation

Sanitise all user-controlled string input using `sanitize-html`.

Sanitisation must happen before the value is persisted or otherwise trusted by the server.

Do not rely on frontend sanitisation alone.

### Formats

Validate formats whenever applicable.

Examples include:

- email addresses
- URLs
- hex colours
- IDs
- dates
- numeric values
- file types
- enum values

Use the validation method already established in the project where possible.

### Client and Server Validation

Never rely on client-side validation alone.

When using Zod:

- validate on the frontend for immediate user feedback
- validate again on the server before performing the operation

The server is the source of truth.

Frontend validation improves UX.

Server validation protects the application.

---

## 2. Error Handling

Errors shown to users must never expose internal implementation details.

### Expected Errors

Expected errors are failures caused by known conditions.

Examples:

- invalid input
- missing required values
- invalid formats
- insufficient permission
- unsupported files
- resource not found
- business-rule violation

For expected errors:

- show a clear non-technical message
- explain what the user needs to change when appropriate
- make the message actionable whenever possible

Good:

```text
Enter a valid email address.
```

Avoid exposing:

- raw Zod errors
- Prisma errors
- stack traces
- SQL/database details
- internal exception names
- implementation details

Bad:

```text
ZodError: invalid_string validation=email
```

### Unexpected Errors

Unexpected errors include:

- database failures
- storage failures
- external service failures
- network failures
- unknown server exceptions

For unexpected errors:

- log the technical error server-side
- show the user a generic retry-oriented message
- never expose the underlying technical error

Example:

```text
We couldn't save your changes. Please try again.
```

---

## 3. Mutation UI State

When a **button** triggers a mutation:

- disable the relevant button while pending
- prevent duplicate submissions
- show a loading state inside that button
- use the project's existing loading indicator/component
- keep unrelated controls usable unless they must also be disabled
- restore normal UI state after success or failure
- show appropriate success feedback after success
- show appropriate error feedback after failure
- prevent race conditions caused by repeated submissions

Example:

```tsx
<Button
    disabled={mutation.isPending}
    onClick={handleSave}
>
    {mutation.isPending ? (
        <div className="flex items-center gap-2">
            <LoadingIcon />
            Saving...
        </div>
    ) : "Save changes"}
</Button>
```

Do not introduce a different loading design when the project already has an existing loading component.

### Inline Text Actions

If the same async action is presented as **inline text or a text-style action**, do not visually replace it with a loading state.

Do not add:

- `LoadingIcon`
- `Loading...`
- `Creating...`
- spinner beside the text
- replacement pending text

The underlying action must still prevent duplicate execution when necessary.

The distinction is based on **how the action is presented in the UI**:

```text
Button action → visible loading state
Text action   → no visible loading state
```

---

## 4. Database Writes

For ordinary CRUD whose primary purpose is storing application data or user configuration:

- use the simplest production-safe implementation
- follow the existing Prisma and tRPC architecture
- reuse existing project patterns
- do not introduce unnecessary service layers
- do not introduce unnecessary repository layers
- do not create unnecessary helpers
- do not introduce speculative abstractions

Routine mutation, function, and variable names may follow existing codebase conventions.

Do not spend architecture complexity on ordinary data storage.

### User-Owned Data

For records belonging to a user:

- determine the authenticated user on the server
- associate records with the authenticated user on the server
- never trust a client-provided `userId`
- verify ownership before reading user-owned resources where required
- verify ownership before updating user-owned resources
- verify ownership before deleting user-owned resources

Example principle:

```text
Client says which resource they want.
Server decides whether they own it.
```

Never treat possession of an ID as proof of authorization.

---

## 5. Business Rules

Business rules must be enforced on the server.

Examples:

- plan limits
- ownership
- allowed state transitions
- project limits
- date relationships
- feature access
- resource availability

The frontend may enforce the same rule for better UX, but it must not be the only enforcement layer.

Prefer direct business logic.

Good:

```ts
if (user.plan === "FREE" && activeProjects >= 2) {
    ...
}
```

Avoid unnecessary transformations such as:

```ts
const normalizedPlan = String(user.plan).toLowerCase();
```

when the existing enum can be compared directly.

---

## 6. Async Workflows

Keep business workflows explicit.

If one operation depends on the result of another, make the sequence easy to read.

Example:

```text
create client
↓
get client ID
↓
if requested, create proposal
↓
navigate to the correct page
```

Do not hide a multi-step workflow behind unnecessary helpers or unrelated callbacks.

Mutation callbacks should contain behaviour that is common to every use of the mutation.

Workflow-specific behaviour should remain where the workflow decision is visible.

Do not use UI-only state as the source of truth for business intent when the original action is already available directly.

For example, prefer:

```ts
if (thenPropose) {
    ...
}
```

over:

```ts
if (pendingAction === "propose") {
    ...
}
```

when `pendingAction` exists only for loading UI.

---

## 7. Code Quality

All implementations should be production-safe without becoming unnecessarily complex.

Prefer:

- simple code
- explicit code
- existing project patterns
- existing architecture
- direct business logic
- local reasoning
- predictable control flow

Do not:

- change unrelated code
- perform unrelated refactors
- add speculative abstractions
- create variables that do not improve readability
- create helpers that do not improve readability
- normalize values without a real reason
- add unnecessary casts
- introduce additional layers for simple CRUD

Handle foreseeable failure states.

Remove unused code introduced during implementation.

Preserve existing behaviour unless the requested change explicitly modifies it.

When multiple implementations are valid, choose the one that is easiest to:

- read
- review
- debug
- maintain

---

## 8. Implementation Review

Before considering an implementation complete, check:

### Validation

- Are all user-controlled strings trimmed?
- Do strings have appropriate min/max limits?
- Is user-controlled string input sanitised server-side?
- Are applicable formats validated?
- Does the server repeat required validation?

### Errors

- Are expected errors clear and actionable?
- Are unexpected errors generic and retry-oriented?
- Are raw technical errors hidden from users?
- Are technical errors logged server-side where appropriate?

### Mutations

- Do mutation buttons show pending state?
- Are pending buttons disabled?
- Are duplicate submissions prevented?
- Do inline text actions avoid visible loading state?
- Is normal UI state restored correctly?

### Security

- Is authentication determined on the server?
- Is ownership verified?
- Is client-provided `userId` ignored?
- Are business rules enforced server-side?

### Database

- Does the implementation follow existing Prisma/tRPC patterns?
- Is the write as simple as it can safely be?
- Were unnecessary layers avoided?

### Code

- Is the business logic obvious?
- Are there unnecessary variables?
- Are there unnecessary helpers?
- Are there unnecessary transformations?
- Are there unrelated changes?
- Is unused code removed?
- Is existing behaviour preserved?

Only finish after these checks pass.
