import { expect, test } from 'bun:test'
import { type Handlers, handleError, safeAwait } from '..'

class FirstCustomError extends Error {
  safeAwaitName = 'FirstCustomError' as const
}
async function mightFail(throwMaybe: boolean) {
  if (throwMaybe === true)
    throw new FirstCustomError('value too high')

  return 'success' as const
}

test('Go variant - returns a tuple containing a error value when thrown, and no result value', async () => {
    type ResultType = Awaited<ReturnType<typeof mightFail>>
    const [result, error] = await safeAwait<ResultType, FirstCustomError>(mightFail(true))

    expect(result).toStrictEqual(null)
    expect(error && error.message).toStrictEqual('value too high')
})

test('Go variant - returns a tuple containing no error value when not thrown, and a result value', async () => {
    type ResultType = Awaited<ReturnType<typeof mightFail>>
    const [result, error] = await safeAwait<ResultType, FirstCustomError>(mightFail(false))

    expect(result).toStrictEqual('success')
    expect(error && error.message).toStrictEqual(null)
})

test('Rust variant - returns a tuple containing a error value when thrown, and no result value', async () => {
    type ResultType = Awaited<ReturnType<typeof mightFail>>
    const result = await safeAwait<ResultType, FirstCustomError>(mightFail(true), true)

    expect(result.ok).toStrictEqual(false)

    if (!result.ok)
      expect(result.error && result.error.message).toStrictEqual('value too high')
})

test('Rust variant - returns a tuple containing no error value when not thrown, and a result value', async () => {
    type ResultType = Awaited<ReturnType<typeof mightFail>>
    const result = await safeAwait<ResultType, FirstCustomError>(mightFail(false), true)

    expect(result.ok).toStrictEqual(true)

    if (result.ok)
      expect(result.value).toStrictEqual('success')
})

test('Go variant - handleError returns the possible thrown error classes', async () => {
  type ResultType = Awaited<ReturnType<typeof mightFail>>
  const [_, error] = await safeAwait<ResultType, FirstCustomError>(mightFail(true))

  if (error) {
    const handlers = {
      FirstCustomError: (err: FirstCustomError) => {
        return err
      },
    } satisfies Handlers

    const handlerErrors = handleError(handlers, error)
    expect(handlerErrors.message).toStrictEqual('value too high')
  }
})

test('Rust variant - handleError returns the possible thrown error classes', async () => {
  type ResultType = Awaited<ReturnType<typeof mightFail>>
  const result = await safeAwait<ResultType, FirstCustomError>(mightFail(true), true)

  if (!result.ok) {
    const handlers = {
      FirstCustomError: (err: FirstCustomError) => {
        return err
      },
    } satisfies Handlers

    const handlerErrors = handleError(handlers, result.error)
    expect(handlerErrors.message).toStrictEqual('value too high')
  }
})
