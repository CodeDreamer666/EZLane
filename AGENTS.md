# Frontend Code Style

This file defines how frontend React/Next.js code should be written in this codebase.

The reviewed implementations of `BrandingSection`, `InvoiceSection`, `PlanSection`, and `ProfileSection` are the source of truth for this style.

The goal is **simple, explicit, readable code** that can be understood immediately when opening a file.

Do not optimize for cleverness, abstraction, or reducing line count.

---

## 1. Core Principle

Write code so that the execution flow is obvious from top to bottom.

Prefer:

```ts
const isProPlan = brandingData?.plan === "PRO";
```

over unnecessary transformations such as:

```ts
const normalized = String(brandingData?.plan).toLowerCase();
const isProPlan = normalized === "pro";
```

If the backend/database already uses `"FREE"` and `"PRO"`, preserve those values.

Do not transform values unless the transformation is actually required by the feature.

---

## 2. Component Structure

Every component should follow roughly this order:

```text
"use client"

imports

export default function ComponentName() {
    shared hooks
    query hooks
    state
    utils
    effects
    mutations
    validation schemas
    handlers
    simple derived values

    loading guard
    error guard

    return JSX
}
```

The exact order may vary slightly when necessary, but code should remain easy to scan.

---

## 3. Hooks Must Stay Together Near the Top

All React, Next.js, custom, and tRPC hooks should be declared near the top of the component.

Preferred:

```ts
export default function ProfileSection() {
    const { showMessage } = useStatusMessage();
    const { data, isLoading, error } = api.settings.getProfile.useQuery();

    const [name, setName] = useState("");

    const utils = api.useUtils();

    useEffect(() => {
        ...
    }, [data]);

    const mutation = api.settings.updateProfile.useMutation({
        ...
    });
}
```

Avoid scattering hooks between ordinary variables and business logic.

Avoid:

```ts
const currentPlan = ...

const router = useRouter();

const usageNote = ...

const utils = api.useUtils();
```

Even when technically valid React, this makes the file harder to scan.

---

## 4. Keep Server Values in Their Existing Representation

Do not normalize values for no reason.

If the server returns:

```ts
"FREE"
"PRO"
```

use:

```ts
const isPro = planData.plan === "PRO";
```

Do not write:

```ts
const normalized = String(planData.plan).toLowerCase() as "free" | "pro";
const isPro = normalized === "pro";
```

Do not change enum casing merely for local convenience.

The frontend should generally respect the representation already defined by the schema/backend.

---

## 5. Avoid Unnecessary Variables

Do not create variables only to hide simple expressions.

Avoid:

```ts
const currentPlan = planData.plan;
const isPro = currentPlan === "PRO";
const usageBar = isPro ? "100%" : "0%";
const usageNote = isPro
    ? "Unlimited active projects"
    : "Up to 2 active projects";
```

Prefer keeping only meaningful derived state:

```ts
const isPro = planData.plan === "PRO";
```

Then use simple values directly where they are needed:

```tsx
<rect
    width={isPro ? "100%" : "0%"}
    height="100%"
    fill="currentColor"
/>

<div>
    {isPro ? "Unlimited active projects" : "Up to 2 active projects"}
</div>
```

A variable should exist when it improves readability, is reused, or represents an important concept.

Do not create variables simply because an expression exists.

---

## 6. Naming Must Explain the Actual Value

Use concrete names.

Preferred:

```ts
brandingData
invoiceDetails
isProPlan
welcomeMessage
invoiceDisplayName
invoiceContact
invoicePrefix
handleSave
```

Avoid vague names such as:

```ts
normalized
processed
valueData
resultData
currentValue
config
payload
temp
finalData
```

unless the name genuinely describes the concept.

A variable name should tell the reader what the value represents without requiring them to trace several lines backwards.

---

## 7. State Should Be Simple and Explicit

For a single value:

```ts
const [name, setName] = useState("");
```

For a small related form:

```ts
const [form, setForm] = useState({
    accentColour: "",
    logo: "",
    welcomeMessage: "",
    hideBranding: false,
});
```

