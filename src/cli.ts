/* eslint-disable no-console */

import { readFileSync } from 'fs'
import executeScript from './execute'

const script = process.argv[2] || '.'

const input = JSON.parse(readFileSync(0, 'utf8'))

const result = executeScript(input, script)

if (Array.isArray(result)) {
  for (const eachResult of result) {
    console.log(JSON.stringify(eachResult))
  }
} else {
  console.log(JSON.stringify(result))
}
