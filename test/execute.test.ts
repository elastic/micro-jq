import { executeScript } from '../src'

describe('literals', () => {
  test('number', () => {
    expect(executeScript(null, '42')).toEqual(42)
  })

  test('strings', () => {
    expect(executeScript(null, '"foo"')).toEqual('foo')
    expect(executeScript(null, "'foo'")).toEqual('foo')
    expect(executeScript(null, '""')).toEqual('')
  })

  test('null', () => {
    expect(executeScript(null, 'null')).toEqual(null)
  })

  test('bools', () => {
    expect(executeScript(null, 'false')).toEqual(false)
    expect(executeScript(null, 'true')).toEqual(true)
  })
})

describe('pick values', () => {
  test('missing', () => {
    const input = {}
    const script = '.foo'
    expect(executeScript(input, script)).toEqual(null)
  })

  test('one deep', () => {
    const input = { foo: 'bar' }
    const script = '.foo'
    expect(executeScript(input, script)).toEqual('bar')
  })

  test('two deep', () => {
    const input = { foo: { bar: 'baz' } }
    const script = '.foo.bar'
    expect(executeScript(input, script)).toEqual('baz')
  })

  test('pick index', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[4]'
    expect(executeScript(input, script)).toEqual(5)
  })

  test('pick negative index', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[-4]'
    expect(executeScript(input, script)).toEqual(3)
  })

  test('pick first index by negative length', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[-7]'
    expect(executeScript(input, script)).toEqual(1)
  })

  test('pick out of bounds index', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[7]'
    expect(executeScript(input, script)).toEqual(null)
  })

  test('pick out of bounds negative index', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[-8]'
    expect(executeScript(input, script)).toEqual(null)
  })

  test('slice', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[2:5]'
    expect(executeScript(input, script)).toEqual([2, 3, 5])
  })

  test('slice with no start', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[:5]'
    expect(executeScript(input, script)).toEqual([1, 1, 2, 3, 5])
  })

  test('slice with no end', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[2:]'
    expect(executeScript(input, script)).toEqual([2, 3, 5, 8, 13])
  })

  test('slice with no offsets', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[:]'
    expect(() => executeScript(input, script)).toThrowErrorMatchingInlineSnapshot(
      '"Cannot slice with no offsets"'
    )
  })

  test('slice with negative offsets', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[-5:-2]'
    expect(executeScript(input, script)).toEqual([2, 3, 5])
  })

  test('slice with end offset greater than start', () => {
    const input = [1, 1, 2, 3, 5, 8, 13]
    const script = '.[5:2]'
    expect(executeScript(input, script)).toEqual([])
  })

  test('pick by identifier and then index', () => {
    const input = { foo: [1, 1, 2, 3, 5, 8, 13] }
    const script = '.foo[4]'
    expect(executeScript(input, script)).toEqual(5)
  })

  test('pick by identifier and then index by negative number', () => {
    const input = { foo: [1, 1, 2, 3, 5, 8, 13] }
    const script = '.foo[-4]'
    expect(executeScript(input, script)).toEqual(3)
  })

  test('pick by identifier, index, then identifier again', () => {
    const input = { foo: [{ bar: 1 }, { bar: 2 }] }
    const script = '.foo[1].bar'
    expect(executeScript(input, script)).toEqual(2)
  })

  test('pick 0 value', () => {
    const input = { foo: 0 }
    const script = '.foo'
    expect(executeScript(input, script)).toEqual(0)
  })

  test('pick empty string value', () => {
    const input = { foo: '' }
    const script = '.foo'
    expect(executeScript(input, script)).toEqual('')
  })

  test('pick false value', () => {
    const input = { foo: false }
    const script = '.foo'
    expect(executeScript(input, script)).toEqual(false)
  })
})

