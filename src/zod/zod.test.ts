import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { buildDefaultObject, mergeWithArrayHandling, zodObjectBuilder } from '.'

describe('zodObjectBuilder', () => {
  test('creates an array of mocks via the count config option', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      config: {
        count: 4
      },
    })

    expect(actual).toStrictEqual([
      {
        foo: 'Hello, World!',
        bar: false,
      },
      {
        foo: 'Hello, World!',
        bar: false,
      },
      {
        foo: 'Hello, World!',
        bar: false,
      },
      {
        foo: 'Hello, World!',
        bar: false,
      },
    ])
  })
  test('the override option properly overrides the count value if used', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      config: {
        count: 4
      },
      overrides: { bar: true }
    })

    expect(actual).toStrictEqual({
        foo: 'Hello, World!',
        bar: true,
    })
  })
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
  test('create a zod object object from a schema', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      overrides: {},
    })

    expect(actual).toStrictEqual(
      {
        foo: 'Hello, World!',
        bar: false,
      },
    )
  })
  test('create a zod object object from a schema (with override)', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      overrides: {
        bar: true,
      },
    })

    expect(actual).toStrictEqual(
      {
        bar: true,
        foo: 'Hello, World!',
      },
    )
  })
  test('creates a zod object array from a schema (with overrides)', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
        nestedExample: z.object({
          nested1: z.string(),
          nested2: z.object({
            nestednested1: z.string(),
          }).optional(),
        }).default({
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        }),
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
        {
          nestedExample: {
            nested1: 'nested1',
          },
        },
      ],
    })

    expect(actual).toStrictEqual([
      {
        foo: 'rawr',
        bar: false,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
      {
        foo: 'rawr2',
        bar: true,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
      {
        foo: 'Hello, World!',
        bar: false,
        nestedExample: {
          nested1: 'nested1',
        },
      },
    ])
  })

  test('creates a zod object array from a schema (with overrides & preserveNestedDefaults)', () => {
    const schema = z.object(
      {
        foo: z.string().default('Hello, World!'),
        bar: z.boolean().default(false),
        nestedExample: z.object({
          nested1: z.string().default('nested1'),
          nested2: z.object({
            nestednested1: z.string().default('nested2'),
          }),
        }),
      },
    )

    const actual = zodObjectBuilder({
      schema,
      config: {
        preserveNestedDefaults: true,
      },
      overrides: [
        {
          foo: 'rawr',
        },
        {
          foo: 'rawr2',
          bar: true,
        },
        {
          nestedExample: {
            nested1: 'nested1',
          },
        },
      ],
    })

    expect(actual).toStrictEqual([
      {
        foo: 'rawr',
        bar: false,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
      {
        foo: 'rawr2',
        bar: true,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
      {
        foo: 'Hello, World!',
        bar: false,
        nestedExample: {
          nested1: 'nested1',
          nested2: {
            nestednested1: 'nested2',
          },
        },
      },
    ])
  })
  test('it properly overrides nested arrays whilst preverse nested defaults', () => {
    const addressSchema = z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string()
    }).default({
      street: "123 Pine Street",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "USA"
    });

    const customerInfoSchema = z.object({
      id: z.string().regex(/^CUST-\d{4}$/),
      name: z.string().min(1),
      email: z.string().email(),
      shippingAddress: addressSchema
    }).default({
      id: "CUST-1234",
      name: "Alice Johnson",
      email: "alice.j@email.com",
    });

    const paymentInfoSchema = z.object({
      method: z.enum(['credit_card', 'paypal']),
      status: z.enum(['completed', 'pending', 'failed']),
      transactionId: z.string()
    }).default({
      method: 'credit_card',
      status: 'pending',
      transactionId: 'TXN-88776655'
    });

    const orderItemSchema = z.object({
      productId: z.string().regex(/^PROD-\d{3}$/),
      name: z.string().min(1),
      quantity: z.number().int().positive(),
      pricePerUnit: z.number().positive(),
      color: z.string().optional(),
      size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).optional(),
      variety: z.string().optional(),
      weight: z.enum(['8oz', '12oz', '16oz', '1lb']).optional()
    }).default({
      productId: "PROD-001",
      name: "Sample Product",
      quantity: 1,
      pricePerUnit: 29.99,
      color: "Black",
      size: "M"
    });


    const orderSchema = z.object({
      orderId: z.string().regex(/^ORD-\d{4}-\d{3}$/).default('ORD-2024-661'),
      customerInfo: customerInfoSchema,
      orderDate: z.string().default('11/11/1111'),
      items: z.array(orderItemSchema).min(1).default([orderItemSchema.parse(undefined)]),
      paymentInfo: paymentInfoSchema,
      subtotal: z.number().positive().default(29.99),
      shippingCost: z.number().nonnegative().default(5.99),
      tax: z.number().nonnegative().default(3.00),
      totalAmount: z.number().positive().default(38.98),
      status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
      trackingNumber: z.string().default('1Z999AA1234567890')
    });


    const orders = zodObjectBuilder({
      schema: orderSchema,
      config: {
        preserveNestedDefaults: true
      },
      overrides: [
        {
          status: "delivered",
          items: [{size: 'L'}],
        },
      ]
    });

    expect(orders).toStrictEqual([{ "orderId": "ORD-2024-661", "customerInfo": { "id": "CUST-1234", "name": "Alice Johnson", "email": "alice.j@email.com", "shippingAddress": { "street": "123 Pine Street", "city": "Portland", "state": "OR", "zipCode": "97201", "country": "USA" } }, "orderDate": "11/11/1111", "items": [{ "productId": "PROD-001", "name": "Sample Product", "quantity": 1, "pricePerUnit": 29.99, "color": "Black", "size": "L" }], "paymentInfo": { "method": "credit_card", "status": "pending", "transactionId": "TXN-88776655" }, "subtotal": 29.99, "shippingCost": 5.99, "tax": 3, "totalAmount": 38.98, "status": "delivered", "trackingNumber": "1Z999AA1234567890" }])
  })
  test('it properly overrides nested array without preversing nested defaults', () => {
    const addressSchema = z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string()
    }).default({
      street: "123 Pine Street",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "USA"
    });

    const customerInfoSchema = z.object({
      id: z.string().regex(/^CUST-\d{4}$/),
      name: z.string().min(1),
      email: z.string().email(),
      shippingAddress: addressSchema
    }).default({
      id: "CUST-1234",
      name: "Alice Johnson",
      email: "alice.j@email.com",
    });

    const paymentInfoSchema = z.object({
      method: z.enum(['credit_card', 'paypal']),
      status: z.enum(['completed', 'pending', 'failed']),
      transactionId: z.string()
    }).default({
      method: 'credit_card',
      status: 'pending',
      transactionId: 'TXN-88776655'
    });

    const orderItemSchema = z.object({
      productId: z.string().regex(/^PROD-\d{3}$/).optional(),
      name: z.string().min(1).optional(),
      quantity: z.number().int().positive().optional(),
      pricePerUnit: z.number().positive().optional(),
      color: z.string().optional(),
      size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).optional(),
      variety: z.string().optional(),
      weight: z.enum(['8oz', '12oz', '16oz', '1lb']).optional()
    }).default({
      productId: "PROD-001",
      name: "Sample Product",
      quantity: 1,
      pricePerUnit: 29.99,
      color: "Black",
      size: "M"
    });


    const orderSchema = z.object({
      orderId: z.string().regex(/^ORD-\d{4}-\d{3}$/).default('ORD-2024-661'),
      customerInfo: customerInfoSchema,
      orderDate: z.string().default('11/11/1111'),
      items: z.array(orderItemSchema).min(1).default([orderItemSchema.parse(undefined)]),
      paymentInfo: paymentInfoSchema,
      subtotal: z.number().positive().default(29.99),
      shippingCost: z.number().nonnegative().default(5.99),
      tax: z.number().nonnegative().default(3.00),
      totalAmount: z.number().positive().default(38.98),
      status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
      trackingNumber: z.string().default('1Z999AA1234567890')
    });


    const orders = zodObjectBuilder({
      schema: orderSchema,
      overrides: [
        {
          status: "delivered",
          items: [{size: 'L'}],
        },
      ]
    });

    expect(orders).toEqual([{ "orderId": "ORD-2024-661", "customerInfo": { "id": "CUST-1234", "name": "Alice Johnson", "email": "alice.j@email.com", "shippingAddress": { "street": "123 Pine Street", "city": "Portland", "state": "OR", "zipCode": "97201", "country": "USA" } }, "orderDate": "11/11/1111", "items": [{"size": "L" }], "paymentInfo": { "method": "credit_card", "status": "pending", "transactionId": "TXN-88776655" }, "subtotal": 29.99, "shippingCost": 5.99, "tax": 3, "totalAmount": 38.98, "status": "delivered", "trackingNumber": "1Z999AA1234567890" }])
  })
})

