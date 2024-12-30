import { type ZodRawShape, z } from 'zod'

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

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
 *   config: {
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

type Transform<T extends z.ZodObject<ZodRawShape>> = {
  [K in keyof z.infer<T>]?: (params: {
    item: z.infer<T>
    index: number
  }) => z.infer<T>[K]
}


interface BatchConfig<T extends z.ZodObject<ZodRawShape>> {
  /**
   * Number of items to generate in this batch
   */
  count: number
  /**
   * Transform functions for this specific batch
   */
  transform?: Transform<T>
}

/**
 * Configuration options for the zodObjectBuilder.
 */
interface BaseConfig<T extends z.ZodObject<ZodRawShape>> {
  /**
   * When true, preserves default values in nested objects when merging overrides.
   * This is useful when you want to retain schema defaults while overriding specific fields.
   * @default false
   */
  preserveNestedDefaults?: boolean

  /**
   * Generates the specified number of mocks using schema defaults.
   * Only applies when no overrides are provided.
   * @example
   * // Generate 5 users with default values
   * zodObjectBuilder({
   *   schema: UserSchema,
   *   config: { count: 5 }
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
   *   config: {
   *     batchTransform: [
   *       { count: 3, transform: { role: () => 'admin' } },
   *       { count: 7, transform: { role: () => 'user' } }
   *     ]
   *   }
   * })
   */
    batchTransform?: BatchConfig<T>[]

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
  *   config: {
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
  *   config: {
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
  config: GenerateConfig<T>,
): T[] {
  const items: T[] = []

  for (let i = 0; i < count; i++) {
    const item = { ...base }
    if (config.transform) {
      for (const [key, fn] of Object.entries(config.transform,
      )) {
        const transformFn = fn as (params: { item: T, index: number }) => T[keyof T]
        item[key as keyof T] = transformFn({ item, index: i })
      }
    }

    items.push(item)
  }

  
 if (config.afterGenerate) {
  return config.afterGenerate(items)
}

  return items
}
/**
 * Creates objects from a Zod schema with optional overrides. This utility function helps generate
 * test data or default objects while allowing partial overrides of specific fields.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.overrides - Optional override values. Can be either a single partial object or an array of partial objects
 * @param params.config - Optional configuration object
 * @param params.config.preserveNestedDefaults - When true, preserves default values in nested objects when merging overrides
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
 *   config: {
 *     count: 3,
 *     transform: {
 *       id: (i) => `USER-${i + 1}`,
 *       name: (i) => `User ${i + 1}`
 *     }
 *   }
 * });
 */
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Optional override values. Can be a single object or array of objects */
  overrides: DeepPartial<z.infer<T>>
  /** Configuration options for controlling how mocks are generated */
  config?: BaseConfig<T>
}): z.infer<T>

/**
 * Creates objects from a Zod schema with optional overrides. This utility function helps generate
 * test data or default objects while allowing partial overrides of specific fields.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.overrides - Optional override values. Can be either a single partial object or an array of partial objects
 * @param params.config - Optional configuration object
 * @param params.config.preserveNestedDefaults - When true, preserves default values in nested objects when merging overrides
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
 *   config: {
 *     count: 3,
 *     transform: {
 *       id: (i) => `USER-${i + 1}`,
 *       name: (i) => `User ${i + 1}`
 *     }
 *   }
 * });
 */
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Optional override values. Can be a single object or array of objects */
  overrides: DeepPartial<z.infer<T>>[]
  /** Configuration options for controlling how mocks are generated */
  config?: BaseConfig<T>
}): z.infer<T>[]

/**
 * Creates objects from a Zod schema with optional overrides. This utility function helps generate
 * test data or default objects while allowing partial overrides of specific fields.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.overrides - Optional override values. Can be either a single partial object or an array of partial objects
 * @param params.config - Optional configuration object
 * @param params.config.preserveNestedDefaults - When true, preserves default values in nested objects when merging overrides
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
 *   config: {
 *     count: 3,
 *     transform: {
 *       id: (i) => `USER-${i + 1}`,
 *       name: (i) => `User ${i + 1}`
 *     }
 *   }
 * });
 */
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Configuration options for controlling how mocks are generated */
  config?: BaseConfig<T>
}): z.infer<T>[]

/**
 * Creates objects from a Zod schema with optional overrides. This utility function helps generate
 * test data or default objects while allowing partial overrides of specific fields.
 *
 * @param params Configuration object for the builder
 * @param params.schema - Zod schema that defines the shape and validation rules for the objects
 * @param params.overrides - Optional override values. Can be either a single partial object or an array of partial objects
 * @param params.config - Optional configuration object
 * @param params.config.preserveNestedDefaults - When true, preserves default values in nested objects when merging overrides
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
 *   config: {
 *     count: 3,
 *     transform: {
 *       id: (i) => `USER-${i + 1}`,
 *       name: (i) => `User ${i + 1}`
 *     }
 *   }
 * });
 */
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>({
  schema,
  overrides,
  config = { preserveNestedDefaults: false },
}: {
  /** The Zod schema that defines the shape of the returned mocks */
  schema: T
  /** Optional override values. Can be a single object or array of objects */
  overrides?: DeepPartial<z.infer<T>> | DeepPartial<z.infer<T>>[]
  /** Configuration options for controlling how mocks are generated */
  config?: BaseConfig<T>
}): z.infer<T>[] | z.infer<T> {
  if (overrides) {
    if (Array.isArray(overrides)) {
      const objects: z.infer<T>[] = []
      overrides.forEach((override) => {
        if (config.preserveNestedDefaults) {
          const base = buildDefaultObject(schema)
          const newObject = mergeWithArrayHandling(base, override)
          objects.push(newObject)
        }
        else {
          const base = schema.parse({})
          objects.push({ ...base, ...override })
        }
      })

      if (config.afterGenerate) {
        return config.afterGenerate(objects)
      }

      return objects
    }
    else {
      if (config.preserveNestedDefaults) {
        const base = buildDefaultObject(schema)
        return mergeWithArrayHandling(base, overrides)
      }
      else {
        const base = schema.parse({})
        return { ...base, ...overrides }
      }
    }
  }

  if (config.batchTransform) {
    const base = buildDefaultObject(schema)
    const allItems: z.infer<T>[] = []

    for (const batch of config.batchTransform) {
      const batchItems = generateMocks(base, batch.count, {
        transform: batch.transform
      })
      allItems.push(...batchItems)
    }

    if (config.afterGenerate) {
      return config.afterGenerate(allItems)
    }

    return allItems
  }

  const base = buildDefaultObject(schema)

  if (config.count && config.count > 0) {
    const items = generateMocks(base, config.count, config)
    if (config.afterGenerate) {
      return config.afterGenerate(items)
    }
    return items
  }

  return [base]
}

/**
 * Internal helper function that builds a default object from a Zod schema by attempting to parse
 * empty objects for each field. For nested objects, it recursively builds default objects.
 *
 * @param schema - Zod schema to build defaults from
 * @returns A complete object with default values for all fields
 */
export function buildDefaultObject<T extends z.ZodObject<ZodRawShape>>(schema: T): z.infer<T> {
  const shape = schema.shape
  const defaultBase: Record<string, any> = {}

  for (const key in shape) {
    const field = shape[key]
    if (field instanceof z.ZodObject) {
      defaultBase[key] = buildDefaultObject(field)
    }
    else {
      try {
        defaultBase[key] = field?.parse({})
      }
      catch {
        defaultBase[key] = undefined
      }
    }
  }

  return schema.parse(defaultBase)
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
