function splitWords(str: string): string[] {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1\0$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1\0$2')
    .split('\0')
}

function camelCase(str: string): string {
  const words = splitWords(str)
  return words
    .map((w, i) =>
      i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join('')
}

function kebabCase(str: string): string {
  return splitWords(str)
    .map((w) => w.toLowerCase())
    .join('-')
}

function snakeCase(str: string): string {
  return splitWords(str)
    .map((w) => w.toLowerCase())
    .join('_')
}

function upperCase(str: string): string {
  return str.toUpperCase()
}

const caseTransforms: Record<string, (s: string) => string> = {
  camelCase,
  kebabCase,
  snakeCase,
  upperCase,
}

function resolveVariable(
  variable: string,
  member: string,
  matches: RegExpMatchArray | null,
  memberMatches: RegExpMatchArray | null,
): string {
  if (variable === 'member') return member

  const matchesResult = variable.match(/^matches\.\[(\d+)\]$/)
  if (matchesResult) {
    return matches?.[Number.parseInt(matchesResult[1])] ?? ''
  }

  const memberMatchesResult = variable.match(/^memberMatches\.\[(\d+)\]$/)
  if (memberMatchesResult) {
    return memberMatches?.[Number.parseInt(memberMatchesResult[1])] ?? ''
  }

  return variable
}

export function processTemplate(
  template: string,
  member: string,
  matches: RegExpMatchArray | null,
  memberMatches: RegExpMatchArray | null,
): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_match, expr: string) => {
    const parts = expr.trim().split(/\s+/)
    if (parts.length === 2) {
      const transform = caseTransforms[parts[0]]
      const value = resolveVariable(parts[1], member, matches, memberMatches)
      return transform ? transform(value) : value
    }
    if (parts.length === 1) {
      return resolveVariable(parts[0], member, matches, memberMatches)
    }
    return _match
  })
}
