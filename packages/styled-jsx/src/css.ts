import { transform, Features } from 'lightningcss'
import type { Selector, SelectorComponent, Targets, TokenOrValue, Token } from 'lightningcss'
import { computeHash } from './hash.js'

// SWC styled-jsx plugin defaults (BASE_BROWSERS)
const BASE_TARGETS: Targets = {
  chrome: 64 << 16,
  edge: 79 << 16,
  firefox: 67 << 16,
  opera: 51 << 16,
  safari: 12 << 16,
}

/**
 * Strip single-line `//` comments from CSS, preserving `//` inside strings
 * and URLs. Matches SWC's `strip_comments` / `strip_line_comment` logic.
 */
export function stripLineComments(css: string): string {
  return css
    .split('\n')
    .map((line) => {
      const parts = line.split('//')
      let result = parts[0]
      for (let i = 1; i < parts.length; i++) {
        // Rejoin if we're inside a string or it looks like a URL (ends with `:`)
        if (
          result.endsWith(':') ||
          countChar(result, "'") % 2 !== 0 ||
          countChar(result, '"') % 2 !== 0
        ) {
          result += '//' + parts[i]
        }
        // Otherwise, the rest is a comment — stop
        else break
      }
      return result
    })
    .join('\n')
}

function countChar(s: string, c: string): number {
  let count = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === c) count++
  }
  return count
}

/**
 * Scope CSS selectors with a `.jsx-{hash}` class and minify.
 * When `isGlobal` is true, only minification is applied (no scoping).
 *
 * Uses a two-pass pipeline matching SWC's approach:
 *   Pass 1: Expand nesting & minify with base targets (no vendor prefixes, no :is())
 *   Pass 2: Re-parse, apply scoping visitor, minify with user targets
 */
export function scopeCSS(
  css: string,
  hash: string,
  isGlobal: boolean,
  overrideScopeClass?: string,
  browsers?: Targets,
): string {
  const scopeClass = overrideScopeClass ?? `jsx-${hash}`
  const stripped = stripLineComments(css)

  // Pass 1: Expand nesting, minify with base targets.
  // Exclude vendor prefixes and :is() — those are handled in pass 2.
  const pass1 = transform({
    filename: 'styled-jsx.css',
    code: Buffer.from(stripped),
    minify: true,
    errorRecovery: true,
    targets: BASE_TARGETS,
    include: Features.Nesting,
    exclude: Features.IsSelector | Features.CustomMediaQueries | Features.VendorPrefixes,
  })

  // Pass 2: Apply scoping visitor, minify with user browser targets.
  // No cssModules — :global() is parsed as an unknown pseudo-class function
  // (custom-function) and handled manually in the visitor, matching SWC's approach.
  const userTargets = browsers ?? BASE_TARGETS
  const pass2 = transform({
    filename: 'styled-jsx.css',
    code: pass1.code,
    minify: true,
    errorRecovery: true,
    targets: userTargets,
    include: Features.IsSelector,
    visitor: {
      Selector(selector: Selector) {
        return scopeSelector(selector, scopeClass, isGlobal)
      },
    },
  })
  return new TextDecoder().decode(pass2.code)
}

/**
 * Check if a component is a `:global()` custom-function pseudo-class.
 */
function isGlobalPseudo(comp: SelectorComponent): boolean {
  return comp.type === 'pseudo-class' && comp.kind === 'custom-function' && comp.name === 'global'
}

/**
 * Scope a selector by walking its components linearly, matching SWC's
 * `get_transformed_selectors` approach.
 *
 * For each compound (segment between combinators):
 *   - If it contains `:global()`: unwrap the inner selector via
 *     `parseGlobalTokens` and inline the result (which may include
 *     combinators). No scope class is added.
 *   - Otherwise: insert `.jsx-{hash}` before any trailing pseudo-classes.
 *
 * When `isGlobal` is true, only `:global()` unwrapping is performed
 * (no scope class insertion).
 */
