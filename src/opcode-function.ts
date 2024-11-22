import { Context, NoArgFunctioName, OpFunction, StringArgFunctionName } from './types'

export function evaluateOpCode_function(context: Context, { name, value }: OpFunction): Context {
  const result: Context = []

  const stringArgCallback =
    name in stringArgCallbacks ? stringArgCallbacks[name as StringArgFunctionName] : undefined

  const noArgCallback =
    !stringArgCallback && name in noArgCallbacks
      ? noArgCallbacks[name as NoArgFunctioName]
      : undefined

  if (stringArgCallback) {
    if (value === undefined) {
      throw new Error('Unexpected value for string arg callback')
    }
    for (const each of context) {
      result.push(stringArgCallback(each, value))
    }
  } else if (noArgCallback) {
    if (value !== undefined) {
      throw new Error('Unexpected value for no arg callback')
    }
    for (const each of context) {
      result.push(noArgCallback(each))
    }
  } else {
    throw new Error('Unknown function name: ' + name)
  }

  return result
}

const noArgCallbacks = {
  ltrim(each: Context[number]): string {
    if (typeof each !== 'string') throw new Error(`Cannot ltrim ${typeof each}`)
    return each.trimStart()
  },
  rtrim(each: Context[number]): string {
    if (typeof each !== 'string') throw new Error(`Cannot rtrim ${typeof each}`)
    return each.trimEnd()
  },
  trim(each: Context[number]): string {
    if (typeof each !== 'string') throw new Error(`Cannot trim ${typeof each}`)
    return each.trim()
  },
} as const

const stringArgCallbacks = {
  startswith<Value extends string>(
    each: Context[number],
    value: Value
  ): each is `${Value}${string}` {
    if (typeof each !== 'string') throw new Error(`Cannot startswith ${typeof each}`)
    return each.startsWith(value)
  },

  endswith<Value extends string>(each: Context[number], value: Value): each is `${string}${Value}` {
    if (typeof each !== 'string') throw new Error(`Cannot endswith ${typeof each}`)
    return each.endsWith(value)
  },

  ltrimstr(each: Context[number], value: string): string {
    return stringArgCallbacks.startswith(each, value) ? each.slice(value.length) : value
  },

  rtrimstr(each: Context[number], value: string): string {
    return stringArgCallbacks.endswith(each, value) ? each.slice(0, 0 - value.length) : value
  },

  split(each: Context[number], value: string): string[] {
    if (typeof each !== 'string') throw new Error(`Cannot split ${typeof each}`)
    return each.split(value)
  },

  join(each: Context[number], value: string): string {
    if (!Array.isArray(each)) throw new Error(`Cannot join ${typeof each}`)
    return each.join(value)
  },
} as const
