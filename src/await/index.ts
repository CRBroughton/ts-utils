type GoResult<Success, Error = unknown> = [Success, null] | [null, Error]
type RustResult<Success, Error = unknown> = { ok: true, value: Success } | { ok: false, error: Error }

export function safeAwait<Success, Error = unknown>(
  func: () => Promise<Success>,
  rustStyle?: false
): Promise<GoResult<Success, Error>>

export function safeAwait<Success, Error = unknown>(
  func: () => Promise<Success>,
  rustStyle: true
): Promise<RustResult<Success, Error>>

export async function safeAwait<Success, Error = unknown>(
  func: () => Promise<Success>,
  rustStyle: boolean = false,
): Promise<GoResult<Success, Error> | RustResult<Success, Error>> {
  try {
    const result = await func()
    if (rustStyle)
      return { ok: true, value: result }
    else
      return [result, null]
  }
  catch (error) {
    if (rustStyle)
      return { ok: false, error: error as Error }
    else
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
