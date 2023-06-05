import { parse } from 'graphql';
import generateCode from '../codegen.js';

const schema = `
  """
  Description for query
  """
  type Query {
    """
    Description for hello
    """
    hello(
      """
      Arguments for hello
      """
      name2: [String!]!
    ): [Hello!]! @deprecated(reason: "Use hello2")
  }

  enum Role {
    USER
    ADMIN
  }

  interface Node {
    id: ID
  }

  type Hello implements Node @deprecated(reason: "Use hello2")  {
    world: String!
  }

  type A {
    id: ID
  }

  type B {
    id: ID
  }

  input UserInput {
    name: String = "Mish"
  }

  union AB = A | B
  scalar Date
`

const ast = parse(schema)
console.log(generateCode(ast, { generateTypes: true }))

// generateCode(ast)