Update state explicitly:

```ts
setForm({
    ...form,
    welcomeMessage: e.target.value,
});
```

Do not introduce reducers, form libraries, state machines, or helper abstractions unless the complexity of the feature genuinely requires them.

---

## 8. Synchronizing Query Data Into Form State

When editable local state needs initial values from a query, use a straightforward `useEffect`.

Example:

```ts
useEffect(() => {
    if (brandingData) {
        setForm({
            accentColour: brandingData.accentColour,
            logo: brandingData.logo,
            welcomeMessage: brandingData.welcomeMessage,
            hideBranding: brandingData.hideBranding,
        });
    }
}, [brandingData]);
```

Do not create additional synchronization helpers unless necessary.

---

## 9. tRPC Query Pattern

Use the query directly:

```ts
const {
    data,
    isLoading,
    error,
} = api.settings.getProfile.useQuery();
```

Alias `data` only when a more specific name improves readability:

```ts
const {
    data: brandingData,
    isLoading,
    error,
} = api.settings.getBranding.useQuery();
```

Do not destructure large amounts of query state that are never used.

---

## 10. tRPC Mutation Pattern

Mutations should normally use:

```ts
const mutation = api.settings.updateSomething.useMutation({
    onSuccess: () => {
        showMessage("Settings saved", true);
    },

    onError: (err) => {
        const msg = getFriendlyError(err);
        showMessage(msg, false);
    },

    onSettled: async () => {
        await utils.invalidate();
    },
});
```

The structure should remain predictable:

1. `onSuccess`
2. `onError`
3. `onSettled`

Use `getFriendlyError` for unexpected/server mutation errors.

Use `showMessage` for user-facing feedback.

Do not invent additional error-handling layers when the existing shared utilities already handle them.

---

## 11. Validation

Validation must happen before `mutation.mutate()`.

For very small forms, simple direct validation is acceptable:

```ts
const handleSave = () => {
    const trimmed = name.trim();

    if (trimmed.length < 1) {
        showMessage("Display name is required", false);
        return;
    }

    if (trimmed.length > 120) {
        showMessage(
            "Display name must be at most 120 characters",
            false,
        );
        return;
    }

    mutation.mutate({
        name: trimmed,
    });
};
```

For forms with several fields or multiple validation rules, use Zod:

```ts
const invoiceDetailsZodSchema = z.object({
    invoiceDisplayName: z
        .string()
        .trim()
        .min(1, "Invoice display name is required")
        .max(
            120,
            "Invoice display name must be at most 120 characters",
        ),

    invoiceContact: z
        .string()
        .trim()
        .min(1, "Contact info is required")
        .max(
            120,
            "Contact info must be at most 120 characters",
        ),
});
```

Then:

```ts
const handleSave = () => {
    const result = invoiceDetailsZodSchema.safeParse(invoiceDetails);

    if (!result.success) {
        showMessage(
            result.error.issues[0]?.message ?? "",
            false,
        );
        return;
    }

    mutation.mutate(result.data);
};
```

---

## 12. Always Trim User Strings Before Sending

User-entered strings should be trimmed before being persisted.

For Zod forms:

```ts
z.string().trim()
```

For simple manual validation:

```ts
const trimmed = name.trim();
```

Send the trimmed value:

```ts
mutation.mutate({
    name: trimmed,
});
```

Do not validate a trimmed value and then send the original untrimmed value.

---

## 13. Validation Messages

Validation messages should be:

- non-technical
- specific
- actionable
- written for the user

Good:

```text
Display name is required
Invoice prefix must be at most 20 characters
Accent colour must be a hex value like #4F46E5
```

Avoid:

```text
Invalid input
Validation error
BAD_REQUEST
String failed regex validation
```

---

## 14. Handlers Should Be Direct

Use clear handler names:

```ts
handleSave
handleDelete
handleUpload
handleSubmit
```

Keep the logic visible.

Preferred:

