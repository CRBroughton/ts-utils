import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { faker } from '@faker-js/faker'
import { type SchemaTransforms, buildDefaultObject, generateMocks, mergeWithArrayHandling, zodObjectBuilder } from '.'

describe('Container shape (array or object)', () => {
  test('should throw error when using empty object override', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    expect(() => zodObjectBuilder({
      schema: UserSchemaMock,
      // @ts-expect-error - Empty object should not be allowed, must have at least one key
      overrides: {},
    })).toThrow('When using overrides as a single object, at least one valid key must be provided. Use options: { container: \'object\' } instead if you want to return a single object without overrides.')
  })

  test('should throw error when using empty array override', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    expect(() => zodObjectBuilder({
      schema: UserSchemaMock,
      // @ts-expect-error - Empty array should not be allowed, must have at least one element
      overrides: [],
    })).toThrow('When using overrides as an array, at least one element must be provided. Remove the overrides parameter if you want to use default values.')
  })

  test('should throw error when array contains empty objects', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    expect(() => zodObjectBuilder({
      schema: UserSchemaMock,
      // Note: TypeScript cannot catch empty objects in arrays without breaking type inference for partial objects.
      // Runtime validation catches this case.
      overrides: [{}],
    })).toThrow('Override at index 0 is an empty object. Each override element must contain at least one key.')
  })

  test('should return an array by default', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    const result = zodObjectBuilder({
      schema: UserSchemaMock,
    })

    expect(result).toStrictEqual([{
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    }])
  })
  test('should return an array when specified', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    const result = zodObjectBuilder({
      schema: UserSchemaMock,
      options: {
        container: 'array',
      },
    })

    expect(result).toStrictEqual([{
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    }])
  })
  test('should return an object when specified', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    const result = zodObjectBuilder({
      schema: UserSchemaMock,
      options: {
        container: 'object',
      },
    })

    expect(result).toStrictEqual({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })
  })
})

describe('zodObjectBuilder with seperate default mock object', () => {
  test('should work with ZodDefault wrapped ZodObject', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    const result = zodObjectBuilder({
      schema: UserSchemaMock,
    })

    expect(result).toStrictEqual([{
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    }])
  })

  test('can use container option to get a single object', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    const result = zodObjectBuilder({
      schema: UserSchemaMock,
      options: {
        container: 'object',
      },
    })

    expect(result).toStrictEqual({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })
  })

  test('can still use the included features of ZodObjectBuilder', () => {
    const UserSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(['admin', 'user']),
    })

    const UserSchemaMock = UserSchema.default({
      id: 'default-id',
      name: 'John Smith',
      email: 'john@email.com',
      role: 'user',
    })

    faker.seed(123)
    const result = zodObjectBuilder({
      schema: UserSchemaMock,
      options: {
        count: 3,
        transform: {
          id: ({ item, index }) => `${index}-${item.id}`,
          name: () => faker.person.fullName(),
        },
        afterGenerate: (items) => {
          return [...items].sort((a, b) => a.name.localeCompare(b.name))
        },
      },
    })

    expect(result).toStrictEqual(
      [{
        id: '0-default-id',
        name: 'Daryl Reichel',
        email: 'john@email.com',
        role: 'user',
      }, {
        id: '2-default-id',
        name: 'Jaime Deckow',
        email: 'john@email.com',
        role: 'user',
      }, {
        id: '1-default-id',
        name: 'Jayden Heathcote',
        email: 'john@email.com',
        role: 'user',
      }],
    )
  })
})

