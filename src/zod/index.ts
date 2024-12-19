import { type ZodRawShape, z } from 'zod'
import { merge } from 'ts-deepmerge'

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

interface ZodObjectBuilder<T extends z.ZodObject<ZodRawShape>> {
  schema: T
  overrides?: DeepPartial<z.infer<T>>[]
  config?: {
    preserveNestedDefaults?: boolean
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

export function zodObjectBuilder<T extends z.ZodObject<ZodRawShape>>({
  schema,
  overrides,
  config = { preserveNestedDefaults: false },
}: ZodObjectBuilder<T>): z.infer<T>[] {
  const objects: z.infer<T>[] = []

  if (overrides) {
    overrides.forEach((override) => {
      let newObject: z.infer<T>

      if (config.preserveNestedDefaults) {
        const base = buildDefaultObject(schema)
        newObject = merge(base, override)
        objects.push(newObject)
      }
      else {
        const base = schema.parse({})
        objects.push({ ...base, ...override })
      }
    })
  }
  else {
    const base = buildDefaultObject(schema)
    objects.push(base)
  }

  return objects
}
