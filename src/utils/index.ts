/**
 * Flattens complex types for better type hints and IntelliSense
 * 
 * @example
 * ```ts
 * type Complex = { a: string } & { b: number }
 * // Without Prettify: hover shows { a: string } & { b: number }
 * 
 * type Pretty = Prettify<Complex>
 * // With Prettify: hover shows { a: string, b: number }
 * ```
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & NonNullable<unknown>