describe('zodObjectBuilder with transforms and batchTransforms', () => {
  const UserSchema = z.object({
    id: z.string().default('default-id'),
    name: z.string().default('John Smith'),
    email: z.string().email().default('john@email.com'),
    role: z.enum(['admin', 'user']).default('user'),
  })

  test('count defaults to one', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      config: {
        allowOverlappingTransforms: false,
      },
      options: {
        transform: {
          id: ({ index }) => `USER-${index + 1}`, // Should be ignored
        },
        batchTransform: [
          {
            transform: {
              id: ({ index }) => `ADMIN-${index + 1}`,
              role: () => 'admin' as const,
            },
          },
          {
            count: 1,
            transform: {
              id: ({ index }) => `USER-${index + 1}`,
              role: () => 'user' as const,
            },
          },
        ],
      },
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), id: 'ADMIN-1', role: 'admin' },
      { ...UserSchema.parse({}), id: 'USER-1', role: 'user' },
    ])
  })

  test('should allow for non functional batch transformations', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      config: {
        allowOverlappingTransforms: false,
      },
      options: {
        transform: {
          id: ({ index }) => `USER-${index + 1}`, // Should be ignored
        },
        batchTransform: [
          {
            count: 2,
            transform: {
              id: ({ index }) => `ADMIN-${index + 1}`,
              role: 'admin',
            },
          },
          {
            count: 1,
            transform: {
              id: ({ index }) => `USER-${index + 1}`,
              role: () => 'user' as const,
            },
          },
        ],
      },
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), id: 'ADMIN-1', role: 'admin' },
      { ...UserSchema.parse({}), id: 'ADMIN-2', role: 'admin' },
      { ...UserSchema.parse({}), id: 'USER-1', role: 'user' },
    ])
  })

  test('should only apply batch transforms when allowOverlappingTransforms is false', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      config: {
        allowOverlappingTransforms: false,
      },
      options: {
        transform: {
          id: ({ index }) => `USER-${index + 1}`, // Should be ignored
        },
        batchTransform: [
          {
            count: 2,
            transform: {
              id: ({ index }) => `ADMIN-${index + 1}`,
              role: () => 'admin' as const,
            },
          },
          {
            count: 1,
            transform: {
              id: ({ index }) => `USER-${index + 1}`,
              role: () => 'user' as const,
            },
          },
        ],
      },
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), id: 'ADMIN-1', role: 'admin' },
      { ...UserSchema.parse({}), id: 'ADMIN-2', role: 'admin' },
      { ...UserSchema.parse({}), id: 'USER-1', role: 'user' },
    ])
  })

  test('should apply global transforms first when allowOverlappingTransforms is true', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      config: {
        allowOverlappingTransforms: true,
      },
      options: {
        transform: {
          email: ({ item }) => `${item.name.toLowerCase()}@example.com`,
        },
        batchTransform: [
          {
            count: 2,
            transform: {
              name: ({ index }) => `Admin ${index + 1}`,
            },
          },
        ],
      },
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), name: 'Admin 1', email: 'admin 1@example.com' },
      { ...UserSchema.parse({}), name: 'Admin 2', email: 'admin 2@example.com' },
    ])
  })

  test('should allow batch transforms to override global transforms when enabled', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      config: {
        allowOverlappingTransforms: true,
      },
      options: {
        transform: {
          id: ({ index }) => `GLOBAL-${index + 1}`,
          name: ({ index }) => `User ${index + 1}`,
        },
        batchTransform: [
          {
            count: 2,
            transform: {
              id: ({ index }) => `BATCH-${index + 1}`,
            },
          },
        ],
      },
    })

    // Batch transform overrides 'id', but global 'name' transform remains
    expect(result).toEqual([
      { ...UserSchema.parse({}), id: 'BATCH-1', name: 'User 1' },
      { ...UserSchema.parse({}), id: 'BATCH-2', name: 'User 2' },
    ])
  })

  test('should maintain independent indices for each batch', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      config: {
        allowOverlappingTransforms: true,
      },
      options: {
        transform: {
          email: ({ index }) => `global${index + 1}@example.com`,
        },
        batchTransform: [
          {
            count: 2,
            transform: {
              id: ({ index }) => `FIRST-${index + 1}`,
            },
          },
          {
            count: 1,
            transform: {
              id: ({ index }) => `SECOND-${index + 1}`,
            },
          },
        ],
      },
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), id: 'FIRST-1', email: 'global1@example.com' },
      { ...UserSchema.parse({}), id: 'FIRST-2', email: 'global2@example.com' },
      { ...UserSchema.parse({}), id: 'SECOND-1', email: 'global3@example.com' },
    ])
  })
})

