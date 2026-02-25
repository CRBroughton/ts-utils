import { type ZodRawShape, z } from 'zod'

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

type RequireAtLeastOne<T> = T extends object
  ? { [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>> }[keyof T]
  : T

type NonEmptyDeepPartial<T> = DeepPartial<T> & RequireAtLeastOne<T>

type NonEmptyArray<T> = [T, ...T[]]

type SupportedZodSchema = z.ZodObject<ZodRawShape> | z.ZodDefault<z.ZodObject<ZodRawShape>>

/**
 * Create type-safe transform functions based on your Zod schema.
 * Use this to create reusable, schema-validated transformations for generating mock data.
 *
 * @example
 * const UserSchema = z.object({
 *   id: z.string().default('default-id'),
 *   name: z.string().default('John Smith'),
 *   email: z.string().email().default('john@email.com'),
 *   role: z.enum(['admin', 'user']).default('user')
 * })
 *
 * const transforms: SchemaTransforms<z.infer<typeof UserSchema>> = {
 *   id: ({ index }) => `USER-${index + 1}`,
 *   email: ({ index }) => `user${index + 1}@example.com`,
 *   // role and name will use schema defaults if not specified
 * }
 *
 * const result = zodObjectBuilder({
 *   schema: UserSchema,
 *   options: {
 *     count: 3,
 *     transform: transforms
 *   }
 * })
 * // result = [
 * //   { id: 'USER-1', name: 'John Smith', email: 'user1@example.com', role: 'user' },
 * //   { id: 'USER-2', name: 'John Smith', email: 'user2@example.com', role: 'user' },
 * //   { id: 'USER-3', name: 'John Smith', email: 'user3@example.com', role: 'user' }
 * // ]
 */
export type SchemaTransforms<T> = {
  [K in keyof T]?: (params: {
    item: T
    index: number
  }) => T[K]
}

type TransformValue<T, K extends keyof T> =
  | ((params: { item: T, index: number }) => DeepPartial<T[K]>)
  | DeepPartial<T[K]>
type Transform<T extends SupportedZodSchema> = {
  [K in keyof z.infer<T>]?: TransformValue<z.infer<T>, K>
}

interface BatchOptions<T extends SupportedZodSchema> {
  /**
   * Number of items to generate in this batch.
   * @default 1
   */
  count?: number
  /**
   * Transform functions, direct values, or partial values for this specific batch.
   * Supports:
   * - Transform functions with access to the current item and index:
   *   (params: { item: T; index: number }) => T[K]
   * - Direct values: T[K]
   * - Partial values for nested objects
   * @example
   * transform: {
   *   // Transform function with access to the current item
   *   email: ({ item, index }) => `${item.name}${index}@email.com`,
   *   // Transform function using only index
   *   id: ({ index }) => `USER-${index}`,
   *   // Direct value
   *   role: 'admin',
   *   // Partial nested object
   *   settings: { theme: 'dark' }
   * }
   */
  transform?: Transform<T> // Always allow partial transforms in batches
}

/**
 * Configuration options for the zodObjectBuilder
 */
interface BaseConfig {
  /**
   * When true, preserves default values in nested objects when merging overrides.
   * This is useful when you want to retain schema defaults while overriding specific fields.
   * @default false
   */
  preserveNestedDefaults?: boolean
  /**
   * Allows global transforms to be combined with batch transforms.
   * When true, batch transforms are applied after global transforms and will override any overlapping keys.
   *
   * @example
   * // With allowOverlappingTransforms: true
   * zodObjectBuilder({
   *   schema: UserSchema,
   *   config: { allowOverlappingTransforms: true },
   *   options: {
   *     // Global transforms run first
   *     transform: {
   *       email: ({ item }) => `${item.name.toLowerCase()}@example.com`
   *     },
   *     // Batch transforms can override global transforms
   *     batchTransform: [
   *       {
   *         count: 2,
   *         transform: {
   *           name: ({ index }) => `Admin ${index + 1}`
   *         }
   *       }
   *     ]
   *   }
   * })
   *
   * @default false
   */
  allowOverlappingTransforms?: boolean
}

/**
 * Options for the zodObjectBuilder.
 */
interface Options<T extends SupportedZodSchema> {
  /**
   * Generates the specified number of mocks using schema defaults.
   * Only applies when no overrides are provided.
   * This feature does not work with batch transformations.
   * @example
   * // Generate 5 users with default values
   * zodObjectBuilder({
   *   schema: UserSchema,
   *   options: { count: 5 }
   * })
   */
  count?: number

  /**
   * Transform specific properties using the current item and index.
   * Each property must be a key from the schema.
   * @example
   * transform: {
   *   id: ({ index }) => `USER-${index + 1}`,
   *   email: ({ item, index }) => `user${item.id}-${index + 1}@example.com`
   * }
   */
  transform?: Transform<T>

  /**
   * Generate multiple batches of items with different transforms
   * @example
   * zodObjectBuilder({
   *   schema: UserSchema,
   *   options: {
   *     batchTransform: [
   *       { count: 3, transform: { role: () => 'admin' } },
   *       { count: 7, transform: { role: () => 'user' } }
   *     ]
   *   }
   * })
   */
  batchTransform?: BatchOptions<T>[]

  /**
   * Process the array of generated items before returning.
   * Useful for sorting, filtering, or adding derived data across the collection.
   *
   * @param items Array of generated mocks
   * @returns Processed array of mocks
   *
   * @example
   * zodObjectBuilder({
   *   schema: UserSchema,
   *   options: {
   *     count: 3,
   *     transform: {
   *       name: ({ index }) => `User ${index + 1}`
   *     },
   *     afterGenerate: (items) => {
   *       // Sort users by name
   *       return [...items].sort((a, b) => a.name.localeCompare(b.name))
   *     }
   *   }
   * })
   */
  afterGenerate?: (items: z.infer<T>[]) => z.infer<T>[]

  /**
   * Controls the shape of the return value when no overrides are provided.
   * - 'array': Returns an array with a single object (default behavior)
   * - 'object': Returns a plain object without wrapping it in an array
   *
   * Note: This option is ignored when overrides are provided, as overrides determine the return shape.
   *
   * @example
   * // Returns an array by default
   * const users = zodObjectBuilder({
   *   schema: UserSchema
   * })
   * // Result: [{ id: 'default-id', name: 'John' }]
   *
   * @example
   * // Returns a single object
   * const user = zodObjectBuilder({
   *   schema: UserSchema,
   *   options: { container: 'object' }
   * })
   * // Result: { id: 'default-id', name: 'John' }
   *
   * @default 'array'
   */
  container?: 'object' | 'array'
}

interface GenerateConfig<T> {
  /**
   * Transform specific properties using the current item and index.
   * Each property must be a key from the schema.
   * @example
   * transform: {
   *   id: ({ index }) => `USER-${index + 1}`,
   *   email: ({ item, index }) => `user${item.id}-${index + 1}@example.com`
   * }
   */
  transform?: SchemaTransforms<T>

  /**
   * Process the array of generated items before returning.
   * Useful for sorting, filtering, or adding derived data across the collection.
   *
   * @param items Array of generated mocks
   * @returns Processed array of mocks
   *
   * @example
   * zodObjectBuilder({
   *   schema: UserSchema,
   *   options: {
   *     count: 3,
   *     transform: {
   *       name: ({ index }) => `User ${index + 1}`
   *     },
   *     afterGenerate: (items) => {
   *       // Sort users by name
   *       return [...items].sort((a, b) => a.name.localeCompare(b.name))
   *     }
   *   }
   * })
   */
  afterGenerate?: (items: T[]) => T[]
}
export function generateMocks<T>(
  base: T,
  count: number,
  options: GenerateConfig<T> & { index?: number },
): T[] {
  const items: T[] = []

  for (let i = 0; i < count; i++) {
    const item = { ...base }
    if (options.transform) {
      for (const [key, fn] of Object.entries(options.transform)) {
        const transformFn = fn as (params: { item: T, index: number }) => T[keyof T]
        item[key as keyof T] = transformFn({
          item,
          index: options.index !== undefined ? options.index : i,
        })
      }
    }
    items.push(item)
  }

  return items
}
/**
 * Creates objects from a Zod schema with optional overrides. This utility function helps generate
 * test data or default objects while allowing partial overrides of specific fields.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.overrides - Optional override values. Can be a single object or array of objects. Overrides do not work with any of the configuration options.
 * @param params.options - Options for controlling how mocks are generated
 * @param params.config - Optional configuration object
 * @param params.config.preserveNestedDefaults - When true, preserves default values in nested objects when merging overrides
 * @param params.config.allowOverlappingTransforms - When true, allows global transforms to be combined with batch transforms
 *
 * @returns If overrides is an array, returns an array of objects. If overrides is a single object,
 *          returns a single object. If no overrides provided, returns an array with one default object.
 *
 * @example
 * // Define a schema
 * const UserSchema = z.object({
 *   id: z.string(),
 *   name: z.string().default("Craig R Broughton"),
 *   settings: z.object({
 *     theme: z.enum(['light', 'dark']),
 *     notifications: z.boolean()
 *   }).default({
 *     theme: 'dark',
 *     notifications: true
 *   })
 * });
 *
 * // Create a single object with overrides
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } }
 * });
 *
 * // Create multiple objects with overrides
 * const users = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: [
 *     { name: 'John' },
 *     { name: 'Jane', settings: { theme: 'light' } }
 *   ]
 * });
 *
 * // Create default object(nested in an array) with no overrides
 * const defaultUsers = zodObjectBuilder({
 *   schema: UserSchema
 * });
 *
 * // Preserve nested defaults with overrides
 * const userWithDefaults = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } },
 *   config: { preserveNestedDefaults: true }
 * });
 * // Generate multiple objects with sequential values
 * const sequentialUsers = zodObjectBuilder({
 *   schema: UserSchema,
 *   options: {
 *     count: 3,
 *     transform: {
 *       id: (i) => `USER-${i + 1}`,
 *       name: (i) => `User ${i + 1}`
 *     }
 *   }
 * });
 */
export function zodObjectBuilder<T extends SupportedZodSchema>(params: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Configuration options for controlling how mocks are generated */
  config?: BaseConfig
  /** Options for controlling how mocks are generated */
  options?: Options<T>
  /** Optional override values. Must contain at least one key. Use options.container = 'object' if you want a single object without overrides. */
  overrides: NonEmptyDeepPartial<z.infer<T>>
}): z.infer<T>