describe('functions', () => {
  test('trim', () => {
    expect(executeScript('  a-b  ', 'trim')).toEqual('a-b')
  })
  test('ltrim', () => {
    expect(executeScript('  a-b  ', 'ltrim')).toEqual('a-b  ')
  })
  test('rtrim', () => {
    expect(executeScript('  a-b  ', 'rtrim')).toEqual('  a-b')
  })
  test('startswith', () => {
    expect(executeScript('a-b--', 'startswith("a")')).toEqual(true)
    expect(executeScript('a-b--', 'startswith("-")')).toEqual(false)
  })
  test('endswith', () => {
    expect(executeScript('a-b--', 'endswith("-")')).toEqual(true)
    expect(executeScript('a-b--', 'endswith("a")')).toEqual(false)
  })
  test('ltrimstr', () => {
    expect(executeScript('--a-b--', 'ltrimstr("-")')).toEqual('-a-b--')
  })
  test('rtrimstr', () => {
    expect(executeScript('--a-b--', 'rtrimstr("-")')).toEqual('--a-b-')
  })
  test('split', () => {
    expect(executeScript('a-b-c', 'split("-")')).toEqual(['a', 'b', 'c'])
  })
  test('join', () => {
    expect(executeScript(['a', 'b', 'c'], 'join("-")')).toEqual('a-b-c')
  })
})

describe('lazy operator', () => {
  test('cannot pick a key from a number', () => {
    const input = 1
    const script = '.foo'
    expect(() => executeScript(input, script)).toThrowErrorMatchingInlineSnapshot(
      '"Cannot index number with foo"'
    )
  })

  test('can suppress errors', () => {
    const input = 1
    const script = '.foo?'
    expect(executeScript(input, script)).toEqual(undefined)
  })

  test('cannot expand a literal as an array', () => {
    const input = 1
    const script = '.[]'
    expect(() => executeScript(input, script)).toThrowErrorMatchingInlineSnapshot(
      '"Cannot iterate over number"'
    )
  })

  test('can suppress iteration errors', () => {
    const input = 1
    const script = '.[]?'
    expect(executeScript(input, script)).toEqual(undefined)
  })
})

describe('pipes', () => {
  test('simple pipe', () => {
    const input = { foo: { bar: 'baz' } }
    const script = '.foo | .bar'
    expect(executeScript(input, script)).toEqual('baz')
  })
})

describe('create array', () => {
  test('with literal', () => {
    expect(executeScript(null, '[ 1 ]')).toEqual([1])
  })

  test('with multiple literal', () => {
    expect(executeScript(null, '[ 1, "2", \'3\', null ]')).toEqual([1, '2', '3', null])
  })

  test('with filter', () => {
    expect(executeScript({ foo: 'bar' }, '[ .foo ]')).toEqual(['bar'])
  })

  test('with complex filter', () => {
    const input = { foo: [{ bar: 1 }, { bar: 2 }] }
    const script = '[ .foo[1].bar ]'
    expect(executeScript(input, script)).toEqual([2])
  })
})

describe('create object', () => {
  test('with literal', () => {
    expect(executeScript(null, '{ foo: 42 }')).toEqual({ foo: 42 })
  })

  test('with multiple literal', () => {
    expect(executeScript(null, '{ foo: 42, bar: "baz", quux: { schmee: null } }')).toEqual({
      foo: 42,
      bar: 'baz',
      quux: { schmee: null },
    })
  })

  test('with filters', () => {
    expect(executeScript({ foo: 'bar' }, '{ bar: .foo }')).toEqual({
      bar: 'bar',
    })
  })

  test('with iterators', () => {
    const input = { foo: ['a', 'b'], bar: [1, 2] }
    const script = '{ foo: .foo[], bar: .bar[] }'
    expect(executeScript(input, script)).toEqual([
      { foo: 'a', bar: 1 },
      { foo: 'a', bar: 2 },
      { foo: 'b', bar: 1 },
      { foo: 'b', bar: 2 },
    ])
  })
})

