import { evaluateOpCode_function } from './opcode-function'
// @ts-ignore
import { parse } from './parser'
import {
  ComparisonOperator,
  Context,
  JSONValue,
  OpCode,
  OpComparison,
  OpCreateArray,
  OpCreateObject,
  OpExplode,
  OpIndex,
  OpLogical,
  OpPick,
  OpPipe,
  OpSelect,
  OpSlice,
} from './types'

export default function executeScript(input: JSONValue, script: string) {
  const opCodes = parse(script) as OpCode[]

  const results = evaluateOpCodes([input], opCodes)
  return results.length > 1 ? results : results[0]
}

function evaluateOpCodes(context: Context, opCodes: OpCode[]): Context {
  for (const opCode of opCodes) {
    switch (opCode.op) {
      case 'current_context':
        break

      case 'literal':
        context = context.map(() => nullify(opCode.value))
        break

      case 'pick':
        context = evaluateOpCode_pick(context, opCode)
        break

      case 'index':
        context = evaluateOpCode_index(context, opCode)
        break

      case 'slice':
        context = evaluateOpCode_slice(context, opCode)
        break

      case 'explode':
        context = evaluateOpCode_explode(context, opCode)
        break

      case 'recursive_descent':
        context = evaluateOpCode_recursive_descent(context)
        break

      case 'to_entries':
        context = evaluateOpCode_to_entries(context)
        break

      case 'create_array':
        context = evaluateOpCode_create_array(context, opCode)
        break

      case 'create_object':
        context = evaluateOpCode_create_object(context, opCode)
        break

      case 'pipe':
        context = evaluateOpCode_pipe(context, opCode)
        break

      case 'function':
        context = evaluateOpCode_function(context, opCode)
        break

      case 'comma':
        context = context.flatMap((each) =>
          opCode.values.flatMap((ops) => evaluateOpCodes([each], ops))
        )
        break

      case 'comparison':
        context = evaluateOpCode_comparison(context, opCode)
        break

      case 'and':
      case 'or':
        context = evaluateOpCode_logical(context, opCode)
        break

      case 'select':
        context = evaluateOpCode_select(context, opCode)
        break

      default:
        // @ts-expect-error if this doesn't error, then some opcode isn't handled
        throw new Error('Unknown op code: ' + opCode.op)
    }
  }

  return context
}

function evaluateOpCode_pick(context: Context, opCode: OpPick): Context {
  return context.reduce<Context>((result, each) => {
    if (typeof each !== 'object' || Array.isArray(each)) {
      if (opCode.strict) {
        throw new Error(`Cannot index ${typeof each} with ${opCode.key}`)
      }
      // Skip this value entirely
      return result
    }
    const picked = each?.[opCode.key] ?? null
    result.push(picked)
    return result
  }, [])
}

function evaluateOpCode_index(context: Context, opCode: OpIndex): Context {
  return context.reduce<Context>((result, each) => {
    if (!Array.isArray(each)) {
      if (opCode.strict) {
        throw new Error('Can only index into arrays')
      }
      return result
    }
    let indexed
    if (Math.abs(opCode.index) > each.length || opCode.index === each.length) {
      indexed = null
    } else if (opCode.index < 0) {
      indexed = each.slice(opCode.index)[0]
    } else {
      indexed = each[opCode.index]
    }
    result.push(nullify(indexed))
    return result
  }, [])
}

function evaluateOpCode_slice(context: Context, opCode: OpSlice): Context {
  return context.reduce<Context>((result, each) => {
    if ('string' !== typeof each && Array.isArray(each) == false) {
      if (opCode.strict) {
        throw new Error('Cannot slice ' + typeof each)
      }
      return result
    } else {
      if (undefined === opCode.start && undefined === opCode.end) {
        throw new Error('Cannot slice with no offsets')
      }
      if (each == null) {
        result.push(null)
      } else {
        result.push((each as string | JSONValue[]).slice(opCode.start, opCode.end))
      }
      return result
    }
  }, [])
}

function evaluateOpCode_explode(context: Context, opCode: OpExplode): Context {
  context = context.reduce<Context>((result, each) => {
    if (Array.isArray(each)) {
      return result.concat(each.map(nullify))
    } else if (typeof each === 'object' && each != null) {
      return result.concat(Object.values(each).map(nullify))
    }
    if (opCode.strict) {
      // jq throws an error specifically for `null`, so let's
      // distinguish that from `object`.
      const type = each === null ? 'null' : typeof each
      throw new Error('Cannot iterate over ' + type)
    }
    return result
  }, [])
  return context
}