describe('buildDefaultObject', () => {
  test('should create an object with default values for flat objects', () => {
    const schema = z.object({
      name: z.string().default('John'),
      age: z.number().default(25),
      isActive: z.boolean().default(true),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      name: 'John',
      age: 25,
      isActive: true,
    })
  })

  test('should create an object with nested default values', () => {
    const schema = z.object({
      user: z.object({
        name: z.string().default('John'),
        settings: z.object({
          theme: z.string().default('dark'),
          notifications: z.boolean().default(true),
        }),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      user: {
        name: 'John',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
    })
  })

  test('should handle fields without default values', () => {
    const schema = z.object({
      required: z.string().optional(),
      withDefault: z.string().default('default'),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      required: undefined,
      withDefault: 'default',
    })
  })

  test('should handle arrays with default values', () => {
    const schema = z.object({
      tags: z.array(z.string()).default(['default']),
      settings: z.object({
        permissions: z.array(z.string()).default(['read']),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      tags: ['default'],
      settings: {
        permissions: ['read'],
      },
    })
  })

  test('should handle optional fields', () => {
    const schema = z.object({
      required: z.string().optional(),
      optional: z.string().optional(),
      withDefault: z.string().optional().default('default'),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      required: undefined,
      optional: undefined,
      withDefault: 'default',
    })
  })

  test('should handle deeply nested objects with mixed default values', () => {
    const schema = z.object({
      level1: z.object({
        a: z.string().default('a'),
        level2: z.object({
          b: z.number().optional(),
          c: z.boolean().default(true),
          level3: z.object({
            d: z.string().default('d'),
            e: z.number().optional(),
          }),
        }),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      level1: {
        a: 'a',
        level2: {
          b: undefined,
          c: true,
          level3: {
            d: 'd',
            e: undefined,
          },
        },
      },
    })
  })

  test('should handle enums with default values', () => {
    const StatusEnum = z.enum(['active', 'inactive']).default('active')
    const schema = z.object({
      status: StatusEnum,
      config: z.object({
        type: z.enum(['user', 'admin']).default('user'),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      status: 'active',
      config: {
        type: 'user',
      },
    })
  })

  test('should handle literal values with defaults', () => {
    const schema = z.object({
      type: z.literal('user').default('user'),
      settings: z.object({
        mode: z.literal('dark').default('dark'),
      }),
    })

    const result = buildDefaultObject(schema)

    expect(result).toEqual({
      type: 'user',
      settings: {
        mode: 'dark',
      },
    })
  })
})


describe('mergeWithArrayHandling', () => {
  test('should replace arrays completely instead of merging them', () => {
    const base = { items: [{ id: 1, name: 'default' }] }
    const override = { items: [{ id: 2 }] }

    // When calling directly without defaults
    expect(mergeWithArrayHandling(base, override, false)).toEqual({
      items: [{ id: 2 }] as any
    })
  })

  test('should handle multiple nested arrays', () => {
    const base = {
      categories: [
        {
          name: 'Category 1',
          items: [{ id: 1, name: 'Item 1', status: 'active' }]
        }
      ]
    }
    const override = {
      categories: [
        {
          name: 'Category 2',
          items: [{ id: 2 }]
        }
      ]
    }

    expect(mergeWithArrayHandling(base, override, false)).toEqual({
      categories: [
        {
          name: 'Category 2',
          items: [{ id: 2 }] as any
        }
      ]
    })
  })

  // Add a new test to clarify the default behavior
  test('should apply defaults for direct array items but not nested arrays', () => {
    const base = {
      items: [{ id: 1, name: 'default', status: 'active' }],
      categories: [
        {
          name: 'Category 1',
          subItems: [{ id: 1, type: 'sub' }]
        }
      ]
    }
    const override = {
      items: [{ id: 2 }],
      categories: [
        {
          name: 'Category 2',
          subItems: [{ id: 3 }]
        }
      ]
    }

    expect(mergeWithArrayHandling(base, override, true)).toEqual({
      items: [{ id: 2, name: 'default', status: 'active' }],
      categories: [
        {
          name: 'Category 2',
          subItems: [{ id: 3 }] as any
        }
      ]
    })
  })
})