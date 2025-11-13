---
"@crbroughton/ts-utils": major
---

**BREAKING CHANGE:** Enforce non-empty overrides with compile-time and runtime validation

The `overrides` parameter now requires at least one meaningful value:
- `overrides: {}` (empty object) → Type error + runtime error
- `overrides: []` (empty array) → Type error + runtime error
- `overrides: [{}]` (array with empty objects) → Runtime error

**Migration:**
- Remove `overrides: {}` and use `options: { container: 'object' }` instead
- Remove `overrides: []` and omit the overrides parameter
- Ensure all override objects have at least one key