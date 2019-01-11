Script
  = Expression

Expression
  = head:Operation tail:(_ Pipe* _ Operation)* {
    return tail.reduce(function(result, element) {
      result.push(element[3]);
      return result;
    }, [head]);
  }

_ "whitespace"
  = [ \t\n\r]*

Pipe
  = "|"

Filter
  = _ identifer: "." name: [a-zA-Z]+ subscript:("[" [0-9]* "]")? strict:"?"? {
    const explode = subscript != null && (subscript[1] == null || subscript[1].length === 0)
    const index = subscript != null && subscript[1] != null && subscript[1].length > 0
      ? parseInt(subscript[1].join(''), 10)
      : null;

    return {
      op: 'pick',
      key: name.join(''),
      explode,
      index,
      strict: strict == null
    };
  } 
  / _ ".[" name:[a-zA-Z]+ "]" strict:"?"? { return { op: 'pick', key: name.join(''), strict: strict == null }; } 
  / _ ".[" index:[0-9]+ "]" { return { op: 'index', index: parseInt(index.join(''), 10) }; } 
  / _ ".[" start:[0-9]+ ":" end:[0-9]+ "]" { return { op: 'slice', start: parseInt(start.join(''), 10), end: parseInt(end.join(''), 10) }; } 
  / _ ".[]" strict:"?"? { return { op: 'explode', strict: strict == null }; }
  / _ "." { return { op: 'current_context' }; }
  
Operation
  = Literal
  / Filter
  / CreateArray
  / CreateObject

Literal
  = number:[0-9]+ { return { op: 'literal', value: parseInt(number.join(''), 10) }; }
  / "null" { return { op: 'literal', value: null }; }
  / "'" string:[^']+ "'" { return { op: 'literal', value: string.join('') }; }
  / '"' string:[^"]+ '"' { return { op: 'literal', value: string.join('') }; }

CreateArray
  = "[" _ head:Expression tail:(_ "," _ Expression)* _ "]" {
  return {
    op: 'create_array',
    values: tail.reduce((result, element) => result.concat(element[3]), head)
  };
}
  
CreateObject
  = "{" _ head:KeyValue tail:(_ "," _ KeyValue)* _ "}" {
  return {
    op: 'create_object',
    entries: tail.reduce(function(result, element) {
      result.push(element[3]);
      return result;
    }, [head])
  };
}

KeyValue
  = key:Key _ ":" _ value:Expression {
    return { key, value }
  }
  
Key
  = key:([a-zA-Z0-9]+) { return key.join('') } 
  / "'" key:[^']+ "'" { return key.join('') } 
  / '"' key:[^"]+ '"' { return key.join('') } 
