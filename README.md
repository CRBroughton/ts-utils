# ts-utils

A collection of helper functions and types. To use any of the following,
simply import into your project like so:

```typescript
import { handleError, safeAwait } from '@crbroughton/ts-utils'
```

## Installation

To install `ts-utils` with Bun, run the following command:

```bash
bun i -D @crbroughton/ts-utils
```

## await

The `await` directory contains the following:

- `safeAwait` - This function return either a result or error value. This suppports both a Go and Rust like syntax, using overload functions.
- `handleError` - To be used in conjunction with `safeAwait`.

The goal of the `await` helpers is to make it more obvious where throw exceptions
occur and to help guide the user to write exception handlers. Please inspect the [the accompanying example file](src/await/await.example.ts) file to see both helpers in action.

## enum

The `enum` directory contains the following:

- `EnumLike` - A helper type to define enum-like objects
- `createEnum` - A function to create enum-like object

It is intended that you'll only need to interface with the `createEnum` function,
however the `EnumLike` type has been exported if you find yourself requiring it.

## utils

The `utils` directory for now only contains the `Prettify` type, which will
improve your experience when hovering over type to get their underlying type
information.

## Development Installation

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
