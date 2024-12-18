import type { ZodObject, ZodRawShape, z } from 'zod'

export function zodObjectBuilder<T extends ZodObject<ZodRawShape>>({
  schema,
  overrides,
}: {
  schema: T
  overrides?: Partial<z.infer<T>>[]
}): z.infer<T>[] {
  const objects: z.infer<T>[] = []
  const base = schema.parse({})

  if (overrides) {
    overrides.forEach((override) => {
      objects.push({ ...base, ...override })
    })
  }
  else {
    objects.push({ ...base })
  }

  return objects
}