function scopeSelector(
  selector: SelectorComponent[],
  scopeClass: string,
  isGlobal = false,
): SelectorComponent[] {
  const result: SelectorComponent[] = []

  // Collect compound boundaries: ranges of [start, end) between combinators
  const compounds: { start: number; end: number; combinator?: SelectorComponent }[] = []
  let start = 0
  for (let i = 0; i <= selector.length; i++) {
    const comp = selector[i]
    if (!comp || comp.type === 'combinator') {
      compounds.push({ start, end: i, combinator: comp })
      start = i + 1
    }
  }

  for (const { start: cStart, end: cEnd, combinator } of compounds) {
    const compound = selector.slice(cStart, cEnd)

    // Check if this compound contains :global()
    let globalIdx = -1
    for (let j = 0; j < compound.length; j++) {
      if (isGlobalPseudo(compound[j])) {
        globalIdx = j
        break
      }
    }

    if (globalIdx >= 0) {
      // Emit any components before :global() in this compound
      for (let j = 0; j < globalIdx; j++) {
        result.push(compound[j])
      }

      // Unwrap :global() — inline the parsed result (may include combinators)
      const globalComp = compound[globalIdx]
      if ('arguments' in globalComp) {
        const parsed = parseGlobalTokens(globalComp.arguments)

        // If parsed starts with a combinator, replace the preceding one
        if (parsed.length > 0 && parsed[0].type === 'combinator') {
          const last = result[result.length - 1]
          if (last && last.type === 'combinator') {
            result.pop()
          }
        }

        result.push(...parsed)
      }

      // Emit any components after :global() in this compound
      for (let j = globalIdx + 1; j < compound.length; j++) {
        result.push(compound[j])
      }
    } else if (compound.length > 0) {
      // No :global() — add scope class (unless isGlobal)
      if (isGlobal) {
        result.push(...compound)
      } else {
        // Lone pseudo-element (e.g. bare `::before`) — skip scoping, matching SWC
        if (compound.length === 1 && compound[0].type === 'pseudo-element') {
          result.push(compound[0])
        } else {
          // Find insertion point — before trailing pseudo-classes/pseudo-elements
          let insertAt = compound.length
          while (insertAt > 0) {
            const prev = compound[insertAt - 1]
            if (prev.type === 'pseudo-class' || prev.type === 'pseudo-element') {
              insertAt--
            } else {
              break
            }
          }
          result.push(...compound.slice(0, insertAt))
          result.push({ type: 'class', name: scopeClass } as SelectorComponent)
          result.push(...compound.slice(insertAt))
        }
      }
    }

    if (combinator) {
      result.push(combinator)
    }
  }

  // Remove trailing descendant combinator
  const last = result[result.length - 1]
  if (last && last.type === 'combinator' && 'value' in last && last.value === 'descendant') {
    result.pop()
  }

  return result
}

/**
 * Serialize a single lightningcss token to its CSS string representation.
 */
function serializeToken(token: Token): string {
  switch (token.type) {
    case 'ident':
    case 'at-keyword':
    case 'unquoted-url':
    case 'delim':
    case 'white-space':
    case 'comment':
    case 'bad-url':
    case 'bad-string':
      return token.value
    case 'string': {
      const escaped = token.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      return `"${escaped}"`
    }
    case 'hash':
    case 'id-hash':
      return '#' + token.value
    case 'number':
      return String(token.value)
    case 'percentage':
      return String(token.value * 100) + '%'
    case 'dimension':
      return String(token.value) + token.unit
    case 'function':
      return token.value + '('
    case 'comma':
      return ','
    case 'colon':
      return ':'
    case 'semicolon':
      return ';'
    case 'parenthesis-block':
      return '('
    case 'square-bracket-block':
      return '['
    case 'curly-bracket-block':
      return '{'
    case 'close-parenthesis':
      return ')'
    case 'close-square-bracket':
      return ']'
    case 'close-curly-bracket':
      return '}'
    default:
      throw new Error(`Unknown token type in :global() arguments: ${JSON.stringify(token)}`)
  }
}

/**
 * Serialize a TokenOrValue array to a CSS string.
 * Only token types are expected inside `:global()` selector arguments.
 */
function serializeTokenOrValues(args: TokenOrValue[]): string {
  return args
    .map((a) => {
      if (a.type === 'token') return serializeToken(a.value)
      throw new Error(`Unexpected non-token value in :global() arguments: ${JSON.stringify(a)}`)
    })
    .join('')
}

