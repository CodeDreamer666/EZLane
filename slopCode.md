# Code Simplicity and Readability Rules

The goal is to avoid unnecessary abstraction, excessive helper functions, and vague naming. Prefer code that can be read directly from top to bottom without constantly jumping between tiny functions.

## 1. Do not create functions for trivial one-line operations

Avoid creating a named function when it only wraps a simple operation and is used once.

Bad:

```tsx
const closeNav = () => setNavOpen(false);

<button onClick={closeNav}>Close</button>
```

Prefer:

```tsx
<button onClick={() => setNavOpen(false)}>Close</button>
```

Create a separate function only when at least one of these is true:

* The same logic is used multiple times.
* The logic is sufficiently complex that extracting it improves readability.
* The function has meaningful reusable behaviour rather than simply forwarding one operation.

Do not extract code merely for the sake of having a named handler.

---

## 2. Merge unnecessary page-specific functions and components

If a single file contains multiple small functions or components that exist only to split up that file, merge them into the main function where practical.

For example, if one file contains:

```tsx
DashboardShell
Header
Sidebar
CommandPalette
AddClientDialog
```

and all of them are small, page-specific, and used only by that file, do not automatically keep them as five separate functions.

Prefer one main component when doing so keeps the code readable.

This rule applies only to functions and components that already exist within the same file.

Do **not**:

* Copy components from other files into the current file.
* Move unrelated reusable components into the main component.
* Merge genuinely large or independently reusable components merely to reduce the function count.

The purpose is to remove artificial fragmentation, not to create one enormous unreadable function.

---

## 3. Avoid unnecessary wrapper handlers

Do not create handlers whose only purpose is to call another function or perform a very small amount of obvious logic.

For example:

```tsx
const handleDelete = () => {
    if (selectedIds.length === 0) return;

    deleteClients.mutate({ ids: selectedIds });
};
```

If this handler is used only once and remains easy to understand inline, prefer:

```tsx
onClick={() => {
    if (selectedIds.length === 0) return;

    deleteClients.mutate({ ids: selectedIds });
}}
```

The same applies to functions such as:

```tsx
const closeAddClient = () => {
    if (isPending) return;

    setForm(EMPTY_FORM);
    closeModal();
};
```

or:

```tsx
const navigate = (route: string) => {
    setPaletteOpen(false);
    router.push(route);
};
```

Do not automatically extract these into standalone functions.

Keep them inline when they are used once and the inline version remains easier to follow.

Extract them when they are reused, become complex, or make the JSX significantly harder to read.

---

## 4. Do not create tiny state-management helpers unnecessarily

For example:

```tsx
const cancelManage = () => {
    setManaging(false);
    setSelectedIds([]);
};
```

If this operation is only triggered in one place, it usually does not need its own function.

Prefer keeping the state changes where the action occurs:

```tsx
onClick={() => {
    setManaging(false);
    setSelectedIds([]);
}}
```

A function should represent meaningful behaviour, not merely hide two obvious state updates.

---

## 5. Extract repeated or genuinely complex logic

Logic such as:

```tsx
const toggleSelected = (clientId: string) => {
    setSelectedIds(
        selectedIds.includes(clientId)
            ? selectedIds.filter((id) => id !== clientId)
            : [...selectedIds, clientId],
    );
};
```

does not automatically need to be extracted.

Use this general rule:

* If the logic is used repeatedly, extract it.
* If it appears only once and remains readable inline, keep it inline.
* If inlining it makes the surrounding JSX difficult to understand, extract it even if it is only used once.

Do not use an arbitrary abstraction merely because a block contains several lines. Optimize for how easily a human can follow the code.

---

## 6. Use descriptive variable and parameter names

Do not use meaningless single-letter names when a descriptive name is obvious.

Bad:

```tsx
clientList.map((c) => {
    ...
});
```

Good:

```tsx
clientList.map((client) => {
    ...
});
```

Bad:

```tsx
onClick={(e) => {
    ...
}}
```

Good:

```tsx
onClick={(event) => {
    ...
}}
```

The same applies to:

```tsx
id
i
x
d
c
e
```

when the variable represents something with a clear domain meaning.

Prefer names such as:

```tsx
client
clientId
document
documentId
index
event
project
invoice
selectedClient
```

Short names are acceptable only when their meaning is genuinely obvious and conventional in the immediate context.

---

## 7. Prefer direct code over abstraction for abstraction's sake

Do not create:

* `handleX` functions that are used once and contain trivial logic.
* `closeX` functions that only call a state setter.
* `openX` functions that only call a state setter.
* `navigateX` wrappers that merely call `router.push`.
* Functions whose only purpose is hiding one mutation call.
* Small page-specific components solely to reduce the number of JSX lines in the parent.
* Variables or callbacks with vague single-letter names.

Every abstraction should provide an actual readability, reuse, or complexity-management benefit.

If removing a function makes the code easier to understand without introducing duplication or excessive JSX complexity, remove it.

---

## General Principle

Write code for the person who will read it later.

Prefer:

```tsx
<button
    onClick={() => {
        setManaging(false);
        setSelectedIds([]);
    }}
>
    Cancel
</button>
```

over:

```tsx
const cancelManage = () => {
    setManaging(false);
    setSelectedIds([]);
};

<button onClick={cancelManage}>Cancel</button>
```

when `cancelManage` is used only once.

However, do not force everything inline. If an inline callback becomes large, deeply nested, repeated, or distracts from the structure of the JSX, extract it into a clearly named function.

The objective is **fewer unnecessary abstractions, descriptive naming, and code that is straightforward for a human to read**.
