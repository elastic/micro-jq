const executeScript = require('../src/execute')

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
    expect(() =>
      executeScript(input, script)
    ).toThrowErrorMatchingInlineSnapshot('"Cannot slice with no offsets"')
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
    const input = { foo: [ { bar: 1 }, { bar: 2 } ] }
    const script = '.foo[1].bar'
    expect(executeScript(input, script)).toEqual(2)
  })
})

describe('lazy operator', () => {
  test('cannot pick a key from a number', () => {
    const input = 1
    const script = '.foo'
    expect(() =>
      executeScript(input, script)
    ).toThrowErrorMatchingInlineSnapshot('"Cannot index number with foo"')
  })

  test('can suppress errors', () => {
    const input = 1
    const script = '.foo?'
    expect(executeScript(input, script)).toEqual(undefined)
  })

  test('cannot expand a literal as an array', () => {
    const input = 1
    const script = '.[]'
    expect(() =>
      executeScript(input, script)
    ).toThrowErrorMatchingInlineSnapshot('"Cannot iterate over number"')
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
    expect(executeScript(null, "[ 1, \"2\", '3', null ]")).toEqual([
      1,
      '2',
      '3',
      null,
    ])
  })

  test('with filter', () => {
    expect(executeScript({ foo: 'bar' }, '[ .foo ]')).toEqual(['bar'])
  })

  test('with complex filter', () => {
    const input = { foo: [ { bar: 1 }, { bar: 2 } ] }
    const script = '[ .foo[1].bar ]'
    expect(executeScript(input, script)).toEqual([2])
  })
})

describe('create object', () => {
  test('with literal', () => {
    expect(executeScript(null, '{ foo: 42 }')).toEqual({ foo: 42 })
  })

  test('with multiple literal', () => {
    expect(
      executeScript(null, '{ foo: 42, bar: "baz", quux: { schmee: null } }')
    ).toEqual({ foo: 42, bar: 'baz', quux: { schmee: null } })
  })

  test('with filters', () => {
    expect(executeScript({ foo: 'bar' }, '{ bar: .foo }')).toEqual({
      bar: 'bar',
    })
  })
})

test('nested structures', () => {
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
