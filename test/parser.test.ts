import { parse } from '../src'

test('current context', () => {
  expect(parse('.')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
    ]
  `)
})

test('bare identifier', () => {
  expect(parse('.foo')).toMatchInlineSnapshot(`
    [
      {
        "key": "foo",
        "op": "pick",
        "strict": true,
      },
    ]
  `)
})

test('bare identifier with punctuation', () => {
  expect(parse('.$foo')).toMatchInlineSnapshot(`
    [
      {
        "key": "$foo",
        "op": "pick",
        "strict": true,
      },
    ]
  `)
})

test('optional bare identifier', () => {
  expect(parse('.foo?')).toMatchInlineSnapshot(`
    [
      {
        "key": "foo",
        "op": "pick",
        "strict": false,
      },
    ]
  `)
})

test('pick with object index', () => {
  expect(parse('.["foo"]')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "key": "foo",
        "op": "pick",
        "strict": true,
      },
    ]
  `)
})

test('nested keys', () => {
  expect(parse('.foo.bar')).toMatchInlineSnapshot(`
    [
      {
        "key": "foo",
        "op": "pick",
        "strict": true,
      },
      {
        "key": "bar",
        "op": "pick",
        "strict": true,
      },
    ]
  `)
})

test('index an array', () => {
  expect(parse('.[1]')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "index": 1,
        "op": "index",
        "strict": true,
      },
    ]
  `)
})

test('index an array with negative index', () => {
  expect(parse('.[-1]')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "index": -1,
        "op": "index",
        "strict": true,
      },
    ]
  `)
})

test('index non-strictly', () => {
  expect(parse('.[1]?')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "index": 1,
        "op": "index",
        "strict": false,
      },
    ]
  `)
})

test('slice an array', () => {
  expect(parse('.[1:3]')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "end": 3,
        "op": "slice",
        "start": 1,
        "strict": true,
      },
    ]
  `)
})

test('slice an array with negative offsets', () => {
  expect(parse('.[-3:-1]')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "end": -1,
        "op": "slice",
        "start": -3,
        "strict": true,
      },
    ]
  `)
})

test('slice an array with no start', () => {
  expect(parse('.[:3]')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "end": 3,
        "op": "slice",
        "start": undefined,
        "strict": true,
      },
    ]
  `)
})