/**
 * Creates objects from a Zod schema with optional overrides. This utility function helps generate
 * test data or default objects while allowing partial overrides of specific fields.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.overrides - Optional override values. Can be a single object or array of objects. Overrides do not work with any of the configuration options.
 * @param params.options - Options for controlling how mocks are generated
 * @param params.config - Optional configuration object
 * @param params.config.preserveNestedDefaults - When true, preserves default values in nested objects when merging overrides
 * @param params.config.allowOverlappingTransforms - When true, allows global transforms to be combined with batch transforms
 *
 * @returns If overrides is an array, returns an array of objects. If overrides is a single object,
 *          returns a single object. If no overrides provided, returns an array with one default object.
 *
 * @example
 * // Define a schema
 * const UserSchema = z.object({
 *   id: z.string(),
 *   name: z.string().default("Craig R Broughton"),
 *   settings: z.object({
 *     theme: z.enum(['light', 'dark']),
 *     notifications: z.boolean()
 *   }).default({
 *     theme: 'dark',
 *     notifications: true
 *   })
 * });
 *
 * // Create a single object with overrides
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } }
 * });
 *
 * // Create multiple objects with overrides
 * const users = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: [
 *     { name: 'John' },
 *     { name: 'Jane', settings: { theme: 'light' } }
 *   ]
 * });
 *
 * // Create default object(nested in an array) with no overrides
 * const defaultUsers = zodObjectBuilder({
 *   schema: UserSchema
 * });
 *
 * // Preserve nested defaults with overrides
 * const userWithDefaults = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } },
 *   config: { preserveNestedDefaults: true }
 * });
 * // Generate multiple objects with sequential values
 * const sequentialUsers = zodObjectBuilder({
 *   schema: UserSchema,
 *   options: {
 *     count: 3,
 *     transform: {
 *       id: (i) => `USER-${i + 1}`,
 *       name: (i) => `User ${i + 1}`
 *     }
 *   }
 * });
 */
