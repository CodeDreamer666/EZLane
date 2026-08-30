# Data and Mutation Rules

Use this file for tRPC queries, mutations, async workflows, cache invalidation, errors, and server values.

## Queries

Use query hooks directly:

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

Do not destructure query fields that are not used.

## Simple mutation pattern

```ts
const mutation = api.settings.updateSomething.useMutation({
    onSuccess: () => {
        showMessage("Settings saved", true);
    },

    onError: (err) => {
        showMessage(getFriendlyError(err), false);
    },

    onSettled: async () => {
        await utils.invalidate();
    },
});
```

Keep the order:
1. `onSuccess`
2. `onError`
3. `onSettled`

## Errors

Use:

```ts
showMessage(getFriendlyError(err), false);
```

Do not manually decode tRPC internals in every component unless a specific error requires it.

## Cache invalidation

Invalidate relevant data after mutations when needed.

Prefer:

```ts
onSettled: async () => {
    await utils.invalidate();
},
```

Do not invalidate only one branch if every branch changes the same underlying data.

## Mutation callbacks vs workflow logic

Global mutation callbacks should contain behaviour common to every use of that mutation.

Workflow-specific behaviour should stay where the workflow is visible.

If creating a client can either:
- create client → go to clients
- create client → create proposal → go to proposal

do not put unconditional navigation inside global `createClient.onSuccess`.

## Chained mutations

When one mutation depends on another result, keep the sequence explicit:

```ts
const client = await createClient.mutateAsync(result.data);

if (thenPropose) {
    const proposal = await createProposal.mutateAsync({
        clientId: client.id,
    });

    router.push(`/proposals/${proposal.id}`);
    return;
}

router.push("/clients");
```

Per-call callbacks are also acceptable when they keep the workflow clear.

## UI state is not business intent

If the original intent is already available, use it directly:

```ts
if (thenPropose) {
    ...
}
```

Do not use a UI-only value such as `pendingAction === "propose"` as the source of truth for business flow.

## mutateAsync

`mutateAsync()` can reject even if `onError` displays an error. Handle the rejection appropriately.

Use `try/finally` when cleanup must always happen:

```ts
try {
    ...
} finally {
    setPendingAction(null);
}
```

Do not remove necessary control flow just because it looks more complex.

## Preserve server representation

If the server returns `"FREE"` and `"PRO"`, use those values directly.

Avoid:

```ts
const normalized =
    String(res.plan).toLowerCase() as "free" | "pro";
```

## Success messages

Keep them short and specific:

```ts
showMessage("Branding saved", true);
showMessage(`${client.name} added`, true);
```
