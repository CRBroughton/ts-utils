/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
import { type Handlers, handleError, safeAwait } from '.'

class FirstCustomError extends Error {
  safeAwaitName = 'FirstCustomError' as const
}
class SecondCustomError extends Error {
  safeAwaitName = 'SecondCustomError' as const
}
class ThirdError extends Error {
  safeAwaitName = 'ThirdError' as const
}

type MightFailPossibleErrors = FirstCustomError | SecondCustomError | ThirdError
async function mightFail() {
  if (Math.random() > 0.2)
    throw new FirstCustomError('value too high`')

  if (Math.random() > 0.5)
    throw new SecondCustomError('value even higher')

  if (Math.random() > 0.7)
    throw new ThirdError('ouch')

  return 'success' as const
}

async function goExample() {
  type SuccessType = Awaited<ReturnType<typeof mightFail>>
  const [result, error] = await safeAwait<SuccessType, MightFailPossibleErrors>(mightFail())

  if (error) {
    const handlers = {
      FirstCustomError: (_err: FirstCustomError) => {
        console.log('this is a void return')
      },
      SecondCustomError: (err: SecondCustomError) => {
        return err
      },
      ThirdError: (err: ThirdError) => {
        return err
      },
    } satisfies Handlers

    const errorResult = handleError(handlers, error)
    return errorResult
  }
  return result
}

async function rustExample() {
  type SuccessType = Awaited<ReturnType<typeof mightFail>>
  const result = await safeAwait<SuccessType, MightFailPossibleErrors>(mightFail(), true)

  if (!result.ok) {
    const handlers = {
      FirstCustomError: (_err: FirstCustomError) => {
        console.log('this is a void return')
      },
      SecondCustomError: (err: SecondCustomError) => {
        return err
      },
      ThirdError: (err: ThirdError) => {
        return err
      },
    } satisfies Handlers

    const errorResult = handleError(handlers, result.error)
    return errorResult
  }
  return result.value
}
