function typeTree(d) {
  if (d.kind === 'NonNullType') {
    return {
      kind: d.kind,
      type: typeTree(d.type),
    }
  } else if (d.kind === 'ListType') {
    return {
      kind: d.kind,
      type: typeTree(d.type),
    }
  } else {
    return {
      kind: d.name.value,
    }
  }
}

function flattenTypeTree(d) {
  const list = []
  const values = typeTree(d)

  function f(ds) {
    Object.entries(ds).forEach(([k, v]) => {
      if (k === 'type') {
        f(v)
      } else {
        list.push(v)
      }
    })
  }

  f(values)
  return list.reverse()
}

export function simplifiedGQLAst(ast) {
  return ast.definitions.map((d) => {
    return d.kind === 'ObjectTypeDefinition' ||
      d.kind === 'InputObjectTypeDefinition' ||
      d.kind === 'InterfaceTypeDefinition'
      ? {
          kind: d.kind,
          name: d.name.value,
          description: d.description?.value,
          implements: d.interfaces?.map((i) => i.name.value),
          directives: d.directives?.map((d) => {
            return {
              name: d.name.value,
              arguments: d.arguments?.map((a) => {
                return {
                  name: a.name.value,
                  value: a.value.value,
                }
              }),
            }
          }),
          fields: d.fields?.map((f) => {
            return {
              name: f.name.value,
              description: f.description?.value,
              defaultValue: f.defaultValue?.value,
              type: flattenTypeTree(f.type),
              arguments: f.arguments?.map((a) => {
                return {
                  name: a.name.value,
                  description: a.description?.value,
                  type: flattenTypeTree(a.type),
                  defaultValue: a.defaultValue?.value,
                }
              }),
              directives: f.directives.map((d) => {
                return {
                  name: d.name.value,
                  arguments: d.arguments.map((a) => {
                    return {
                      name: a.name.value,
                      value: a.value.value,
                    }
                  }),
                }
              }),
            }
          }),
        }
      : {
          kind: d.kind,
          name: d.name.value,
          description: d.description?.value,
          types:
            d.kind === 'UnionTypeDefinition'
              ? d.types?.map((t) => t.name.value)
              : undefined,
          values:
            d.kind === 'EnumTypeDefinition'
              ? d.values?.map((v) => v.name.value)
              : undefined,
        }
  })
}