export function zodObjectBuilder<T extends SupportedZodSchema>(params: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Configuration options */
  config?: BaseConfig
  /** Options for controlling how mocks are generated */
  options?: Options<T>
  /** Optional override values. Must be a non-empty array with each element containing at least one key. Runtime validation enforces non-empty arrays and objects. */
  overrides: NonEmptyArray<DeepPartial<z.infer<T>>>
}): z.infer<T>[]

/**
 * Creates objects from a Zod schema with container: 'object' option.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.config - Optional configuration object
 * @param params.options - Options object with container set to 'object'
 *
 * @returns A single object
 *
 * @example
 * const UserSchema = z.object({
 *   id: z.string().default('id'),
 *   name: z.string().default('John')
 * });
 *
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   options: { container: 'object' }
 * });
 * // Result: { id: 'id', name: 'John' }
 */
export function zodObjectBuilder<T extends SupportedZodSchema>(params: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Configuration options */
  config?: BaseConfig
  /** Options with container set to 'object' */
  options: Options<T> & { container: 'object' }
}): z.infer<T>

/**
 * Creates objects from a Zod schema with optional overrides. This utility function helps generate
 * test data or default objects while allowing partial overrides of specific fields.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.overrides - Optional override values. Can be a single object or array of objects. Overrides do not work with any of the configuration options.
 * @param params.options - Options for controlling how mocks are generated
 * @param params.config - Optional configuration object
 * @param params.config.preserveNestedDefaults - When true, preserves default values in nested objects when merging overrides
 * @param params.config.allowOverlappingTransforms - When true, allows global transforms to be combined with batch transforms
 *
 * @returns If overrides is an array, returns an array of objects. If overrides is a single object,
 *          returns a single object. If no overrides provided, returns an array with one default object.
 *
 * @example
 * // Define a schema
 * const UserSchema = z.object({
 *   id: z.string(),
 *   name: z.string().default("Craig R Broughton"),
 *   settings: z.object({
 *     theme: z.enum(['light', 'dark']),
 *     notifications: z.boolean()
 *   }).default({
 *     theme: 'dark',
 *     notifications: true
 *   })
 * });
 *
 * // Create a single object with overrides
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } }
 * });
 *
 * // Create multiple objects with overrides
 * const users = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: [
 *     { name: 'John' },
 *     { name: 'Jane', settings: { theme: 'light' } }
 *   ]
 * });
 *
 * // Create default object(nested in an array) with no overrides
 * const defaultUsers = zodObjectBuilder({
 *   schema: UserSchema
 * });
 *
 * // Preserve nested defaults with overrides
 * const userWithDefaults = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } },
 *   config: { preserveNestedDefaults: true }
 * });
 * // Generate multiple objects with sequential values
 * const sequentialUsers = zodObjectBuilder({
 *   schema: UserSchema,
 *   options: {
 *     count: 3,
 *     transform: {
 *       id: (i) => `USER-${i + 1}`,
 *       name: (i) => `User ${i + 1}`
 *     }
 *   }
 * });
 */
