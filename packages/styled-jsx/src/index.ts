import { withMagicString } from 'rolldown-string'
import type { RolldownString } from 'rolldown-string'
import type { Plugin, PluginContext } from 'rolldown'
import type { ESTree } from 'rolldown/utils'
import { walk, ScopeTracker } from 'oxc-walker'
import type { StyledJsxPluginOptions } from './types.js'
import { computeHash } from './hash.js'
import { scopeCSS, transformCSS, buildPlaceholderCSS, type PlaceholderScopeResult } from './css.js'
import {
  buildDynamicTemplate,
  buildStyleReplacement,
  buildClassNameExpr,
  escapeTemplateContent,
  parenWrap,
  unescapeTemplateQuasi,
  type StyleContent,
  type StyledJsxStyleInfo,
  type ClassNameDynamicInfo,
} from './codegen.js'
import {
  collectSiblingsFromChildren,
  extractVarName,
  findInsertPosition,
  hasAttribute,
  isStyledJsxElement,
} from './astUtils.js'
import { createSourceMap, getPos } from './source-map.js'

export type { StyledJsxPluginOptions } from './types.js'

type CSSTagFunction = 'default' | 'global' | 'resolve'

interface CSSTaggedTemplateInfo {
  varName: string
  css: string
  hash: string
  scopedCSS: string
  scopeResult: PlaceholderScopeResult | null
  expressionSources: string[] | null
  isExprProperty: boolean[] | null
  tagFunction: CSSTagFunction
  isDynamic: boolean
  declarationEnd: number
  initStart: number
  initEnd: number
  exportStart: number | null
  sourceMapComment: string | null
}

interface ClassNameUpdateInfo {
  staticParts: string[]
  dynamicParts: string[]
  dynamicStyleInfos: ClassNameDynamicInfo[]
}

