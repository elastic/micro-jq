type Primitive = boolean | null | number | string
export type JSONValue = Primitive | JSONObject | JSONArray

export interface JSONObject {
  [key: string]: JSONValue
}

export type JSONArray = Array<JSONValue>
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
