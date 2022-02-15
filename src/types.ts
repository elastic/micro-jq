export type JSONValue =
  | string
  | number
  | boolean
  | null
  | undefined // not a JSON type, but included for interoperability with defined types that allow undefined
  | JSONValue[]
  | { [key: string]: JSONValue }

export type Context = JSONValue[]

export interface OpCreateArray {
  op: 'create_array'
  values: OpCode[][]
}

export interface OpCreateObject {
  op: 'create_object'
  entries: Array<{ key: string; value: OpCode[] }>
}

interface OpCurrentContext {
  op: 'current_context'
}

export interface OpExplode {
  op: 'explode'
  strict: boolean
}

export interface OpIndex {
  op: 'index'
  index: number
  strict: boolean
}

interface OpLiteral {
  op: 'literal'
  value: string | number | null
}

export interface OpPick {
  op: 'pick'
  key: string
  strict: boolean
}

export interface OpPipe {
  op: 'pipe'
  in: OpCode[]
  out: OpCode[]
}

export interface OpSlice {
  op: 'slice'
  start: number | undefined
  end: number | undefined
  strict: boolean
}

export type OpCode =
  | OpCreateArray
  | OpCreateObject
  | OpCurrentContext
  | OpExplode
  | OpIndex
  | OpLiteral
  | OpPick
  | OpPipe
  | OpSlice

export interface Exploder {
  exploded: boolean
  length: number
}

export type ExploderCallback = (length: number) => void