describe('zodObjectBuilder batches', () => {
  const UserSchema = z.object({
    id: z.string().default('default-id'),
    name: z.string().default('John Smith'),
    email: z.string().email().default('john@email.com'),
    role: z.enum(['admin', 'user']).default('user'),
  })

  test('should generate different batches with different transforms', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        batchTransform: [
          {
            count: 2,
            transform: {
              id: ({ index }) => `ADMIN-${index + 1}`,
              role: () => 'admin' as const,
            },
          },
          {
            count: 3,
            transform: {
              id: ({ index }) => `USER-${index + 1}`,
              role: () => 'user' as const,
            },
          },
        ],
      },
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), id: 'ADMIN-1', role: 'admin' },
      { ...UserSchema.parse({}), id: 'ADMIN-2', role: 'admin' },
      { ...UserSchema.parse({}), id: 'USER-1', role: 'user' },
      { ...UserSchema.parse({}), id: 'USER-2', role: 'user' },
      { ...UserSchema.parse({}), id: 'USER-3', role: 'user' },
    ])
  })

  test('should work with afterGenerate', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        batchTransform: [
          {
            count: 2,
            transform: { role: () => 'admin' as const },
          },
          {
            count: 2,
            transform: { role: () => 'user' as const },
          },
        ],
        afterGenerate: (items) => {
          return [...items].sort((a, _b) => a.role.localeCompare(a.role))
        },
      },
    })

    expect(result.map(item => item.role)).toEqual([
      'admin',
      'admin',
      'user',
      'user',
    ])
  })

  test('should maintain schema defaults for untransformed fields', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        batchTransform: [
          {
            count: 1,
            transform: { id: () => 'custom-id' },
          },
        ],
      },
    })

    expect(result).toEqual([
      {
        id: 'custom-id',
        name: 'John Smith',
        email: 'john@email.com',
        role: 'user',
      },
    ])
  })

  test('each batch should have independent transforms', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        batchTransform: [
          {
            count: 2,
            transform: {
              name: ({ index }) => `Admin ${index + 1}`,
              role: () => 'admin' as const,
            },
          },
          {
            count: 2,
            transform: {
              name: ({ index }) => `User ${index + 1}`,
              role: () => 'user' as const,
            },
          },
        ],
      },
    })

    expect(result.map(item => ({ name: item.name, role: item.role }))).toEqual([
      { name: 'Admin 1', role: 'admin' },
      { name: 'Admin 2', role: 'admin' },
      { name: 'User 1', role: 'user' },
      { name: 'User 2', role: 'user' },
    ])
  })
  test('overrides should take priority over batches', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        batchTransform: [
          {
            count: 2,
            transform: {
              name: () => 'This should not show up in the result',
            },
          },
        ],
      },
      overrides: [
        { name: 'Override 1' },
        { name: 'Override 2' },
      ],
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), name: 'Override 1' },
      { ...UserSchema.parse({}), name: 'Override 2' },
    ])
  })
})

describe('zodObjectBuilder afterGenerate', () => {
  const UserSchema = z.object({
    id: z.string().default('default-id'),
    name: z.string().default('John Smith'),
    email: z.string().email().default('john@email.com'),
    role: z.enum(['admin', 'user']).default('user'),
  })

  test('can sort generated items', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        count: 3,
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
        },
        afterGenerate: (items) => {
          return [...items].sort((a, b) => b.id.localeCompare(a.id))
        },
      },
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), id: 'USER-3' },
      { ...UserSchema.parse({}), id: 'USER-2' },
      { ...UserSchema.parse({}), id: 'USER-1' },
    ])
  })

  test('can add derived data', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        count: 3,
        transform: {
          name: ({ index }) => `User ${index + 1}`,
        },
        afterGenerate: (items) => {
          const totalLength = items.reduce((sum, item) => sum + item.name.length, 0)
          const avgLength = totalLength / items.length

          return items.map(item => ({
            ...item,
            name: `${item.name} (avg: ${avgLength.toFixed(1)})`,
          }))
        },
      },
    })

    expect(result[0].name).toContain('(avg:')
    expect(result.every(item => item.name.includes('(avg:'))).toBe(true)
  })

  test('works with overrides array', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        afterGenerate: (items) => {
          return [...items].sort((a, b) => b.name.localeCompare(a.name))
        },
      },
      overrides: [
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ],
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), name: 'Charlie' },
      { ...UserSchema.parse({}), name: 'Bob' },
      { ...UserSchema.parse({}), name: 'Alice' },
    ])
  })

  test('should not affect single item override', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        afterGenerate: (items) => {
          return items.map(item => ({ ...item, name: 'Modified' }))
        },
      },
      overrides: { name: 'Single User' },
    })

    expect(result).toEqual({
      ...UserSchema.parse({}),
      name: 'Single User',
    })
  })
})