/**
 * Parse the raw token arguments from a `:global()` custom-function pseudo-class.
 * Matches SWC's `parse_token_list` logic:
 *   1. Try parsing as a selector list. If multiple selectors → wrap in `:is()`.
 *   2. For single/relative selectors (e.g. `> *`), prepend `a ` to make it
 *      a valid absolute selector, parse, then strip the leading `a` element.
 * Nesting selectors (`&`) are stripped since nesting was already expanded in pass 1.
 */
function parseGlobalTokens(args: TokenOrValue[]): SelectorComponent[] {
  const innerCSS = serializeTokenOrValues(args)
  if (!innerCSS.trim()) return []

  // Step 1: Try parsing as a selector list via :is() wrapper.
  // This handles multiple selectors (e.g. `.c1, .c2`) correctly.
  const multiResult = parseAsIsSelector(innerCSS)
  if (multiResult) return multiResult

  // Step 2: For single/relative selectors (e.g. `> .foo`, `div`),
  // prepend `a ` to make it a valid absolute selector, then strip `a`.
  return parseWithPrefix(innerCSS)
}

/**
 * Try parsing innerCSS as a multi-selector list via `:is(<inner>){}`.
 * Returns result only if multiple selectors are found; null otherwise.
 */
function parseAsIsSelector(innerCSS: string): SelectorComponent[] | null {
  let isNode = null as (SelectorComponent & { type: 'pseudo-class' }) | null
  let captured = false
  transform({
    filename: 'global-inner.css',
    code: Buffer.from(`:is(${innerCSS}){}`),
    minify: false,
    errorRecovery: true,
    visitor: {
      Selector(sel: Selector) {
        if (
          !captured &&
          sel.length === 1 &&
          sel[0].type === 'pseudo-class' &&
          sel[0].kind === 'is'
        ) {
          isNode = sel[0]
          captured = true
        }
        return sel
      },
    },
  })

  if (!isNode || isNode.kind !== 'is') return null

  const selectors = isNode.selectors
  if (selectors.length <= 1) return null

  // Multiple selectors — strip nesting (&) and wrap in :is()
  const cleaned = selectors.map((sel) => sel.filter((c) => c.type !== 'nesting'))
  return [{ type: 'pseudo-class', kind: 'is', selectors: cleaned }]
}

/**
 * Parse a single (possibly relative) selector by prepending `a ` to make it
 * a valid absolute selector, then stripping the leading `a` element and any
 * adjacent descendant combinator. Matches SWC's `parse_token_list` fallback.
 */
function parseWithPrefix(innerCSS: string): SelectorComponent[] {
  let parsed = null as SelectorComponent[] | null
  transform({
    filename: 'global-inner.css',
    code: Buffer.from(`a ${innerCSS}{}`),
    minify: false,
    errorRecovery: true,
    visitor: {
      Selector(sel: Selector) {
        parsed = [...sel]
        return sel
      },
    },
  })

  if (!parsed || parsed.length === 0) return []

  const result = parsed

  // Remove the leading `a` type selector
  if (result.length > 0 && result[0].type === 'type' && result[0].name === 'a') {
    result.shift()
  }

  // Remove leading descendant combinator (from the space in `a .foo`)
  if (result.length > 0 && result[0].type === 'combinator' && result[0].value === 'descendant') {
    result.shift()
  }

  // Remove trailing descendant combinator
  const last = result[result.length - 1]
  if (last && last.type === 'combinator' && last.value === 'descendant') {
    result.pop()
  }

  // Strip nesting selectors (&)
  return result.filter((c) => c.type !== 'nesting')
}

const PLACEHOLDER_PREFIX = '--styled-jsx-placeholder-'
const PLACEHOLDER_SUFFIX = '__'

/**
 * Scope CSS that contains `--styled-jsx-placeholder-N__` placeholders (for dynamic expressions).
 * Returns an array of CSS string pieces split at placeholder boundaries.
 * pieces[0] + expr[0] + pieces[1] + expr[1] + ... + pieces[N]
 */
/**
 * Result of scoping CSS with placeholders. Contains the text pieces
 * and the expression index for each placeholder occurrence.
 * After nesting expansion, a placeholder may appear multiple times,
 * so `exprIndices.length` can be greater than the original expression count.
 *
 * Template reconstruction: `pieces[0] + exprs[exprIndices[0]] + pieces[1] + ...`
 */
export interface PlaceholderScopeResult {
  pieces: string[]
  exprIndices: number[]
}