describe('iterator', () => {
  test('array', () => {
    const input = ['foo', 'bar']
    const script = '.[]'
    expect(executeScript(input, script)).toEqual(['foo', 'bar'])
  })

  test('object', () => {
    const input = { foo: 'a', bar: 'b' }
    const script = '.[]'
    expect(executeScript(input, script)).toEqual(['a', 'b'])
  })

  test('nested', () => {
    const input = { foo: [{ a: 1, b: 2 }], bar: [{ a: 3, b: 4 }] }
    const script = '.[].[].b'
    expect(executeScript(input, script)).toEqual([2, 4])
  })

  test('object, nested', () => {
    const input = {
      foo: [
        { a: 1, b: 2 },
        { a: 3, b: 4 },
      ],
      bar: [
        { a: 5, b: 6 },
        { a: 7, b: 8 },
      ],
    }
    const script = '{foo: .[].[].a, bar: .[].[].b}'
    expect(executeScript(input, script)).toEqual([
      { foo: 1, bar: 2 },
      { foo: 1, bar: 4 },
      { foo: 1, bar: 6 },
      { foo: 1, bar: 8 },
      { foo: 3, bar: 2 },
      { foo: 3, bar: 4 },
      { foo: 3, bar: 6 },
      { foo: 3, bar: 8 },
      { foo: 5, bar: 2 },
      { foo: 5, bar: 4 },
      { foo: 5, bar: 6 },
      { foo: 5, bar: 8 },
      { foo: 7, bar: 2 },
      { foo: 7, bar: 4 },
      { foo: 7, bar: 6 },
      { foo: 7, bar: 8 },
    ])
  })

  test('should not double-promote double-nested single elment array', () => {
    const input = [[1]]
    const script = '{foo: .[]}'
    expect(executeScript(input, script)).toEqual({ foo: [1] })
  })

  test('cannot iterate over null', () => {
    const input = null
    const script = '.[]'
    expect(() => executeScript(input, script)).toThrowErrorMatchingInlineSnapshot(
      '"Cannot iterate over null"'
    )
  })
})

describe('nested structures', () => {
  test('#1', () => {
    const input = {
      foo: [
        {
          bar: 'baz',
        },
        {
          bar: 'quux',
        },
      ],
    }

    expect(executeScript(input, '.foo[] | .bar')).toEqual(['baz', 'quux'])
  })

  test('#2', () => {
    const input = {
      data: {
        foo: {
          entries: [
            { name: 'foo-a', a: { b: { c: { d: 1 } } } },
            { name: 'foo-b', a: { b: { c: { d: 2 } } } },
          ],
        },
        bar: {
          entries: [
            { name: 'bar-a', a: { b: { c: { d: 3 } } } },
            { name: 'bar-b', a: { b: { c: { d: 4 } } } },
            { name: 'bar-c', a: {} },
          ],
        },
      },
    }

    expect(executeScript(input, '[.data[].entries[] | {name: .name, value: .a.b.c.d}]')).toEqual([
      { name: 'foo-a', value: 1 },
      { name: 'foo-b', value: 2 },
      { name: 'bar-a', value: 3 },
      { name: 'bar-b', value: 4 },
      { name: 'bar-c', value: null },
    ])
  })

  test('#3', () => {
    const input = {
      data: {
        foo: {
          entries: [{ name: 'foo-a', a: { b: { c: { d: [{ e: 1 }, { e: 2 }] } } } }],
        },
      },
    }

    expect(
      executeScript(input, '[.data[].entries[] | {name: .name, values: [ .a.b.c.d[] | .e ]}]')
    ).toEqual([{ name: 'foo-a', values: [1, 2] }])
  })
})

