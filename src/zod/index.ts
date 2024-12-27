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
        // Now override is a single object, not an array
        const newObject = mergeWithArrayHandling(base, override)
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
      return mergeWithArrayHandling(base, overrides)
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
  shouldApplyDefaults = true
): T {
  if (!override) return base
  
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
            if (baseItem && typeof baseItem === 'object') {
              return { ...baseItem, ...item } as T[keyof T]
            }
          }
          return item
        }) as T[keyof T]
      }
    } else if (overrideObj[k] && typeof overrideObj[k] === 'object') {
      result[k] = mergeWithArrayHandling(
        (result[k] || {}) as any,
        overrideObj[k] as any,
        shouldApplyDefaults
      )
    } else {
      result[k] = overrideObj[k] as T[keyof T]
    }
  }

  return result
}