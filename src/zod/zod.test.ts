import { expect, test } from 'bun:test'
import { z } from 'zod'
import { zodObjectBuilder } from '.'

test('create a zod object array from a schema', () => {
  const schema = z.object(
    {
      foo: z.string().default('Hello, World!'),
      bar: z.boolean().default(false),
    },
  )

  const actual = zodObjectBuilder({
    schema,
  })

  expect(actual).toStrictEqual([
    {
      foo: 'Hello, World!',
      bar: false,
    },
  ])
})

test('creates a zod object array from a schema (with overrides', () => {
  const schema = z.object(
    {
      foo: z.string().default('Hello, World!'),
      bar: z.boolean().default(false),
    },
  )

  const actual = zodObjectBuilder({
    schema,
    overrides: [
      {
        foo: 'rawr',
      },
      {
        foo: 'rawr2',
        bar: true,
      },
    ],
  })

  expect(actual).toStrictEqual([
    {
      foo: 'rawr',
      bar: false,
    },
    {
      foo: 'rawr2',
      bar: true,
    },
  ])
})

test('creates a zod object array from a schema (with overrides and partials', () => {
  const schema = z.object(
    {
      foo: z.string().default('Hello, World!'),
      bar: z.boolean().default(false),
    },
  )

  const actual = zodObjectBuilder({
    schema,
    overrides: [
      {
        foo: 'rawr',
      },
      {
        foo: 'rawr2',
        bar: true,
      },
    ],
    partial: true,
  })

  expect(actual).toEqual([
    {
      foo: 'rawr',
    },
    {
      foo: 'rawr2',
      bar: true,
    },
  ])
})