describe('comparison operators', () => {
  test('== on equal values', () => {
    expect(executeScript({ type: 'keyword' }, '.type == "keyword"')).toEqual(true)
  })

  test('== on unequal values', () => {
    expect(executeScript({ type: 'text' }, '.type == "keyword"')).toEqual(false)
  })

  test('!= on unequal values', () => {
    expect(executeScript({ type: 'text' }, '.type != "keyword"')).toEqual(true)
  })

  test('!= on equal values', () => {
    expect(executeScript({ type: 'keyword' }, '.type != "keyword"')).toEqual(false)
  })

  test('< on numbers', () => {
    expect(executeScript({ n: 3 }, '.n < 5')).toEqual(true)
    expect(executeScript({ n: 5 }, '.n < 5')).toEqual(false)
  })

  test('> on numbers', () => {
    expect(executeScript({ n: 6 }, '.n > 5')).toEqual(true)
    expect(executeScript({ n: 4 }, '.n > 5')).toEqual(false)
  })

  test('<= on numbers', () => {
    expect(executeScript({ n: 5 }, '.n <= 5')).toEqual(true)
    expect(executeScript({ n: 6 }, '.n <= 5')).toEqual(false)
  })

  test('>= on numbers', () => {
    expect(executeScript({ n: 5 }, '.n >= 5')).toEqual(true)
    expect(executeScript({ n: 4 }, '.n >= 5')).toEqual(false)
  })

  test('< on strings (lexicographic)', () => {
    expect(executeScript({ s: 'apple' }, '.s < "banana"')).toEqual(true)
    expect(executeScript({ s: 'zebra' }, '.s < "banana"')).toEqual(false)
  })

  test('> on strings (lexicographic)', () => {
    expect(executeScript({ s: 'zebra' }, '.s > "apple"')).toEqual(true)
    expect(executeScript({ s: 'apple' }, '.s > "zebra"')).toEqual(false)
  })

  test('<= on strings', () => {
    expect(executeScript({ s: 'apple' }, '.s <= "apple"')).toEqual(true)
    expect(executeScript({ s: 'banana' }, '.s <= "apple"')).toEqual(false)
  })

  test('>= on strings', () => {
    expect(executeScript({ s: 'banana' }, '.s >= "apple"')).toEqual(true)
    expect(executeScript({ s: 'apple' }, '.s >= "banana"')).toEqual(false)
  })

  test('== on numbers', () => {
    expect(executeScript({ n: 42 }, '.n == 42')).toEqual(true)
    expect(executeScript({ n: 42 }, '.n == 43')).toEqual(false)
  })

  test('== on booleans', () => {
    expect(executeScript({ active: true }, '.active == true')).toEqual(true)
    expect(executeScript({ active: false }, '.active == true')).toEqual(false)
  })

  test('== on null', () => {
    expect(executeScript({ a: null }, '.a == null')).toEqual(true)
    expect(executeScript({ a: 'something' }, '.a == null')).toEqual(false)
  })

  test('!= on numbers', () => {
    expect(executeScript({ n: 5 }, '.n != 3')).toEqual(true)
    expect(executeScript({ n: 3 }, '.n != 3')).toEqual(false)
  })

  test('!= on booleans', () => {
    expect(executeScript({ active: false }, '.active != true')).toEqual(true)
    expect(executeScript({ active: true }, '.active != true')).toEqual(false)
  })

  test('== on nested values', () => {
    expect(executeScript({ a: { b: 'foo' } }, '.a.b == "foo"')).toEqual(true)
  })
})

describe('logical operators', () => {
  test('and — both true', () => {
    expect(executeScript({ a: 1, b: 2 }, '.a == 1 and .b == 2')).toEqual(true)
  })

  test('and — one false', () => {
    expect(executeScript({ a: 1, b: 3 }, '.a == 1 and .b == 2')).toEqual(false)
  })

  test('or — one true', () => {
    expect(executeScript({ type: 'text' }, '.type == "keyword" or .type == "text"')).toEqual(true)
  })

  test('or — both false', () => {
    expect(executeScript({ type: 'date' }, '.type == "keyword" or .type == "text"')).toEqual(false)
  })

  test('chained and', () => {
    expect(executeScript({ a: 1, b: 2, c: 3 }, '.a == 1 and .b == 2 and .c == 3')).toEqual(true)
    expect(executeScript({ a: 1, b: 2, c: 4 }, '.a == 1 and .b == 2 and .c == 3')).toEqual(false)
  })
})

