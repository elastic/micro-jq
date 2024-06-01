import { parse } from '../src'

test('current context', () => {
  expect(parse('.')).toMatchInlineSnapshot(`
Array [
  Object {
    "op": "current_context",
  },
]
`)
})

test('bare identifier', () => {
  expect(parse('.foo')).toMatchInlineSnapshot(`
Array [
  Object {
    "key": "foo",
    "op": "pick",
    "strict": true,
  },
]
`)
})

test('bare identifier with punctuation', () => {
  expect(parse('.$foo')).toMatchInlineSnapshot(`
Array [
  Object {
    "key": "$foo",
    "op": "pick",
    "strict": true,
  },
]
`)
})

test('optional bare identifier', () => {
  expect(parse('.foo?')).toMatchInlineSnapshot(`
Array [
  Object {
    "key": "foo",
    "op": "pick",
    "strict": false,
  },
]
`)
})

test('pick with object index', () => {
  expect(parse('.["foo"]')).toMatchInlineSnapshot(`
Array [
  Object {
    "op": "current_context",
  },
  Object {
    "key": "foo",
    "op": "pick",
    "strict": true,
  },
]
`)
})

test('nested keys', () => {
  expect(parse('.foo.bar')).toMatchInlineSnapshot(`
Array [
  Object {
    "key": "foo",
    "op": "pick",
    "strict": true,
  },
  Object {
    "key": "bar",
    "op": "pick",
    "strict": true,
  },
]
`)
})

test('index an array', () => {
  expect(parse('.[1]')).toMatchInlineSnapshot(`
Array [
  Object {
    "op": "current_context",
  },
  Object {
    "index": 1,
    "op": "index",
    "strict": true,
  },
]
`)
})

test('index an array with negative index', () => {
  expect(parse('.[-1]')).toMatchInlineSnapshot(`
Array [
  Object {
    "op": "current_context",
  },
  Object {
    "index": -1,
    "op": "index",
    "strict": true,
  },
]
`)
})

test('index non-strictly', () => {
  expect(parse('.[1]?')).toMatchInlineSnapshot(`
Array [
  Object {
    "op": "current_context",
  },
  Object {
    "index": 1,
    "op": "index",
    "strict": false,
  },
]
`)
})

test('slice an array', () => {
  expect(parse('.[1:3]')).toMatchInlineSnapshot(`
Array [
  Object {
    "op": "current_context",
  },
  Object {
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
Array [
  Object {
    "op": "current_context",
  },
  Object {
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
Array [
  Object {
    "op": "current_context",
  },
  Object {
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
Array [
  Object {
    "op": "current_context",
  },
  Object {
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
Array [
  Object {
    "op": "current_context",
  },
  Object {
    "op": "explode",
    "strict": true,
  },
]
`)
})

test('pick a value and index into it', () => {
  expect(parse('.foo[1]')).toMatchInlineSnapshot(`
Array [
  Object {
    "key": "foo",
    "op": "pick",
    "strict": true,
  },
  Object {
    "index": 1,
    "op": "index",
    "strict": true,
  },
]
`)
})

test('pick value from an array', () => {
  expect(parse('.foo[].bar')).toMatchInlineSnapshot(`
Array [
  Object {
    "key": "foo",
    "op": "pick",
    "strict": true,
  },
  Object {
    "op": "explode",
    "strict": true,
  },
  Object {
    "key": "bar",
    "op": "pick",
    "strict": true,
  },
]
`)
})

test('pick a value from an array and pick from that', () => {
  expect(parse('.foo[1].bar')).toMatchInlineSnapshot(`
Array [
  Object {
    "key": "foo",
    "op": "pick",
    "strict": true,
  },
  Object {
    "index": 1,
    "op": "index",
    "strict": true,
  },
  Object {
    "key": "bar",
    "op": "pick",
    "strict": true,
  },
]
`)
})

