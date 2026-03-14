import { withMagicString } from 'rolldown-string'
import type { Plugin } from 'rolldown'
import type { ESTree } from 'rolldown/utils'
import { Visitor } from 'rolldown/utils'
import type { JsxRemoveAttributesOptions } from './types.ts'

export type { JsxRemoveAttributesOptions } from './types.ts'

const DEFAULT_ATTRIBUTES: RegExp[] = [/^data-test/]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractFilterNeedle(pattern: RegExp): string | null {
  const normalized = pattern.source.replace(/\\-/g, '-').replace(/\\_/g, '_')
  const chunks = normalized.match(/[A-Za-z0-9_-]{3,}/g)
  if (!chunks || chunks.length === 0) return null
  return chunks.reduce((longest, current) => (current.length > longest.length ? current : longest))
}

function buildCodeFilter(patterns: ReadonlyArray<string | RegExp>): RegExp | null {
  const needles = [
    ...new Set(
      patterns
        .map((pattern) => (typeof pattern === 'string' ? pattern : extractFilterNeedle(pattern)))
        .filter((needle) => needle !== null),
    ),
  ]
  if (needles.length === 0) return null
  return new RegExp(needles.map(escapeRegExp).join('|'))
}

function shouldRemoveProperty(name: string, matchers: ReadonlyArray<string | RegExp>): boolean {
  return matchers.some((matcher) =>
    typeof matcher === 'string' ? matcher === name : matcher.test(name),
  )
}

export default function jsxRemoveAttributesPlugin(
  options: JsxRemoveAttributesOptions = {},
): Plugin {
  const matcherPatterns =
    options.attributes && options.attributes.length > 0 ? options.attributes : DEFAULT_ATTRIBUTES
  const codeFilter = buildCodeFilter(matcherPatterns)

  return {
    name: 'rolldown-plugin-jsx-remove-attributes',
    // @ts-expect-error Vite-specific property
    enforce: 'pre',

    transform: {
      filter: {
        id: /\.[jt]sx$/,
        ...(codeFilter && {
          code: {
            include: codeFilter,
          },
        }),
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

        new Visitor({
          JSXOpeningElement(node: ESTree.JSXOpeningElement) {
            for (const attr of node.attributes) {
              if (attr.type !== 'JSXAttribute') continue
              if (attr.name.type !== 'JSXIdentifier') continue
              if (!shouldRemoveProperty(attr.name.name, matcherPatterns)) continue
              s.remove(attr.start, attr.end)
            }
          },
        }).visit(program)
      }),
    },
  }
}