```ts
const handleSave = () => {
    const result = schema.safeParse(form);

    if (!result.success) {
        showMessage(
            result.error.issues[0]?.message ?? "",
            false,
        );
        return;
    }

    mutation.mutate(result.data);
};
```

Avoid unnecessary chains of helpers such as:

```text
handleSave
→ prepareData
→ normalizeData
→ validateData
→ createPayload
→ submitPayload
```

for simple forms.

---

## 15. Loading and Error Guards

Handle page-level loading and server errors before the main JSX.

Use:

```ts
if (isLoading) return <LoadingScreen />;

if (error || !data) return <ServerError />;
```

Keep these guards immediately before `return`.

Do not deeply nest the entire component inside loading/error conditionals.

---

## 16. Shared UI Components

Use existing shared UI components whenever available.

Examples:

```ts
Button
Field
Input
Textarea
Toggle
Tag
LoadingIcon
LoadingScreen
ServerError
```

Do not recreate an input/button/loading/error component locally when the shared component already exists.

---

## 17. Pending Button Pattern

Buttons that trigger mutations should be disabled while pending.

Example:

```tsx
<Button
    variant="primary"
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

When appropriate:

```tsx
className="disabled:cursor-not-allowed"
```

Use the same pending pattern consistently.

---

## 17A. Loading States Are for Buttons, Not Text Links

Loading/pending states are a **button UI convention** in this codebase.

If an action is presented as a `Button`, it should show an appropriate loading state while its async work is pending.

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

This applies to buttons such as:

- Save
- Create
- Submit
- Delete
- Archive
- Upload
- Update
- Confirm

However, if the same action is presented as **text or an inline link**, do not add a visible loading state to that text.

For example:

```tsx
<button
    type="button"
    onClick={handleCreateProposal}
    className="text-accent"
>
    Write a proposal
</button>
```

or:

```tsx
<Link href="/proposals/new" className="text-accent">
    Write a proposal
</Link>
```

The text should remain visually unchanged while the action runs.

Do not add any of the following to text links or inline clickable text:

- `LoadingIcon`
- `"Loading..."`
- `"Creating..."`
- replacement pending text
- a spinner beside the text

This rule is based on **how the action is presented in the UI**, not on whether it performs navigation or a mutation.

Two controls may perform the exact same async action:

```text
Button: "Create proposal"
Text:   "Write a proposal"
```

The button should show a loading state.

The text link should not.

The underlying action may still need protection against duplicate execution in code. For example, the handler may check `mutation.isPending`. The rule only means that inline text should not visually turn into a loading control.



## 18. JSX Should Stay Straightforward

Prefer readable JSX directly inside the component.

Simple conditions should remain simple:

```tsx
{!isProPlan ? <Tag status="sent">Pro</Tag> : null}
```

or:

```tsx
{isPro ? (
    <Button>Downgrade to Free</Button>
) : (
    <Button>Upgrade to Pro</Button>
)}
```

Do not extract tiny pieces of JSX into new components merely to reduce the size of the main component.

---

## 19. Ternaries Are Fine When They Are Easy to Read

Do not create variables merely to avoid a small ternary.

Good:

```tsx
{isPro ? "Pro" : "Free"}
```

Good:

```tsx
{mutation.isPending ? (
    <div className="flex items-center gap-2">
        <LoadingIcon />
        Saving...
    </div>
) : "Save changes"}
```

Use a variable only when the expression is complex, repeated, or meaningful enough to deserve a name.

---

## 20. Prefer Explicit Repetition Over Premature Abstraction

Some repetition is acceptable.

For example, several fields may each contain their own character counter:

```tsx
<div className="mt-[4px] flex justify-end">
    <span className="text-text/45 text-[11px]">
        {invoiceDetails.invoiceContact.length} / 120
    </span>
</div>
```

Do not immediately create:

```tsx
<CharacterCounter ... />
```

unless the component is genuinely reused enough to justify the abstraction.

The priority is being able to open the file and understand it without jumping through several files.

---

## 21. Do Not Create Helpers Without a Real Need

Avoid helper functions for one-line or trivial logic.

Avoid:

```ts
function normalizePlan(plan: string) {
    return plan.toLowerCase();
}

