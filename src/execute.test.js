const executeScript = require('./execute')

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

  test('with mutiple literal', () => {
    expect(executeScript(null, '[ 1, "2", \'3\', null ]')).toEqual([1,'2','3', null])
  })

  test('with filter', () => {
    expect(executeScript({ foo: 'bar' }, '[ .foo ]')).toEqual(['bar'])
  })
})

describe('create object', () => {
  test('with literal', () => {
    expect(executeScript(null, '{ foo: 42 }')).toEqual({ foo: 42 })
  })

  test('with multiple literal', () => {
    expect(executeScript(null, '{ foo: 42, bar: "baz", quux: { schmee: null } }')).toEqual({ foo: 42, bar: 'baz', quux: { schmee: null }})
  })

  test('with filters', () => {
    expect(executeScript({ foo: 'bar' }, '{ bar: .foo }')).toEqual({ bar: 'bar' })
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
      }
    ]
  }

  expect(executeScript(input, '.foo[] | .bar')).toEqual(['baz', 'quux'])
})

