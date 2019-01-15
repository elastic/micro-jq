/* eslint-disable no-console */

const fs = require('fs')
const executeScript = require('./execute')

const script = process.argv[2] || '.'

const input = JSON.parse(fs.readFileSync(0, 'utf8'))

const result = executeScript(input, script)

if (Array.isArray(result)) {
  for (const eachResult of result) {
    console.log(JSON.stringify(eachResult))
  }
} else {
  console.log(JSON.stringify(result))
}
