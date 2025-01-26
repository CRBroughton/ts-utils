export type EnumLike<T extends string> = {
  [K in T]: K
}

/**
 * Creates an enum-like object from string array where each key equals its value
 * 
 * @example
 * ```ts
 * const colours = createEnum(['RED', 'GREEN', 'BLUE'])
 * // Results in: { RED: 'RED', GREEN: 'GREEN', BLUE: 'BLUE' }
 * 
 * // Type-safe usage:
 * function paint(color: keyof typeof colours) {
 *   console.log(`Painting with ${colours[color]}`)
 * }
 * ```
 * 
 * @param values - Array of strings to convert to enum
 * @returns Object with keys matching values
 */
export function createEnum<T extends string>(values: T[]): EnumLike<T> {
  return values.reduce((acc, value) => {
    acc[value] = value
    return acc
  }, Object.create(null) as EnumLike<T>)
}