export function zodObjectBuilder<T extends SupportedZodSchema>(params: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Configuration options for controlling how mocks are generated */
  config?: BaseConfig
  /** Options for controlling how mocks are generated */
  options?: Options<T>
}): z.infer<T>[]

/**
 * Creates objects from a Zod schema with optional overrides. This utility function helps generate
 * test data or default objects while allowing partial overrides of specific fields.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.overrides - Optional override values. Can be a single object or array of objects. Overrides do not work with any of the configuration options.
 * @param params.options - Options for controlling how mocks are generated
 * @param params.config - Optional configuration object
 * @param params.config.preserveNestedDefaults - When true, preserves default values in nested objects when merging overrides
 * @param params.config.allowOverlappingTransforms - When true, allows global transforms to be combined with batch transforms
 *
 * @returns If overrides is an array, returns an array of objects. If overrides is a single object,
 *          returns a single object. If no overrides provided, returns an array with one default object.
 *
 * @example
 * // Define a schema
 * const UserSchema = z.object({
 *   id: z.string(),
 *   name: z.string().default("Craig R Broughton"),
 *   settings: z.object({
 *     theme: z.enum(['light', 'dark']),
 *     notifications: z.boolean()
 *   }).default({
 *     theme: 'dark',
 *     notifications: true
 *   })
 * });
 *
 * // Create a single object with overrides
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } }
 * });
 *
 * // Create multiple objects with overrides
 * const users = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: [
 *     { name: 'John' },
 *     { name: 'Jane', settings: { theme: 'light' } }
 *   ]
 * });
 *
 * // Create default object(nested in an array) with no overrides
 * const defaultUsers = zodObjectBuilder({
 *   schema: UserSchema
 * });
 *
 * // Preserve nested defaults with overrides
 * const userWithDefaults = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } },
 *   config: { preserveNestedDefaults: true }
 * });
 * // Generate multiple objects with sequential values
 * const sequentialUsers = zodObjectBuilder({
 *   schema: UserSchema,
 *   options: {
 *     count: 3,
 *     transform: {
 *       id: (i) => `USER-${i + 1}`,
 *       name: (i) => `User ${i + 1}`
 *     }
 *   }
 * });
 */