export default function styledJsxPlugin(options: StyledJsxPluginOptions = {}): Plugin {
  const browsers = options.browsers
  const sourceMapEnabled = options.sourceMap

  let isDev = false

  return {
    name: 'rolldown-plugin-styled-jsx',
    // @ts-expect-error Vite-specific property
    enforce: 'pre',

    // @ts-expect-error Vite-specific hook
    configResolved(config) {
      isDev = !config.isProduction
    },

    outputOptions() {
      if ('viteVersion' in this.meta) return
      isDev = process.env.NODE_ENV === 'development'
    },

    transform: {
      filter: {
        id: /\.[jt]sx$/,
        code: {
          include: /style/,
        },
      },

      handler: withMagicString(function (this, s, id, meta) {
        const lang = id.endsWith('.tsx')
          ? 'tsx'
          : id.endsWith('.ts')
            ? 'ts'
            : id.endsWith('.jsx')
              ? 'jsx'
              : 'js'
        const program = meta?.ast ?? this.parse(s.original, { lang })
        // oxlint-disable-next-line no-this-alias
        const ctx = this

        const shouldSourceMap = sourceMapEnabled ?? isDev
        const makeSourceMap = shouldSourceMap
          ? (offset: number) => {
              const pos = getPos(s.original, offset)
              return '\n' + createSourceMap(s.original, id, pos)
            }
          : null

        const scopeTracker = new ScopeTracker({ preserveExitedScopes: true })
        // Pre-pass to collect all declarations (including hoisted ones)
        walk(program, { scopeTracker })
        scopeTracker.freeze()

        const styles: StyledJsxStyleInfo[] = []
        const cssTagged: CSSTaggedTemplateInfo[] = []

        const jsxParentStack: (ESTree.JSXElement | ESTree.JSXFragment | null)[] = [null]

        // Tracks nesting: when we're inside a non-style-jsx child of an element
        // that has a <style jsx>, this counter is >0. Any <style jsx> found at
        // depth >0 is nested and should error.
        let styledJsxAncestorDepth = 0

        // Track function scope keys for shouldInjectClassName
        const functionScopeStack: string[] = ['']
        let currentFunctionScope = ''

        // Pre-computed injection targets per parent children group
        const injectionTargetsMap = new Map<ESTree.JSXChild[], ESTree.JSXOpeningElement[]>()

        let currentVarDeclEnd = 0

        walk(program, {
          scopeTracker,
          enter(node, parent) {
            switch (node.type) {
              case 'ExportNamedDeclaration': {
                if (node.declaration?.type === 'VariableDeclaration') {
                  currentVarDeclEnd = node.end
                }
                break
              }
              case 'VariableDeclaration': {
                if (currentVarDeclEnd < node.start) {
                  currentVarDeclEnd = node.end
                }
                break
              }

              case 'TaggedTemplateExpression': {
                const tagInfo = identifyCSSTag(node.tag, scopeTracker)
                if (!tagInfo) break

                let varName: string
                let declarationEnd: number
                let exportStart: number | null = null

                if (parent?.type === 'VariableDeclarator') {
                  const name = extractVarName(parent)
                  if (!name) break
                  varName = name
                  declarationEnd = currentVarDeclEnd
                } else if (parent?.type === 'ExpressionStatement') {
                  varName = ''
                  declarationEnd = parent.end
                } else if (parent?.type === 'ExportDefaultDeclaration') {
                  varName = '_defaultExport'
                  exportStart = parent.start
                  declarationEnd = parent.end
                } else {
                  varName = tagInfo === 'resolve' ? '_resolve' : ''
                  declarationEnd = node.end
                }

                const inFunction = functionScopeStack.length > 1
                // Only `css.resolve` tagged templates use dynamic scoping (with
                // `__jsx-style-dynamic-selector`). `css` and `css.global` produce
                // standalone `new String(...)` values — their scope class is always
                // the concrete `jsx-{hash}` because the runtime applies the hash
                // via the `_JSXStyle` component, not via className injection.
                const isDynamic =
                  tagInfo === 'resolve' && inFunction && node.quasi.expressions.length > 0

                const template = node.quasi
                let css: string
                let expressionSources: string[] | null = null
                let isExprProperty: boolean[] | null = null

                if (template.expressions.length === 0) {
                  css = template.quasis.map((q) => unescapeTemplateQuasi(q.value.raw)).join('')
                } else {
                  const quasis = template.quasis.map((q) => unescapeTemplateQuasi(q.value.raw))
                  const placeholder = buildPlaceholderCSS(quasis)
                  css = placeholder.placeholderCSS
                  isExprProperty = placeholder.isExprProperty
                  expressionSources = template.expressions.map((e) =>
                    s.original.slice(e.start, e.end),
                  )
                }

                cssTagged.push({
                  varName,
                  css,
                  hash: '',
                  scopedCSS: '',
                  scopeResult: null,
                  expressionSources,
                  isExprProperty,
                  tagFunction: tagInfo,
                  isDynamic,
                  declarationEnd,
                  initStart: node.start,
                  initEnd: node.end,
                  exportStart,
                  sourceMapComment: makeSourceMap?.(node.start) ?? null,
                })
                break
              }

              case 'FunctionDeclaration':
              case 'FunctionExpression':
              case 'ArrowFunctionExpression': {
                currentFunctionScope = scopeTracker.getCurrentScope()
                functionScopeStack.push(currentFunctionScope)
                break
              }

              case 'JSXElement': {
                if (isStyledJsxElement(node.openingElement)) {
                  if (styledJsxAncestorDepth > 0) {
                    ctx.error({
                      message:
                        'Detected nested style tag styled-jsx only allows style tags ' +
                        'to be direct descendants (children) of the outermost JSX element i.e. the subtree root.',
                      pos: node.start,
                    })
                  }

                  const content = extractCSSContent(ctx, node, s.original, scopeTracker)
                  const currentJsxParent = jsxParentStack[jsxParentStack.length - 1]
                  const currentParentChildren = currentJsxParent?.children ?? null
                  const currentParentOpening =
                    currentJsxParent?.type === 'JSXElement' ? currentJsxParent.openingElement : null
                  styles.push({
                    element: node,
                    isGlobal: hasAttribute(node.openingElement, 'global'),
                    content,
                    hash: '',
                    scopedCSS: '',
                    scopeResult: null,
                    expressionSources: null,
                    parentChildren: currentParentChildren ?? [],
                    sourceMapComment: makeSourceMap?.(node.start) ?? null,
                  })

                  // Pre-compute injection targets while ScopeTracker has the right context
                  if (currentParentChildren && !injectionTargetsMap.has(currentParentChildren)) {
                    const fnScope = currentFunctionScope
                    const targets: ESTree.JSXOpeningElement[] = []
                    if (
                      currentParentOpening &&
                      shouldInjectClassName(currentParentOpening, scopeTracker, fnScope)
                    ) {
                      targets.push(currentParentOpening)
                    }
                    const siblings = collectSiblingsFromChildren(currentParentChildren)
                    for (const sibling of siblings) {
                      if (shouldInjectClassName(sibling, scopeTracker, fnScope)) {
                        targets.push(sibling)
                      }
                    }
                    injectionTargetsMap.set(currentParentChildren, targets)
                  }
                  break
                }

                const jsxParent = jsxParentStack[jsxParentStack.length - 1]
                if (
                  jsxParent?.children.some(
                    (child) =>
                      child.type === 'JSXElement' && isStyledJsxElement(child.openingElement),
                  )
                ) {
                  styledJsxAncestorDepth++
                }
                jsxParentStack.push(node)
                break
              }

              case 'JSXFragment': {
                jsxParentStack.push(node)
                break
              }
            }
          },

          leave(node) {
            switch (node.type) {
              case 'FunctionDeclaration':
              case 'FunctionExpression':
              case 'ArrowFunctionExpression': {
                functionScopeStack.pop()
                currentFunctionScope = functionScopeStack[functionScopeStack.length - 1]
                break
              }

              case 'JSXElement': {
                if (!isStyledJsxElement(node.openingElement)) {
                  jsxParentStack.pop()
                  const jsxParent = jsxParentStack[jsxParentStack.length - 1]
                  if (
                    jsxParent?.children.some(
                      (child) =>
                        child.type === 'JSXElement' && isStyledJsxElement(child.openingElement),
                    )
                  ) {
                    styledJsxAncestorDepth--
                  }
                }
                break
              }

              case 'JSXFragment': {
                jsxParentStack.pop()
                break
              }
            }
          },
        })

        applyCollectedTransforms(s, program, styles, cssTagged, injectionTargetsMap, browsers)
      }),
    },
  }
}