/**
 * Build a CSS string with placeholders replacing template expressions.
 *
 * Uses CSS custom property syntax (`--styled-jsx-placeholder-N__`) so lightningcss can parse it.
 * When an expression appears as a full declaration,
 * uses `--styled-jsx-placeholder-N__: 0` which is valid as a CSS custom property declaration.
 */
export function buildPlaceholderCSS(quasis: string[]): {
  placeholderCSS: string
  isExprProperty: boolean[]
} {
  const isExprProperty: boolean[] = []
  let css = ''
  for (let i = 0; i < quasis.length; i++) {
    css += quasis[i]
    if (i < quasis.length - 1) {
      const before = quasis[i].trimEnd()
      const after = quasis[i + 1]?.trimStart()
      // If the expression sits where a full declaration would go
      // (after `;` or `{`, and not followed by `:`)
      if ((before.endsWith(';') || before.endsWith('{')) && !after?.startsWith(':')) {
        isExprProperty.push(true)
        css += `${PLACEHOLDER_PREFIX}${i}${PLACEHOLDER_SUFFIX}: 0`
      } else {
        isExprProperty.push(false)
        css += `${PLACEHOLDER_PREFIX}${i}${PLACEHOLDER_SUFFIX}`
      }
    }
  }
  return { placeholderCSS: css, isExprProperty }
}

export interface TransformCSSResult {
  hash: string
  scopedCSS: string
  scopeResult: PlaceholderScopeResult | null
}

/**
 * Transform CSS: compute hash, scope selectors, and minify.
 * Mirrors SWC's `transform_css` in `transform_css_lightningcss.rs`.
 *
 * For static CSS (no expressions), returns `{ hash, scopedCSS, scopeResult: null }`.
 * For dynamic CSS (with placeholder expressions), returns `{ hash, scopedCSS: '', scopeResult }`.
 *
 * When `isDynamic` is true (css.resolve inside a function scope), the scope class
 * uses `__jsx-style-dynamic-selector` and the hash is recomputed to incorporate
 * the static class name.
 */
export function transformCSS(
  css: string,
  isGlobal: boolean,
  options: {
    expressionSources?: string[] | null
    isExprProperty?: boolean[] | null
    isDynamic?: boolean
    isConstant?: boolean
    overrideScopeClass?: string
    browsers?: Targets
  } = {},
): TransformCSSResult {
  const hash = computeHash(css)
  const { expressionSources, isExprProperty, browsers } = options
  const isDynamic = options.isDynamic ?? false
  const isConstant = options.isConstant ?? false

  if (expressionSources && isExprProperty) {
    const overrideScopeClass =
      options.overrideScopeClass ?? (!isConstant ? '__jsx-style-dynamic-selector' : undefined)
    const scoped = scopeCSS(css, hash, isGlobal, overrideScopeClass, browsers)

    // Split on the placeholder prefix, then parse each placeholder occurrence.
    // After CSS nesting expansion, a placeholder may appear multiple times
    // (e.g., `.scope-${id} { button {} div {} }` expands to
    //  `.scope-${id} button{} .scope-${id} div{}`).
    const rawParts = scoped.split(PLACEHOLDER_PREFIX)
    const pieces: string[] = [rawParts[0]]
    const exprIndices: number[] = []

    for (let i = 1; i < rawParts.length; i++) {
      const part = rawParts[i]
      let numEnd = 0
      while (
        numEnd < part.length &&
        part.charCodeAt(numEnd) >= 48 &&
        part.charCodeAt(numEnd) <= 57
      ) {
        numEnd++
      }
      const exprIndex = Number.parseInt(part.slice(0, numEnd), 10)
      exprIndices.push(exprIndex)

      let skipLen = numEnd + PLACEHOLDER_SUFFIX.length
      if (isExprProperty[exprIndex]) {
        skipLen += 2 // `:0` after minification
      }
      pieces.push(part.slice(skipLen))
    }

    let finalHash = hash
    if (isDynamic) {
      finalHash = computeHash(hash + `jsx-${hash}`)
    }
    return { hash: finalHash, scopedCSS: '', scopeResult: { pieces, exprIndices } }
  }

  const scopedCSS = scopeCSS(css, hash, isGlobal, options.overrideScopeClass, browsers)
  return { hash, scopedCSS, scopeResult: null }
}
