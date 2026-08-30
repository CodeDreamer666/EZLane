# Core Frontend Rules

Read this before writing or refactoring frontend React/Next.js code.

The reviewed `BrandingSection`, `InvoiceSection`, `PlanSection`, and `ProfileSection` files are canonical style references.

## Goal

Code should be simple, explicit, predictable, local, easy to scan, easy to modify, and easy to debug.

Avoid cleverness, generic abstractions, unnecessary normalization, over-componentization, and over-engineering.

When two implementations are both correct, choose the one that requires the reader to remember fewer things.

## Direct business logic

Prefer:

```ts
const isProPlan = brandingData?.plan === "PRO";
```

Avoid:

```ts
const normalized = String(brandingData?.plan).toLowerCase();
const isProPlan = normalized === "pro";
```

If the backend/database uses `"FREE"` and `"PRO"`, preserve those values exactly. Do not change casing merely for frontend convenience.

## Avoid unnecessary abstraction

Do not add helpers, wrapper components, generic renderers, mappers, view models, reducers, form libraries, state machines, context, `useMemo`, `useCallback`, custom hooks, normalization layers, or type casts unless they are genuinely needed.

Readable repetition is acceptable.

## Preserve behaviour

A style refactor must not change UI wording, validation, API behaviour, routes, plan rules, features, or business logic unless explicitly requested.

## Use existing conventions

Match nearby reviewed code. Use existing shared UI components and utilities. Do not replace working code with your preferred architecture simply because it is more abstract or DRY.

## Final core check

Before finishing:
- remove unnecessary variables
- remove unnecessary transformations
- remove unnecessary helpers
- remove unnecessary casts
- use concrete names
- make business logic direct
- preserve behaviour