const constLiteralTypes = new Set(['string', 'number', 'boolean', 'null', 'bigint', 'undefined'])

/**
 * Check whether `name` refers to a `const` binding initialized with a
 * literal value.
 */
function isConstLiteralBinding(scopeTracker: ScopeTracker, name: string): boolean {
  const decl = scopeTracker.getDeclaration(name)
  if (decl?.type !== 'Variable' || decl.variableNode.kind !== 'const') return false
  for (const d of decl.variableNode.declarations) {
    if (d.id.type === 'Identifier' && d.id.name === name) {
      if (
        d.init?.type === 'Literal' &&
        (constLiteralTypes.has(typeof d.init.value) || d.init.value === null)
      ) {
        return true
      }
      if (d.init?.type === 'TemplateLiteral' && d.init.expressions.length === 0) {
        return true
      }
    }
  }
  return false
}

function applyCollectedTransforms(
  s: RolldownString,
  program: ESTree.Program,
  styles: StyledJsxStyleInfo[],
  cssTagged: CSSTaggedTemplateInfo[],
  injectionTargetsMap: Map<ESTree.JSXChild[], ESTree.JSXOpeningElement[]>,
  browsers: StyledJsxPluginOptions['browsers'],
): void {
  const cssTaggedMap = processCSSTagged(cssTagged, browsers)
  if (styles.length === 0 && cssTagged.length === 0) return

  processInlineStyles(styles, cssTaggedMap, browsers)
  const classNameUpdates = computeScopeClassNames(styles, injectionTargetsMap, browsers)
  emitReplacements(s, program, styles, cssTagged, classNameUpdates)
}

/** Transform each css-tagged template and build a lookup map by variable name. */
function processCSSTagged(
  cssTagged: CSSTaggedTemplateInfo[],
  browsers: StyledJsxPluginOptions['browsers'],
): Map<string, CSSTaggedTemplateInfo> {
  const cssTaggedMap = new Map<string, CSSTaggedTemplateInfo>()
  for (const info of cssTagged) {
    const result = transformCSS(info.css, info.tagFunction === 'global', {
      expressionSources: info.expressionSources,
      isExprProperty: info.isExprProperty,
      isDynamic: info.isDynamic,
      isConstant: !info.isDynamic,
      browsers,
    })
    info.hash = result.hash
    info.scopedCSS = result.scopedCSS
    info.scopeResult = result.scopeResult
    cssTaggedMap.set(info.varName, info)
  }
  return cssTaggedMap
}

