export default function commonjsGlobalsPlugin({ types: t }) {
  return {
    visitor: {
      Identifier(p) {
        if (p.node.name === 'commonjsGlobals') {
          p.replaceWith(
            t.stringLiteral(
              [typeof require, typeof module, typeof __dirname, typeof __filename].join(','),
            ),
          )
        }
      },
    },
  }
}