function getUsageNote(isPro: boolean) {
    return isPro
        ? "Unlimited active projects"
        : "Up to 2 active projects";
}
```

Use the values directly.

Create a helper only when:

- the logic is genuinely complex,
- the logic is reused,
- the helper clearly improves understanding,
- or the logic belongs in a shared utility for architectural reasons.

---

## 22. One Component Per File

Frontend component files should contain one main component.

Use:

```ts
export default function ProfileSection() {
    ...
}
```

Do not stack several unrelated React components in the same file.

If another substantial component is necessary, place it in its own file.

---

## 23. Component Filename Must Match the Default Export

Inside component folders, the filename should exactly match the default-exported component name.

Example:

```text
ProfileSection.tsx
```

must contain:

```ts
export default function ProfileSection() {
    ...
}
```

Do not use mismatched names.

---

## 24. Prefer `export default`

For main components in their own files:

```ts
export default function BrandingSection() {
    ...
}
```

Follow the existing one-function-per-file architecture unless there is a genuine reason not to.

---

## 25. Styling

Use Tailwind classes directly in JSX.

Example:

```tsx
<div className="flex flex-col gap-[16px]">
```

Do not create separate CSS files for ordinary component styling unless required.

Do not replace existing Tailwind conventions with another styling system.

Keep styling consistent with nearby reviewed files.

---

## 26. Preserve Existing UI Behaviour

When asked to clean up, refactor, or fix code style:

- do not redesign the UI
- do not change wording
- do not change validation behaviour
- do not change API behaviour
- do not alter routes
- do not change plan rules
- do not add features
- do not remove features

unless explicitly requested.

A style cleanup is not permission to redesign the feature.

---

## 27. Do Not Over-Engineer

Avoid adding the following to simple components unless there is a demonstrated need:

- `useMemo`
- `useCallback`
- reducers
- context
- custom form hooks
- form libraries
- data-normalization layers
- mapper functions
- view-model objects
- extra wrapper components
- generic field renderers
- unnecessary utility functions
- unnecessary TypeScript casts
- unnecessary enum conversion

Simple CRUD/settings code should remain simple.

---

## 28. Avoid Unnecessary Type Casting

Do not write casts just to force a transformed value into a type.

Avoid:

```ts
const normalized = String(res.plan).toLowerCase() as "free" | "pro";
```

If `res.plan` is already typed correctly, use it directly:

```ts
if (res.plan === "PRO") {
    ...
}
```

Use casts only when TypeScript genuinely requires one and the type relationship is correct.

---

## 29. Business Logic Should Be Obvious

Code should reflect the domain directly.

Preferred:

```ts
const isProPlan = brandingData?.plan === "PRO";
```

This immediately communicates:

> Check whether the user's plan is Pro.

Avoid code that makes the reader decode implementation details before understanding the business rule.

---

## 30. Character Counters

For inputs with limits, use a small counter near the field.

Example:

```tsx
<div className="mt-[4px] flex justify-end">
    <span
        className={`text-[11px] ${
            invoiceDetails.invoicePrefix.length > 20
                ? "text-red-500"
                : "text-text/45"
        }`}
    >
        {invoiceDetails.invoicePrefix.length} / 20
    </span>
</div>
```

Even when `maxLength` normally prevents exceeding the value, maintain the established counter pattern when the surrounding UI uses it.

---

## 31. Form Inputs

Use controlled inputs.

Example:

```tsx
<Input
    value={invoiceDetails.invoiceDisplayName}
    onChange={(e) =>
        setInvoiceDetails({
            ...invoiceDetails,
            invoiceDisplayName: e.target.value,
        })
    }
    maxLength={120}
/>
```

Keep the relationship between the input and its state visible.

Do not hide basic state changes inside generic handlers unless doing so clearly improves the file.

---

## 32. Boolean State

Use descriptive boolean names:

```ts
isPro
isProPlan
isLoading
isPending
hideBranding
counterOver
```

Boolean names should normally read like a condition.

Avoid vague names such as:

```ts
status
flag
check
condition
value
```

---

## 33. Avoid Clever Data Pipelines

Do not turn simple values into pipelines.

Avoid:

```ts
const currentPlan = String(planData.plan)
    .trim()
    .toLowerCase() as Plan;
