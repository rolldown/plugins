export default function identifierReplacePlugin({ types: t }, { name, value }) {
  return {
    visitor: {
      Identifier(p) {
        if (p.node.name === name) {
          p.replaceWith(t.booleanLiteral(value))
        }
      },
    },
  }
}
