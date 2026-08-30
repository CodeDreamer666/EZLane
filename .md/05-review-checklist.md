# Frontend Review Checklist

Use this only after implementation or refactoring is complete.

Review one category at a time. Fix violations before moving to the next category.

Do not change product behaviour during style review.

## 1. Structure
- Are hooks grouped near the top?
- Is state easy to find?
- Are effects easy to find?
- Are mutations easy to find?
- Are handlers easy to find?
- Are loading/error guards before JSX?
- Is there one main component per file?
- Does the filename match the default export?

## 2. Readability
- Are names concrete?
- Are there vague names such as `normalized`, `processed`, `payload`, or `temp` without a real reason?
- Are there unnecessary variables?
- Are there unnecessary helpers?
- Are there unnecessary wrappers?
- Are there unnecessary casts?
- Are there unnecessary transformations?
- Is business logic visible immediately?

## 3. Domain logic
- Are backend enum values preserved exactly?
- Are direct comparisons used where possible?
- Is UI state incorrectly controlling business flow?
- Can the business rule be understood without tracing several variables?

## 4. Queries and mutations
- Are only needed query fields used?
- Are mutation callbacks predictable?
- Are errors shown through `getFriendlyError`?
- Are success messages specific?
- Is cache invalidated where required?
- Is invalidation consistent across workflow branches?
- Is workflow-specific navigation kept out of global callbacks when the mutation has multiple outcomes?
- Are chained mutations explicit?
- Is `mutateAsync()` rejection handled where needed?
- Is pending state cleaned up correctly?

## 5. Forms
- Are strings trimmed?
- Is validation done before mutation?
- Are validation messages actionable?
- Is Zod used for multi-field/multi-rule forms?
- Are small forms kept simple?
- Are controlled inputs explicit?
- Are character counters present where expected?

## 6. Loading/error UI
- Does page loading use `<LoadingScreen />`?
- Does server failure use `<ServerError />`?
- Do async action buttons show pending state?
- Are pending buttons disabled?
- Do text/inline actions avoid visible loading state?
- Are duplicate actions still blocked internally where necessary?

## 7. Complexity
- Can any variable be deleted?
- Can any helper be deleted?
- Can any transformation be deleted?
- Can any cast be deleted?
- Can any generic abstraction be replaced with direct code?
- Can the file be understood without unnecessary jumping?

## 8. Behaviour
Confirm that the review did not accidentally change:
- UI wording
- validation behaviour
- API behaviour
- routes
- business rules
- features

## Recommended sequential workflow

For existing generated code:

```text
Read target code
↓
Read 00-core.md
↓
Audit + fix
↓
Read 01-react-structure.md
↓
Audit + fix
↓
Read 02-data-and-mutations.md
↓
Audit + fix
↓
Read 03-readability.md
↓
Audit + fix
↓
Read 04-ui-and-forms.md
↓
Audit + fix
↓
Read 05-review-checklist.md
↓
Final audit
```

For new implementation:

```text
Read 00-core.md
↓
Read nearby reviewed code
↓
Understand feature logic
↓
Implement
↓
Run the rule files sequentially
↓
Run this final checklist
```
