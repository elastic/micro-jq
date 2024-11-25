## [`1.8.0`](https://github.com/elastic/micro-jq/tree/v1.8.0)

Adds support for calling zero argument and single argument functions, along
with support for the following functions.

Whitespace removal e.g. `.foo | trim`:

 - `trim`
 - `ltrim`
 - `rtrim`

Trim specific characters e.g. `.foo | ltrimstr("f")`

 - `ltrimstr`
 - `rtrimstr`

Filters e.g. `.foo | startswith("f")`

 - `startswith`
 - `endswith`

`split` - breaks a string into an array using the specified delimiter e.g.
`.aStringField | split(",")`

`join` - turn an array into a string by concatenating using the specified
delimiter e.g. `.anArrayField | join(",")`

## [`1.7.0`](https://github.com/elastic/micro-jq/tree/v1.7.0)

- Improve handling of bools, empty strings and falsy values

## [`1.6.1`](https://github.com/elastic/micro-jq/tree/v1.6.1)

- Convert project to TypeScript
- Switch to `peggy` instead of PegJS
- Update dependencies

## `1.5.0`

- Update dependencies (note that this release was not correctly tracked in
  GitHub)

## [`1.4.3`](https://github.com/elastic/micro-jq/tree/v1.4.3)

- Update dependencies

## [`1.4.2`](https://github.com/elastic/micro-jq/tree/v1.4.2)

- Just a release to Fix up the out-of-date changelog

## [`1.4.1`](https://github.com/elastic/micro-jq/tree/v1.4.1)

- Bugfix

## [`1.4.0`](https://github.com/elastic/micro-jq/tree/v1.4.0)

- Ensures that micro-jq conforms to jq's "spec" of constructing multiple objects when a field in an object constructor produces "multiple results".

## [`1.3.0`](https://github.com/elastic/micro-jq/tree/v1.3.0)

- Add the ability to iterate over objects with the iterator operator as described in the jq manual, in the same fashion as arrays can be iterated over.

## [`1.2.0`](https://github.com/elastic/micro-jq/tree/v1.2.0)

- Better support for slices, indexing, and improved composability #3
- Update dependencies

## [`1.1.0`](https://github.com/elastic/micro-jq/tree/v1.1.0)

- Update dependencies

## [`1.0.2`](https://github.com/elastic/micro-jq/tree/v1.0.2)

- Bugfixes

## [`1.0.1`](https://github.com/elastic/micro-jq/tree/v1.0.1)

- Bugfixes

## [`1.0.0`](https://github.com/elastic/micro-jq/tree/v1.0.0) Initial Release

- Initial release