/** Compute hash and scoped CSS for each inline `<style jsx>` element. */
function processInlineStyles(
  styles: StyledJsxStyleInfo[],
  cssTaggedMap: Map<string, CSSTaggedTemplateInfo>,
  browsers: StyledJsxPluginOptions['browsers'],
): void {
  for (const style of styles) {
    const { content } = style
    if (content.kind === 'static') {
      const result = transformCSS(content.css, style.isGlobal, { browsers })
      style.hash = result.hash
      style.scopedCSS = result.scopedCSS
      continue
    }

    if (content.kind === 'dynamic') {
      const result = transformCSS(content.placeholderCSS, style.isGlobal, {
        expressionSources: content.expressionSources,
        isExprProperty: content.isExprProperty,
        isConstant: content.isConstant,
        browsers,
      })
      style.hash = result.hash
      style.scopeResult = result.scopeResult
      style.expressionSources = content.expressionSources
      continue
    }

    const taggedInfo = cssTaggedMap.get(content.varName)
    if (taggedInfo) {
      style.hash = taggedInfo.hash
      style.scopedCSS = taggedInfo.scopedCSS
      style.scopeResult = taggedInfo.scopeResult
      style.expressionSources = taggedInfo.expressionSources
    }
  }
}

/**
 * Group styles by parent scope, compute combined hashes when multiple
 * static/constant styles share a parent, and build className update
 * entries for each injection target.
 */
function computeScopeClassNames(
  styles: StyledJsxStyleInfo[],
  injectionTargetsMap: Map<ESTree.JSXChild[], ESTree.JSXOpeningElement[]>,
  browsers: StyledJsxPluginOptions['browsers'],
): Map<ESTree.JSXOpeningElement, ClassNameUpdateInfo> {
  const scopeMap = new Map<ESTree.JSXChild[], StyledJsxStyleInfo[]>()
  for (const style of styles) {
    const existing = scopeMap.get(style.parentChildren)
    if (existing) {
      existing.push(style)
    } else {
      scopeMap.set(style.parentChildren, [style])
    }
  }

  const classNameUpdates = new Map<ESTree.JSXOpeningElement, ClassNameUpdateInfo>()
  for (const [parentChildren, scopeStyles] of scopeMap) {
    const update = computeScopeForGroup(scopeStyles, browsers)
    if (!update) continue

    const targets = injectionTargetsMap.get(parentChildren) ?? []
    for (const target of targets) {
      const existing = classNameUpdates.get(target)
      if (existing) {
        existing.staticParts.push(...update.staticParts)
        existing.dynamicParts.push(...update.dynamicParts)
        existing.dynamicStyleInfos.push(...update.dynamicStyleInfos)
      } else {
        classNameUpdates.set(target, {
          staticParts: [...update.staticParts],
          dynamicParts: [...update.dynamicParts],
          dynamicStyleInfos: [...update.dynamicStyleInfos],
        })
      }
    }
  }
  return classNameUpdates
}

/** Compute className parts for a single scope group of styles. */
function computeScopeForGroup(
  scopeStyles: StyledJsxStyleInfo[],
  browsers: StyledJsxPluginOptions['browsers'],
): ClassNameUpdateInfo | null {
  const staticParts: string[] = []
  const dynamicParts: string[] = []
  const dynamicStyleInfos: ClassNameDynamicInfo[] = []
  const contentHashes: string[] = []

  for (const style of scopeStyles) {
    if (
      style.hash &&
      (style.content.kind === 'static' ||
        (style.content.kind === 'dynamic' && style.content.isConstant))
    ) {
      contentHashes.push(style.hash)
    }
  }

  const combinedScopeHash = contentHashes.length > 1 ? computeHash(contentHashes.join(',')) : null

  if (combinedScopeHash) {
    rescopeWithCombinedHash(scopeStyles, combinedScopeHash, browsers)
  }

  // SWC inserts styles in reverse order (insert at 0), so iterate reversed
  // to match className ordering: last <style jsx> in source → first in className.
  for (let i = scopeStyles.length - 1; i >= 0; i--) {
    const style = scopeStyles[i]
    if (
      style.content.kind === 'dynamic' &&
      !style.content.isConstant &&
      style.expressionSources &&
      style.scopeResult
    ) {
      dynamicStyleInfos.push({
        hash: style.hash,
        expressionSources: style.expressionSources,
      })
      continue
    }

    if (style.content.kind === 'variable') {
      if (!style.isGlobal) dynamicParts.push(style.content.varName)
      continue
    }

    if (!style.hash) continue
    if (combinedScopeHash) {
      const className = `jsx-${combinedScopeHash}`
      if (!staticParts.includes(className)) {
        staticParts.push(className)
      }
    } else {
      staticParts.push(`jsx-${style.hash}`)
    }
  }

  // Incorporate static class name into dynamic hash (matching SWC behavior)
  if (staticParts.length > 0 && dynamicStyleInfos.length > 0) {
    const staticClassName = staticParts[0]
    for (const info of dynamicStyleInfos) {
      info.hash = computeHash(info.hash + staticClassName)
    }
    for (const style of scopeStyles) {
      if (style.content.kind === 'dynamic' && style.expressionSources && style.scopeResult) {
        style.hash = computeHash(style.hash + staticClassName)
      }
    }
  }

  if (staticParts.length === 0 && dynamicParts.length === 0 && dynamicStyleInfos.length === 0) {
    return null
  }

  return { staticParts, dynamicParts, dynamicStyleInfos }
}

