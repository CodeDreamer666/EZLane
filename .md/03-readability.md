# Readability and Anti-Slop Rules

Use this file to remove unnecessary complexity from generated code.

## Naming

Prefer concrete domain names:

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

unless they genuinely describe the value.

## Unnecessary variables

Avoid:

```ts
const currentPlan = planData.plan;
const isPro = currentPlan === "PRO";
const usageBar = isPro ? "100%" : "0%";
const usageNote = isPro
    ? "Unlimited active projects"
    : "Up to 2 active projects";
```

Prefer:

```ts
const isPro = planData.plan === "PRO";
```

Then use simple one-use expressions directly in JSX.

A variable should exist only when it improves readability, is reused, or represents an important concept.

## Unnecessary helpers

Avoid trivial helpers:

```ts
function normalizePlan(plan: string) {
    return plan.toLowerCase();
}
```

Create helpers only when logic is genuinely complex, reused, or clearly easier to understand that way.

## Direct handlers

Use names like:

```ts
handleSave
handleDelete
handleUpload
handleSubmit
```

Keep simple logic visible in the handler.

Avoid chains like:

```text
handleSave
→ prepareData
→ normalizeData
→ validateData
→ createPayload
→ submitPayload
```

for ordinary CRUD.

## Ternaries

Simple ternaries are fine:

```tsx
{isPro ? "Pro" : "Free"}
```

Do not create a variable just to avoid a simple ternary.

## Repetition

Readable repetition is acceptable. Do not create tiny components such as `CharacterCounter` just because the same few JSX lines appear multiple times.

## No clever pipelines

Avoid:

```ts
const currentPlan = String(planData.plan)
    .trim()
    .toLowerCase() as Plan;
```

when this works:

```ts
const isPro = planData.plan === "PRO";
```

## Type casts

Do not cast values just to make unnecessary transformations type-check.

Use casts only when TypeScript genuinely requires them and the type relationship is correct.

## Final anti-slop check

Ask:
- Can any variable be removed?
- Can any helper be removed?
- Can any cast be removed?
- Can any transformation be removed?
- Can generic names become domain-specific?
- Can the business rule be written more directly?
- Does this code require unnecessary mental tracing?