test('pipe commands together', () => {
  expect(parse('.foo | .bar')).toMatchInlineSnapshot(`
Array [
  Object {
    "in": Array [
      Object {
        "key": "foo",
        "op": "pick",
        "strict": true,
      },
    ],
    "op": "pipe",
    "out": Array [
      Object {
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
Array [
  Object {
    "in": Array [
      Object {
        "in": Array [
          Object {
            "key": "foo",
            "op": "pick",
            "strict": true,
          },
        ],
        "op": "pipe",
        "out": Array [
          Object {
            "key": "bar",
            "op": "pick",
            "strict": true,
          },
        ],
      },
    ],
    "op": "pipe",
    "out": Array [
      Object {
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
Array [
  Object {
    "in": Array [
      Object {
        "op": "current_context",
      },
      Object {
        "op": "explode",
        "strict": true,
      },
    ],
    "op": "pipe",
    "out": Array [
      Object {
        "entries": Array [
          Object {
            "key": "foo",
            "value": Array [
              Object {
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
Array [
  Object {
    "op": "create_array",
    "values": Array [
      Array [
        Object {
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
Array [
  Object {
    "op": "create_array",
    "values": Array [
      Array [
        Object {
          "op": "literal",
          "value": 1,
        },
      ],
      Array [
        Object {
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
Array [
  Object {
    "op": "create_array",
    "values": Array [
      Array [
        Object {
          "key": "foo",
          "op": "pick",
          "strict": true,
        },
      ],
      Array [
        Object {
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
Array [
  Object {
    "op": "create_array",
    "values": Array [
      Array [
        Object {
          "key": "foo",
          "op": "pick",
          "strict": true,
        },
        Object {
          "index": 1,
          "op": "index",
          "strict": true,
        },
        Object {
          "key": "bar",
          "op": "pick",
          "strict": true,
        },
      ],
      Array [
        Object {
          "key": "foo",
          "op": "pick",
          "strict": true,
        },
        Object {
          "index": 1,
          "op": "index",
          "strict": true,
        },
        Object {
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
Array [
  Object {
    "entries": Array [
      Object {
        "key": "foo",
        "value": Array [
          Object {
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
Array [
  Object {
    "entries": Array [
      Object {
        "key": "foo",
        "value": Array [
          Object {
            "op": "literal",
            "value": 1,
          },
        ],
      },
      Object {
        "key": "bar",
        "value": Array [
          Object {
            "op": "literal",
            "value": "baz",
          },
        ],
      },
      Object {
        "key": "quux",
        "value": Array [
          Object {
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
Array [
  Object {
    "entries": Array [
      Object {
        "key": "foo",
        "value": Array [
          Object {
            "key": "bar",
            "op": "pick",
            "strict": true,
          },
        ],
      },
      Object {
        "key": "baz",
        "value": Array [
          Object {
            "key": "quux",
            "op": "pick",
            "strict": true,
          },
          Object {
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
Array [
  Object {
    "name": "trim",
    "op": "function",
  },
]
`)
  })
  test('ltrim', () => {
    expect(parse('ltrim')).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "ltrim",
    "op": "function",
  },
]
`)
  })
  test('rtrim', () => {
    expect(parse('rtrim')).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "rtrim",
    "op": "function",
  },
]
`)
  })
  test('startswith', () => {
    expect(parse('startswith("foo")')).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "startswith",
    "op": "function",
    "value": "foo",
  },
]
`)
  })
  test('endswith', () => {
    expect(parse('endswith("foo")')).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "endswith",
    "op": "function",
    "value": "foo",
  },
]
`)
  })
  test('ltrimstr', () => {
    expect(parse('ltrimstr("foo")')).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "ltrimstr",
    "op": "function",
    "value": "foo",
  },
]
`)
  })
  test('rtrimstr', () => {
    expect(parse('rtrimstr("foo")')).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "rtrimstr",
    "op": "function",
    "value": "foo",
  },
]
`)
  })
  test('split', () => {
    expect(parse('split("foo")')).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "split",
    "op": "function",
    "value": "foo",
  },
]
`)
  })
  test('join', () => {
    expect(parse('join("foo")')).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "join",
    "op": "function",
    "value": "foo",
  },
]
`)
  })
})
