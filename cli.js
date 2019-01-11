const fs = require('fs')
const executeScript = require('./execute')

const script = process.argv[2] || '.'

const input = JSON.parse(fs.readFileSync(0, 'utf8'))

const result = executeScript(input, script)

console.log('In:')
console.dir(input)
console.log('Out:')
result.forEach(r => console.dir(r))

