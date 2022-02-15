# micro-jq

A small implementation of JQ.

## What is it?

[jq](https://stedolan.github.io/jq/) is a fantastic tool for wrangling
JSON, but it's written in C and so cannot be used in a browser. This
project implements a subset of the JQ filter language, and is intended for
simple filtering jobs in JavaScript where the filter is supplied e.g. by
a user.

## How does it work?

It uses a [parsed expression grammar][peg] (via [Peggy][peggy]) to transform JQ expressions
into a series of "op codes", with each one representing a JQ filter
operation. Each op code is executed with a context, which is initialised
with the input object. As each op code executes, the context is updated.

## Goals

   * Implement enough of the JQ syntax to be useful
   * Implement it the same as JQ

## Non-goals

   * Complete implementation of JQ (but the level of completeness may
     increase over time).

[peg]: https://en.wikipedia.org/wiki/Parsing_expression_grammar
[peggy]: https://peggyjs.org/
