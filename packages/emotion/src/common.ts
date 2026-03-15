export const ExprKind = {
  Css: 0,
  Styled: 1,
  GlobalJSX: 2,
} as const
export type ExprKind = (typeof ExprKind)[keyof typeof ExprKind]

export function regexEscape(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Unescape template literal raw text to get the actual string value.
 * Template literal raw text preserves escape sequences as written in source.
 * We need to convert them to their actual characters.
 */
export function unescapeTemplateRaw(raw: string): string {
  return raw
    .replace(/\\`/g, '`')
    .replace(/\\\$/g, '$')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\v/g, '\v')
    .replace(/\\\\/g, '\\')
}

/**
 * Escape a string for use inside a JS double-quoted string literal.
 */
export function escapeJSString(str: string): string {
  return (
    str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      // oxlint-disable-next-line no-control-regex
      .replace(/\u000b/g, '\\v')
      .replace(/[\b]/g, '\\b')
  )
}

const SPACE_REGEX = /\s/

export function checkTrailingCommaExistence(str: string, endIndex: number): boolean {
  for (let i = endIndex - 1; i >= 0; i--) {
    const char = str[i]
    if (char === ',') {
      return true
    }
    if (!SPACE_REGEX.test(char)) {
      break
    }
  }
  return false
}

export function maybeComma(needed: boolean): string {
  return needed ? ', ' : ''
}