/** Re-scope static and constant-dynamic styles with the combined hash. */
function rescopeWithCombinedHash(
  scopeStyles: StyledJsxStyleInfo[],
  combinedScopeHash: string,
  browsers: StyledJsxPluginOptions['browsers'],
): void {
  for (const style of scopeStyles) {
    if (!style.hash || style.content.kind === 'variable' || style.isGlobal) continue
    // Non-constant dynamic styles keep __jsx-style-dynamic-selector — don't rescope
    if (style.content.kind === 'dynamic' && !style.content.isConstant) continue

    if (style.content.kind === 'static') {
      style.scopedCSS = scopeCSS(
        style.content.css,
        combinedScopeHash,
        false,
        `jsx-${combinedScopeHash}`,
        browsers,
      )
    } else if (style.content.kind === 'dynamic' && style.content.isConstant) {
      // Constant-dynamic styles also need rescoping with the combined hash.
      // Re-run transformCSS with the combined scope class to get updated pieces.
      const result = transformCSS(style.content.placeholderCSS, style.isGlobal, {
        expressionSources: style.content.expressionSources,
        isExprProperty: style.content.isExprProperty,
        isConstant: true,
        overrideScopeClass: `jsx-${combinedScopeHash}`,
        browsers,
      })
      style.scopeResult = result.scopeResult
    }
  }
}

/** Apply all source mutations: style replacements, tagged template rewrites, className injection, imports. */
function emitReplacements(
  s: RolldownString,
  program: ESTree.Program,
  styles: StyledJsxStyleInfo[],
  cssTagged: CSSTaggedTemplateInfo[],
  classNameUpdates: Map<ESTree.JSXOpeningElement, ClassNameUpdateInfo>,
): void {
  const sortedStyles = [...styles].toSorted((a, b) => b.element.start - a.element.start)
  for (const style of sortedStyles) {
    s.update(style.element.start, style.element.end, buildStyleReplacement(style))
  }

  const sortedTagged = [...cssTagged].toSorted((a, b) => b.initStart - a.initStart)
  for (const info of sortedTagged) {
    emitTaggedTemplateReplacement(s, info)
  }

  const sortedClassNameUpdates = [...classNameUpdates.entries()].toSorted(
    (a, b) => b[0].start - a[0].start,
  )
  for (const [opening, info] of sortedClassNameUpdates) {
    const dynamicExpr = buildClassNameExpr(
      info.staticParts,
      info.dynamicParts,
      info.dynamicStyleInfos,
    )
    const scopeExpr = dynamicExpr ?? `"${info.staticParts.join(' ')}"`
    rewriteClassName(s, opening, scopeExpr)
  }

  for (let i = program.body.length - 1; i >= 0; i--) {
    const stmt = program.body[i]
    if (stmt.type === 'ImportDeclaration' && stmt.source.value === 'styled-jsx/css') {
      let end = stmt.end
      if (s.original[end] === '\n') end++
      s.update(stmt.start, end, '')
    }
  }

  if (styles.length > 0 || cssTagged.some((t) => t.tagFunction === 'resolve')) {
    s.appendLeft(findInsertPosition(program), 'import _JSXStyle from "styled-jsx/style";\n')
  }
}

