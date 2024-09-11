import { expect, test } from 'bun:test'
import { createEnum } from '..'

test('creates an enum like object', () => {
  const actual = createEnum(['RED', 'GREEN', 'BLUE'])

  expect(actual).toStrictEqual({
    RED: 'RED',
    GREEN: 'GREEN',
    BLUE: 'BLUE',
  })
})
