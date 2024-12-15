import type { ZodObject, z } from 'zod'

export function zodObjectBuilder<T extends ZodObject<any>>({
  schema,
  overrides,
  partial,
}: {
  schema: T
  overrides?: Partial<z.infer<T>>[]
  partial: true
}): Partial<z.infer<T>>[]

export function zodObjectBuilder<T extends ZodObject<any>>({
  schema,
  overrides,
  partial,
}: {
  schema: T
  overrides?: Partial<z.infer<T>>[]
  partial?: false
}): z.infer<T>[]

export function zodObjectBuilder<T extends ZodObject<any>>({
  schema,
  overrides,
  partial = false,
}: {
  schema: T
  overrides?: Partial<z.infer<T>>[]
  partial?: boolean
}) {
  const objects = [] as (typeof partial extends true ? Partial<z.infer<T>>[] : z.infer<T>[])
  const base = partial
    ? schema.partial().parse({})
    : schema.parse({})

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
