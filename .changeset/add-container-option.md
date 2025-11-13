---
"@crbroughton/ts-utils": minor
---

Add `container` option to control return value shape

The new `options.container` parameter allows users to control whether `zodObjectBuilder` returns an array or a single object when no overrides are provided:

**Usage:**
```typescript
// Returns an array (default)
const users = zodObjectBuilder({ schema: UserSchema })
// Result: [{ id: 'default-id', name: 'John' }]

// Returns a single object
const user = zodObjectBuilder({
  schema: UserSchema,
  options: { container: 'object' }
})
// Result: { id: 'default-id', name: 'John' }
```

**Features:**
- Type-safe: Return type is correctly inferred based on container option
- Replaces the previous hack of using `overrides: {}` to get a single object
- Works alongside other options like `count`, `transform`, and `afterGenerate`