describe('generateMocks', () => {
  const baseUser = {
    id: 'default-id',
    name: 'John Smith',
    email: 'john@email.com',
    role: 'user' as const,
  }

  describe('transform option', () => {
    test('should apply sequential values to specified properties', () => {
      const result = generateMocks(baseUser, 3, {
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
          email: ({ index }) => `user${index + 1}@email.com`,
        },
      })

      expect(result).toStrictEqual([
        { ...baseUser, id: 'USER-1', email: 'user1@email.com' },
        { ...baseUser, id: 'USER-2', email: 'user2@email.com' },
        { ...baseUser, id: 'USER-3', email: 'user3@email.com' },
      ])
    })

    test('should handle single sequenced property', () => {
      const result = generateMocks(baseUser, 2, {
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
        },
      })

      expect(result).toStrictEqual([
        { ...baseUser, id: 'USER-1' },
        { ...baseUser, id: 'USER-2' },
      ])
    })

    test('should maintain non-sequenced properties', () => {
      const result = generateMocks(baseUser, 2, {
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
        },
      })

      expect(result[0].name).toBe('John Smith')
      expect(result[1].name).toBe('John Smith')
    })

    test('should handle count of 1', () => {
      const result = generateMocks(baseUser, 1, {
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
        },
      })

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ ...baseUser, id: 'USER-1' })
    })
  })
})

describe('zodObjectBuilder with transform option', () => {
  const UserSchema = z.object({
    id: z.string().default('default-id'),
    name: z.string().default('John Smith'),
    email: z.string().email().default('john@email.com'),
    role: z.enum(['admin', 'user']).default('user'),
  })
  test('can create default transforms with the Transform type', () => {
    const transforms: SchemaTransforms<z.infer<typeof UserSchema>> = {
      id: ({ index }) => `USER-${index + 1}`,
      email: ({ index }) => `user${index + 1}@email.com`,
    }

    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        count: 3,
        transform: transforms,
      },
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), id: 'USER-1', email: 'user1@email.com' },
      { ...UserSchema.parse({}), id: 'USER-2', email: 'user2@email.com' },
      { ...UserSchema.parse({}), id: 'USER-3', email: 'user3@email.com' },
    ])
  })
  test('should generate sequenced mocks when count and sequnece is provided', () => {
    const defaultValues = UserSchema.parse({})

    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        count: 3,
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
          email: ({ index }) => `user${index + 1}@email.com`,
        },
      },
    })

    expect(result).toEqual([
      { ...defaultValues, id: 'USER-1', email: 'user1@email.com' },
      { ...defaultValues, id: 'USER-2', email: 'user2@email.com' },
      { ...defaultValues, id: 'USER-3', email: 'user3@email.com' },
    ])
  })

  test('should ignore sequence when overrides are provided', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
        },
      },
      overrides: [{ name: 'Alice' }, { name: 'Bob' }],
    })

    expect(result).toEqual([
      { ...UserSchema.parse({}), name: 'Alice' },
      { ...UserSchema.parse({}), name: 'Bob' },
    ])
  })

  test('should require count when using sequence', () => {
    const result = zodObjectBuilder({
      schema: UserSchema,
      options: {
        transform: {
          id: ({ index }) => `USER-${index + 1}`,
        },
      },
    })

    // Without count, falls back to default behavior of single item
    expect(result).toEqual([UserSchema.parse({})])
  })
})