export function zodObjectBuilder<T extends SupportedZodSchema>({
  schema,
  config = { preserveNestedDefaults: false, allowOverlappingTransforms: false },
  options = {},
  overrides,
}: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Configuration options */
  config?: BaseConfig
  /** Options for controlling how mocks are generated */
  options?: Options<T>
  /** Optional override values. Can be a single object or array of objects. Overrides do not work with any of the configuration options. */
  overrides?: DeepPartial<z.infer<T>> | DeepPartial<z.infer<T>>[]
}): z.infer<T>[] | z.infer<T> {
  if (overrides) {
    if (Array.isArray(overrides)) {
      // Require at least one element when using array overrides
      if (overrides.length === 0)
        throw new Error('When using overrides as an array, at least one element must be provided. Remove the overrides parameter if you want to use default values.')

      // Validate that each override element has at least one key
      overrides.forEach((override, index) => {
        if (override && typeof override === 'object' && Object.keys(override).length === 0)
          throw new Error(`Override at index ${index} is an empty object. Each override element must contain at least one key.`)
      })

      const objects: z.infer<T>[] = []
      overrides.forEach((override) => {
        if (config.preserveNestedDefaults) {
          const base = buildDefaultObject(schema)
          const newObject = mergeWithArrayHandling(base, override)
          objects.push(newObject)
        }
        else {
          const base = schema.parse({})
          objects.push({ ...base, ...override } as z.infer<T>)
        }
      })

      if (options.afterGenerate)
        return options.afterGenerate(objects)

      return objects
    }
    else {
      // Require at least one valid key when using single object override
      if (Object.keys(overrides).length === 0)
        throw new Error('When using overrides as a single object, at least one valid key must be provided. Use options: { container: \'object\' } instead if you want to return a single object without overrides.')

      if (config.preserveNestedDefaults) {
        const base = buildDefaultObject(schema)
        return mergeWithArrayHandling(base, overrides)
      }
      else {
        const base = buildDefaultObject(schema)
        return { ...base, ...overrides }
      }
    }
  }

  if (options.batchTransform) {
    const base = buildDefaultObject(schema)
    const allItems: z.infer<T>[] = []
    let globalIndex = 0

    for (const batch of options.batchTransform) {
      const batchCount = batch.count ?? 1
      for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
        let item = { ...base }

        if (batch.transform) {
          const transformedValues = {} as Record<keyof z.infer<T>, z.infer<T>[keyof z.infer<T>]>
          for (const [key, value] of Object.entries(batch.transform)) {
            if (typeof value === 'function') {
              const transformFn = value as (params: { item: z.infer<T>, index: number }) => z.infer<T>[keyof z.infer<T>]
              transformedValues[key as keyof z.infer<T>] = transformFn({ item, index: batchIndex })
            }
            else {
              transformedValues[key as keyof z.infer<T>] = value
            }
          }

          item = config.preserveNestedDefaults
            ? mergeWithArrayHandling(item, transformedValues as DeepPartial<z.infer<T>>)
            : { ...item, ...transformedValues }
        }

        if (config.allowOverlappingTransforms && options.transform) {
          for (const [key, fn] of Object.entries(options.transform)) {
            if (batch.transform && key in batch.transform)
              continue
            const transformFn = fn as (params: { item: z.infer<T>, index: number }) => z.infer<T>[keyof z.infer<T>]
            item[key as keyof z.infer<T>] = transformFn({ item, index: globalIndex })
          }
        }

        allItems.push(item)
        globalIndex++
      }
    }

    if (options.afterGenerate)
      return options.afterGenerate(allItems)

    return allItems
  }
  const base = buildDefaultObject(schema)

  if (options.count && options.count > 0) {
    const items = generateMocks(base, options.count, options as GenerateConfig<z.infer<T>>)
    if (options.afterGenerate)
      return options.afterGenerate(items)

    return items
  }

  // Handle container option
  if (options.container === 'object')
    return base

  return [base]
}

