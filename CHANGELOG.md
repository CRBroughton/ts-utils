# @crbroughton/ts-utils

## 2.0.0

### Major Changes

- 442229c: **BREAKING CHANGE:** Enforce non-empty overrides with compile-time and runtime validation

  The `overrides` parameter now requires at least one meaningful value:

  - `overrides: {}` (empty object) → Type error + runtime error
  - `overrides: []` (empty array) → Type error + runtime error
  - `overrides: [{}]` (array with empty objects) → Runtime error

  **Migration:**

  - Remove `overrides: {}` and use `options: { container: 'object' }` instead
  - Remove `overrides: []` and omit the overrides parameter
  - Ensure all override objects have at least one key

### Minor Changes

- d02d837: Add `container` option to control return value shape

  The new `options.container` parameter allows users to control whether `zodObjectBuilder` returns an array or a single object when no overrides are provided:

  **Usage:**

  ```typescript
  // Returns an array (default)
  const users = zodObjectBuilder({ schema: UserSchema });
  // Result: [{ id: 'default-id', name: 'John' }]

  // Returns a single object
  const user = zodObjectBuilder({
    schema: UserSchema,
    options: { container: "object" },
  });
  // Result: { id: 'default-id', name: 'John' }
  ```

  **Features:**

  - Type-safe: Return type is correctly inferred based on container option
  - Replaces the previous hack of using `overrides: {}` to get a single object
  - Works alongside other options like `count`, `transform`, and `afterGenerate`

## 1.0.0

### Major Changes

- Replace await package with result package

## 0.6.2

### Patch Changes

- ensuring overrie continues to work with default schemas

## 0.6.1

### Patch Changes

- ensure default schemas return early to properly populate the default values

## 0.6.0

### Minor Changes

- add support for z.ZodDefault schemas

### Patch Changes

- dff53e8: add documentation for createEnum and Prettify

## 0.5.1

### Patch Changes

- update documentation for allowOverlappingTransforms

## 0.5.0

### Minor Changes

- 3b078e5: allow for both function and object based batch transformations

## 0.4.0

### Minor Changes

- 4261b13: allow for global and batch transformations to work together

### Patch Changes

- 59ad8b6: preserveNestedDefaults now works with batch transformations

## 0.3.0

### Minor Changes

- 722324d: create transform configuration option - generate sequential values for schema properties
- 057a503: add support for count - generate a certain amount of mocks
- 2673732: create afterGenerate function - run custom functionality against the resulting mocks, helpful for sorting or adding derived data
- 3d77c51: create batchTranform function - Generate multiple batches with different transforms
- 2673732: create SchemaTransforms type - allows creation of type safe default transformations against a schema

### Patch Changes

- 0499b64: improve documentation for configuration options

## 0.2.5

### Patch Changes

- update internal documentation

## 0.2.4

### Patch Changes

- 4213120: fix nested arrays not returned preserved values

## 0.2.3

### Minor Changes

- 2eafacf: add support for Rust style Result type to safeAwait
- 6954d24: create zodObjectBuilder

### Patch Changes

- e998329: change first arg for safeAwait from function to promise

## 0.1.1

### Patch Changes

- 4e544c0: fix repo link in package.json
- 1808d47: add MIT file

## 0.1.0

### Minor Changes

- 5d31b34c: create safeAwait and handleError functions
- 4711a15: add Prettify type
- 280e117: add createEnum and EnumLike type
