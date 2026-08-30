# React Structure Rules

Use this file for component organization, hooks, state, effects, and file structure.

## Component order

Prefer:

```text
"use client"
imports

export default function ComponentName() {
    hooks
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

The exact order may vary slightly, but the file must remain easy to scan.

## Hooks near the top

Keep React, Next.js, custom, and tRPC hooks together near the top.

Preferred:

```ts
const { showMessage } = useStatusMessage();
const router = useRouter();
const utils = api.useUtils();
const { data, isLoading, error } = api.settings.getProfile.useQuery();

const [name, setName] = useState("");

useEffect(() => {
    ...
}, [data]);

const mutation = api.settings.updateProfile.useMutation({
    ...
});
```

Do not scatter hooks between ordinary variables and business logic.

## State

For one value:

```ts
const [name, setName] = useState("");
```

For a small form:

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

## Query data into local state

Use a straightforward `useEffect`:

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

Do not create synchronization helpers unless necessary.

## Derived values

Keep only meaningful derived values.

Good:

```ts
const isPro = planData?.plan === "PRO";
```

Do not create one-use variables merely to hide simple JSX ternaries.

## Loading and error guards

Keep immediately before JSX:

```ts
if (isLoading) return <LoadingScreen />;
if (error || !data) return <ServerError />;
```

## Files

One main component per file.

```ts
export default function ProfileSection() {
    ...
}
```

The filename should match the default-exported component name, e.g. `ProfileSection.tsx`.
