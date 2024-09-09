export type EnumLike<T extends string> = {
  [K in T]: K
}

export function createEnum<T extends string>(values: T[]): EnumLike<T> {
  return values.reduce((acc, value) => {
    acc[value] = value
    return acc
  }, Object.create(null) as EnumLike<T>)
}
