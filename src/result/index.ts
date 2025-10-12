/* eslint-disable ts/no-redeclare */

/**
 * Represents a successful result containing a value.
 * @template T The type of the success value
 */
export interface Ok<T> {
  ok: true
  value: T
}

/**
 * Type guard to check if a Result is Ok.
 * Narrows the type to Ok<T> when true.
 *
 * @template T The type of the success value
 * @template E The type of the error
 * @param result The Result to check
 * @returns true if the result is Ok, false otherwise
 *
 * @example
 * ```ts
 * const result = await safeAwait(fetchUser())
 *
 * if (isOk(result)) {
 *   // TypeScript knows result is Ok<User>
 *   console.log(result.value.name)
 * }
 * ```
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true
}

/**
 * Extracts the value from a Result if Ok, otherwise returns null.
 * Convenient for converting Result to nullable value.
 *
 * @template T The type of the success value
 * @template E The type of the error
 * @param result The Result to extract from
 * @returns The value if Ok, null if Err
 *
 * @example
 * ```ts
 * const result = await safeAwait(fetchUser())
 * const user = ok(result) // User | null
 *
 * // Use with nullish coalescing
 * const userName = ok(result)?.name ?? 'Guest'
 * ```
 */
export function ok<T, E>(result: Result<T, E>): T | null {
  return result.ok === true ? result.value : null
}

/**
 * Represents a failed result containing an error.
 * @template E The type of the error
 */
export interface Err<E> {
  ok: false
  error: E
}

/**
 * Type guard to check if a Result is Err.
 * Narrows the type to Err<E> when true.
 *
 * @template T The type of the success value
 * @template E The type of the error
 * @param result The Result to check
 * @returns true if the result is Err, false otherwise
 *
 * @example
 * ```ts
 * const result = await safeAwait(fetchUser())
 *
 * if (isErr(result)) {
 *   // TypeScript knows result is Err<Error>
 *   console.error(result.error.message)
 * }
 * ```
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false
}

/**
 * Extracts the error from a Result if Err, otherwise returns null.
 * Convenient for converting Result to nullable error.
 *
 * @template T The type of the success value
 * @template E The type of the error
 * @param result The Result to extract from
 * @returns The error if Err, null if Ok
 *
 * @example
 * ```ts
 * const result = await safeAwait(fetchUser())
 * const error = err(result) // Error | null
 *
 * if (error) {
 *   console.error('Failed:', error.message)
 * }
 * ```
 */
export function err<T, E>(result: Result<T, E>): E | null {
  return result.ok === true ? null : result.error
}

/**
 * A Result type representing either success (Ok) or failure (Err).
 * Inspired by Rust's Result<T, E> type for explicit error handling.
 *
 * @template T The type of the success value
 * @template E The type of the error (defaults to Error)
 *
 * @example
 * ```ts
 * const result: Result<number, string> = Ok(42)
 *
 * if (result.ok === false) {
 *   console.error(result.error) // TypeScript knows this is string
 * } else {
 *   console.log(result.value) // TypeScript knows this is number
 * }
 * ```
 */
export type Result<T, E = Error> = Ok<T> | Err<E>

/**
 * Creates a successful Result with the given value.
 *
 * @template T The type of the value
 * @param value The success value to wrap
 * @returns An Ok result containing the value
 *
 * @example
 * ```ts
 * const result = Ok(42)
 * // result is { ok: true, value: 42 }
 * ```
 */
export const Ok = <T>(value: T): Ok<T> => ({ ok: true as const, value })

/**
 * Creates a failed Result with the given error.
 *
 * @template E The type of the error
 * @param error The error to wrap
 * @returns An Err result containing the error
 *
 * @example
 * ```ts
 * const result = Err('Something went wrong')
 * // result is { ok: false, error: 'Something went wrong' }
 * ```
 */
export const Err = <E>(error: E): Err<E> => ({ ok: false as const, error })

/**
 * Safely executes a Promise and returns a Result instead of throwing.
 * Converts promise rejections into Err values for explicit error handling.
 *
 * @template T The type of the resolved promise value
 * @template E The type of the error (defaults to Error)
 * @param promise The promise to execute
 * @returns A Promise that resolves to either Ok(value) or Err(error)
 *
 * @example
 * ```ts
 * // Basic usage
 * const result = await safeAwait(fetch('/api/data'))
 * if (result.ok === false) {
 *   console.error('Fetch failed:', result.error)
 *   return
 * }
 * const response = result.value
 *
 * // With custom error type
 * type MyError = { code: number, message: string }
 * const result = await safeAwait<Data, MyError>(fetchData())
 *
 * // No try-catch needed!
 * const result = await safeAwait(riskyOperation())
 * if (result.ok === false) {
 *   // Handle error
 * }
 * ```
 */
export async function safeAwait<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise
    return Ok(data)
  }
  catch (error) {
    return Err(error as E)
  }
}
