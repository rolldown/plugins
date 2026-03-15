// Remove multi-line comments: /* ... */
const MULTI_LINE_COMMENT = /\/\*[\s\S]*?\*\//g

// Remove single-line comments: // ...
// Preserves URLs like url('//...') and url("//...")
// Group $1 captures the character before // (if any)
const SINGLE_LINE_COMMENT = /(^|[^:'^"]|\s)\/\/.*$/gm

// Collapse whitespace around CSS punctuation: : ; , { }
const SPACE_AROUND_COLON = /\s*([:;,{}])\s*/g

export function minifyCSSString(input: string, isFirst: boolean, isLast: boolean): string {
  // Step 1: Remove multi-line comments
  let result = input.replace(MULTI_LINE_COMMENT, '')

  // Step 2: Remove single-line comments (preserving preceding char)
  result = result.replace(SINGLE_LINE_COMMENT, '$1')

  // Step 3: Trim leading/trailing whitespace
  // First item: trim both spaces and newlines from start
  // Middle items: only trim newlines from start/end
  // Last item: trim both spaces and newlines from end
  if (isFirst) {
    result = result.replace(/^[\s]+/, '')
  } else {
    result = result.replace(/^\n+/, '')
  }
  if (isLast) {
    result = result.replace(/[\s]+$/, '')
  } else {
    result = result.replace(/\n+$/, '')
  }

  // Step 4: Collapse whitespace around CSS punctuation
  result = result.replace(SPACE_AROUND_COLON, '$1')

  return result
}
