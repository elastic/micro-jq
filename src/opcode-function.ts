import { Context, JSONValue, NoArgFunctioName, OpFunction, StringArgFunctionName } from './types'

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

const noArgCallbacks: Record<NoArgFunctioName, (each: JSONValue) => JSONValue> = {
  ltrim(each) {
    if (typeof each !== 'string') {
      throw new Error(`Cannot ltrim ${typeof each}`)
    }
    return each.trimStart()
  },
  rtrim(each) {
    if (typeof each !== 'string') {
      throw new Error(`Cannot rtrim ${typeof each}`)
    }
    return each.trimEnd()
  },
  trim(each) {
    if (typeof each !== 'string') {
      throw new Error(`Cannot trim ${typeof each}`)
    }
    return each.trim()
  },
  not(each) {
    return !each
  },
  keys(each) {
    if (Array.isArray(each)) {
      return each.map((_, i) => i)
    }
    if (typeof each === 'object' && each !== null) {
      return Object.keys(each as Record<string, JSONValue>).sort()
    }
    throw new Error(`Cannot get keys of ${typeof each}`)
  },
  length(each) {
    if (each === null) {
      return 0
    }
    if (typeof each === 'string') {
      return each.length
    }
    if (typeof each === 'number') {
      return Math.abs(each)
    }
    if (Array.isArray(each)) {
      return each.length
    }
    if (typeof each === 'object') {
      return Object.keys(each as Record<string, JSONValue>).length
    }
    throw new Error(`Cannot get length of ${typeof each}`)
  },
  from_entries(each) {
    if (!Array.isArray(each)) {
      throw new Error('from_entries input must be an array')
    }
    const result: Record<string, JSONValue> = {}
    for (const entry of each) {
      if (typeof entry !== 'object' || Array.isArray(entry) || entry === null) {
        throw new Error('from_entries entry must be an object')
      }
      const e = entry as Record<string, JSONValue>
      const k = e.key ?? e.Key ?? e.name ?? e.Name
      if (k === undefined || k === null) {
        throw new Error('from_entries entry must have key or name')
      }
      const v = 'value' in e ? e.value : e.Value
      result[String(k)] = v as JSONValue
    }
    return result
  },
}

const stringArgCallbacks: Record<
  StringArgFunctionName,
  (each: JSONValue, value: string) => JSONValue
> = {
  startswith(each, value) {
    if (typeof each !== 'string') {
      throw new Error(`Cannot startswith ${typeof each}`)
    }
    return each.startsWith(value)
  },

  endswith(each, value) {
    if (typeof each !== 'string') {
      throw new Error(`Cannot endswith ${typeof each}`)
    }
    return each.endsWith(value)
  },

  ltrimstr(each, value) {
    if (typeof each !== 'string') {
      throw new Error(`Cannot ltrimstr ${typeof each}`)
    }
    return each.startsWith(value) ? each.slice(value.length) : each
  },

  rtrimstr(each, value) {
    if (typeof each !== 'string') {
      throw new Error(`Cannot rtrimstr ${typeof each}`)
    }
    return each.endsWith(value) ? each.slice(0, -value.length) : each
  },

  split(each, value) {
    if (typeof each !== 'string') {
      throw new Error(`Cannot split ${typeof each}`)
    }
    return each.split(value)
  },

  join(each: Context[number], value: string): string {
    if (!Array.isArray(each)) {
      throw new Error(`Cannot join ${typeof each}`)
    }
    return each.join(value)
  },
}
