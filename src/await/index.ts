export async function safeAwait<Success, Error = unknown>(
  func: () => Promise<Success>,
): Promise<[Success, null] | [null, Error]> {
  try {
    const result = await func()
    return [result, null]
  }
  catch (error) {
    return [null, error as Error]
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
