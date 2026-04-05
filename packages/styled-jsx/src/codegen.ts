import type { PlaceholderScopeResult } from './css.js'
import type { ESTree } from 'rolldown/utils'

export type StyleContent =
  | { kind: 'static'; css: string }
  | {
      kind: 'dynamic'
      placeholderCSS: string
      expressionSources: string[]
      isExprProperty: boolean[]
      isConstant: boolean
    }
  | { kind: 'variable'; varName: string }

export interface StyledJsxStyleInfo {
  element: { start: number; end: number }
  isGlobal: boolean
  content: StyleContent
  hash: string
  scopedCSS: string
  scopeResult: PlaceholderScopeResult | null
  expressionSources: string[] | null
  parentChildren: ESTree.JSXChild[]
  sourceMapComment: string | null
}

export interface ClassNameDynamicInfo {
  hash: string
  expressionSources: string[]
}

/**
 * Unescape template-literal-specific escape sequences from a raw quasi value.
 * Only unescapes `\`` → `` ` `` and `\${` → `${` which are JS template escapes
 * that don't exist in CSS. Other escapes like `\n`, `\\` are left as-is
 * since they may be valid CSS escapes.
 */
export function unescapeTemplateQuasi(raw: string): string {
  return raw.replace(/\\`/g, '`').replace(/\\\$/g, '$')
}

/**
 * Escape a string for safe embedding inside a JS template literal.
 * Handles backslashes, backticks, and `${` sequences.
 */
export function escapeTemplateContent(source: string): string {
  return source.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

/**
 * Wrap an expression source in parentheses if it contains a comma operator,
 * so that embedding it in a comma-separated list (e.g. array literal) does
 * not split it into multiple elements.
 */
export function parenWrap(expr: string): string {
  return expr.includes(',') ? `(${expr})` : expr
}

/**
 * Build the content of a JS template literal from scoped CSS pieces and
 * expression sources. The result is the raw string between backticks
 * (without the backticks themselves).
 */
export function buildDynamicTemplate(
  scopeResult: PlaceholderScopeResult,
  expressionSources: string[],
): string {
  const { pieces, exprIndices } = scopeResult
  let result = ''
  for (let i = 0; i < pieces.length; i++) {
    result += escapeTemplateContent(pieces[i])
    if (i < exprIndices.length) {
      result += `\${${expressionSources[exprIndices[i]]}}`
    }
  }
  return result
}

export function buildStyleReplacement(style: StyledJsxStyleInfo): string {
  const { content } = style

  if (content.kind === 'dynamic' && style.scopeResult && style.expressionSources) {
    const dynamicProp = content.isConstant
      ? ''
      : ` dynamic={[${style.expressionSources.map(parenWrap).join(', ')}]}`
    const smSuffix = style.sourceMapComment ? escapeTemplateContent(style.sourceMapComment) : ''
    return `<_JSXStyle id={"${style.hash}"}${dynamicProp}>{\`${buildDynamicTemplate(style.scopeResult, style.expressionSources)}${smSuffix}\`}</_JSXStyle>`
  }
  if (content.kind === 'variable') {
    return `<_JSXStyle id={${content.varName}.__hash}>{${content.varName}}</_JSXStyle>`
  }
  const cssStr = style.sourceMapComment ? style.scopedCSS + style.sourceMapComment : style.scopedCSS
  return `<_JSXStyle id={"${style.hash}"}>{${JSON.stringify(cssStr)}}</_JSXStyle>`
}

export function buildClassNameExpr(
  staticParts: string[],
  dynamicParts: string[],
  dynamicStyleInfos: ClassNameDynamicInfo[],
): string | null {
  if (dynamicParts.length === 0 && dynamicStyleInfos.length === 0) return null

  if (staticParts.length === 0 && dynamicParts.length === 0 && dynamicStyleInfos.length > 0) {
    return `_JSXStyle.dynamic(${buildDynamicArray(dynamicStyleInfos)})`
  }

  if (dynamicParts.length > 0) {
    const templateParts: string[] = []
    if (staticParts.length > 0) {
      templateParts.push(`${staticParts.join(' ')} `)
    }
    for (let index = 0; index < dynamicParts.length; index++) {
      templateParts.push(`jsx-\${${dynamicParts[index]}.__hash}`)
      if (index < dynamicParts.length - 1) {
        templateParts.push(' ')
      }
    }
    if (dynamicStyleInfos.length > 0) {
      return `\`${templateParts.join('')} \` + _JSXStyle.dynamic(${buildDynamicArray(dynamicStyleInfos)})`
    }
    return `\`${templateParts.join('')}\``
  }

  if (staticParts.length > 0 && dynamicStyleInfos.length > 0) {
    return `"${staticParts.join(' ')} " + _JSXStyle.dynamic(${buildDynamicArray(dynamicStyleInfos)})`
  }

  return null
}

function buildDynamicArray(infos: ClassNameDynamicInfo[]): string {
  return `[${infos.map((info) => `["${info.hash}", [${info.expressionSources.map(parenWrap).join(', ')}]]`).join(', ')}]`
}