function emitTaggedTemplateReplacement(s: RolldownString, info: CSSTaggedTemplateInfo): void {
  let cssContent: string
  if (info.scopeResult && info.expressionSources) {
    const smSuffix = info.sourceMapComment ? escapeTemplateContent(info.sourceMapComment) : ''
    cssContent = `\`${buildDynamicTemplate(info.scopeResult, info.expressionSources)}${smSuffix}\``
  } else {
    const cssStr = info.sourceMapComment ? info.scopedCSS + info.sourceMapComment : info.scopedCSS
    cssContent = JSON.stringify(cssStr)
  }

  if (info.varName === '') {
    // Standalone expression statement — wrap in new String() like SWC
    s.update(info.initStart, info.initEnd, `new String(${cssContent})`)
  } else if (info.tagFunction === 'resolve') {
    let resolveOutput: string
    if (info.isDynamic && info.expressionSources) {
      // Dynamic resolve: include dynamic prop and use _JSXStyle.dynamic for className
      const dynamicArray = `[["${info.hash}", [${info.expressionSources.map(parenWrap).join(', ')}]]]`
      resolveOutput = `{ styles: <_JSXStyle id={"${info.hash}"} dynamic={[${info.expressionSources.map(parenWrap).join(', ')}]}>{${cssContent}}</_JSXStyle>, className: _JSXStyle.dynamic(${dynamicArray}) }`
    } else {
      resolveOutput = `{ styles: <_JSXStyle id={"${info.hash}"}>{${cssContent}}</_JSXStyle>, className: "jsx-${info.hash}" }`
    }
    s.update(info.initStart, info.initEnd, resolveOutput)
  } else if (info.exportStart !== null) {
    s.update(
      info.exportStart,
      info.declarationEnd,
      `const ${info.varName} = new String(${cssContent});\n${info.varName}.__hash = "${info.hash}";\nexport { ${info.varName} as default };`,
    )
  } else {
    s.update(info.initStart, info.initEnd, `new String(${cssContent})`)
    s.appendRight(info.declarationEnd, `\n${info.varName}.__hash = "${info.hash}";`)
  }
}

function identifyCSSTag(tag: ESTree.Expression, scopeTracker: ScopeTracker): CSSTagFunction | null {
  if (tag.type === 'Identifier') {
    const decl = scopeTracker.getDeclaration(tag.name)
    if (decl?.type !== 'Import' || decl.importNode.source.value !== 'styled-jsx/css') return null

    if (decl.node.type === 'ImportDefaultSpecifier') {
      return 'default'
    }
    if (decl.node.type === 'ImportSpecifier') {
      const imported =
        decl.node.imported.type === 'Identifier' ? decl.node.imported.name : decl.node.local.name
      if (imported === 'global' || imported === 'resolve') return imported
    }
    return null
  }

  if (tag.type === 'MemberExpression') {
    if (tag.computed || tag.object.type !== 'Identifier' || tag.property.type !== 'Identifier')
      return null

    const decl = scopeTracker.getDeclaration(tag.object.name)
    if (
      decl?.type !== 'Import' ||
      decl.importNode.source.value !== 'styled-jsx/css' ||
      (decl.node.type !== 'ImportNamespaceSpecifier' && decl.node.type !== 'ImportDefaultSpecifier')
    )
      return null

    const property = tag.property.name
    if (property === 'global' || property === 'resolve' || property === 'default') return property
    return null
  }

  return null
}

function shouldInjectClassName(
  opening: ESTree.JSXOpeningElement,
  scopeTracker: ScopeTracker,
  functionScope: string,
): boolean {
  if (opening.name.type !== 'JSXIdentifier') return false
  const name = opening.name.name
  if (name === 'style' || name === '_JSXStyle') return false
  // Capitalized names are components — only inject if declared in the local function scope.
  // Matches Babel's path.scope.bindings which contains only bindings in the nearest scope.
  const first = name.charCodeAt(0)
  if (first >= 65 && first <= 90) {
    const decl = scopeTracker.getDeclaration(name)
    if (!decl || decl.type === 'Import') return false
    return decl.scope === functionScope || decl.isUnderScope(functionScope)
  }
  return true
}