test('slice an array with no end', () => {
  expect(parse('.[1:]')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "end": undefined,
        "op": "slice",
        "start": 1,
        "strict": true,
      },
    ]
  `)
})

test('get all values from an array', () => {
  expect(parse('.[]')).toMatchInlineSnapshot(`
    [
      {
        "op": "current_context",
      },
      {
        "op": "explode",
        "strict": true,
      },
    ]
  `)
})

test('pick a value and index into it', () => {
  expect(parse('.foo[1]')).toMatchInlineSnapshot(`
    [
      {
        "key": "foo",
        "op": "pick",
        "strict": true,
      },
      {
        "index": 1,
        "op": "index",
        "strict": true,
      },
    ]
  `)
})

test('pick value from an array', () => {
  expect(parse('.foo[].bar')).toMatchInlineSnapshot(`
    [
      {
        "key": "foo",
        "op": "pick",
        "strict": true,
      },
      {
        "op": "explode",
        "strict": true,
      },
      {
        "key": "bar",
        "op": "pick",
        "strict": true,
      },
    ]
  `)
})

test('pick a value from an array and pick from that', () => {
  expect(parse('.foo[1].bar')).toMatchInlineSnapshot(`
    [
      {
        "key": "foo",
        "op": "pick",
        "strict": true,
      },
      {
        "index": 1,
        "op": "index",
        "strict": true,
      },
      {
        "key": "bar",
        "op": "pick",
        "strict": true,
      },
    ]
  `)
})

test('pipe commands together', () => {
  expect(parse('.foo | .bar')).toMatchInlineSnapshot(`
    [
      {
        "in": [
          {
            "key": "foo",
            "op": "pick",
            "strict": true,
          },
        ],
        "op": "pipe",
        "out": [
          {
            "key": "bar",
            "op": "pick",
            "strict": true,
          },
        ],
      },
    ]
  `)
})

test('multiple pipe', () => {
  expect(parse('.foo | .bar | .baz')).toMatchInlineSnapshot(`
    [
      {
        "in": [
          {
            "in": [
              {
                "key": "foo",
                "op": "pick",
                "strict": true,
              },
            ],
            "op": "pipe",
            "out": [
              {
                "key": "bar",
                "op": "pick",
                "strict": true,
              },
            ],
          },
        ],
        "op": "pipe",
        "out": [
          {
            "key": "baz",
            "op": "pick",
            "strict": true,
          },
        ],
      },
    ]
  `)
})

test('pipe into create object', () => {
  expect(parse('.[] | {foo: .bar}')).toMatchInlineSnapshot(`
    [
      {
        "in": [
          {
            "op": "current_context",
          },
          {
            "op": "explode",
            "strict": true,
          },
        ],
        "op": "pipe",
        "out": [
          {
            "entries": [
              {
                "key": "foo",
                "value": [
                  {
                    "key": "bar",
                    "op": "pick",
                    "strict": true,
                  },
                ],
              },
            ],
            "op": "create_object",
          },
        ],
      },
    ]
  `)
})

describe('create arrays', () => {
  test('create an array', () => {
    expect(parse('[ 1 ]')).toMatchInlineSnapshot(`
      [
        {
          "op": "create_array",
          "values": [
            [
              {
                "op": "literal",
                "value": 1,
              },
            ],
          ],
        },
      ]
    `)
  })

  test('create an array with multiple values', () => {
    expect(parse('[ 1, 2 ]')).toMatchInlineSnapshot(`
      [
        {
          "op": "create_array",
          "values": [
            [
              {
                "op": "literal",
                "value": 1,
              },
            ],
            [
              {
                "op": "literal",
                "value": 2,
              },
            ],
          ],
        },
      ]
    `)
  })

  test('create an array with filters', () => {
    expect(parse('[ .foo, .bar ]')).toMatchInlineSnapshot(`
      [
        {
          "op": "create_array",
          "values": [
            [
              {
                "key": "foo",
                "op": "pick",
                "strict": true,
              },
            ],
            [
              {
                "key": "bar",
                "op": "pick",
                "strict": true,
              },
            ],
          ],
        },
      ]
    `)
  })

  test('create an array by picking a value from an array and picking from that', () => {
    expect(parse('[ .foo[1].bar, .foo[1].bar ]')).toMatchInlineSnapshot(`
      [
        {
          "op": "create_array",
          "values": [
            [
              {
                "key": "foo",
                "op": "pick",
                "strict": true,
              },
              {
                "index": 1,
                "op": "index",
                "strict": true,
              },
              {
                "key": "bar",
                "op": "pick",
                "strict": true,
              },
            ],
            [
              {
                "key": "foo",
                "op": "pick",
                "strict": true,
              },
              {
                "index": 1,
                "op": "index",
                "strict": true,
              },
              {
                "key": "bar",
                "op": "pick",
                "strict": true,
              },
            ],
          ],
        },
      ]
    `)
  })
})

describe('create objects', () => {
  test('one key', () => {
    expect(parse('{ foo: 1 }')).toMatchInlineSnapshot(`
      [
        {
          "entries": [
            {
              "key": "foo",
              "value": [
                {
                  "op": "literal",
                  "value": 1,
                },
              ],
            },
          ],
          "op": "create_object",
        },
      ]
    `)
  })

  test('multiple keys', () => {
    expect(parse('{ foo: 1, bar: \'baz\', quux: "schmee" }')).toMatchInlineSnapshot(`
      [
        {
          "entries": [
            {
              "key": "foo",
              "value": [
                {
                  "op": "literal",
                  "value": 1,
                },
              ],
            },
            {
              "key": "bar",
              "value": [
                {
                  "op": "literal",
                  "value": "baz",
                },
              ],
            },
            {
              "key": "quux",
              "value": [
                {
                  "op": "literal",
                  "value": "schmee",
                },
              ],
            },
          ],
          "op": "create_object",
        },
      ]
    `)
  })

  test('filters for values', () => {
    expect(parse('{ foo: .bar, baz: .quux.schmee }')).toMatchInlineSnapshot(`
      [
        {
          "entries": [
            {
              "key": "foo",
              "value": [
                {
                  "key": "bar",
                  "op": "pick",
                  "strict": true,
                },
              ],
            },
            {
              "key": "baz",
              "value": [
                {
                  "key": "quux",
                  "op": "pick",
                  "strict": true,
                },
                {
                  "key": "schmee",
                  "op": "pick",
                  "strict": true,
                },
              ],
            },
          ],
          "op": "create_object",
        },
      ]
    `)
  })
})

describe('functions', () => {
  test('trim', () => {
    expect(parse('trim')).toMatchInlineSnapshot(`
      [
        {
          "name": "trim",
          "op": "function",
        },
      ]
    `)
  })
  test('ltrim', () => {
    expect(parse('ltrim')).toMatchInlineSnapshot(`
      [
        {
          "name": "ltrim",
          "op": "function",
        },
      ]
    `)
  })
  test('rtrim', () => {
    expect(parse('rtrim')).toMatchInlineSnapshot(`
      [
        {
          "name": "rtrim",
          "op": "function",
        },
      ]
    `)
  })
  test('startswith', () => {
    expect(parse('startswith("foo")')).toMatchInlineSnapshot(`
      [
        {
          "name": "startswith",
          "op": "function",
          "value": "foo",
        },
      ]
    `)
  })
  test('endswith', () => {
    expect(parse('endswith("foo")')).toMatchInlineSnapshot(`
      [
        {
          "name": "endswith",
          "op": "function",
          "value": "foo",
        },
      ]
    `)
  })
  test('ltrimstr', () => {
    expect(parse('ltrimstr("foo")')).toMatchInlineSnapshot(`
      [
        {
          "name": "ltrimstr",
          "op": "function",
          "value": "foo",
        },
      ]
    `)
  })
  test('rtrimstr', () => {
    expect(parse('rtrimstr("foo")')).toMatchInlineSnapshot(`
      [
        {
          "name": "rtrimstr",
          "op": "function",
          "value": "foo",
        },
      ]
    `)
  })
  test('split', () => {
    expect(parse('split("foo")')).toMatchInlineSnapshot(`
      [
        {
          "name": "split",
          "op": "function",
          "value": "foo",
        },
      ]
    `)
  })
  test('join', () => {
    expect(parse('join("foo")')).toMatchInlineSnapshot(`
      [
        {
          "name": "join",
          "op": "function",
          "value": "foo",
        },
      ]
    `)
  })
})
