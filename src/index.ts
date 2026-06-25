import { parse } from './parser'

export function checkScript(script: string): boolean {
  try {
    parse(script)
    return true
  } catch {
    return false
  }
}

export { default as executeScript } from './execute'
