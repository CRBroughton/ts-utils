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

## Zod

The Zod directly currently contains only a single function, the `zodObjectBuilder` function, which is
a helper to generate objects from a Zod object schema.
Use this function for whenever you need to generate
objects but don't want to see the entire object in
your code. This function support both full and partial
schema support. Below is an example of `zodObjectBuilder` in action with it's various
use-cases.

``` typescript
// Define a schema
const UserSchema = z.object({
  id: z.string().default('1'),
  name: z.string().default("Craig R Broughton"),
  settings: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  }).default({
    theme: 'dark',
    notifications: true
  })
});

// Create default object(nested in an array) with no overrides
const defaultUsers = zodObjectBuilder({
  schema: UserSchema
});


// Create a single object with overrides
const user = zodObjectBuilder({
  schema: UserSchema,
  overrides: { name: 'John', settings: { theme: 'dark' } }
});

// Create multiple objects with overrides
const users = zodObjectBuilder({
  schema: UserSchema,
  overrides: [
    { name: 'John' },
    { name: 'Jane', settings: { theme: 'light' } }
  ]
});

// Preserve nested defaults with overrides
const userWithDefaults = zodObjectBuilder({
  schema: UserSchema,
  overrides: { name: 'John', settings: { theme: 'dark' } },
  config: { preserveNestedDefaults: true }
});

// Generate multiple objects with sequential values
const sequentialUsers = zodObjectBuilder({
  schema: UserSchema,
  options: {
    count: 3,
    transform: {
      id: (i) => `USER-${i + 1}`,
      name: (i) => `User ${i + 1}`
    }
  }
});

// Generate multiple batches with different transforms
const mixedUsers = zodObjectBuilder({
  schema: UserSchema,
  options: {
    batches: [
      { 
        count: 2, 
        transform: {
          id: ({ index }) => `ADMIN-${index + 1}`,
          role: () => 'admin' as const
        }
      },
      { 
        count: 3, 
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
          role: () => 'user' as const
        }
      }
    ]
  }
})

```
## Development Installation

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
