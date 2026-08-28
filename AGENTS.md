## Input validation
Every string input must use `.trim()`.
Every user-controlled string must have an appropriate minimum and maximum length. For example, for a username input, it should have a minimum one character and a maximum 120 characters. Another example is description input, it should have a minimum one character and a maximum 255 characters.
All of the user input must be sanitised by using the package, called “sanitize-html”
Validate formats where applicable, such as email addresses, hex colours, URLs, IDs, etc.
Never trust client-side validation alone. Repeat required validation on the server. One of the examples is validating the user input using Zod in both frontend and backend. 

## Errors
### Expected errors
Examples:
Invalid input
Missing required value
Invalid format
 Insufficient permission
Unsupported file

Rules:
Show a clear, non-technical message.
Explain what the user needs to fix where appropriate.
Never expose Zod internals, Prisma errors, stack traces, database details, or implementation details.

### Unexpected errors
Examples:
Database failure
Storage failure
Unknown server exception

Rules:
Log technical information server-side.
Show a calm generic message such as: "We couldn't save your changes. Please try again."
Never expose the underlying technical error to the user.

## Mutation UI state
Whenever a form mutation is pending:
- Disable the relevant submit button to prevent duplicate submissions.
- Show a loading state inside the button and use `cursor-not-allowed` on the cursor. 
- Loading indicators must match the existing visual system.
- Do not use `cursor-not-allowed`.
- Prevent accidental race conditions caused by repeated UI submissions.
- Restore the normal state after success or failure.
- Show appropriate success/error feedback.

## Database writes
For ordinary CRUD whose only purpose is storing user configuration:
- Use the simplest production-safe implementation.
- Do not introduce unnecessary abstractions.
- AI may choose routine mutation/function/variable names consistent with the existing codebase.
- Follow the existing Prisma and tRPC architecture.
- Associate user-owned records with the authenticated user on the server.
- Never trust a client-provided `userId`.

## Code quality
- Production-safe but simple.
- Reuse existing project patterns.
- Do not change unrelated code.
- Avoid speculative abstractions.
- Handle foreseeable failure states.