```

when this is sufficient:

```ts
const isPro = planData.plan === "PRO";
```

Every transformation creates another thing the reader has to verify.

---

## 34. Use Existing Error Utilities

For mutation/server errors:

```ts
onError: (err) => {
    const msg = getFriendlyError(err);
    showMessage(msg, false);
},
```

Do not manually inspect tRPC internals in every component unless a specific error requires special handling.

---

## 35. Keep Success Messages Specific

Use short success messages related to the operation:

```ts
showMessage("Branding saved", true);
showMessage("Settings saved", true);
showMessage("Username saved successfully", true);
```

Do not create generic messages like:

```text
Operation completed
Request succeeded
Mutation successful
```

---

## 36. Code Review Standard

Before considering generated code complete, check:

### Structure

- Are all hooks grouped near the top?
- Is state easy to find?
- Are effects easy to find?
- Is the mutation easy to find?
- Is validation immediately understandable?
- Are handlers immediately understandable?
- Are loading/error guards before JSX?

### Readability

- Can each important variable be understood from its name?
- Are there unnecessary intermediate variables?
- Are there unnecessary helpers?
- Are there unnecessary casts?
- Are there unnecessary transformations?
- Is domain logic expressed directly?

### Behaviour

- Are strings trimmed?
- Are validation rules correct?
- Is mutation pending state handled?
- Are server errors shown through `getFriendlyError`?
- Is query cache invalidated when needed?
- Are existing enum values preserved?
- Is UI behaviour unchanged unless explicitly requested?

---

# Rules for AI Agents

When generating or editing code in this codebase:

1. Read this file before changing frontend React code.
2. Treat the reviewed settings components as canonical style examples.
3. Match the surrounding code instead of introducing your preferred architecture.
4. Do not "improve" working code by adding abstraction.
5. Do not normalize enum values unless required.
6. Do not lowercase or uppercase backend values merely for convenience.
7. Put hooks together near the top of the component.
8. Minimize derived variables.
9. Use direct business-domain comparisons.
10. Use concrete names.
11. Do not create tiny helper functions or components without a strong reason.
12. Prefer obvious code over DRY code.
13. Preserve existing UX and behaviour.
14. Use existing shared UI components and utilities.
15. Before finishing, re-read the generated file and remove unnecessary complexity.

---

# Example: Bad vs Preferred

## Bad

```ts
const router = useRouter();

const currentPlan = (
    planData ? String(planData.plan).toLowerCase() : "free"
) as "free" | "pro";

const utils = api.useUtils();

const isPro = currentPlan === "pro";

const usageBar = isPro ? "100%" : "0%";

const usageNote = isPro
    ? "Unlimited active projects"
    : "Up to 2 active projects";
```

Problems:

- unnecessary lowercase conversion
- unnecessary cast
- hooks and ordinary variables are mixed
- `currentPlan` is unnecessary
- `usageBar` is unnecessary
- `usageNote` is unnecessary
- more values must be mentally tracked

## Preferred

```ts
const router = useRouter();
const utils = api.useUtils();

const isPro = planData?.plan === "PRO";
```

Then:

```tsx
<rect
    width={isPro ? "100%" : "0%"}
    height="100%"
    fill="currentColor"
/>

<div className="text-text/60 text-[12.5px]">
    {isPro
        ? "Unlimited active projects"
        : "Up to 2 active projects"}
</div>
```

The business rule remains visible and requires less mental tracing.

---

# Final Standard

The desired code should feel:

- explicit
- boring
- predictable
- local
- easy to scan
- easy to modify
- easy to debug

It should **not** feel:

- clever
- generic
- abstract
- over-normalized
- over-componentized
- over-engineered

When there are two correct implementations, choose the one that requires the reader to remember fewer things.
