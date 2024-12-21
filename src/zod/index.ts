import { type ZodRawShape, z } from 'zod'
import { merge } from 'ts-deepmerge'

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

interface BaseConfig {
  preserveNestedDefaults?: boolean
}

// Overload for single override - returns single object
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  schema: T
  overrides: DeepPartial<z.infer<T>>
  config?: BaseConfig
}): z.infer<T>

// Overload for array of overrides
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  schema: T
  overrides: DeepPartial<z.infer<T>>[]
  config?: BaseConfig
}): z.infer<T>[]

// Overload for no overrides
export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>(params: {
  schema: T
  config?: BaseConfig
}): z.infer<T>[]

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
        defaultBase[key] = field.parse({})
      }
      catch {
        defaultBase[key] = undefined
      }
    }
  }

  return schema.parse(defaultBase)
}
