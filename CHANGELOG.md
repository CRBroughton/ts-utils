# @crbroughton/ts-utils

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
