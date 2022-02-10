// @ts-ignore
import { parse } from './parser'
import {
  Context,
  Exploder,
  ExploderCallback,
  JSONArray,
  JSONObject,
  JSONValue,
  OpCode,
  OpCreateArray,
  OpCreateObject,
  OpExplode,
  OpIndex,
  OpPick,
  OpPipe,
  OpSlice,
} from './types'

export default function executeScript(input: JSONValue, script: string) {
  const opCodes = parse(script)

  return evaluateOpCodes([input], opCodes)
}

function evaluateOpCodes(
  context: Context,
  opCodes: OpCode[],
  callback?: ExploderCallback
): JSONValue {
  do {
    const opCode = opCodes.shift()

    if (opCode == null) {
      throw new Error('null opcode, cannot continue')
    }

    switch (opCode.op) {
      case 'current_context':
        break

      case 'literal':
        context = [opCode.value]
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
        context = evaluateOpCode_explode(context, opCode, callback)
        break

      case 'create_array':
        context = evaluateOpCode_create_array(context, opCode)
        break

      case 'create_object':
        context = evaluateOpCode_create_object(context, opCode, callback)
        break

      case 'pipe':
        context = evaluateOpCode_pipe(context, opCode, callback)
        break

      default:
        // @ts-ignore shouldn't happen
        throw new Error('Unknown op code: ' + opCode.op)
    }
  } while (opCodes.length > 0)

  return context.length > 1 ? context : context[0]
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
    let picked: JSONValue = null
    if (each != null && each[opCode.key]) {
      picked = each[opCode.key]
    }
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
    result.push(indexed)
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
        result.push((each as string | JSONArray).slice(opCode.start, opCode.end))
      }
      return result
    }
  }, [])
}

function evaluateOpCode_explode(
  context: Context,
  opCode: OpExplode,
  callback?: ExploderCallback
): Context {
  context = context.reduce<Context>((result, each) => {
    if (Array.isArray(each)) {
      return result.concat(each)
    } else if (typeof each === 'object' && each != null) {
      return result.concat(Object.values(each))
    }
    if (opCode.strict) {
      // jq throws an error specifically for `null`, so let's
      // distinguish that from `object`.
      const type = each === null ? 'null' : typeof each
      throw new Error('Cannot iterate over ' + type)
    }
    return result
  }, [])
  if (callback) {
    callback(context.length)
  }
  return context
}

function evaluateOpCode_create_array(context: Context, opCode: OpCreateArray): Context {
  return [
    opCode.values.reduce((result, opCodesForIndex) => {
      const exploder = makeExploder()
      // Array creation terminates an explode chain - all generated
      // results will get collected in the singular array. As such,
      // no parent is called to makeExploderCb, and none is taken by
      // this function.
      const values = evaluateOpCodes(context, [...opCodesForIndex], makeExploderCb(exploder))
      if (!exploder.exploded) {
        result.push(values)
      } else {
        switch (exploder.length) {
          case 0:
            break

          case 1:
            result.push(values)
            break

          default:
            result = result.concat(values)
        }
      }

      return result
    }, [] as Context),
  ]
}

function evaluateOpCode_create_object(
  context: Context,
  opCode: OpCreateObject,
  callback?: ExploderCallback
): Context {
  const jsonObject = opCode.entries.reduce((result, each) => {
    const exploder = makeExploder()
    const values: JSONValue = evaluateOpCodes(
      context,
      [...each.value],
      makeExploderCb(exploder, callback)
    )

    if (!exploder.exploded) {
      result[each.key] = [values]
    } else {
      switch (exploder.length) {
        case 0:
          result[each.key] = []
          break

        case 1:
          result[each.key] = [values]
          break

        default:
          result[each.key] = values as Context
          break
      }
    }
    return result
  }, {} as { [key: string]: Context })

  const ops: [string, Context][] = Object.entries(jsonObject)

  return evaluateOpCode_create_object_build({} as JSONObject, ops)
}

function evaluateOpCode_create_object_build(current: JSONObject, ops: Array<[string, Context]>) {
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

function evaluateOpCode_pipe(
  context: Context,
  opCode: OpPipe,
  callback?: ExploderCallback
): Context {
  const exploder = makeExploder()
  let result = evaluateOpCodes(context, [...opCode.in], makeExploderCb(exploder, callback))
  if (!exploder.exploded) {
    result = evaluateOpCodes([result], [...opCode.out])
  } else {
    let explodedResult: JSONValue[]
    switch (exploder.length) {
      case 0:
        explodedResult = []
        break

      case 1:
        explodedResult = [result]
        break

      default:
        explodedResult = result as JSONValue[]
        break
    }
    result =
      explodedResult == null
        ? null
        : explodedResult.map((each) => evaluateOpCodes([each], [...opCode.out]))
  }
  return Array.isArray(result) ? result : [result]
}

function makeExploder(): Exploder {
  return { exploded: false, length: 0 }
}

function makeExploderCb(exploder: Exploder, callback?: ExploderCallback): ExploderCallback {
  return (length) => {
    exploder.exploded = true
    exploder.length = length
    if (callback) {
      callback(length)
    }
  }
}
