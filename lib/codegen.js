import { simplifiedGQLAst } from './parser.js'

function lowercaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

function toGarphType(types) {
  const type = ['g']
  const GraphQLScalars = ['String', 'Int', 'Float', 'Boolean', 'ID']

  types.forEach((t, i, arr) => {
    if (GraphQLScalars.includes(t)) {
      type.push(`.${t.toLowerCase()}()`)
      if (arr[i + 1] !== 'NonNullType') type.push('.optional()')
      return
    }

    if (t === 'NonNullType') {
      return
    }

    if (t === 'ListType') {
      type.push('.list()')
      if (arr[i + 1] !== 'NonNullType') type.push('.optional()')
      return
    }

    else {
      type.push(`.ref(() => ${`${lowercaseFirstLetter(t)}Type`})`)
      if (arr[i + 1] !== 'NonNullType') type.push('.optional()')
      return
    }
  })

  return type.join('')
}

function toGarphModifiers(node) {
  const modifiers = []

  if (node.description) {
    modifiers.push(`.description('${node.description}')`)
  }

  if (node.implements && node.implements.length > 0) {
    modifiers.push(`.implements([${node.implements.map(n => `${lowercaseFirstLetter(n)}Type`).join(', ')}])`)
  }

  if (node.directives && node.directives.length > 0) {
    const deprecated = node.directives.find(d => d.name === 'deprecated')
    if (deprecated) {
      modifiers.push(`.deprecated('${deprecated.arguments[0].value}')`)
    }
  }

  if (node.defaultValue) {
    modifiers.push(`.default(${node.defaultValue})`)
  }

  return modifiers.join('')
}

export default function generateCode(ast, options = { generateTypes: false }) {
  const simplifiedAst = simplifiedGQLAst(ast)
  const code = [`import { g, Infer, InferResolvers } from 'garph'\n\n`]

  simplifiedAst.forEach((c) => {
    const name = `${lowercaseFirstLetter(c.name)}Type`
    switch (c.kind) {
      case "ObjectTypeDefinition":
        code.push(`const ${name} = g.type('${c.name}', {
  ${c.fields?.map((f) => `${f.name}: ${toGarphType(f.type)}${toGarphModifiers(f)}${f.arguments.length > 0 ?
    `\n    .args({
      ${f.arguments.map(a => `${a.name}: ${toGarphType(a.type)}${toGarphModifiers(a)}`).join(',\n      ')}
    })` : ''}`).join(',\n  ')}
})${toGarphModifiers(c)}`.trim())

        break

      case "InterfaceTypeDefinition":
        code.push(`const ${name} = g.interface('${c.name}', {
  ${c.fields?.map((f) => `${f.name}: ${toGarphType(f.type)}${toGarphModifiers(f)}`).join(',\n  ')}
})${toGarphModifiers(c)}`.trim())

        break

      case "InputObjectTypeDefinition":
        code.push(`const ${name} = g.inputType('${c.name}', {
  ${c.fields?.map((f) => `${f.name}: ${toGarphType(f.type)}${toGarphModifiers(f)}`).join(',\n  ')}
})${toGarphModifiers(c)}`.trim())

        break

      case "EnumTypeDefinition":
        code.push(`const ${name} = g.enumType('${c.name}', [${c.values?.map(v => `'${v}'`).join(', ')}] as const)${toGarphModifiers(c)}`)
        break

      case "UnionTypeDefinition":
        code.push(`const ${name} = g.unionType('${c.name}', { ${c.types.map(a => `${lowercaseFirstLetter(a)}Type`).join(', ') } })${toGarphModifiers(c)}`)
        break

      case "ScalarTypeDefinition":
        code.push(`const ${name} = g.scalarType<any, never>('${c.name}')${toGarphModifiers(c)}`)
        break
    }

    code.push('\n\n')
  })

  if (options?.generateTypes) {
    simplifiedAst.forEach((c) => {
      const name = `${c.name}Type`
      code.push(`export type ${name} = Infer<typeof ${lowercaseFirstLetter(c.name)}Type>\n`)
    })

    code.push(`export type ResolverTypes = InferResolvers<{\n${simplifiedAst.filter(t => t.kind === "ObjectTypeDefinition").map(a => `  ${a.name}: typeof ${lowercaseFirstLetter(a.name)}Type`).join(',\n')}\n}, {}>`)
  }

  return code.join('')
}