function evaluateOpCode_recursive_descent(context: Context): Context {
  const result: Context = []

  function walk(value: JSONValue) {
    value = nullify(value)
    result.push(value)
    if (Array.isArray(value)) {
      value.forEach(walk)
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(walk)
    }
  }

  context.forEach(walk)

  return result
}

function evaluateOpCode_to_entries(context: Context): Context {
  const result: Context = []
  for (const each of context) {
    if (Array.isArray(each)) {
      for (let i = 0; i < (each as JSONValue[]).length; i++) {
        result.push({ key: i as unknown as JSONValue, value: nullify((each as JSONValue[])[i]) })
      }
    } else if (typeof each === 'object' && each !== null) {
      for (const [k, v] of Object.entries(each as Record<string, JSONValue>)) {
        result.push({ key: k as JSONValue, value: nullify(v) })
      }
    } else {
      throw new Error(`Cannot get entries of ${typeof each}`)
    }
  }
  return result
}

function evaluateOpCode_comparison(context: Context, opCode: OpComparison): Context {
  return context.flatMap((each) => {
    const left = evaluateOpCodes([each], opCode.left)
    const right = evaluateOpCodes([each], opCode.right)
    return right.flatMap((r) => left.map((l) => compareValues(l, r, opCode.operator)))
  })
}

function compareValues(left: JSONValue, right: JSONValue, operator: ComparisonOperator): boolean {
  switch (operator) {
    case '==':
      return deepEqual(left, right)
    case '!=':
      return !deepEqual(left, right)
    case '<':
      return (left as number) < (right as number)
    case '>':
      return (left as number) > (right as number)
    case '<=':
      return (left as number) <= (right as number)
    case '>=':
      return (left as number) >= (right as number)
  }
}

function deepEqual(a: JSONValue, b: JSONValue): boolean {
  if (a === b) {
    return true
  }
  return JSON.stringify(a) === JSON.stringify(b)
}

function evaluateOpCode_logical(context: Context, opCode: OpLogical): Context {
  return context.flatMap((each) => {
    return evaluateOpCodes([each], opCode.left).flatMap((left) => {
      const truthy = left !== false && left !== null
      if (opCode.op === 'and' ? !truthy : truthy) {
        return [truthy]
      }
      return evaluateOpCodes([each], opCode.right).map((right) => right !== false && right !== null)
    })
  })
}

function evaluateOpCode_select(context: Context, opCode: OpSelect): Context {
  return context.flatMap((each) => {
    try {
      return evaluateOpCodes([each], opCode.condition)
        .filter((result) => result !== null && result !== false && result !== undefined)
        .map(() => each)
    } catch {
      return []
    }
  })
}

function evaluateOpCode_create_array(context: Context, opCode: OpCreateArray): Context {
  return context.map((each) => opCode.values.flatMap((ops) => evaluateOpCodes([each], ops)))
}

function evaluateOpCode_create_object(context: Context, opCode: OpCreateObject): Context {
  return context.flatMap((each) => {
    const entries: [string, Context][] = opCode.entries.map(({ key, value }) => [
      key,
      evaluateOpCodes([each], value),
    ])
    return evaluateOpCode_create_object_build({}, entries)
  })
}

function evaluateOpCode_create_object_build(
  current: { [key: string]: JSONValue },
  ops: Array<[string, Context]>
) {
  let result: Context = []
  const op = ops.shift()
  if (op == null) {
    throw new Error('Unexpectedly ran out of ops')
  }
  const [key, values] = op
  values.forEach((value) => {
    current[key] = value
    if (ops.length > 0) {
      result = result.concat(evaluateOpCode_create_object_build({ ...current }, [...ops]))
    } else {
      result.push({ ...current })
    }
  })
  return result
}

function evaluateOpCode_pipe(context: Context, opCode: OpPipe): Context {
  return evaluateOpCodes(context, opCode.in).flatMap((each) => evaluateOpCodes([each], opCode.out))
}

// JSON has no undefined; coerce it to null at all points where user data enters the context
function nullify(value: JSONValue): JSONValue {
  return value === undefined ? null : value
}
