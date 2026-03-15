import { GenMapping, addSegment, setSourceContent, toEncodedMap } from '@jridgewell/gen-mapping'

/**
 * Create an inline source map comment string.
 *
 * @param sourceContent - The full original source code
 * @param filename - The source filename (with extension stripped)
 * @param pos - The 0-indexed line and column number of the expression in the original source
 */
export function createSourceMap(
  sourceContent: string,
  filename: string,
  pos: { line: number; column: number },
): string {
  const map = new GenMapping({ file: filename })
  setSourceContent(map, filename, sourceContent)
  addSegment(map, 0, 0, filename, pos.line, pos.column)

  const encoded = Buffer.from(JSON.stringify(toEncodedMap(map))).toString('base64')
  return `/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${encoded} */`
}

const LF = '\n'.charCodeAt(0)

/**
 * Get the 0-indexed line number and column for a character offset in the source.
 */
export function getPos(source: string, offset: number): { line: number; column: number } {
  let line = 0
  let column = 0
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source.charCodeAt(i) === LF) {
      line++
      column = 0
    } else {
      column++
    }
  }
  return { line, column }
}
