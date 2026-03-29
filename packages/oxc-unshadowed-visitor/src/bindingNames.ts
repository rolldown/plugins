import type * as ESTree from '@oxc-project/types'

/**
 * Recursively extracts binding names from a pattern node.
 */
export function extractBindingNames(
  pattern: ESTree.ParamPattern | ESTree.BindingPattern,
  names: string[],
): void {
  switch (pattern.type) {
    case 'Identifier':
      names.push(pattern.name)
      break

    case 'ArrayPattern':
      for (const element of pattern.elements) {
        if (element != null) {
          extractBindingNames(element, names)
        }
      }
      break

    case 'ObjectPattern':
      for (const prop of pattern.properties) {
        if (prop.type === 'RestElement') {
          extractBindingNames(prop, names)
        } else {
          // Property node — the value holds the binding pattern
          extractBindingNames(prop.value, names)
        }
      }
      break

    case 'AssignmentPattern':
      extractBindingNames(pattern.left, names)
      break

    case 'RestElement':
      extractBindingNames(pattern.argument, names)
      break
  }
}
