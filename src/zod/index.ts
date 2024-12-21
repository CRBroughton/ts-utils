import { type ZodRawShape, z } from 'zod'
import { merge } from 'ts-deepmerge'

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

interface BaseConfig {
  preserveNestedDefaults?: boolean
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
 *   name: z.string(),
 *   settings: z.object({
 *     theme: z.enum(['light', 'dark']),
 *     notifications: z.boolean()
 *   })
 * });
 *
 * // Create a single object with overrides
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } }
 * });
 *
 * // Create multiple objects
 * const users = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: [
 *     { name: 'John' },
 *     { name: 'Jane', settings: { theme: 'light' } }
 *   ]
 * });
 *
 * // Create default object with no overrides
 * const defaultUsers = zodObjectBuilder({
 *   schema: UserSchema
 * });
 *
 * // Preserve nested defaults
 * const userWithDefaults = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John' },
 *   config: { preserveNestedDefaults: true }
 * });
 */
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  schema: T
  overrides: DeepPartial<z.infer<T>>
  config?: BaseConfig
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
 *   name: z.string(),
 *   settings: z.object({
 *     theme: z.enum(['light', 'dark']),
 *     notifications: z.boolean()
 *   })
 * });
 *
 * // Create a single object with overrides
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } }
 * });
 *
 * // Create multiple objects
 * const users = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: [
 *     { name: 'John' },
 *     { name: 'Jane', settings: { theme: 'light' } }
 *   ]
 * });
 *
 * // Create default object with no overrides
 * const defaultUsers = zodObjectBuilder({
 *   schema: UserSchema
 * });
 *
 * // Preserve nested defaults
 * const userWithDefaults = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John' },
 *   config: { preserveNestedDefaults: true }
 * });
 */
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  schema: T
  overrides: DeepPartial<z.infer<T>>[]
  config?: BaseConfig
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
 *   name: z.string(),
 *   settings: z.object({
 *     theme: z.enum(['light', 'dark']),
 *     notifications: z.boolean()
 *   })
 * });
 *
 * // Create a single object with overrides
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } }
 * });
 *
 * // Create multiple objects
 * const users = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: [
 *     { name: 'John' },
 *     { name: 'Jane', settings: { theme: 'light' } }
 *   ]
 * });
 *
 * // Create default object with no overrides
 * const defaultUsers = zodObjectBuilder({
 *   schema: UserSchema
 * });
 *
 * // Preserve nested defaults
 * const userWithDefaults = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John' },
 *   config: { preserveNestedDefaults: true }
 * });
 */
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  schema: T
  config?: BaseConfig
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
 *   name: z.string(),
 *   settings: z.object({
 *     theme: z.enum(['light', 'dark']),
 *     notifications: z.boolean()
 *   })
 * });
 *
 * // Create a single object with overrides
 * const user = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John', settings: { theme: 'dark' } }
 * });
 *
 * // Create multiple objects
 * const users = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: [
 *     { name: 'John' },
 *     { name: 'Jane', settings: { theme: 'light' } }
 *   ]
 * });
 *
 * // Create default object with no overrides
 * const defaultUsers = zodObjectBuilder({
 *   schema: UserSchema
 * });
 *
 * // Preserve nested defaults
 * const userWithDefaults = zodObjectBuilder({
 *   schema: UserSchema,
 *   overrides: { name: 'John' },
 *   config: { preserveNestedDefaults: true }
 * });
 */
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>({
  schema,
  overrides,
  config = { preserveNestedDefaults: false },
}: {
  schema: T
  overrides?: DeepPartial<z.infer<T>> | DeepPartial<z.infer<T>>[]
  config?: BaseConfig
}): z.infer<T>[] | z.infer<T> {
  if (overrides && Array.isArray(overrides)) {
    const objects: z.infer<T>[] = []
    overrides.forEach((override) => {
      if (config.preserveNestedDefaults) {
        const base = buildDefaultObject(schema)
        const newObject = merge(base, override)
        objects.push(newObject)
      }
      else {
        const base = schema.parse({})
        objects.push({ ...base, ...override })
      }
    })
    return objects
  }
  else if (overrides) {
    if (config.preserveNestedDefaults) {
      const base = buildDefaultObject(schema)
      return merge(base, overrides)
    }
    else {
      const base = schema.parse({})
      return { ...base, ...overrides }
    }
  }
  else {
    const base = buildDefaultObject(schema)
    return [base]
  }
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
