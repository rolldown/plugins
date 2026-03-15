import type { ESTree } from 'rolldown/utils'

const OPERATION_REGEX = /(fragment|mutation|query|subscription) (\w+)/

function stripComments(source: string): string {
  if (!source.includes('#')) return source

  const lines = source.split('\n')
  let output = ''
  for (const line of lines) {
    const commentIndex = line.indexOf('#')
    output += commentIndex === -1 ? line : line.slice(0, commentIndex)
    output += '\n'
  }
  return output
}

export function extractOperationName(node: ESTree.TaggedTemplateExpression): string | null {
  for (const quasi of node.quasi.quasis) {
    const raw = stripComments(quasi.value.raw)
    const match = raw.match(OPERATION_REGEX)
    if (match) return match[2]
  }
  return null
}
