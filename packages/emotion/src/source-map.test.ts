import { describe, it, expect } from 'vitest'
import { createSourceMap } from './source-map'

describe('createSourceMap', () => {
  it('handles source content with non-Latin-1 characters', () => {
    // Source files containing characters outside that range caused
    // "Invalid character" errors when generating inline source maps.
    const sourceWithUnicode = `
      import { css } from '@emotion/react'
      // Em dash: —
      // Arrow: ➜
      // Emoji: 🔁
      const style = css\`color: red;\`
    `
    // With the btoa() implementation, this would throw:
    //   "Invalid character" at btoa (node:buffer)
    expect(() =>
      createSourceMap(sourceWithUnicode, 'test.tsx', { line: 6, column: 20 }),
    ).not.toThrow()
  })

  it('returns a valid base64-encoded source map comment', () => {
    const result = createSourceMap('const x = 1', 'test.tsx', { line: 0, column: 0 })
    expect(result).toMatch(
      /^\/\*# sourceMappingURL=data:application\/json;charset=utf-8;base64,[A-Za-z0-9+/=]+ \*\/$/,
    )
  })
})
