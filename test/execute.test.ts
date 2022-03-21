import { executeScript } from '../src'

describe('literals', () => {
  test('number', () => {
    expect(executeScript(null, '42')).toEqual(42)
  })

  test('strings', () => {
    expect(executeScript(null, '"foo"')).toEqual('foo')
    expect(executeScript(null, "'foo'")).toEqual('foo')
  })

  test('null', () => {
    expect(executeScript(null, 'null')).toEqual(null)
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
