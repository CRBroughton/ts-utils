export async function safeAwait<T, E = unknown>(
  func: () => Promise<T>,
): Promise<[T, null] | [null, E]> {
  try {
    const result = await func()
    return [result, null]
  }
  catch (error) {
    return [null, error as E]
  }
}

export type Handlers = Record<string, (...args: any) => any>
type NonVoid<T> = T extends void ? never : T
type HandlersReturnType<T extends Handlers> = NonVoid<ReturnType<T[keyof T]>>
export function handleError<R extends Handlers, T extends { safeAwaitName: keyof R }>(
  handlers: R,
  error: T,
): HandlersReturnType<R> {
  const handler = handlers[error.safeAwaitName]
  return handler(error as Extract<T, { type: typeof error.safeAwaitName }>)
}
