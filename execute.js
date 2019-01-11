const parser = require('./parser')

module.exports = function executeScript(input, script) {
  const opCodes = parser.parse(script)

  return evaluateOpCodes([input], opCodes)
}

function evaluateOpCodes(context, opCodes) {
  if (!Array.isArray(opCodes)) {
    opCodes = [opCodes]
  }

  do {
    const opCode = opCodes.shift()

    switch (opCode.op) {
      case 'current_context':
        break

      case 'literal':
        context = [opCode.value];
        break

      case 'pick':
        context = context.reduce((result, each) => {
          const picked = each[opCode.key]
          if (opCode.explode) {
            if (!Array.isArray(picked)) {
              throw new Error('Cannot iterate over ' + typeof picked)
            }
            return result.concat(picked)
          }
          result.push(picked)
          return result
        }, [])
        break

      case 'index':
        context = context.map(x => {
          if (!Array.isArray(x)) {
            throw new Error('Can only index into arrays')
          }
          return x[opCode.index]
        })
        break

      case 'explode':
        context = context.reduce((result, each) => {
          if (!Array.isArray(each)) {
            throw new Error('Cannot iterate over ' + typeof each)
          }
          return result.concat(each)
        }, [])
        break

      case 'create_array':
        context = [ opCode.values.map(each => evaluateOpCodes(context, each)) ];
        break

      case 'create_object':
        context = [ opCode.entries.reduce((result, each) => {
          result[each.key] = evaluateOpCodes(context, each.value)
          return result
        }, {}) ]
        break

      default:
        throw new Error('Unknown op code: ' + opCode.op)
    }
  } while (opCodes.length > 0)

  return context.length > 1 ? context : context[0]
}