describe('zodObjectBuilder', () => {
  test('creates an array of mocks via the count config option', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      options: {
        count: 4,
      },
    })

    expect(actual).toStrictEqual([
      {
        foo: 'Hello, World!',
        bar: false,
      },
      {
        foo: 'Hello, World!',
        bar: false,
      },
      {
        foo: 'Hello, World!',
        bar: false,
      },
      {
        foo: 'Hello, World!',
        bar: false,
      },
    ])
  })
  test('the override option properly overrides the count value if used', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      options: {
        count: 4,
      },
      overrides: { bar: true },
    })

    expect(actual).toStrictEqual({
      foo: 'Hello, World!',
      bar: true,
    })
  })
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
  test('create a zod object object from a schema', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      options: {
        container: 'object',
      },
    })

    expect(actual).toStrictEqual(
      {
        foo: 'Hello, World!',
        bar: false,
      },
    )
  })
  test('create a zod object object from a schema (with override)', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      overrides: {
        bar: true,
      },
    })

    expect(actual).toStrictEqual(
      {
        bar: true,
        foo: 'Hello, World!',
      },
    )
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
          nested2: {
            nestednested1: 'nested2',
          },
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

  test('creates a zod object array from a schema (with batch transformations & preserveNestedDefaults & non functional )', () => {
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
      options: {
        batchTransform: [
          {
            transform: {
              foo: () => 'rawr',
            },
          },
          {
            transform: {
              foo: () => 'rawr2',
              bar: true,
            },
          },
          {
            transform: {
              nestedExample: {
                nested1: 'nested-one',
              },
            },
          },
        ],
      },
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
          nested1: 'nested-one',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
    ])
  })

  test('creates a zod object array from a schema (with batch transformations & preserveNestedDefaults)', () => {
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
      options: {
        batchTransform: [
          {
            count: 1,
            transform: {
              foo: () => 'rawr',
            },
          },
          {
            count: 1,
            transform: {
              foo: () => 'rawr2',
              bar: () => true,
            },
          },
          {
            count: 1,
            transform: {
              nestedExample: () => {
                return {
                  nested1: 'nested-one',
                }
              },
            },
          },
        ],
      },
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
          nested1: 'nested-one',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
    ])
  })
  test('it properly overrides nested arrays whilst preverse nested defaults', () => {
    const addressSchema = z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
    })

    const addressSchemaMock = addressSchema.default({
      street: '123 Pine Street',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA',
    })

    const customerInfoSchema = z.object({
      id: z.string().regex(/^CUST-\d{4}$/),
      name: z.string().min(1),
      email: z.email(),
      shippingAddress: addressSchemaMock,
    })

    const customerInfoMock = customerInfoSchema.default({
      id: 'CUST-1234',
      name: 'Alice Johnson',
      email: 'alice.j@email.com',
      shippingAddress: addressSchemaMock.parse(undefined),
    })

    const paymentInfoSchema = z.object({
      method: z.enum(['credit_card', 'paypal']),
      status: z.enum(['completed', 'pending', 'failed']),
      transactionId: z.string(),
    })

    const paymentInfoMock = paymentInfoSchema.default({
      method: 'credit_card',
      status: 'pending',
      transactionId: 'TXN-88776655',
    })

    const orderItemSchema = z.object({
      productId: z.string().regex(/^PROD-\d{3}$/),
      name: z.string().min(1),
      quantity: z.number().int().positive(),
      pricePerUnit: z.number().positive(),
      color: z.string().optional(),
      size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).optional(),
      variety: z.string().optional(),
      weight: z.enum(['8oz', '12oz', '16oz', '1lb']).optional(),
    })

    const orderItemMock = orderItemSchema.default({
      productId: 'PROD-001',
      name: 'Sample Product',
      quantity: 1,
      pricePerUnit: 29.99,
      color: 'Black',
      size: 'M',
    })

    const orderSchemaMock = z.object({
      orderId: z.string().regex(/^ORD-\d{4}-\d{3}$/).default('ORD-2024-661'),
      customerInfo: customerInfoMock,
      orderDate: z.string().default('11/11/1111'),
      items: z.array(orderItemMock).min(1).default([orderItemMock.parse(undefined)]),
      paymentInfo: paymentInfoMock,
      subtotal: z.number().positive().default(29.99),
      shippingCost: z.number().nonnegative().default(5.99),
      tax: z.number().nonnegative().default(3.00),
      totalAmount: z.number().positive().default(38.98),
      status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
      trackingNumber: z.string().default('1Z999AA1234567890'),
    })

    const orders = zodObjectBuilder({
      schema: orderSchemaMock,
      overrides: [
        {
          status: 'delivered',
          items: [{ size: 'L' }],
        },
      ],
    })

    expect(orders).toStrictEqual([{ orderId: 'ORD-2024-661', customerInfo: { id: 'CUST-1234', name: 'Alice Johnson', email: 'alice.j@email.com', shippingAddress: { street: '123 Pine Street', city: 'Portland', state: 'OR', zipCode: '97201', country: 'USA' } }, orderDate: '11/11/1111', items: [{ productId: 'PROD-001', name: 'Sample Product', quantity: 1, pricePerUnit: 29.99, color: 'Black', size: 'L' }], paymentInfo: { method: 'credit_card', status: 'pending', transactionId: 'TXN-88776655' }, subtotal: 29.99, shippingCost: 5.99, tax: 3, totalAmount: 38.98, status: 'delivered', trackingNumber: '1Z999AA1234567890' }])
  })
  test('it properly overrides nested array without preserving nested defaults', () => {
    const addressSchema = z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
    })

    const addressSchemaMock = addressSchema.default({
      street: '123 Pine Street',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA',
    })

    const customerInfoSchema = z.object({
      id: z.string().regex(/^CUST-\d{4}$/),
      name: z.string().min(1),
      email: z.string().email(),
      shippingAddress: addressSchemaMock,
    })

    const customerInfoMock = customerInfoSchema.default({
      id: 'CUST-1234',
      name: 'Alice Johnson',
      email: 'alice.j@email.com',
      shippingAddress: addressSchemaMock.parse(undefined),
    })

    const paymentInfoSchema = z.object({
      method: z.enum(['credit_card', 'paypal']),
      status: z.enum(['completed', 'pending', 'failed']),
      transactionId: z.string(),
    })

    const paymentInfoMock = paymentInfoSchema.default({
      method: 'credit_card',
      status: 'pending',
      transactionId: 'TXN-88776655',
    })

    const orderItemSchema = z.object({
      productId: z.string().regex(/^PROD-\d{3}$/).optional(),
      name: z.string().min(1).optional(),
      quantity: z.number().int().positive().optional(),
      pricePerUnit: z.number().positive().optional(),
      color: z.string().optional(),
      size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).optional(),
      variety: z.string().optional(),
      weight: z.enum(['8oz', '12oz', '16oz', '1lb']).optional(),
    })

    const orderItemMock = orderItemSchema.default({
      productId: 'PROD-001',
      name: 'Sample Product',
      quantity: 1,
      pricePerUnit: 29.99,
      color: 'Black',
      size: 'M',
    })

    const orderSchemaMock = z.object({
      orderId: z.string().regex(/^ORD-\d{4}-\d{3}$/).default('ORD-2024-661'),
      customerInfo: customerInfoMock,
      orderDate: z.string().default('11/11/1111'),
      items: z.array(orderItemMock).min(1).default([orderItemMock.parse(undefined)]),
      paymentInfo: paymentInfoMock,
      subtotal: z.number().positive().default(29.99),
      shippingCost: z.number().nonnegative().default(5.99),
      tax: z.number().nonnegative().default(3.00),
      totalAmount: z.number().positive().default(38.98),
      status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
      trackingNumber: z.string().default('1Z999AA1234567890'),
    })

    const orders = zodObjectBuilder({
      schema: orderSchemaMock,
      config: {
        preserveNestedDefaults: false,
      },
      overrides: [
        {
          status: 'delivered',
          items: [{ size: 'L' }],
        },
      ],
    })

    expect(orders).toEqual([{ orderId: 'ORD-2024-661', customerInfo: { id: 'CUST-1234', name: 'Alice Johnson', email: 'alice.j@email.com', shippingAddress: { street: '123 Pine Street', city: 'Portland', state: 'OR', zipCode: '97201', country: 'USA' } }, orderDate: '11/11/1111', items: [{ size: 'L' }], paymentInfo: { method: 'credit_card', status: 'pending', transactionId: 'TXN-88776655' }, subtotal: 29.99, shippingCost: 5.99, tax: 3, totalAmount: 38.98, status: 'delivered', trackingNumber: '1Z999AA1234567890' }])
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