describe('not', () => {
  test('negates false', () => {
    expect(executeScript(false, 'not')).toEqual(true)
  })

  test('negates true', () => {
    expect(executeScript(true, 'not')).toEqual(false)
  })

  test('negates null', () => {
    expect(executeScript(null, 'not')).toEqual(true)
  })

  test('via pipe', () => {
    expect(executeScript({ active: false }, '.active | not')).toEqual(true)
  })
})

describe('select', () => {
  test('keeps matching elements', () => {
    expect(executeScript([1, 2, 3, 4], '.[] | select(. > 2)')).toEqual([3, 4])
  })

  test('drops non-matching elements', () => {
    expect(executeScript([1, 2, 3], '.[] | select(. == 99)')).toEqual(undefined)
  })

  test('with string comparison', () => {
    const input = [{ type: 'keyword' }, { type: 'text' }, { type: 'keyword' }]
    expect(executeScript(input, '.[] | select(.type == "keyword") | .type')).toEqual([
      'keyword',
      'keyword',
    ])
  })

  test('with != comparison', () => {
    const input = [{ type: 'keyword' }, { type: 'text' }]
    expect(executeScript(input, '.[] | select(.type != "keyword") | .type')).toEqual('text')
  })

  test('with and condition', () => {
    const input = [
      { type: 'keyword', active: true },
      { type: 'keyword', active: false },
      { type: 'text', active: true },
    ]
    expect(executeScript(input, '.[] | select(.type == "keyword" and .active == true)')).toEqual({
      type: 'keyword',
      active: true,
    })
  })

  test('with or condition', () => {
    const input = [{ type: 'date' }, { type: 'keyword' }, { type: 'text' }]
    expect(
      executeScript(input, '.[] | select(.type == "keyword" or .type == "text") | .type')
    ).toEqual(['keyword', 'text'])
  })

  test('errors suppressed — non-matching type is silently dropped', () => {
    const input = [{ type: 'keyword' }, 'not-an-object']
    expect(executeScript(input, '.[] | select(.type == "keyword") | .type')).toEqual('keyword')
  })
})

describe('length', () => {
  test('returns string length', () => {
    expect(executeScript('hello', 'length')).toEqual(5)
  })

  test('counts multibyte characters as one', () => {
    expect(executeScript('🐴', 'length')).toEqual(1)
    expect(executeScript('👨‍👩‍👧‍👦', 'length')).toEqual(1)
    expect(executeScript('🐴🐴🐴', 'length')).toEqual(3)
    expect(executeScript('hello 🌍', 'length')).toEqual(7)
  })

  test('returns array length', () => {
    expect(executeScript([1, 2, 3], 'length')).toEqual(3)
  })

  test('returns object key count', () => {
    expect(executeScript({ a: 1, b: 2 }, 'length')).toEqual(2)
  })

  test('returns 0 for null', () => {
    expect(executeScript(null, 'length')).toEqual(0)
  })

  test('returns absolute value for numbers', () => {
    expect(executeScript(-5, 'length')).toEqual(5)
    expect(executeScript(3, 'length')).toEqual(3)
  })

  test('works in a pipe', () => {
    expect(executeScript({ a: 1, b: 2, c: 3 }, 'keys | length')).toEqual(3)
  })

  test('throws on boolean', () => {
    expect(() => executeScript(true, 'length')).toThrow()
    expect(() => executeScript(false, 'length')).toThrow()
  })
})

describe('keys', () => {
  test('returns sorted object keys', () => {
    expect(executeScript({ b: 2, a: 1, c: 3 }, 'keys')).toEqual(['a', 'b', 'c'])
  })

  test('returns indices for arrays', () => {
    expect(executeScript(['x', 'y', 'z'], 'keys')).toEqual([0, 1, 2])
  })

  test('on nested object', () => {
    expect(executeScript({ foo: { b: 1, a: 2 } }, '.foo | keys')).toEqual(['a', 'b'])
  })

  test('throws on non-object', () => {
    expect(() => executeScript(42, 'keys')).toThrow()
  })
})

