import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { buildDefaultObject, zodObjectBuilder } from '.'

describe('zodObjectBuilder', () => {
  test('create a zod object array from a schema', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
    })

    expect(actual).toStrictEqual([
      {
        foo: 'Hello, World!',
        bar: false,
      },
    ])
  })
  test('creates a zod object array from a schema (with overrides)', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
        nestedExample: z.object({
          nested1: z.string(),
          nested2: z.object({
            nestednested1: z.string(),
          }).optional(),
        }).default({
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        }),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      overrides: [
        {
          foo: 'rawr',
        },
        {
          foo: 'rawr2',
          bar: true,
        },
        {
          nestedExample: {
            nested1: 'nested1',
          },
        },
      ],
    })

    expect(actual).toStrictEqual([
      {
        foo: 'rawr',
        bar: false,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
      {
        foo: 'rawr2',
        bar: true,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
      {
        foo: 'Hello, World!',
        bar: false,
        nestedExample: {
          nested1: 'nested1',
        },
      },
    ])
  })

  test('creates a zod object array from a schema (with overrides & preserveNestedDefaults)', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
        nestedExample: z.object({
          nested1: z.string().default('nested1'),
          nested2: z.object({
            nestednested1: z.string().default('nested2'),
          }),
        }),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      config: {
        preserveNestedDefaults: true,
      },
      overrides: [
        {
          foo: 'rawr',
        },
        {
          foo: 'rawr2',
          bar: true,
        },
        {
          nestedExample: {
            nested1: 'nested1',
          },
        },
      ],
    })

    expect(actual).toStrictEqual([
      {
        foo: 'rawr',
        bar: false,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
      {
        foo: 'rawr2',
        bar: true,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
      {
        foo: 'Hello, World!',
        bar: false,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
    ])
  })
})

describe('buildDefaultObject', () => {
  test('should create an object with default values for flat objects', () => {
    const schema = z.object({
      name: z.string().default('John'),
      age: z.number().default(25),
      isActive: z.boolean().default(true),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      name: 'John',
      age: 25,
      isActive: true,
    })
  })

  test('should create an object with nested default values', () => {
    const schema = z.object({
      user: z.object({
        name: z.string().default('John'),
        settings: z.object({
          theme: z.string().default('dark'),
          notifications: z.boolean().default(true),
        }),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      user: {
        name: 'John',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
    })
  })

  test('should handle fields without default values', () => {
    const schema = z.object({
      required: z.string().optional(),
      withDefault: z.string().default('default'),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      required: undefined,
      withDefault: 'default',
    })
  })

  test('should handle arrays with default values', () => {
    const schema = z.object({
      tags: z.array(z.string()).default(['default']),
      settings: z.object({
        permissions: z.array(z.string()).default(['read']),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      tags: ['default'],
      settings: {
        permissions: ['read'],
      },
    })
  })

  test('should handle optional fields', () => {
    const schema = z.object({
      required: z.string().optional(),
      optional: z.string().optional(),
      withDefault: z.string().optional().default('default'),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      required: undefined,
      optional: undefined,
      withDefault: 'default',
    })
  })

  test('should handle deeply nested objects with mixed default values', () => {
    const schema = z.object({
      level1: z.object({
        a: z.string().default('a'),
        level2: z.object({
          b: z.number().optional(),
          c: z.boolean().default(true),
          level3: z.object({
            d: z.string().default('d'),
            e: z.number().optional(),
          }),
        }),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      level1: {
        a: 'a',
        level2: {
          b: undefined,
          c: true,
          level3: {
            d: 'd',
            e: undefined,
          },
        },
      },
    })
  })

  test('should handle enums with default values', () => {
    const StatusEnum = z.enum(['active', 'inactive']).default('active')
    const schema = z.object({
      status: StatusEnum,
      config: z.object({
        type: z.enum(['user', 'admin']).default('user'),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      status: 'active',
      config: {
        type: 'user',
      },
    })
  })

  test('should handle literal values with defaults', () => {
    const schema = z.object({
      type: z.literal('user').default('user'),
      settings: z.object({
        mode: z.literal('dark').default('dark'),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      type: 'user',
      settings: {
        mode: 'dark',
      },
    })
  })
})