describe('mergeWithArrayHandling', () => {
  test('should replace arrays completely instead of merging them', () => {
    const base = { items: [{ id: 1, name: 'default' }] }
    const override = { items: [{ id: 2 }] }

    // When calling directly without defaults
    expect(mergeWithArrayHandling(base, override, false)).toEqual({
      items: [{ id: 2 }] as any,
    })
  })

  test('should handle multiple nested arrays', () => {
    const base = {
      categories: [
        {
          name: 'Category 1',
          items: [{ id: 1, name: 'Item 1', status: 'active' }],
        },
      ],
    }
    const override = {
      categories: [
        {
          name: 'Category 2',
          items: [{ id: 2 }],
        },
      ],
    }

    expect(mergeWithArrayHandling(base, override, false)).toEqual({
      categories: [
        {
          name: 'Category 2',
          items: [{ id: 2 }] as any,
        },
      ],
    })
  })

  // Add a new test to clarify the default behavior
  test('should apply defaults for direct array items but not nested arrays', () => {
    const base = {
      items: [{ id: 1, name: 'default', status: 'active' }],
      categories: [
        {
          name: 'Category 1',
          subItems: [{ id: 1, type: 'sub' }],
        },
      ],
    }
    const override = {
      items: [{ id: 2 }],
      categories: [
        {
          name: 'Category 2',
          subItems: [{ id: 3 }],
        },
      ],
    }

    expect(mergeWithArrayHandling(base, override, true)).toEqual({
      items: [{ id: 2, name: 'default', status: 'active' }],
      categories: [
        {
          name: 'Category 2',
          subItems: [{ id: 3 }] as any,
        },
      ],
    })
  })
})