function extractCSSContent(
  ctx: PluginContext,
  element: ESTree.JSXElement,
  original: string,
  scopeTracker: ScopeTracker,
): StyleContent {
  const nonWhitespaceChildren = element.children.filter(
    (child) => child.type !== 'JSXText' || child.value.trim() !== '',
  )
  if (nonWhitespaceChildren.length !== 1) {
    ctx.error({
      message:
        `Expected one child under JSX Style tag, but got ${nonWhitespaceChildren.length} ` +
        `(eg: <style jsx>{\`hi\`}</style>)`,
      pos: element.start,
    })
  }

  const child = nonWhitespaceChildren[0]
  if (child.type !== 'JSXExpressionContainer' || child.expression.type === 'JSXEmptyExpression') {
    ctx.error({
      message:
        `Expected a child of ` +
        `type JSXExpressionContainer under JSX Style tag ` +
        `(eg: <style jsx>{\`hi\`}</style>), got ${child.type}`,
      pos: child.start,
    })
  }

  const expression = child.expression
  if (expression.type === 'Literal' && typeof expression.value === 'string') {
    return {
      kind: 'static',
      css: expression.value,
    }
  }
  if (expression.type === 'TemplateLiteral') {
    if (expression.expressions.length === 0) {
      return {
        kind: 'static',
        css: expression.quasis.map((quasi) => unescapeTemplateQuasi(quasi.value.raw)).join(''),
      }
    }

    // If all expressions are inline literals, inline them at compile time
    // e.g. `color: ${"#abcdef"}12` becomes static `color: #abcdef12`
    if (
      expression.expressions.every(
        (e) => e.type === 'Literal' || (e.type === 'TemplateLiteral' && e.expressions.length === 0),
      )
    ) {
      let css = ''
      for (let i = 0; i < expression.quasis.length; i++) {
        css += unescapeTemplateQuasi(expression.quasis[i].value.raw)
        if (i < expression.expressions.length) {
          const expr = expression.expressions[i]
          css +=
            expr.type === 'TemplateLiteral'
              ? expr.quasis.map((q) => q.value.cooked).join('')
              : // oxlint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                String((expr as ESTree.Expression & { type: 'Literal' }).value)
        }
      }
      return { kind: 'static', css }
    }

    const quasis = expression.quasis.map((quasi) => unescapeTemplateQuasi(quasi.value.raw))
    const { placeholderCSS, isExprProperty } = buildPlaceholderCSS(quasis)
    const expressionSources: string[] = []
    for (const expr of expression.expressions) {
      expressionSources.push(original.slice(expr.start, expr.end))
    }

    // Check if all expressions are known to be constants
    const isConstant = expression.expressions.every(
      (e) =>
        e.type === 'Literal' ||
        (e.type === 'TemplateLiteral' && e.expressions.length === 0) ||
        (e.type === 'Identifier' && isConstLiteralBinding(scopeTracker, e.name)),
    )

    return {
      kind: 'dynamic',
      placeholderCSS,
      expressionSources,
      isExprProperty,
      isConstant,
    }
  }
  if (expression.type === 'Identifier') {
    return {
      kind: 'variable',
      varName: expression.name,
    }
  }

  ctx.error({
    message:
      `Expected a template literal or string or identifier as the child of the ` +
      `JSX Style tag (eg: <style jsx>{\`some css\`}</style>), but got ${expression.type}`,
    pos: expression.start,
  })
}

/**
 * Analyze JSX attributes to extract the existing className expression,
 * accounting for spread attributes that may contain className.
 * Matches SWC's `get_existing_class_name` logic.
 */
