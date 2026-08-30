# UI and Form Rules

Use this file for shared UI components, forms, validation, loading states, text actions, and styling.

## Shared UI

Use existing shared components where available:

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

Do not recreate local equivalents.

## Controlled inputs

Use controlled inputs:

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

Keep state changes explicit.

## Validation

Validate before mutation.

For a tiny form, direct validation is acceptable:

```ts
const trimmed = name.trim();

if (trimmed.length < 1) {
    showMessage("Display name is required", false);
    return;
}
```

For multi-field or multi-rule forms, use Zod.

```ts
const result = schema.safeParse(form);

if (!result.success) {
    showMessage(
        result.error.issues[0]?.message ??
            "Please check the form and try again.",
        false,
    );
    return;
}

mutation.mutate(result.data);
```

## Trim strings

Use:

```ts
z.string().trim()
```

or:

```ts
const trimmed = value.trim();
```

Do not validate a trimmed value and then send the original untrimmed value.

## Validation messages

Messages should be non-technical, specific, and actionable.

Good:
- `Display name is required`
- `Invoice prefix must be at most 20 characters`
- `Accent colour must be a hex value like #4F46E5`

Avoid:
- `Invalid input`
- `Validation error`
- `BAD_REQUEST`

## Character counters

Use the existing counter pattern where appropriate:

```tsx
<div className="mt-[4px] flex justify-end">
    <span className="text-text/45 text-[11px]">
        {invoiceDetails.invoiceContact.length} / 120
    </span>
</div>
```

## Page loading and server errors

```ts
if (isLoading) return <LoadingScreen />;
if (error || !data) return <ServerError />;
```

## Button pending state

Async action buttons should visibly show pending state and prevent repeated clicks.

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

Use `disabled:cursor-not-allowed` when appropriate.

## Text / inline action rule

Loading state is a button UI convention.

If the same action is shown as inline text or a text link, do not visually show a loading state.

Example:

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

Do not add:
- `LoadingIcon`
- `Loading...`
- `Creating...`
- replacement pending text
- spinner beside the text

The underlying handler may still block duplicate execution internally. The text simply should not visually turn into a loading control.

## Styling

Use Tailwind directly in JSX.

Do not create separate CSS files for ordinary component styling unless required.

Keep styling consistent with nearby reviewed files.

## JSX

Keep straightforward JSX in the component.

Do not extract tiny fragments into extra components merely to shorten the file.
