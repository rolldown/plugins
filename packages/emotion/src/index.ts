import { withMagicString } from 'rolldown-string'
import type { Plugin } from 'rolldown'
import type { ESTree } from 'rolldown/utils'
import { ScopedVisitor } from 'oxc-unshadowed-visitor'
import type { EmotionPluginOptions } from './types.js'
import { minifyCSSString } from './css-minify.js'
import { createSourceMap, getPos } from './source-map.js'
import {
  ExprKind,
  regexEscape,
  unescapeTemplateRaw,
  escapeJSString,
  checkTrailingCommaExistence,
  maybeComma,
} from './common.js'
import { createImportMap, expandImportMap } from './import-map.js'
import { createLabelWithInfo } from './label.js'
import path from 'node:path'
import hashString from '@emotion/hash'

export type { EmotionPluginOptions } from './types.js'

interface RecordData {
  nodeStart: number
  nodeEnd: number
  isFullReplace: boolean
  apply: (getTarget: () => string) => void
}

export default function emotionPlugin(options: EmotionPluginOptions = {}): Plugin {
  const sourceMapEnabled = options.sourceMap
  const autoLabel = options.autoLabel ?? 'dev-only'
  const labelFormat = options.labelFormat ?? '[local]'
  const registeredImports = expandImportMap(options.importMap)

  let isDev = false

  return {
    name: 'rolldown-plugin-emotion',
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
        id: /\.[jt]sx?$/,
        code: new RegExp(Object.keys(registeredImports).map(regexEscape).join('|')),
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

        const sourceContent = s.original
        const srcFileHash = hashString(sourceContent)
        const fileStem = path.basename(id, path.extname(id))
        const dirName = path.basename(path.dirname(id))

        let targetCount = 0
        const importMap = createImportMap(registeredImports)

        function shouldAddLabel(): boolean {
          switch (autoLabel) {
            case 'always':
              return true
            case 'never':
              return false
            case 'dev-only':
              return isDev
            default:
              autoLabel satisfies never
              return false
          }
        }

        function createLabel(context: string | null, withPrefix: boolean): string {
          return createLabelWithInfo(labelFormat, context, fileStem, dirName ?? '', withPrefix)
        }

        function makeSourceMap(offset: number): string | null {
          if (!(sourceMapEnabled ?? isDev)) return null
          const pos = getPos(sourceContent, offset)
          return createSourceMap(sourceContent, id, pos)
        }

        function buildTaggedTemplateArgs(
          quasi: ESTree.TemplateLiteral,
          inJsx: boolean,
          labelContext: string | null,
          sourceMapOffset: number,
          withLabelPrefix: boolean,
          includeLabel: boolean = true,
        ): string {
          const quasis = quasi.quasis
          const expressions = quasi.expressions
          const argsLen = quasis.length + expressions.length
          const parts: string[] = []

          for (let index = 0; index < argsLen; index++) {
            const i = Math.floor(index / 2)
            if (index % 2 === 0) {
              // Template quasi (static text)
              const raw = quasis[i].value.raw
              const unescaped = unescapeTemplateRaw(raw)
              const minified = minifyCSSString(unescaped, index === 0, index === argsLen - 1)
              // Compress one more spaces into one space
              if (minified.replaceAll(' ', '') === '') {
                if (index !== 0 && index !== argsLen - 1) {
                  parts.push('" "')
                }
              } else {
                parts.push(`"${escapeJSString(minified)}"`)
              }
            } else {
              // Expression (interpolation)
              const expr = expressions[i]
              parts.push(s.slice(expr.start, expr.end))
            }
          }

          // Add label and source map (unless in JSX element context)
          if (!inJsx) {
            if (includeLabel && shouldAddLabel()) {
              const label = createLabel(labelContext, withLabelPrefix)
              parts.push(`"${escapeJSString(label)}"`)
            }
            const sm = makeSourceMap(sourceMapOffset)
            if (sm) {
              parts.push(`"${escapeJSString(sm)}"`)
            }
          }

          return parts.join(', ')
        }

        for (const node of program.body) {
          if (node.type === 'ImportDeclaration') {
            importMap.addFromImportDecl(node)
          }
        }
        const trackedNames = importMap.getTrackedNames()
        if (trackedNames.length === 0) return

        const labelContextStack: (string | null)[] = [null]
        let inJsx = false
        const sv = new ScopedVisitor<RecordData>({
          trackedNames,
          visitor: {
            VariableDeclarator(node) {
              let ctx = null
              if (node.id.type === 'Identifier') {
                ctx = node.id.name
              }
              // Named function expression overrides variable name
              if (node.init?.type === 'FunctionExpression' && node.init.id) {
                ctx = node.init.id.name
              }
              labelContextStack.push(ctx)
            },
            'VariableDeclarator:exit'() {
              labelContextStack.pop()
            },

            FunctionDeclaration(node) {
              // Function declarations always have an id
              labelContextStack.push(node.id!.name)
            },
            'FunctionDeclaration:exit'() {
              labelContextStack.pop()
            },

            Property(node) {
              let ctx = null
              if (!node.computed) {
                if (node.key.type === 'Identifier') ctx = node.key.name
                else if (node.key.type === 'Literal' && typeof node.key.value === 'string')
                  ctx = node.key.value
              }
              labelContextStack.push(ctx)
            },
            'Property:exit'() {
              labelContextStack.pop()
            },

            ClassDeclaration(node) {
              const name = node.id?.name ?? labelContextStack[labelContextStack.length - 1]
              labelContextStack.push(name)
            },
            'ClassDeclaration:exit'() {
              labelContextStack.pop()
            },

            PropertyDefinition(node) {
              let ctx = labelContextStack[labelContextStack.length - 1]
              if (node.key.type === 'Identifier' && !node.computed) {
                ctx = node.key.name
              }
              labelContextStack.push(ctx)
            },
            'PropertyDefinition:exit'() {
              labelContextStack.pop()
            },

            JSXElement(node, ctx) {
              const opening = node.openingElement
              let isGlobal = false
              let smOffset = node.start
              let recordName: string | null = null

              // Check if this is a <Global> component
              if (opening.name.type === 'JSXIdentifier') {
                const meta = importMap.get(opening.name.name)
                if (meta?.type === 'named' && meta.kind === ExprKind.GlobalJSX) {
                  isGlobal = true
                  smOffset = opening.name.start
                  recordName = opening.name.name
                }
              }

              // Check namespace: <emotionReact.Global>
              if (!isGlobal && opening.name.type === 'JSXMemberExpression') {
                const obj = opening.name.object
                const prop = opening.name.property
                if (obj.type === 'JSXIdentifier' && prop.type === 'JSXIdentifier') {
                  const meta = importMap.get(obj.name)
                  if (meta?.type === 'namespace' && meta.config[prop.name] === ExprKind.GlobalJSX) {
                    isGlobal = true
                    smOffset = obj.start
                    recordName = obj.name
                  }
                }
              }

              if (isGlobal && recordName) {
                const stylesAttr = opening.attributes.find(
                  (a): a is ESTree.JSXAttribute =>
                    a.type === 'JSXAttribute' &&
                    a.name.type === 'JSXIdentifier' &&
                    a.name.name === 'styles',
                )
                if (stylesAttr?.value) {
                  inJsx = true
                  const attrValue = stylesAttr.value
                  let exprStart: number
                  let exprEnd: number
                  if (attrValue.type === 'JSXExpressionContainer') {
                    exprStart = attrValue.expression.start
                    exprEnd = attrValue.expression.end
                  } else {
                    exprStart = attrValue.start
                    exprEnd = attrValue.end
                  }

                  const capturedSmOffset = smOffset
                  ctx.record({
                    name: recordName,
                    node,
                    data: {
                      nodeStart: node.start,
                      nodeEnd: node.end,
                      isFullReplace: false,
                      apply: () => {
                        const sm = makeSourceMap(capturedSmOffset)
                        if (sm) {
                          s.appendLeft(exprStart, '[')
                          s.appendRight(exprEnd, `, "${escapeJSString(sm)}"]`)
                        }
                      },
                    },
                  })
                }
              }
            },
            'JSXElement:exit'() {
              inJsx = false
            },

            TaggedTemplateExpression(node, ctx) {
              const tag = node.tag
              const quasi = node.quasi
              const labelContext = labelContextStack[labelContextStack.length - 1]

              // --- css`...` / keyframes`...` ---
              if (tag.type === 'Identifier') {
                const meta = importMap.get(tag.name)
                if (meta?.type === 'named' && meta.kind === ExprKind.Css) {
                  let wasInJsx = inJsx
                  ctx.record({
                    name: tag.name,
                    node,
                    data: {
                      nodeStart: node.start,
                      nodeEnd: node.end,
                      isFullReplace: true,
                      apply: () => {
                        const args = buildTaggedTemplateArgs(
                          quasi,
                          wasInJsx,
                          labelContext,
                          node.start,
                          false,
                        )
                        const tagText = s.slice(tag.start, tag.end)
                        s.update(node.start, node.end, `${tagText}(${args})`)
                        if (!wasInJsx) {
                          s.appendLeft(node.start, '/* @__PURE__ */ ')
                        }
                      },
                    },
                  })
                  return
                }
              }

              // --- styled.div`...` / namespace.css`...` ---
              if (
                tag.type === 'MemberExpression' &&
                !tag.computed &&
                tag.object.type === 'Identifier'
              ) {
                const meta = importMap.get(tag.object.name)
                if (meta?.type === 'named' && meta.kind === ExprKind.Styled) {
                  ctx.record({
                    name: tag.object.name,
                    node,
                    data: {
                      nodeStart: node.start,
                      nodeEnd: node.end,
                      isFullReplace: true,
                      apply: (getTarget) => {
                        let labelObj = `target: "${getTarget()}"`
                        if (shouldAddLabel()) {
                          const label = createLabel(labelContext, false)
                          labelObj += `, label: "${escapeJSString(label)}"`
                        }

                        const styledArgs = buildTaggedTemplateArgs(
                          quasi,
                          false,
                          labelContext,
                          node.start,
                          false,
                          false,
                        )
                        const styledName = s.slice(tag.object.start, tag.object.end)
                        const propName = tag.property.name
                        s.update(
                          node.start,
                          node.end,
                          `${styledName}("${escapeJSString(propName)}", {\n${labelObj}\n})(${styledArgs})`,
                        )
                        s.appendLeft(node.start, '/* @__PURE__ */ ')
                      },
                    },
                  })
                  return
                }

                // --- namespace.css`...` ---
                if (meta?.type === 'namespace') {
                  const propName = tag.property.type === 'Identifier' ? tag.property.name : null
                  if (!propName || meta.config[propName] !== ExprKind.Css) return

                  let wasInJsx = inJsx
                  ctx.record({
                    name: tag.object.name,
                    node,
                    data: {
                      nodeStart: node.start,
                      nodeEnd: node.end,
                      isFullReplace: true,
                      apply: () => {
                        const tagText = s.slice(tag.start, tag.end)
                        const args = buildTaggedTemplateArgs(
                          quasi,
                          wasInJsx,
                          labelContext,
                          node.start,
                          true,
                        )
                        s.update(node.start, node.end, `${tagText}(${args})`)
                        s.appendLeft(node.start, '/* @__PURE__ */ ')
                      },
                    },
                  })
                  return
                }
              }

              // --- styled(Component)`...` ---
              if (tag.type === 'CallExpression' && tag.callee.type === 'Identifier') {
                const meta = importMap.get(tag.callee.name)
                if (meta?.type === 'named' && meta.kind === ExprKind.Styled) {
                  ctx.record({
                    name: tag.callee.name,
                    node,
                    data: {
                      nodeStart: node.start,
                      nodeEnd: node.end,
                      isFullReplace: true,
                      apply: (getTarget) => {
                        const styledName = s.slice(tag.callee.start, tag.callee.end)
                        const target = getTarget()
                        let labelObj = `target: "${target}"`
                        if (shouldAddLabel()) {
                          const label = createLabel(labelContext, false)
                          labelObj += `, label: "${escapeJSString(label)}"`
                        }

                        // Extract existing args from styled(Component, ...)
                        const existingArgs = tag.arguments
                        const firstArgText =
                          existingArgs.length > 0
                            ? s.slice(existingArgs[0].start, existingArgs[0].end)
                            : ''

                        let innerCallText: string
                        if (existingArgs.length <= 1) {
                          // styled(Component) → styled(Component, { target, label })
                          innerCallText = `${styledName}(${firstArgText}, {\n${labelObj}\n})`
                        } else {
                          // styled(Component, options) → need to merge options
                          const secondArg = existingArgs[1]
                          if (secondArg.type === 'ObjectExpression') {
                            // Merge target/label into existing object
                            const objText = s.slice(secondArg.start + 1, secondArg.end - 1)
                            const isEmpty = objText.trim() === ''
                            const hasTrailingComma = !isEmpty && objText.trimEnd().endsWith(',')
                            const prefix = isEmpty
                              ? ''
                              : `${objText}${maybeComma(!hasTrailingComma)} `
                            innerCallText = `${styledName}(${firstArgText}, { ${prefix}${labelObj} })`
                          } else {
                            // Wrap with spread
                            const secondArgText = s.slice(secondArg.start, secondArg.end)
                            innerCallText = `${styledName}(${firstArgText}, {\n${labelObj},\n\t...${secondArgText}\n})`
                          }
                        }

                        const styledArgs = buildTaggedTemplateArgs(
                          quasi,
                          false,
                          labelContext,
                          node.start,
                          false,
                          false,
                        )
                        s.update(node.start, node.end, `${innerCallText}(${styledArgs})`)
                        s.appendLeft(node.start, '/* @__PURE__ */ ')
                      },
                    },
                  })
                  return
                }
              }
            },

            CallExpression(node, ctx) {
              const callee = node.callee
              const args = node.arguments
              const labelContext = labelContextStack[labelContextStack.length - 1]

              // --- css({...}) ---
              if (callee.type === 'Identifier') {
                const meta = importMap.get(callee.name)
                if (
                  meta?.type === 'named' &&
                  meta.kind === ExprKind.Css &&
                  args.length > 0 &&
                  !inJsx
                ) {
                  ctx.record({
                    name: callee.name,
                    node,
                    data: {
                      nodeStart: node.start,
                      nodeEnd: node.end,
                      isFullReplace: false,
                      apply: () => {
                        s.appendLeft(node.start, '/* @__PURE__ */ ')
                        let hasTrailingComma = checkTrailingCommaExistence(s.original, node.end - 1)
                        if (shouldAddLabel()) {
                          const label = createLabel(labelContext, true)
                          s.appendRight(
                            node.end - 1,
                            `${maybeComma(!hasTrailingComma)}"${escapeJSString(label)}"`,
                          )
                          hasTrailingComma = false
                        }
                        const sm = makeSourceMap(node.start)
                        if (sm) {
                          s.appendRight(
                            node.end - 1,
                            `${maybeComma(!hasTrailingComma)}"${escapeJSString(sm)}"`,
                          )
                        }
                      },
                    },
                  })
                  return
                }
              }

              // --- styled('div')({...}) ---
              if (callee.type === 'CallExpression') {
                const innerCallee = callee.callee
                if (innerCallee.type === 'Identifier') {
                  const meta = importMap.get(innerCallee.name)
                  if (
                    meta?.type === 'named' &&
                    meta.kind === ExprKind.Styled &&
                    callee.arguments.length > 0
                  ) {
                    ctx.record({
                      name: innerCallee.name,
                      node,
                      data: {
                        nodeStart: node.start,
                        nodeEnd: node.end,
                        isFullReplace: false,
                        apply: (getTarget) => {
                          s.appendLeft(node.start, '/* @__PURE__ */ ')
                          let labelObj = `target: "${getTarget()}"`
                          if (shouldAddLabel()) {
                            const label = createLabel(labelContext, false)
                            labelObj += `, label: "${escapeJSString(label)}"`
                          }
                          // Add { target, label } as second arg to inner call
                          if (callee.arguments.length === 1) {
                            // Insert before inner call's closing )
                            const hasTrailingComma = checkTrailingCommaExistence(
                              s.original,
                              callee.end - 1,
                            )
                            s.appendLeft(
                              callee.end - 1,
                              `${maybeComma(!hasTrailingComma)}{\n\t${labelObj}\n}`,
                            )
                          } else if (callee.arguments.length >= 2) {
                            const secondArg = callee.arguments[1]
                            if (secondArg.type === 'ObjectExpression') {
                              // Insert before the closing } of the object
                              const isEmpty = secondArg.properties.length === 0
                              if (isEmpty) {
                                s.appendLeft(secondArg.end - 1, ` ${labelObj} `)
                              } else {
                                const hasTrailingComma = checkTrailingCommaExistence(
                                  s.original,
                                  secondArg.end - 1,
                                )
                                s.appendLeft(
                                  secondArg.end - 1,
                                  `${maybeComma(!hasTrailingComma)} ${labelObj}`,
                                )
                              }
                            } else {
                              // Wrap with spread
                              const secondArgText = s.slice(secondArg.start, secondArg.end)
                              s.update(
                                secondArg.start,
                                secondArg.end,
                                `{ ${labelObj}, ...${secondArgText} }`,
                              )
                            }
                          }
                          const sm = makeSourceMap(node.start)
                          if (sm) {
                            const hasTrailingComma = checkTrailingCommaExistence(
                              s.original,
                              node.end - 1,
                            )
                            s.appendLeft(
                              node.end - 1,
                              `${maybeComma(!hasTrailingComma)}"${escapeJSString(sm)}"`,
                            )
                          }
                        },
                      },
                    })
                    return
                  }
                }
              }

              // --- styled.div({...}) / namespace.css({...}) ---
              if (
                callee.type === 'MemberExpression' &&
                !callee.computed &&
                callee.object.type === 'Identifier'
              ) {
                const meta = importMap.get(callee.object.name)
                if (meta?.type === 'named' && meta.kind === ExprKind.Styled) {
                  let wasInJsx = inJsx
                  ctx.record({
                    name: callee.object.name,
                    node,
                    data: {
                      nodeStart: node.start,
                      nodeEnd: node.end,
                      isFullReplace: false,
                      apply: (getTarget) => {
                        let labelObj = ''
                        if (!wasInJsx) {
                          labelObj += `target: "${getTarget()}"`
                          s.appendLeft(node.start, '/* @__PURE__ */ ')
                          if (shouldAddLabel()) {
                            const label = createLabel(labelContext, false)
                            labelObj += `, label: "${escapeJSString(label)}"`
                          }
                        }
                        const styledName = s.slice(callee.object.start, callee.object.end)
                        const propName = callee.property.name
                        // Replace callee styled.div with styled("div", { target, label })
                        s.update(
                          callee.start,
                          callee.end,
                          `${styledName}("${escapeJSString(propName)}"${labelObj ? `, { ${labelObj} }` : ''})`,
                        )
                        if (!wasInJsx) {
                          const sm = makeSourceMap(node.start)
                          if (sm) {
                            const hasTrailingComma = checkTrailingCommaExistence(
                              s.original,
                              node.end - 1,
                            )
                            s.appendLeft(
                              node.end - 1,
                              `${maybeComma(!hasTrailingComma)}"${escapeJSString(sm)}"`,
                            )
                          }
                        }
                      },
                    },
                  })
                  return
                }

                // --- namespace.css({...}) ---
                if (meta?.type === 'namespace') {
                  const propName =
                    callee.property.type === 'Identifier' ? callee.property.name : null
                  if (!propName || meta.config[propName] !== ExprKind.Css) return

                  ctx.record({
                    name: callee.object.name,
                    node,
                    data: {
                      nodeStart: node.start,
                      nodeEnd: node.end,
                      isFullReplace: false,
                      apply: () => {
                        s.appendLeft(node.start, '/* @__PURE__ */ ')
                        let hasTrailingComma = checkTrailingCommaExistence(s.original, node.end - 1)
                        if (shouldAddLabel()) {
                          const label = createLabel(labelContext, true)
                          s.appendRight(
                            node.end - 1,
                            `${maybeComma(!hasTrailingComma)}"${escapeJSString(label)}"`,
                          )
                          hasTrailingComma = false
                        }
                        const sm = makeSourceMap(node.start)
                        if (sm) {
                          s.appendRight(
                            node.end - 1,
                            `${maybeComma(!hasTrailingComma)}"${escapeJSString(sm)}"`,
                          )
                        }
                      },
                    },
                  })
                  return
                }
              }
            },
          },
        })

        const records = sv.walk(program)
        if (records.length === 0) return

        const consumedRanges: [number, number][] = []
        for (const record of records) {
          const { nodeStart, nodeEnd, isFullReplace, apply } = record.data
          // Skip records fully contained within an already-consumed range
          // (e.g., inner tagged template inside an outer one that was replaced)
          if (consumedRanges.some(([cs, ce]) => nodeStart >= cs && nodeEnd <= ce)) continue
          apply(() => `e${srcFileHash}${targetCount++}`)
          if (isFullReplace) consumedRanges.push([nodeStart, nodeEnd])
        }
      }),
    },
  }
}