function getExistingClassName(
  opening: ESTree.JSXOpeningElement,
  original: string,
): {
  classNameExpr: string | null
  classNameAttrIndex: number | null
  spreadOnlyClassNameIndex: number | null
} {
  const spreads: string[] = []
  let classNameExpr: string | null = null
  let classNameIsLiteral = false // true if className is a string literal or template literal
  let classNameAttrIndex: number | null = null
  let spreadOnlyClassNameIndex: number | null = null

  // Walk attributes in reverse (last className wins)
  for (let i = opening.attributes.length - 1; i >= 0; i--) {
    const attr = opening.attributes[i]

    if (attr.type === 'JSXAttribute') {
      if (attr.name.type === 'JSXIdentifier' && attr.name.name === 'className') {
        classNameAttrIndex = i
        if (!attr.value) {
          classNameExpr = null
        } else if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
          classNameExpr = JSON.stringify(attr.value.value)
          classNameIsLiteral = true
        } else if (attr.value.type === 'JSXExpressionContainer') {
          const expr = attr.value.expression
          classNameExpr = original.slice(expr.start, expr.end)
          // Match SWC: only string literals and template literals are treated as "safe"
          // (don't need || "" wrapping). Everything else (binary, call, ident, etc.) gets wrapped.
          classNameIsLiteral =
            (expr.type === 'Literal' && typeof expr.value === 'string') ||
            expr.type === 'TemplateLiteral'
        }
        break
      }
    } else if (attr.type === 'JSXSpreadAttribute') {
      const spreadSource = original.slice(attr.argument.start, attr.argument.end)

      // Check for object literal spread: {...{className: expr}}
      if (attr.argument.type === 'ObjectExpression') {
        let foundClassName = false
        for (const prop of attr.argument.properties) {
          if (
            prop.type === 'Property' &&
            !prop.computed &&
            ((prop.key.type === 'Identifier' && prop.key.name === 'className') ||
              (prop.key.type === 'Literal' && prop.key.value === 'className'))
          ) {
            foundClassName = true
            classNameExpr = original.slice(prop.value.start, prop.value.end)
            if (attr.argument.properties.length === 1) {
              spreadOnlyClassNameIndex = i
            }
          }
        }
        if (foundClassName) break
        // Object literal spread without className — check if it has spread props
        const hasSpread = attr.argument.properties.some((p) => p.type === 'SpreadElement')
        if (!hasSpread) continue
      }

      // Valid spread for className extraction: identifier or member expression
      if (attr.argument.type === 'Identifier' || attr.argument.type === 'MemberExpression') {
        spreads.push(
          `${spreadSource} && ${spreadSource}.className != null && ${spreadSource}.className`,
        )
      }
    }
  }

  // Combine spreads with className
  let existing: string | null = null
  const spreadExpr = spreads.length > 0 ? spreads.join(' || ') : null

  if (classNameExpr !== null) {
    // SWC: string literals and template literals are used directly;
    // all other expressions (binary, call, ident, conditional, etc.) get || "" wrapping
    const wrappedClassName = classNameIsLiteral ? classNameExpr : `${classNameExpr} || ""`

    if (spreadExpr) {
      existing = `${spreadExpr} || ${wrappedClassName}`
    } else {
      existing = classNameIsLiteral ? classNameExpr : wrappedClassName
    }
  } else if (spreadExpr) {
    existing = `${spreadExpr} || ""`
  }

  return { classNameExpr: existing, classNameAttrIndex, spreadOnlyClassNameIndex }
}

function rewriteClassName(
  s: RolldownString,
  opening: ESTree.JSXOpeningElement,
  scopeExpr: string,
): void {
  const { classNameExpr, classNameAttrIndex, spreadOnlyClassNameIndex } = getExistingClassName(
    opening,
    s.original,
  )

  // Build the new className expression
  let newExpr: string
  if (classNameExpr !== null) {
    newExpr = `${scopeExpr} + " " + (${classNameExpr})`
    // Simplify: "jsx-HASH" + " " + "existing" → "jsx-HASH existing"
    const strMatch = classNameExpr.match(/^"([^"]*)"$/)
    if (strMatch && scopeExpr.startsWith('"') && scopeExpr.endsWith('"')) {
      newExpr = `"${scopeExpr.slice(1, -1)} ${strMatch[1]}"`
    }
  } else {
    newExpr = scopeExpr
  }

  // Remove old className attr and spread-only-className spread
  // We need to handle removals carefully since we work with source positions
  const attrsToRemove: number[] = []
  if (spreadOnlyClassNameIndex !== null) attrsToRemove.push(spreadOnlyClassNameIndex)
  if (classNameAttrIndex !== null) attrsToRemove.push(classNameAttrIndex)

  // Remove in reverse order to preserve indices
  for (const idx of attrsToRemove.toSorted((a, b) => b - a)) {
    const attr = opening.attributes[idx]
    // Find the range to remove (include leading whitespace)
    let removeStart = attr.start
    // Look back for whitespace before this attr
    while (removeStart > opening.name.end && s.original[removeStart - 1] === ' ') {
      removeStart--
    }
    s.update(removeStart, attr.end, '')
  }

  // Append new className at the end of attributes
  const insertPosition = opening.selfClosing
    ? s.original.lastIndexOf('/>', opening.end)
    : s.original.lastIndexOf('>', opening.end)
  s.appendLeft(insertPosition, ` className={${newExpr}}`)
}