describe('to_entries', () => {
  test('converts object to key/value pairs', () => {
    expect(executeScript({ a: 1, b: 2 }, '[to_entries]')).toEqual([
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
    ])
  })

  test('converts array to index/value pairs', () => {
    expect(executeScript(['x', 'y'], '[to_entries]')).toEqual([
      { key: 0, value: 'x' },
      { key: 1, value: 'y' },
    ])
  })

  test('pipes each entry individually', () => {
    expect(executeScript({ a: 1, b: 2 }, 'to_entries | .key')).toEqual(['a', 'b'])
  })

  test('select on entries — filter by value', () => {
    const input = { a: 'keyword', b: 'text', c: 'keyword' }
    expect(executeScript(input, 'to_entries | select(.value == "keyword") | .key')).toEqual([
      'a',
      'c',
    ])
  })

  test('primary use case — find index names by mapping type', () => {
    const mappings = {
      'index-1': { mappings: { properties: { status: { type: 'keyword' } } } },
      'index-2': { mappings: { properties: { status: { type: 'text' } } } },
      'index-3': { mappings: { properties: { status: { type: 'keyword' } } } },
    }
    expect(
      executeScript(
        mappings,
        'to_entries | select(.value.mappings.properties.status.type != "keyword") | .key'
      )
    ).toEqual('index-2')
  })

  test('primary use case — multiple matches', () => {
    const mappings = {
      'index-1': { mappings: { properties: { status: { type: 'text' } } } },
      'index-2': { mappings: { properties: { status: { type: 'text' } } } },
    }
    expect(
      executeScript(
        mappings,
        'to_entries | select(.value.mappings.properties.status.type != "keyword") | .key'
      )
    ).toEqual(['index-1', 'index-2'])
  })
})

describe('from_entries', () => {
  test('converts key/value pairs back to object', () => {
    expect(
      executeScript(
        [
          { key: 'a', value: 1 },
          { key: 'b', value: 2 },
        ],
        'from_entries'
      )
    ).toEqual({ a: 1, b: 2 })
  })

  test('accepts name instead of key', () => {
    expect(executeScript([{ name: 'x', value: 42 }], 'from_entries')).toEqual({ x: 42 })
  })

  test('accepts mixed-case Key and Value', () => {
    expect(executeScript([{ Key: 'a', Value: 1 }], 'from_entries')).toEqual({ a: 1 })
  })

  test('accepts mixed-case Name and Value', () => {
    expect(executeScript([{ Name: 'b', Value: 2 }], 'from_entries')).toEqual({ b: 2 })
  })

  test('round-trips with to_entries', () => {
    const input = { a: 1, b: 2 }
    expect(executeScript(input, '[to_entries] | from_entries')).toEqual(input)
  })

  test('throws on non-array input', () => {
    expect(() => executeScript({ a: 1 }, 'from_entries')).toThrow()
  })
})

describe('recursive descent (..)', () => {
  test('visits all nodes depth-first and collects optional field', () => {
    const input = { a: { type: 'keyword' }, b: { c: { type: 'text' } } }
    // root has no .type → null; {type:'keyword'} → 'keyword'; 'keyword' string → skipped;
    // {c:{...}} has no .type → null; {type:'text'} → 'text'; 'text' string → skipped
    expect(executeScript(input, '.. | .type?')).toEqual([null, 'keyword', null, 'text'])
  })

  test('works on arrays — array itself is skipped by optional pick', () => {
    const input = [{ type: 'keyword' }, { type: 'text' }]
    // the array itself has no .type (arrays skipped in non-strict); objects yield their .type
    expect(executeScript(input, '.. | .type?')).toEqual(['keyword', 'text'])
  })

  test('collects all values at any depth using array construction', () => {
    const input = { a: { b: { type: 'date' } }, c: { type: 'keyword' } }
    const result = executeScript(input, '[.. | .type?]') as string[]
    expect(result.filter((v) => v !== null)).toEqual(['date', 'keyword'])
  })
})