/**
 * Internal helper function that builds a default object from a Zod schema by attempting to parse
 * empty objects for each field. For nested objects, it recursively builds default objects.
 *
 * @param schema - Zod schema to build defaults from
 * @returns A complete object with default values for all fields
 */
export function buildDefaultObject<T extends SupportedZodSchema>(schema: T): z.infer<T> {
  // Handle ZodDefault by using its default value directly
  if (schema instanceof z.ZodDefault)
    return schema.parse(undefined) as z.infer<T>
  // Handle regular ZodObject
  const zodObject = schema as z.ZodObject<ZodRawShape>
  const shape = zodObject.shape
  const defaultBase: Record<string, any> = {}

  for (const key in shape) {
    const field = shape[key]
    if (field instanceof z.ZodObject) {
      defaultBase[key] = buildDefaultObject(field)
    }
    else {
      try {
        defaultBase[key] = (field as z.ZodType)?.parse({})
      }
      catch {
        defaultBase[key] = undefined
      }
    }
  }

  return schema.parse(defaultBase) as z.infer<T>
}

/**
 * Merges objects while handling arrays and nested structures with special rules for defaults.
 * When arrays are encountered in the override object, they can either replace the base array completely
 * or have their items merged with default values from the base array's first item.
 *
 * @param base - The base object containing default values
 * @param override - An object or array of objects whose values will override the base. Can be deeply partial.
 * @param shouldApplyDefaults - When true (default), array items inherit missing properties from base array's first item.
 *                             When false, arrays are replaced without inheriting defaults.
 *
 * @returns A new object containing the merged values. Array handling depends on shouldApplyDefaults:
 *          - With shouldApplyDefaults=true: Array items inherit missing properties from base
 *          - With shouldApplyDefaults=false: Arrays are replaced completely
 *
 * @example
 * // Example with defaults enabled
 * const base = {
 *   items: [{id: 1, name: 'default', type: 'item'}]
 * };
 * const override = {
 *   items: [{id: 2}, {id: 3, name: 'custom'}]
 * };
 * mergeWithArrayHandling(base, override);
 * // Result: {
 * //   items: [
 * //     {id: 2, name: 'default', type: 'item'},
 * //     {id: 3, name: 'custom', type: 'item'}
 * //   ]
 * // }
 *
 * @example
 * // Example with defaults disabled
 * mergeWithArrayHandling(base, override, false);
 * // Result: {
 * //   items: [{id: 2}, {id: 3, name: 'custom'}]
 * // }
 */
export function mergeWithArrayHandling<T>(
  base: T,
  override: DeepPartial<T> | DeepPartial<T>[],
  shouldApplyDefaults = true,
): T {
  if (!override)
    return base

  const result = { ...base }
  const overrideObj = override as DeepPartial<T>

  for (const key in overrideObj) {
    const k = key as keyof T & keyof DeepPartial<T>

    if (Array.isArray(overrideObj[k])) {
      result[k] = overrideObj[k] as T[keyof T]

      if (shouldApplyDefaults && Array.isArray(result[k]) && Array.isArray(base[k]) && base[k]?.[0]) {
        result[k] = (result[k] as unknown[]).map((item) => {
          if (item && typeof item === 'object') {
            const baseItem = (base[k] as unknown[])[0]
            if (baseItem && typeof baseItem === 'object')
              return { ...baseItem, ...item } as T[keyof T]
          }
          return item
        }) as T[keyof T]
      }
    }
    else if (overrideObj[k] && typeof overrideObj[k] === 'object') {
      result[k] = mergeWithArrayHandling(
        (result[k] || {}) as any,
        overrideObj[k] as any,
        shouldApplyDefaults,
      )
    }
    else {
      result[k] = overrideObj[k] as T[keyof T]
    }
  }

  return result
}
